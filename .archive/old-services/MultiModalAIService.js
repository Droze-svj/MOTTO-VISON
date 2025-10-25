import { OPENROUTER_BASE_URL, OPENROUTER_API_KEY, OPENROUTER_APP_NAME } from '../constants/config';
import MetricsService from './MetricsService';
import ErrorRecoveryService from './ErrorRecoveryService';
import PerformanceOptimizationService from './PerformanceOptimizationService';

class MultiModalAIService {
  constructor() {
    this.supportedModes = {
      text: true,
      image: true,
      audio: true,
      document: true,
      code: true
    };
    
    this.modelCapabilities = {
      'openai/gpt-4o': { text: true, image: true, audio: false, document: true, code: true },
      'openai/gpt-4o-mini': { text: true, image: true, audio: false, document: true, code: true },
      'anthropic/claude-3.5-sonnet': { text: true, image: true, audio: false, document: true, code: true },
      'anthropic/claude-3-haiku': { text: true, image: true, audio: false, document: true, code: true },
      'google/gemini-1.5-pro': { text: true, image: true, audio: false, document: true, code: true },
      'meta-llama/llama-3.1-8b-instruct': { text: true, image: false, audio: false, document: true, code: true }
    };
    
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await ErrorRecoveryService.initialize();
      await PerformanceOptimizationService.initialize();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing MultiModalAIService:', error);
    }
  }

  // Image Processing
  async analyzeImage(imageData, prompt = 'Analyze this image and describe what you see') {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = `image_analysis_${this.generateImageHash(imageData)}`;
      const cached = await PerformanceOptimizationService.getCachedResponse(cacheKey, { prompt });
      if (cached) {
        return cached;
      }
      
      const operation = {
        service: 'image_analysis',
        execute: async () => {
          return await this.processImageWithAI(imageData, prompt);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { imageData, prompt });
      
      // Cache the result
      await PerformanceOptimizationService.setCachedResponse(cacheKey, result, { prompt });
      
      // Record metrics
      await MetricsService.log('image_analysis', {
        duration: Date.now() - startTime,
        success: true,
        imageSize: imageData.length || 0
      });
      
      return result;
      
    } catch (error) {
      await MetricsService.log('image_analysis_error', {
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }

  async generateImage(prompt, options = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const operation = {
        service: 'image_generation',
        execute: async () => {
          return await this.generateImageWithAI(prompt, options);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { prompt, options });
      
      await MetricsService.log('image_generation', {
        duration: Date.now() - startTime,
        success: true,
        prompt: prompt.slice(0, 100)
      });
      
      return result;
      
    } catch (error) {
      await MetricsService.log('image_generation_error', {
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }

  async processImageWithAI(imageData, prompt) {
    const model = 'openai/gpt-4o'; // Best model for image analysis
    
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
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageData}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Image analysis failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      analysis: data.choices[0].message.content,
      model: model,
      tokens: data.usage?.total_tokens || 0
    };
  }

  async generateImageWithAI(prompt, options) {
    // For now, return a placeholder since OpenRouter doesn't support image generation
    // In a real implementation, you'd integrate with DALL-E, Midjourney, or Stable Diffusion
    return {
      imageUrl: null,
      prompt: prompt,
      message: 'Image generation not yet implemented. This would integrate with DALL-E or similar service.',
      options: options
    };
  }

  // Audio Processing
  async transcribeAudio(audioData, options = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const operation = {
        service: 'audio_transcription',
        execute: async () => {
          return await this.transcribeAudioWithAI(audioData, options);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { audioData, options });
      
      await MetricsService.log('audio_transcription', {
        duration: Date.now() - startTime,
        success: true,
        audioLength: audioData.length || 0
      });
      
      return result;
      
    } catch (error) {
      await MetricsService.log('audio_transcription_error', {
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }

  async synthesizeSpeech(text, options = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const operation = {
        service: 'speech_synthesis',
        execute: async () => {
          return await this.synthesizeSpeechWithAI(text, options);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { text, options });
      
      await MetricsService.log('speech_synthesis', {
        duration: Date.now() - startTime,
        success: true,
        textLength: text.length
      });
      
      return result;
      
    } catch (error) {
      await MetricsService.log('speech_synthesis_error', {
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }

  async transcribeAudioWithAI(audioData, options) {
    // Placeholder for audio transcription
    // In a real implementation, you'd use Whisper API or similar
    return {
      transcription: 'Audio transcription not yet implemented. This would integrate with Whisper API.',
      confidence: 0.95,
      language: options.language || 'en',
      duration: 0
    };
  }

  async synthesizeSpeechWithAI(text, options) {
    // Placeholder for speech synthesis
    // In a real implementation, you'd use ElevenLabs, Azure Speech, or similar
    return {
      audioUrl: null,
      text: text,
      voice: options.voice || 'default',
      message: 'Speech synthesis not yet implemented. This would integrate with ElevenLabs or similar service.'
    };
  }

  // Document Processing
  async processDocument(documentData, documentType, options = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const operation = {
        service: 'document_processing',
        execute: async () => {
          return await this.processDocumentWithAI(documentData, documentType, options);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { documentData, documentType, options });
      
      await MetricsService.log('document_processing', {
        duration: Date.now() - startTime,
        success: true,
        documentType: documentType,
        documentSize: documentData.length || 0
      });
      
      return result;
      
    } catch (error) {
      await MetricsService.log('document_processing_error', {
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }

  async processDocumentWithAI(documentData, documentType, options) {
    const model = 'openai/gpt-4o'; // Best model for document processing
    
    let prompt = 'Analyze this document and provide insights:';
    
    switch (documentType) {
      case 'pdf':
        prompt = 'Extract and analyze the content of this PDF document:';
        break;
      case 'code':
        prompt = 'Analyze this code and provide feedback, suggestions, and explanations:';
        break;
      case 'markdown':
        prompt = 'Process this markdown document and provide a summary:';
        break;
      case 'text':
        prompt = 'Analyze this text document and provide insights:';
        break;
    }
    
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
            role: 'user',
            content: `${prompt}\n\n${documentData}`
          }
        ],
        max_tokens: 4000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Document processing failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      analysis: data.choices[0].message.content,
      model: model,
      tokens: data.usage?.total_tokens || 0,
      documentType: documentType
    };
  }

  // Code Execution and Analysis
  async executeCode(code, language, options = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const operation = {
        service: 'code_execution',
        execute: async () => {
          return await this.executeCodeWithAI(code, language, options);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { code, language, options });
      
      await MetricsService.log('code_execution', {
        duration: Date.now() - startTime,
        success: true,
        language: language,
        codeLength: code.length
      });
      
      return result;
      
    } catch (error) {
      await MetricsService.log('code_execution_error', {
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }

  async executeCodeWithAI(code, language, options) {
    // For security reasons, we don't actually execute code
    // Instead, we analyze it and provide insights
    const model = 'meta-llama/llama-3.1-8b-instruct'; // Good for code analysis
    
    const prompt = `Analyze this ${language} code and provide:
1. Code review and suggestions
2. Potential bugs or issues
3. Performance optimizations
4. Best practices recommendations
5. Security considerations

Code:
\`\`\`${language}
${code}
\`\`\``;
    
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
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`Code analysis failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      analysis: data.choices[0].message.content,
      model: model,
      tokens: data.usage?.total_tokens || 0,
      language: language,
      executionResult: 'Code analysis completed (execution disabled for security)'
    };
  }

  // Multi-Modal Processing
  async processMultiModal(inputs, options = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const operation = {
        service: 'multimodal_processing',
        execute: async () => {
          return await this.processMultiModalWithAI(inputs, options);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { inputs, options });
      
      await MetricsService.log('multimodal_processing', {
        duration: Date.now() - startTime,
        success: true,
        inputTypes: Object.keys(inputs),
        inputCount: Object.keys(inputs).length
      });
      
      return result;
      
    } catch (error) {
      await MetricsService.log('multimodal_processing_error', {
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }

  async processMultiModalWithAI(inputs, options) {
    const model = 'openai/gpt-4o'; // Best model for multi-modal processing
    
    const messages = [
      {
        role: 'user',
        content: []
      }
    ];
    
    // Add text prompt
    if (inputs.text) {
      messages[0].content.push({
        type: 'text',
        text: inputs.text
      });
    }
    
    // Add image
    if (inputs.image) {
      messages[0].content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${inputs.image}`
        }
      });
    }
    
    // Add document
    if (inputs.document) {
      messages[0].content.push({
        type: 'text',
        text: `Document content: ${inputs.document}`
      });
    }
    
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
        messages: messages,
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Multi-modal processing failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      analysis: data.choices[0].message.content,
      model: model,
      tokens: data.usage?.total_tokens || 0,
      inputTypes: Object.keys(inputs)
    };
  }

  // Utility Methods
  generateImageHash(imageData) {
    // Simple hash for image data
    let hash = 0;
    for (let i = 0; i < Math.min(imageData.length, 1000); i++) {
      const char = imageData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  getSupportedModes() {
    return this.supportedModes;
  }

  getModelCapabilities(model) {
    return this.modelCapabilities[model] || { text: true, image: false, audio: false, document: true, code: true };
  }

  async getHealthStatus() {
    return {
      supportedModes: this.supportedModes,
      modelCapabilities: this.modelCapabilities,
      isInitialized: this.isInitialized
    };
  }
}

export default new MultiModalAIService();
