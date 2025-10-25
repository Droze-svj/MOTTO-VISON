/**
 * Deep Personalization Service
 * Advanced personalization beyond basic learning
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import DataService from './DataService';

interface UserProfile {
  // Demographics (optional, user-provided)
  name?: string;
  age?: number;
  occupation?: string;
  location?: string;
  timezone?: string;
  
  // Behavioral Patterns
  activeHours: number[]; // Hours they're most active
  sessionDuration: number[]; // Typical session lengths
  messageFrequency: number; // Messages per session
  responseTime: number; // How fast they reply
  
  // Communication Style
  vocabularyLevel: 'simple' | 'moderate' | 'advanced' | 'expert';
  sentenceLength: 'short' | 'medium' | 'long';
  usesEmojis: boolean;
  usesSlang: boolean;
  formalityPreference: number; // 0-10
  humorAppreciation: number; // 0-10
  
  // Learning Preferences
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  prefersExamples: boolean;
  prefersStepByStep: boolean;
  prefersAnalogies: boolean;
  detailLevel: 'high-level' | 'detailed' | 'expert';
  
  // Interests Deep Dive
  primaryInterests: Array<{topic: string; expertise: number; lastDiscussed: number}>;
  secondaryInterests: string[];
  dislikedTopics: string[];
  goalTopics: Array<{topic: string; goal: string; progress: number}>;
  
  // Emotional Profile
  typicalMood: 'energetic' | 'calm' | 'serious' | 'playful';
  stressIndicators: string[];
  positivityScore: number; // 0-100
  
  // Usage Patterns
  commonQuestions: Map<string, number>;
  favoriteFeatures: string[];
  problemAreas: string[]; // What they struggle with
  successAreas: string[]; // What they excel at
  
  // Personal Context
  currentProjects: string[];
  recentGoals: string[];
  rememberedFacts: Map<string, string>;
  importantDates: Map<string, string>;
  personalPreferences: Map<string, any>;
}

interface PersonalizationRule {
  condition: (profile: UserProfile, input: string) => boolean;
  adaptation: (response: string, profile: UserProfile) => string;
  priority: number;
}

export class DeepPersonalizationService {
  private static instance: DeepPersonalizationService;
  private userProfiles: Map<string, UserProfile> = new Map();
  private personalizationRules: PersonalizationRule[] = [];

  private constructor() {
    this.initializeRules();
  }

  static getInstance(): DeepPersonalizationService {
    if (!DeepPersonalizationService.instance) {
      DeepPersonalizationService.instance = new DeepPersonalizationService();
    }
    return DeepPersonalizationService.instance;
  }

  // ============================================
  // PROFILE BUILDING
  // ============================================

  async buildProfile(userId: string): Promise<void> {
    const stored = await DataService.get<UserProfile>(`profile_${userId}`);
    
    if (stored) {
      this.userProfiles.set(userId, stored);
    } else {
      this.userProfiles.set(userId, this.createDefaultProfile());
    }
  }

  private createDefaultProfile(): UserProfile {
    return {
      activeHours: [],
      sessionDuration: [],
      messageFrequency: 5,
      responseTime: 30000,
      vocabularyLevel: 'moderate',
      sentenceLength: 'medium',
      usesEmojis: true,
      usesSlang: false,
      formalityPreference: 5,
      humorAppreciation: 5,
      learningStyle: 'reading',
      prefersExamples: true,
      prefersStepByStep: true,
      prefersAnalogies: false,
      detailLevel: 'detailed',
      primaryInterests: [],
      secondaryInterests: [],
      dislikedTopics: [],
      goalTopics: [],
      typicalMood: 'calm',
      stressIndicators: [],
      positivityScore: 50,
      commonQuestions: new Map(),
      favoriteFeatures: [],
      problemAreas: [],
      successAreas: [],
      currentProjects: [],
      recentGoals: [],
      rememberedFacts: new Map(),
      importantDates: new Map(),
      personalPreferences: new Map()
    };
  }

  // ============================================
  // AUTOMATIC PROFILE UPDATES
  // ============================================

  async updateFromInteraction(
    userId: string,
    userInput: string,
    timestamp: number,
    responseTime: number
  ): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      await this.buildProfile(userId);
      return this.updateFromInteraction(userId, userInput, timestamp, responseTime);
    }

    // Update active hours
    const hour = new Date(timestamp).getHours();
    if (!profile.activeHours.includes(hour)) {
      profile.activeHours.push(hour);
    }

    // Update response time
    profile.responseTime = (profile.responseTime * 0.9) + (responseTime * 0.1);

    // Analyze vocabulary
    this.analyzeVocabulary(userInput, profile);

    // Detect communication style
    this.detectCommunicationStyle(userInput, profile);

    // Extract personal information
    await this.extractPersonalInfo(userInput, profile);

    // Update goals if mentioned
    this.updateGoals(userInput, profile);

    await this.saveProfile(userId);
  }

  private analyzeVocabulary(text: string, profile: UserProfile): void {
    const words = text.split(' ').filter(w => w.length > 3);
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;

    // Complex words = advanced vocabulary
    const complexWords = words.filter(w => w.length > 8).length;
    const complexRatio = complexWords / words.length;

    if (complexRatio > 0.3 || avgWordLength > 6) {
      profile.vocabularyLevel = 'advanced';
    } else if (complexRatio > 0.15 || avgWordLength > 5) {
      profile.vocabularyLevel = 'moderate';
    } else {
      profile.vocabularyLevel = 'simple';
    }
  }

  private detectCommunicationStyle(text: string, profile: UserProfile): void {
    // Emojis
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
    if (emojiRegex.test(text)) {
      profile.usesEmojis = true;
    }

    // Slang
    const slangWords = ['gonna', 'wanna', 'kinda', 'sorta', 'yeah', 'nah'];
    if (slangWords.some(word => text.toLowerCase().includes(word))) {
      profile.usesSlang = true;
      profile.formalityPreference = Math.max(0, profile.formalityPreference - 0.5);
    }

    // Sentence structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const avgLength = text.length / Math.max(sentences.length, 1);
    
    if (avgLength < 20) profile.sentenceLength = 'short';
    else if (avgLength < 50) profile.sentenceLength = 'medium';
    else profile.sentenceLength = 'long';

    // Exclamation marks = energetic
    if ((text.match(/!/g) || []).length > 1) {
      profile.typicalMood = 'energetic';
    }
  }

  private async extractPersonalInfo(text: string, profile: UserProfile): Promise<void> {
    const lower = text.toLowerCase();

    // Extract name
    if (lower.match(/my name is|i'm|i am/) && !profile.name) {
      const match = text.match(/(?:my name is|i'm|i am)\s+([A-Z][a-z]+)/);
      if (match) profile.name = match[1];
    }

    // Extract location
    if (lower.match(/i live in|from|in/) && !profile.location) {
      const match = text.match(/(?:live in|from|in)\s+([A-Z][a-z]+)/);
      if (match) profile.location = match[1];
    }

    // Extract occupation
    if (lower.match(/i work as|i'm a|job is/)) {
      const match = text.match(/(?:work as|i'm a|job is)\s+(?:a\s+)?([a-z\s]+)/i);
      if (match) profile.occupation = match[1].trim();
    }

    // Extract goals
    if (lower.match(/i want to|i'm trying to|my goal is/)) {
      const goal = text.substring(text.toLowerCase().indexOf('to') + 3).trim();
      if (!profile.recentGoals.includes(goal)) {
        profile.recentGoals.push(goal);
      }
    }

    // Extract email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      profile.rememberedFacts.set('email', emailMatch[0]);
    }

    // Extract phone
    const phoneMatch = text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
    if (phoneMatch) {
      profile.rememberedFacts.set('phone', phoneMatch[0]);
    }

    // Remember important facts
    if (lower.match(/remember|important|don't forget/)) {
      const fact = text.replace(/remember|important|don't forget/gi, '').trim();
      profile.rememberedFacts.set(`fact_${Date.now()}`, fact);
    }
  }

  private updateGoals(text: string, profile: UserProfile): void {
    const lower = text.toLowerCase();
    const goalKeywords = ['learn', 'improve', 'get better at', 'master', 'understand'];

    goalKeywords.forEach(keyword => {
      if (lower.includes(keyword)) {
        const topic = text.substring(text.toLowerCase().indexOf(keyword) + keyword.length).trim();
        const existingGoal = profile.goalTopics.find(g => g.topic === topic);
        
        if (!existingGoal && topic.length > 3) {
          profile.goalTopics.push({
            topic: topic.substring(0, 50),
            goal: `Learn ${topic}`,
            progress: 0
          });
        }
      }
    });
  }

  // ============================================
  // DEEP PERSONALIZATION
  // ============================================

  async personalizeResponse(
    userId: string,
    baseResponse: string,
    context: {input: string; topic?: string}
  ): Promise<string> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return baseResponse;

    let personalized = baseResponse;

    // Apply all personalization rules
    const sortedRules = this.personalizationRules.sort((a, b) => b.priority - a.priority);
    
    for (const rule of sortedRules) {
      if (rule.condition(profile, context.input)) {
        personalized = rule.adaptation(personalized, profile);
      }
    }

    // Personal touches
    personalized = this.addPersonalTouches(personalized, profile, context);

    return personalized;
  }

  private addPersonalTouches(
    response: string,
    profile: UserProfile,
    context: any
  ): string {
    let enhanced = response;

    // Use their name if we know it
    if (profile.name && Math.random() > 0.8) {
      enhanced = `${profile.name}, ${enhanced.charAt(0).toLowerCase()}${enhanced.slice(1)}`;
    }

    // Reference their goals
    if (context.topic && profile.goalTopics.find(g => g.topic.includes(context.topic))) {
      enhanced += `\n\nThis aligns with your goal to learn ${context.topic}! 🎯`;
    }

    // Reference their location
    if (profile.location && context.input.includes('here')) {
      enhanced = enhanced.replace(/here/g, `in ${profile.location}`);
    }

    // Acknowledge progress on interests
    const relatedInterest = profile.primaryInterests.find(i => 
      context.topic?.includes(i.topic)
    );
    if (relatedInterest && relatedInterest.expertise > 5) {
      enhanced += `\n\nGiven your expertise in ${relatedInterest.topic}, you probably already know this, but let me add some depth...`;
    }

    return enhanced;
  }

  // ============================================
  // PERSONALIZATION RULES
  // ============================================

  private initializeRules(): void {
    // Rule: Match vocabulary level
    this.personalizationRules.push({
      priority: 10,
      condition: (profile) => profile.vocabularyLevel === 'simple',
      adaptation: (response, profile) => {
        return response
          .replace(/utilize/g, 'use')
          .replace(/implement/g, 'add')
          .replace(/subsequently/g, 'then')
          .replace(/therefore/g, 'so');
      }
    });

    // Rule: Match sentence length
    this.personalizationRules.push({
      priority: 9,
      condition: (profile) => profile.sentenceLength === 'short',
      adaptation: (response) => {
        // Split into shorter sentences
        return response.split('. ').slice(0, 3).join('. ') + '.';
      }
    });

    // Rule: Add emojis if user uses them
    this.personalizationRules.push({
      priority: 5,
      condition: (profile) => profile.usesEmojis,
      adaptation: (response) => {
        const emojis = ['✨', '🎯', '💡', '🚀', '💪'];
        return response + ' ' + emojis[Math.floor(Math.random() * emojis.length)];
      }
    });

    // Rule: Use casual language if user does
    this.personalizationRules.push({
      priority: 8,
      condition: (profile) => profile.usesSlang || profile.formalityPreference < 4,
      adaptation: (response) => {
        return response
          .replace(/I would/g, "I'd")
          .replace(/you would/g, "you'd")
          .replace(/cannot/g, "can't")
          .replace(/do not/g, "don't");
      }
    });

    // Rule: Add examples if user likes them
    this.personalizationRules.push({
      priority: 7,
      condition: (profile) => profile.prefersExamples,
      adaptation: (response, profile) => {
        if (!response.includes('example') && response.length > 100) {
          return response + '\n\nWant me to show you a specific example?';
        }
        return response;
      }
    });

    // Rule: Break into steps if user prefers
    this.personalizationRules.push({
      priority: 7,
      condition: (profile) => profile.prefersStepByStep,
      adaptation: (response) => {
        // If response can be broken into steps
        if (response.includes('first') || response.includes('then') || response.includes('next')) {
          return response; // Already has steps
        }
        return response;
      }
    });
  }

  // ============================================
  // CONTEXTUAL PERSONALIZATION
  // ============================================

  async getPersonalizedGreeting(userId: string): Promise<string> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return "Hello!";

    const hour = new Date().getHours();
    const isActiveHour = profile.activeHours.includes(hour);
    
    let greeting = '';

    // Time-based
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';  
    else if (hour < 22) greeting = 'Good evening';
    else greeting = 'Hey there';

    // Add name if we know it
    if (profile.name) {
      greeting += `, ${profile.name}`;
    }

    // Acknowledge unusual time
    if (!isActiveHour && profile.activeHours.length > 5) {
      greeting += '! This is unusual for you - everything okay?';
    } else {
      greeting += '!';
    }

    // Reference current projects
    if (profile.currentProjects.length > 0) {
      greeting += ` Still working on ${profile.currentProjects[0]}?`;
    }

    return greeting;
  }

  async getPersonalizedSuggestions(userId: string): Promise<string[]> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return [];

    const suggestions: string[] = [];

    // Goal-based suggestions
    profile.goalTopics.forEach(goal => {
      if (goal.progress < 100) {
        suggestions.push(`Continue learning ${goal.topic}`);
      }
    });

    // Interest-based suggestions
    profile.primaryInterests
      .sort((a, b) => b.expertise - a.expertise)
      .slice(0, 3)
      .forEach(interest => {
        suggestions.push(`Tell me more about ${interest.topic}`);
      });

    // Problem area assistance
    profile.problemAreas.forEach(area => {
      suggestions.push(`Help me understand ${area} better`);
    });

    // Common questions
    const topQuestions = Array.from(profile.commonQuestions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([q]) => q);
    
    suggestions.push(...topQuestions);

    return suggestions.slice(0, 6);
  }

  // ============================================
  // INSIGHTS & ANALYTICS
  // ============================================

  async getDeepInsights(userId: string): Promise<any> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return null;

    return {
      profile: {
        name: profile.name || 'Not set',
        occupation: profile.occupation || 'Not set',
        location: profile.location || 'Not set'
      },
      communication: {
        vocabularyLevel: profile.vocabularyLevel,
        formality: `${profile.formalityPreference}/10`,
        typical: profile.sentenceLength + ' sentences',
        style: profile.usesSlang ? 'Casual' : 'Standard'
      },
      behavior: {
        activeHours: this.formatActiveHours(profile.activeHours),
        avgSession: this.avgSessionDuration(profile.sessionDuration),
        responseSpeed: `${Math.round(profile.responseTime / 1000)}s`
      },
      interests: {
        primary: profile.primaryInterests.slice(0, 5).map(i => ({
          topic: i.topic,
          expertise: `${i.expertise}/10`,
          lastDiscussed: this.formatTime(i.lastDiscussed)
        })),
        goals: profile.goalTopics.map(g => ({
          goal: g.goal,
          progress: `${g.progress}%`
        }))
      },
      personality: {
        mood: profile.typicalMood,
        positivity: `${profile.positivityScore}%`,
        humor: `${profile.humorAppreciation}/10`
      },
      rememberedFacts: Object.fromEntries(profile.rememberedFacts),
      recommendations: this.generatePersonalizedRecommendations(profile)
    };
  }

  private generatePersonalizedRecommendations(profile: UserProfile): string[] {
    const recs: string[] = [];

    // Based on goals
    profile.goalTopics.forEach(goal => {
      if (goal.progress < 30) {
        recs.push(`Start with fundamentals of ${goal.topic}`);
      } else if (goal.progress < 70) {
        recs.push(`Dive deeper into ${goal.topic} advanced concepts`);
      }
    });

    // Based on interests
    const topInterest = profile.primaryInterests[0];
    if (topInterest && topInterest.expertise > 7) {
      recs.push(`You're an expert in ${topInterest.topic}! Consider teaching others.`);
    }

    // Based on learning style
    if (profile.learningStyle === 'visual') {
      recs.push('Try asking for diagrams or visual explanations');
    }

    // Based on time patterns
    if (profile.activeHours.length > 0) {
      const peak = this.getMostActiveHour(profile.activeHours);
      recs.push(`You're most productive around ${peak}:00 - schedule important tasks then`);
    }

    return recs.slice(0, 5);
  }

  // ============================================
  // UTILITIES
  // ============================================

  private formatActiveHours(hours: number[]): string {
    if (hours.length === 0) return 'Not enough data';
    const sorted = hours.sort((a, b) => a - b);
    return `${sorted[0]}:00 - ${sorted[sorted.length - 1]}:00`;
  }

  private avgSessionDuration(durations: number[]): string {
    if (durations.length === 0) return 'Unknown';
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    return `${Math.round(avg / 60000)} minutes`;
  }

  private getMostActiveHour(hours: number[]): number {
    const counts = new Map<number, number>();
    hours.forEach(h => counts.set(h, (counts.get(h) || 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
  }

  private formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 3600000) return 'Just now';
    if (diff < 86400000) return 'Today';
    if (diff < 172800000) return 'Yesterday';
    return date.toLocaleDateString();
  }

  private async saveProfile(userId: string): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    // Convert Maps for storage
    const storableProfile = {
      ...profile,
      commonQuestions: Object.fromEntries(profile.commonQuestions),
      rememberedFacts: Object.fromEntries(profile.rememberedFacts),
      importantDates: Object.fromEntries(profile.importantDates),
      personalPreferences: Object.fromEntries(profile.personalPreferences)
    };

    await DataService.set(`profile_${userId}`, storableProfile);
  }

  // ============================================
  // PUBLIC API
  // ============================================

  async rememberedFact(userId: string, key: string): Promise<string | null> {
    const profile = this.userProfiles.get(userId);
    return profile?.rememberedFacts.get(key) || null;
  }

  async addGoal(userId: string, goal: string, topic: string): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    profile.goalTopics.push({
      topic,
      goal,
      progress: 0
    });

    await this.saveProfile(userId);
  }

  async updateGoalProgress(userId: string, topic: string, progress: number): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    const goal = profile.goalTopics.find(g => g.topic === topic);
    if (goal) {
      goal.progress = Math.min(100, progress);
      await this.saveProfile(userId);
    }
  }

  getUserProfile(userId: string): UserProfile | null {
    return this.userProfiles.get(userId) || null;
  }
}

export default DeepPersonalizationService.getInstance();
