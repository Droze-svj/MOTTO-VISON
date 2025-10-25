import { OPENROUTER_BASE_URL, OPENROUTER_API_KEY, OPENROUTER_APP_NAME } from '../constants/config';
import MetricsService from './MetricsService';

class StreamingAIService {
  constructor() {
    this.activeStreams = new Map();
    this.streamCallbacks = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
  }

  async streamResponse(prompt, systemAugment = '', model = 'deepseek/deepseek-chat', options = {}) {
    await this.initialize();
    
    const streamId = this.generateStreamId();
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': OPENROUTER_APP_NAME,
          'X-Title': OPENROUTER_APP_NAME,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: `You are MOTTO, an intelligent AI assistant. ${systemAugment}`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: options.maxTokens || 4000,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.9,
          frequency_penalty: options.frequencyPenalty || 0.1,
          presence_penalty: options.presencePenalty || 0.1,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Streaming API error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let tokenCount = 0;
      let lastChunkTime = Date.now();

      // Store stream info
      this.activeStreams.set(streamId, {
        startTime,
        model,
        prompt: prompt.slice(0, 100),
        status: 'streaming'
      });

      // Process stream
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              await this.handleStreamComplete(streamId, fullResponse, tokenCount, startTime);
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                fullResponse += content;
                tokenCount++;
                lastChunkTime = Date.now();
                
                // Emit chunk to callbacks
                await this.emitChunk(streamId, {
                  content,
                  fullResponse,
                  tokenCount,
                  isComplete: false,
                  timestamp: Date.now()
                });
              }
            } catch (e) {
              // Skip invalid JSON chunks
              continue;
            }
          }
        }
      }

      return {
        streamId,
        fullResponse,
        tokenCount,
        duration: Date.now() - startTime,
        success: true
      };

    } catch (error) {
      console.error('Streaming error:', error);
      await this.handleStreamError(streamId, error, startTime);
      
      return {
        streamId,
        fullResponse: '',
        tokenCount: 0,
        duration: Date.now() - startTime,
        success: false,
        error: error.message
      };
    }
  }

  async streamWithCallbacks(prompt, systemAugment, model, callbacks = {}) {
    const streamId = this.generateStreamId();
    
    // Store callbacks
    this.streamCallbacks.set(streamId, {
      onChunk: callbacks.onChunk || (() => {}),
      onComplete: callbacks.onComplete || (() => {}),
      onError: callbacks.onError || (() => {}),
      onStart: callbacks.onStart || (() => {})
    });

    // Start streaming
    const result = await this.streamResponse(prompt, systemAugment, model);
    
    return {
      streamId,
      result,
      unsubscribe: () => this.unsubscribe(streamId)
    };
  }

  async emitChunk(streamId, chunkData) {
    const callbacks = this.streamCallbacks.get(streamId);
    if (callbacks?.onChunk) {
      try {
        await callbacks.onChunk(chunkData);
      } catch (error) {
        console.error('Error in chunk callback:', error);
      }
    }
  }

  async handleStreamComplete(streamId, fullResponse, tokenCount, startTime) {
    const duration = Date.now() - startTime;
    const streamInfo = this.activeStreams.get(streamId);
    
    if (streamInfo) {
      streamInfo.status = 'completed';
      streamInfo.duration = duration;
      streamInfo.tokenCount = tokenCount;
      streamInfo.responseLength = fullResponse.length;
    }

    // Emit completion
    const callbacks = this.streamCallbacks.get(streamId);
    if (callbacks?.onComplete) {
      try {
        await callbacks.onComplete({
          fullResponse,
          tokenCount,
          duration,
          streamId
        });
      } catch (error) {
        console.error('Error in completion callback:', error);
      }
    }

    // Log metrics
    await MetricsService.log('streaming_complete', {
      streamId,
      model: streamInfo?.model,
      duration,
      tokenCount,
      responseLength: fullResponse.length,
      success: true
    });

    // Cleanup
    this.cleanupStream(streamId);
  }

  async handleStreamError(streamId, error, startTime) {
    const duration = Date.now() - startTime;
    const streamInfo = this.activeStreams.get(streamId);
    
    if (streamInfo) {
      streamInfo.status = 'error';
      streamInfo.error = error.message;
      streamInfo.duration = duration;
    }

    // Emit error
    const callbacks = this.streamCallbacks.get(streamId);
    if (callbacks?.onError) {
      try {
        await callbacks.onError({
          error: error.message,
          duration,
          streamId
        });
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    }

    // Log metrics
    await MetricsService.log('streaming_error', {
      streamId,
      model: streamInfo?.model,
      duration,
      error: error.message,
      success: false
    });

    // Cleanup
    this.cleanupStream(streamId);
  }

  cleanupStream(streamId) {
    this.activeStreams.delete(streamId);
    this.streamCallbacks.delete(streamId);
  }

  unsubscribe(streamId) {
    this.cleanupStream(streamId);
  }

  generateStreamId() {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getActiveStreams() {
    return Array.from(this.activeStreams.entries()).map(([id, info]) => ({
      id,
      ...info
    }));
  }

  async cancelStream(streamId) {
    const streamInfo = this.activeStreams.get(streamId);
    if (streamInfo) {
      streamInfo.status = 'cancelled';
      await MetricsService.log('streaming_cancelled', {
        streamId,
        model: streamInfo.model,
        duration: Date.now() - streamInfo.startTime
      });
      this.cleanupStream(streamId);
      return true;
    }
    return false;
  }

  async getStreamStats() {
    const activeStreams = this.getActiveStreams();
    const completedStreams = await MetricsService.getEvents(100).then(events => 
      events.filter(e => e.e === 'streaming_complete')
    );

    return {
      activeStreams: activeStreams.length,
      totalCompleted: completedStreams.length,
      averageDuration: completedStreams.length > 0 
        ? completedStreams.reduce((sum, s) => sum + (s.p?.duration || 0), 0) / completedStreams.length 
        : 0,
      averageTokens: completedStreams.length > 0
        ? completedStreams.reduce((sum, s) => sum + (s.p?.tokenCount || 0), 0) / completedStreams.length
        : 0,
      successRate: completedStreams.length > 0
        ? completedStreams.filter(s => s.p?.success).length / completedStreams.length
        : 0
    };
  }
}

export default new StreamingAIService();
