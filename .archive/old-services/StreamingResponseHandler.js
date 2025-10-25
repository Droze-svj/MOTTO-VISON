import StreamingAIService from './StreamingAIService';
import LearningAdaptationService from './LearningAdaptationService';
import MetricsService from './MetricsService';

class StreamingResponseHandler {
  constructor() {
    this.activeStreams = new Map();
    this.streamCallbacks = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    await StreamingAIService.initialize();
    await LearningAdaptationService.initialize();
    this.isInitialized = true;
  }

  async streamEnhancedResponse(message, context, analysis, selectedModel, adaptations = {}) {
    await this.initialize();
    
    const streamId = this.generateStreamId();
    const startTime = Date.now();
    
    // Build enhanced prompt with adaptations
    const enhancedPrompt = this.buildEnhancedPrompt(message, context, analysis, adaptations);
    const systemAugment = this.buildSystemAugment(context, adaptations);
    
    // Set up streaming callbacks
    const callbacks = {
      onChunk: async (chunkData) => {
        await this.handleChunk(streamId, chunkData, context, analysis);
      },
      onComplete: async (completionData) => {
        await this.handleCompletion(streamId, completionData, message, context, analysis, selectedModel, startTime);
      },
      onError: async (errorData) => {
        await this.handleError(streamId, errorData, message, context, analysis, startTime);
      },
      onStart: async () => {
        await this.handleStart(streamId, message, context, analysis);
      }
    };
    
    // Start streaming
    const streamResult = await StreamingAIService.streamWithCallbacks(
      enhancedPrompt,
      systemAugment,
      selectedModel?.name || 'deepseek/deepseek-chat',
      callbacks
    );
    
    return {
      streamId,
      ...streamResult
    };
  }

  buildEnhancedPrompt(message, context, analysis, adaptations) {
    let prompt = message;
    
    // Add context information
    if (context.semanticContext && context.semanticContext.length > 0) {
      const relevantContext = context.semanticContext.slice(0, 3)
        .map(ctx => ctx.data)
        .join('\n');
      prompt += `\n\nRelevant context: ${relevantContext}`;
    }
    
    // Add search results if available
    if (context.searchResults && context.searchResults.length > 0) {
      const searchInfo = context.searchResults.slice(0, 3)
        .map(result => `${result.title}: ${result.snippet}`)
        .join('\n');
      prompt += `\n\nSearch results: ${searchInfo}`;
    }
    
    // Add knowledge base information
    if (context.knowledge && context.knowledge.length > 0) {
      const knowledgeInfo = context.knowledge.slice(0, 2)
        .map(kb => kb.content)
        .join('\n');
      prompt += `\n\nRelated knowledge: ${knowledgeInfo}`;
    }
    
    return prompt;
  }

  buildSystemAugment(context, adaptations) {
    let systemAugment = 'You are MOTTO, an intelligent AI assistant.';
    
    // Add persona
    if (context.userPreferences?.persona) {
      systemAugment += ` Persona: ${context.userPreferences.persona}`;
    }
    
    // Add style preferences
    if (context.userPreferences?.style) {
      systemAugment += ` Style: ${context.userPreferences.style}`;
    }
    
    // Apply learning adaptations
    if (adaptations.responseLength === 'concise') {
      systemAugment += ' Be concise and to the point.';
    } else if (adaptations.responseLength === 'detailed') {
      systemAugment += ' Provide detailed explanations and examples.';
    }
    
    if (adaptations.tone === 'energetic') {
      systemAugment += ' Use an energetic and enthusiastic tone.';
    } else if (adaptations.tone === 'relaxed') {
      systemAugment += ' Use a calm and relaxed tone.';
    }
    
    if (adaptations.topicExpertise) {
      systemAugment += ` Show expertise in ${adaptations.topicExpertise}.`;
    }
    
    if (adaptations.creativity === 'high') {
      systemAugment += ' Be creative and innovative in your responses.';
    }
    
    if (adaptations.technicality === 'high') {
      systemAugment += ' Use technical language and provide technical details.';
    }
    
    return systemAugment;
  }

