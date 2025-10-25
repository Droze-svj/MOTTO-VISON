/**
 * User Learning Service
 * Learns from user interactions and adapts MOTTO's behavior
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import DataService from './DataService';

interface UserInteraction {
  id: string;
  timestamp: number;
  userInput: string;
  botResponse: string;
  userReaction?: 'positive' | 'negative' | 'neutral';
  responseTime: number;
  context: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: string;
    mood?: string;
    topic?: string;
  };
}

interface UserPreferences {
  communicationStyle: 'formal' | 'casual' | 'friendly' | 'professional';
  responseLength: 'brief' | 'moderate' | 'detailed';
  topicInterests: Map<string, number>; // topic -> interest score
  favoriteTopics: string[];
  dislikedTopics: string[];
  preferredTimeToInteract: string[];
  languageComplexity: 'simple' | 'moderate' | 'advanced';
  humorLevel: number; // 0-10
  formalityLevel: number; // 0-10
}

interface UserPattern {
  commonQuestions: Map<string, number>;
  conversationStarters: string[];
  typicalSessionLength: number;
  averageMessagesPerSession: number;
  preferredFeatures: string[];
  usageTimePatterns: Map<string, number>; // hour -> frequency
  responsePreferences: {
    likesExamples: boolean;
    likesStepByStep: boolean;
    likesVisualization: boolean;
    prefersQuickAnswers: boolean;
  };
}

interface LearningModel {
  version: number;
  totalInteractions: number;
  preferences: UserPreferences;
  patterns: UserPattern;
  personalityProfile: {
    introversion: number; // 0-100
    curiosity: number; // 0-100
    patience: number; // 0-100
    techSavviness: number; // 0-100
  };
  adaptationHistory: Array<{
    timestamp: number;
    change: string;
    reason: string;
  }>;
}

export class UserLearningService {
  private static instance: UserLearningService;
  private interactions: UserInteraction[] = [];
  private learningModel: LearningModel | null = null;
  private readonly STORAGE_KEY = 'user_learning_model';
  private readonly MAX_INTERACTIONS = 1000;

  private constructor() {
    this.initialize();
  }

  static getInstance(): UserLearningService {
    if (!UserLearningService.instance) {
      UserLearningService.instance = new UserLearningService();
    }
    return UserLearningService.instance;
  }

  // ============================================
  // Initialization
  // ============================================

  private async initialize(): Promise<void> {
    try {
      const stored = await DataService.get<LearningModel>(this.STORAGE_KEY);
      if (stored) {
        this.learningModel = stored;
        console.log('✅ User learning model loaded:', stored.totalInteractions, 'interactions');
      } else {
        this.learningModel = this.createDefaultModel();
        console.log('✅ Created new user learning model');
      }
    } catch (error) {
      console.error('Error loading learning model:', error);
      this.learningModel = this.createDefaultModel();
    }
  }

  private createDefaultModel(): LearningModel {
    return {
      version: 1,
      totalInteractions: 0,
      preferences: {
        communicationStyle: 'friendly',
        responseLength: 'moderate',
        topicInterests: new Map(),
        favoriteTopics: [],
        dislikedTopics: [],
        preferredTimeToInteract: [],
        languageComplexity: 'moderate',
        humorLevel: 5,
        formalityLevel: 5
      },
      patterns: {
        commonQuestions: new Map(),
        conversationStarters: [],
        typicalSessionLength: 0,
        averageMessagesPerSession: 0,
        preferredFeatures: [],
        usageTimePatterns: new Map(),
        responsePreferences: {
          likesExamples: true,
          likesStepByStep: true,
          likesVisualization: true,
          prefersQuickAnswers: false
        }
      },
      personalityProfile: {
        introversion: 50,
        curiosity: 50,
        patience: 50,
        techSavviness: 50
      },
      adaptationHistory: []
    };
  }

  // ============================================
  // Learning from Interactions
  // ============================================

  async recordInteraction(
    userInput: string,
    botResponse: string,
    responseTime: number,
    metadata?: {
      userReaction?: 'positive' | 'negative' | 'neutral';
      topic?: string;
      mood?: string;
    }
  ): Promise<void> {
    if (!this.learningModel) await this.initialize();

    const now = new Date();
    const hour = now.getHours();
    
    const interaction: UserInteraction = {
      id: `interaction_${Date.now()}`,
      timestamp: Date.now(),
      userInput,
      botResponse,
      userReaction: metadata?.userReaction,
      responseTime,
      context: {
        timeOfDay: this.getTimeOfDay(hour),
        dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
        mood: metadata?.mood,
        topic: metadata?.topic
      }
    };

    // Store interaction
    this.interactions.push(interaction);
    if (this.interactions.length > this.MAX_INTERACTIONS) {
      this.interactions.shift();
    }

    // Update learning model
    await this.updateLearningModel(interaction);

    // Save periodically
    if (this.learningModel!.totalInteractions % 10 === 0) {
      await this.saveLearningModel();
    }
  }

  private async updateLearningModel(interaction: UserInteraction): Promise<void> {
    if (!this.learningModel) return;

    this.learningModel.totalInteractions++;

    // Update topic interests
    if (interaction.context.topic) {
      const currentScore = this.learningModel.preferences.topicInterests.get(interaction.context.topic) || 0;
      const adjustment = interaction.userReaction === 'positive' ? 1 : 
                        interaction.userReaction === 'negative' ? -0.5 : 0.1;
      this.learningModel.preferences.topicInterests.set(
        interaction.context.topic,
        Math.max(0, Math.min(10, currentScore + adjustment))
      );
    }

    // Update time patterns
    const hour = new Date(interaction.timestamp).getHours().toString();
    const currentTimeCount = this.learningModel.patterns.usageTimePatterns.get(hour) || 0;
    this.learningModel.patterns.usageTimePatterns.set(hour, currentTimeCount + 1);

    // Update common questions
    const questionKey = this.normalizeQuestion(interaction.userInput);
    const questionCount = this.learningModel.patterns.commonQuestions.get(questionKey) || 0;
    this.learningModel.patterns.commonQuestions.set(questionKey, questionCount + 1);

    // Analyze response preferences
    this.analyzeResponsePreferences(interaction);

    // Update personality profile
    this.updatePersonalityProfile(interaction);
  }

  private analyzeResponsePreferences(interaction: UserInteraction): void {
    if (!this.learningModel) return;

    const input = interaction.userInput.toLowerCase();
    const prefs = this.learningModel.patterns.responsePreferences;

    // Detect preferences from user input patterns
    if (input.includes('example') || input.includes('show me')) {
      prefs.likesExamples = true;
    }
    
    if (input.includes('step by step') || input.includes('how do i')) {
      prefs.likesStepByStep = true;
    }
    
    if (input.includes('quick') || input.includes('tldr') || input.includes('brief')) {
      prefs.prefersQuickAnswers = true;
    }

    // Adjust based on response time
    if (interaction.responseTime < 2000 && interaction.userReaction === 'positive') {
      prefs.prefersQuickAnswers = true;
    }
  }

  private updatePersonalityProfile(interaction: UserInteraction): void {
    if (!this.learningModel) return;

    const profile = this.learningModel.personalityProfile;
    const input = interaction.userInput.toLowerCase();

    // Detect curiosity
    if (input.includes('why') || input.includes('how') || input.includes('explain')) {
      profile.curiosity = Math.min(100, profile.curiosity + 0.5);
    }

    // Detect tech savviness
    if (this.hasTechnicalTerms(input)) {
      profile.techSavviness = Math.min(100, profile.techSavviness + 0.5);
    }

    // Detect patience (longer sessions = more patience)
    const sessionDuration = this.getSessionDuration();
    if (sessionDuration > 300000) { // 5 minutes
      profile.patience = Math.min(100, profile.patience + 0.3);
    }
  }

  private hasTechnicalTerms(text: string): boolean {
    const techTerms = ['api', 'code', 'function', 'algorithm', 'database', 'server', 
                       'framework', 'typescript', 'javascript', 'python', 'sql'];
    return techTerms.some(term => text.includes(term));
  }

  // ============================================
  // Adaptation Logic
  // ============================================

  async adaptResponse(baseResponse: string, context: {
    topic?: string;
    intent?: string;
    urgency?: 'low' | 'medium' | 'high';
  }): Promise<string> {
    if (!this.learningModel) await this.initialize();
    if (!this.learningModel) return baseResponse;

    let adaptedResponse = baseResponse;

    // Adjust length based on preferences
    adaptedResponse = this.adjustResponseLength(adaptedResponse);

    // Adjust formality
    adaptedResponse = this.adjustFormality(adaptedResponse);

    // Add personalization
    adaptedResponse = this.personalizeResponse(adaptedResponse, context);

    // Adjust complexity
    adaptedResponse = this.adjustComplexity(adaptedResponse);

    return adaptedResponse;
  }

  private adjustResponseLength(response: string): string {
    if (!this.learningModel) return response;

    const pref = this.learningModel.preferences.responseLength;
    
    if (pref === 'brief' && response.length > 200) {
      // Condense to first 2 sentences
      const sentences = response.split(/[.!?]+/);
      return sentences.slice(0, 2).join('. ') + '.';
    }
    
    if (pref === 'detailed' && response.length < 100) {
      // Add elaboration prompt
      return response + '\n\nWould you like me to elaborate further?';
    }

    return response;
  }

  private adjustFormality(response: string): string {
    if (!this.learningModel) return response;

    const formality = this.learningModel.preferences.formalityLevel;
    
    if (formality < 3) {
      // Make more casual
      response = response.replace(/Hello/g, 'Hey');
      response = response.replace(/I would/g, "I'd");
      response = response.replace(/cannot/g, "can't");
    } else if (formality > 7) {
      // Make more formal
      response = response.replace(/Hey/g, 'Hello');
      response = response.replace(/I'd/g, 'I would');
      response = response.replace(/can't/g, 'cannot');
    }

    return response;
  }

  private personalizeResponse(response: string, context: any): string {
    if (!this.learningModel) return response;

    // Add personalized greeting based on time patterns
    const hour = new Date().getHours();
    const isUsualTime = this.isUsualInteractionTime(hour);
    
    if (!isUsualTime && this.learningModel.totalInteractions > 20) {
      const timeOfDay = this.getTimeOfDay(hour);
      if (timeOfDay === 'night') {
        response = "You're up late! " + response;
      } else if (timeOfDay === 'morning' && hour < 6) {
        response = "Early start today! " + response;
      }
    }

    // Reference favorite topics
    if (context.topic && this.isFavoriteTopic(context.topic)) {
      response = response + "\n\nI know you enjoy " + context.topic + " - happy to discuss more!";
    }

    return response;
  }

  private adjustComplexity(response: string): string {
    if (!this.learningModel) return response;

    const complexity = this.learningModel.preferences.languageComplexity;
    const techLevel = this.learningModel.personalityProfile.techSavviness;

    if (complexity === 'simple' || techLevel < 30) {
      // Simplify technical terms
      response = response.replace(/utilize/g, 'use');
      response = response.replace(/implement/g, 'add');
      response = response.replace(/initialize/g, 'start');
    }

    return response;
  }

  // ============================================
  // Predictions & Suggestions
  // ============================================

  getSuggestedTopics(): string[] {
    if (!this.learningModel) return [];

    const topicScores = Array.from(this.learningModel.preferences.topicInterests.entries());
    return topicScores
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  predictNextQuestion(): string[] {
    if (!this.learningModel) return [];

    const questions = Array.from(this.learningModel.patterns.commonQuestions.entries());
    return questions
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([question]) => question);
  }

  getOptimalInteractionTime(): string {
    if (!this.learningModel) return 'anytime';

    const timePatterns = Array.from(this.learningModel.patterns.usageTimePatterns.entries());
    if (timePatterns.length === 0) return 'anytime';

    const mostActiveHour = timePatterns.sort((a, b) => b[1] - a[1])[0][0];
    return `${mostActiveHour}:00`;
  }

  // ============================================
  // Insights & Analytics
  // ============================================

  getUserInsights(): {
    totalInteractions: number;
    favoriteTopics: string[];
    communicationStyle: string;
    personalityTraits: string[];
    learningProgress: number;
    recommendations: string[];
  } {
    if (!this.learningModel) {
      return {
        totalInteractions: 0,
        favoriteTopics: [],
        communicationStyle: 'learning',
        personalityTraits: [],
        learningProgress: 0,
        recommendations: []
      };
    }

    const insights = {
      totalInteractions: this.learningModel.totalInteractions,
      favoriteTopics: this.getSuggestedTopics(),
      communicationStyle: this.learningModel.preferences.communicationStyle,
      personalityTraits: this.getPersonalityTraits(),
      learningProgress: Math.min(100, (this.learningModel.totalInteractions / 100) * 100),
      recommendations: this.generateRecommendations()
    };

    return insights;
  }

  private getPersonalityTraits(): string[] {
    if (!this.learningModel) return [];

    const profile = this.learningModel.personalityProfile;
    const traits: string[] = [];

    if (profile.curiosity > 70) traits.push('Highly Curious');
    if (profile.patience > 70) traits.push('Patient');
    if (profile.techSavviness > 70) traits.push('Tech Savvy');
    if (profile.introversion < 30) traits.push('Outgoing');
    if (profile.introversion > 70) traits.push('Thoughtful');

    return traits;
  }

  private generateRecommendations(): string[] {
    if (!this.learningModel) return [];

    const recommendations: string[] = [];

    // Recommend features based on patterns
    if (this.learningModel.patterns.responsePreferences.likesExamples) {
      recommendations.push('Try asking for examples to get more practical demonstrations');
    }

    if (this.learningModel.personalityProfile.curiosity > 70) {
      recommendations.push('Explore our advanced features for deeper insights');
    }

    if (this.learningModel.totalInteractions > 50) {
      recommendations.push('Your learning profile is well established! Check your personalized insights.');
    }

    return recommendations;
  }

  // ============================================
  // Utilities
  // ============================================

  private getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private normalizeQuestion(question: string): string {
    return question.toLowerCase().replace(/[^\w\s]/g, '').trim();
  }

  private isUsualInteractionTime(hour: number): boolean {
    if (!this.learningModel) return true;

    const hourStr = hour.toString();
    const count = this.learningModel.patterns.usageTimePatterns.get(hourStr) || 0;
    const avgCount = Array.from(this.learningModel.patterns.usageTimePatterns.values())
      .reduce((a, b) => a + b, 0) / this.learningModel.patterns.usageTimePatterns.size;

    return count > avgCount * 0.5;
  }

  private isFavoriteTopic(topic: string): boolean {
    if (!this.learningModel) return false;
    const score = this.learningModel.preferences.topicInterests.get(topic) || 0;
    return score > 5;
  }

  private getSessionDuration(): number {
    if (this.interactions.length < 2) return 0;
    const firstInteraction = this.interactions[0].timestamp;
    const lastInteraction = this.interactions[this.interactions.length - 1].timestamp;
    return lastInteraction - firstInteraction;
  }

  // ============================================
  // Persistence
  // ============================================

  private async saveLearningModel(): Promise<void> {
    if (!this.learningModel) return;

    try {
      // Convert Maps to objects for storage
      const modelToStore = {
        ...this.learningModel,
        preferences: {
          ...this.learningModel.preferences,
          topicInterests: Object.fromEntries(this.learningModel.preferences.topicInterests)
        },
        patterns: {
          ...this.learningModel.patterns,
          commonQuestions: Object.fromEntries(this.learningModel.patterns.commonQuestions),
          usageTimePatterns: Object.fromEntries(this.learningModel.patterns.usageTimePatterns)
        }
      };

      await DataService.set(this.STORAGE_KEY, modelToStore);
      console.log('✅ Learning model saved');
    } catch (error) {
      console.error('Error saving learning model:', error);
    }
  }

  async exportLearningData(): Promise<string> {
    if (!this.learningModel) return '{}';
    return JSON.stringify(this.learningModel, null, 2);
  }

  async resetLearning(): Promise<void> {
    this.learningModel = this.createDefaultModel();
    this.interactions = [];
    await DataService.remove(this.STORAGE_KEY);
    console.log('✅ Learning model reset');
  }

  getLearningModel(): LearningModel | null {
    return this.learningModel;
  }
}

export default UserLearningService.getInstance();
