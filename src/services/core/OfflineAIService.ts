/**
 * Offline AI Service
 * Local AI processing without external APIs
 * Uses pattern matching + learned responses
 */

import FreeKnowledgeService from './FreeKnowledgeService';
import UserLearningService from './UserLearningService';
import ContextManagerService from './ContextManagerService';

interface LocalAIModel {
  version: string;
  patterns: Map<string, string[]>;
  responses: Map<string, string>;
  entityRecognition: Map<string, string[]>;
  lastTraining: number;
}

export class OfflineAIService {
  private static instance: OfflineAIService;
  private model: LocalAIModel;
  private trainingData: Array<{input: string; output: string; score: number}> = [];

  private constructor() {
    this.model = {
      version: '1.0.0',
      patterns: new Map(),
      responses: new Map(),
      entityRecognition: new Map(),
      lastTraining: Date.now()
    };
    this.initializeModel();
  }

  static getInstance(): OfflineAIService {
    if (!OfflineAIService.instance) {
      OfflineAIService.instance = new OfflineAIService();
    }
    return OfflineAIService.instance;
  }

  // ============================================
  // Local AI Processing
  // ============================================

  async processOffline(
    userId: string,
    userInput: string,
    context: any
  ): Promise<string> {
    // 1. Try user's personal knowledge first
    const userResponse = await FreeKnowledgeService.generateKnowledgeableResponse(
      userId,
      userInput
    );
    
    if (userResponse && !userResponse.includes("I'm still learning")) {
      return userResponse;
    }
    
    // 2. Pattern matching with learned responses
    const patternResponse = this.matchPattern(userInput);
    if (patternResponse) {
      return patternResponse;
    }
    
    // 3. Context-based generation
    const contextResponse = this.generateFromContext(userInput, context);
    if (contextResponse) {
      return contextResponse;
    }
    
    // 4. Template-based response
    return this.generateTemplateResponse(userInput);
  }

  private matchPattern(input: string): string | null {
    const inputLower = input.toLowerCase();
    
    for (const [pattern, responses] of this.model.patterns) {
      if (inputLower.includes(pattern)) {
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
    
    return null;
  }

  private generateFromContext(input: string, context: any): string | null {
    const recentMessages = ContextManagerService.getRecentContext();
    
    if (recentMessages.length < 2) return null;
    
    // Find related previous responses
    const topics = this.extractTopics(input);
    const previousTopics = recentMessages
      .map(m => this.extractTopics(m.text))
      .flat();
    
    // If continuing same topic
    const commonTopics = topics.filter(t => previousTopics.includes(t));
    if (commonTopics.length > 0) {
      return `Continuing our discussion about ${commonTopics[0]}, ${this.generateTemplateResponse(input)}`;
    }
    
    return null;
  }

  private generateTemplateResponse(input: string): string {
    const topics = this.extractTopics(input);
    const isQuestion = input.includes('?') || input.toLowerCase().startsWith('what') || 
                      input.toLowerCase().startsWith('how') || input.toLowerCase().startsWith('why');
    
    if (isQuestion && topics.length > 0) {
      return `Great question about ${topics[0]}! Based on what I've learned, ${topics[0]} is an interesting topic. Let me share what I know... Would you like me to explain a specific aspect?`;
    }
    
    return `I understand you're interested in this. While I continue learning, could you help me understand what specific aspect you're most curious about?`;
  }

  // ============================================
  // Continuous Learning from User
  // ============================================

  async trainFromFeedback(
    userInput: string,
    mottoResponse: string,
    wasGood: boolean
  ): Promise<void> {
    // Add to training data
    this.trainingData.push({
      input: userInput,
      output: mottoResponse,
      score: wasGood ? 1 : -0.5
    });
    
    // If got enough good examples, update patterns
    if (this.trainingData.length > 10) {
      await this.updatePatterns();
    }
  }

  private async updatePatterns(): Promise<void> {
    // Find common successful patterns
    const goodExamples = this.trainingData.filter(d => d.score > 0);
    
    goodExamples.forEach(example => {
      const keywords = this.extractKeywords(example.input);
      
      keywords.forEach(keyword => {
        const existing = this.model.patterns.get(keyword) || [];
        if (!existing.includes(example.output)) {
          existing.push(example.output);
          this.model.patterns.set(keyword, existing);
        }
      });
    });
    
    console.log(`🧠 Updated model with ${goodExamples.length} good examples`);
    
    // Trim old data
    if (this.trainingData.length > 1000) {
      this.trainingData = this.trainingData.slice(-500);
    }
  }

  // ============================================
  // Utilities
  // ============================================

  private initializeModel(): void {
    // Pre-trained patterns for common queries
    const basePatterns = {
      'hello': [
        "Hello! How can I help you today?",
        "Hi there! What brings you here?",
        "Hey! Good to chat with you!"
      ],
      'help': [
        "I'm here to help! What do you need?",
        "Of course! What can I assist with?",
        "Happy to help! What's the issue?"
      ],
      'thank': [
        "You're welcome!",
        "Anytime!",
        "My pleasure!"
      ],
      'code': [
        "I can help with coding! What language?",
        "Programming question? I'm ready to help!",
        "Let's solve this coding challenge together!"
      ]
    };
    
    Object.entries(basePatterns).forEach(([key, responses]) => {
      this.model.patterns.set(key, responses);
    });
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(w => w.length > 4); // Words longer than 4 chars
  }

  private extractTopics(text: string): string[] {
    return FreeKnowledgeService['extractTopics'](text) || [];
  }

  getModelStats(): {
    patterns: number;
    trainingExamples: number;
    lastTraining: string;
  } {
    return {
      patterns: this.model.patterns.size,
      trainingExamples: this.trainingData.length,
      lastTraining: new Date(this.model.lastTraining).toLocaleString()
    };
  }
}

export default OfflineAIService.getInstance();