  async handleStart(streamId, message, context, analysis) {
    // Store stream info
    this.activeStreams.set(streamId, {
      message,
      context,
      analysis,
      startTime: Date.now(),
      chunks: [],
      status: 'streaming'
    });
    
    // Log stream start
    await MetricsService.log('stream_start', {
      streamId,
      messageLength: message.length,
      intent: analysis.intent,
      complexity: analysis.complexity
    });
  }

  async handleChunk(streamId, chunkData, context, analysis) {
    const streamInfo = this.activeStreams.get(streamId);
    if (!streamInfo) return;
    
    // Store chunk
    streamInfo.chunks.push(chunkData);
    
    // Emit chunk to registered callbacks
    const callbacks = this.streamCallbacks.get(streamId);
    if (callbacks?.onChunk) {
      try {
        await callbacks.onChunk(chunkData);
      } catch (error) {
        console.error('Error in chunk callback:', error);
      }
    }
  }

  async handleCompletion(streamId, completionData, message, context, analysis, selectedModel, startTime) {
    const streamInfo = this.activeStreams.get(streamId);
    if (!streamInfo) return;
    
    streamInfo.status = 'completed';
    streamInfo.completionData = completionData;
    
    // Learn from this interaction
    await LearningAdaptationService.learnFromInteraction({
      userMessage: message,
      aiResponse: completionData.fullResponse,
      responseTime: completionData.duration,
      modelUsed: selectedModel?.name,
      context,
      analysis,
      streaming: true
    });
    
    // Log completion
    await MetricsService.log('stream_complete', {
      streamId,
      duration: completionData.duration,
      tokenCount: completionData.tokenCount,
      responseLength: completionData.fullResponse.length,
      model: selectedModel?.name,
      success: true
    });
    
    // Emit completion to callbacks
    const callbacks = this.streamCallbacks.get(streamId);
    if (callbacks?.onComplete) {
      try {
        await callbacks.onComplete(completionData);
      } catch (error) {
        console.error('Error in completion callback:', error);
      }
    }
    
    // Cleanup
    this.cleanupStream(streamId);
  }

  async handleError(streamId, errorData, message, context, analysis, startTime) {
    const streamInfo = this.activeStreams.get(streamId);
    if (!streamInfo) return;
    
    streamInfo.status = 'error';
    streamInfo.error = errorData.error;
    
    // Log error
    await MetricsService.log('stream_error', {
      streamId,
      duration: errorData.duration,
      error: errorData.error,
      success: false
    });
    
    // Emit error to callbacks
    const callbacks = this.streamCallbacks.get(streamId);
    if (callbacks?.onError) {
      try {
        await callbacks.onError(errorData);
      } catch (error) {
        console.error('Error in error callback:', error);
      }
    }
    
    // Cleanup
    this.cleanupStream(streamId);
  }

  registerCallbacks(streamId, callbacks) {
    this.streamCallbacks.set(streamId, callbacks);
  }

  unregisterCallbacks(streamId) {
    this.streamCallbacks.delete(streamId);
  }

  cleanupStream(streamId) {
    this.activeStreams.delete(streamId);
    this.streamCallbacks.delete(streamId);
  }

  generateStreamId() {
    return `enhanced_stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      await MetricsService.log('stream_cancelled', {
        streamId,
        duration: Date.now() - streamInfo.startTime
      });
      this.cleanupStream(streamId);
      return true;
    }
    return false;
  }

  async getStreamingStats() {
    const activeStreams = this.getActiveStreams();
    const completedStreams = await MetricsService.getEvents(100).then(events => 
      events.filter(e => e.e === 'stream_complete')
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

export default new StreamingResponseHandler();
