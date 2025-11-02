/**
 * Ultra Personalization Service
 * 30+ Advanced Personalization Dimensions
 */

import DataService from './DataService';

interface UltraProfile {
  // COGNITIVE PROFILE (10 dimensions)
  cognitiveStyle: {
    thinkingSpeed: 'fast' | 'moderate' | 'deliberate';
    processingDepth: 'surface' | 'moderate' | 'deep';
    attentionSpan: number; // seconds
    memoryStrength: 'excellent' | 'good' | 'needs-reinforcement';
    learningCurve: 'steep' | 'moderate' | 'gradual';
    abstractionPreference: 'concrete' | 'balanced' | 'abstract';
    analyticalVsCreative: number; // 0=creative, 10=analytical
    detailVsBigPicture: number; // 0=big picture, 10=details
    sequentialVsRandom: number; // 0=random, 10=sequential
    verbalVsVisual: number; // 0=visual, 10=verbal
  };

  // PERSONALITY DIMENSIONS (10 traits)
  personality: {
    openness: number; // 0-100
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    curiosity: number;
    persistence: number;
    risktaking: number;
    empathy: number;
    optimism: number;
  };

  // MOTIVATION & GOALS (8 dimensions)
  motivation: {
    primaryDrive: 'achievement' | 'affiliation' | 'power' | 'autonomy' | 'mastery';
    goalOrientation: 'learning' | 'performance' | 'social' | 'intrinsic';
    timeHorizon: 'immediate' | 'short-term' | 'long-term';
    rewardSensitivity: number; // 0-10
    challengePreference: 'easy' | 'moderate' | 'difficult' | 'extreme';
    competitiveness: number; // 0-10
    growthMindset: number; // 0-10
    intrinsicMotivation: number; // 0-10
  };

  // SOCIAL & INTERACTION (5 dimensions)
  social: {
    communicationPreference: 'direct' | 'diplomatic' | 'elaborate';
    feedbackStyle: 'blunt' | 'constructive' | 'gentle';
    relationshipStage: 'stranger' | 'acquaintance' | 'friend' | 'trusted-advisor';
    trustLevel: number; // 0-100
    sharingComfort: number; // 0-100 (how much they share)
  };

  // TEMPORAL PATTERNS (7 dimensions)
  temporal: {
    peakHours: number[];
    lowEnergyHours: number[];
    weekdayVsWeekend: 'weekday' | 'weekend' | 'both';
    morningPersonVsNight: 'morning' | 'evening' | 'night' | 'flexible';
    sessionLengthPreference: number; // minutes
    interactionFrequency: 'multiple-daily' | 'daily' | 'weekly';
    timeZone: string;
  };

  // EXPERTISE TRACKING (10 dimensions)
  expertise: {
    technicalLevel: number; // 0-100
    domainKnowledge: Map<string, number>; // topic -> expertise
    skillProgress: Map<string, {current: number; target: number; velocity: number}>;
    knowledgeGaps: string[];
    masteredAreas: string[];
    strugglingAreas: string[];
    learningVelocity: Map<string, number>; // how fast they learn per topic
    teachingAbility: number; // can they explain back?
    problemSolvingSkill: number; // 0-100
    criticalThinking: number; // 0-100
  };

  // CONTENT PREFERENCES (8 dimensions)
  content: {
    preferredFormats: ('text' | 'code' | 'diagrams' | 'lists' | 'stories' | 'analogies')[];
    exampleQuantity: 'minimal' | 'moderate' | 'abundant';
    codeCommentLevel: 'none' | 'minimal' | 'detailed';
    technicalDepth: 'simplified' | 'standard' | 'advanced' | 'expert';
    humorLevel: number; // 0-10
    emojiUsage: number; // 0-10
    narrativeStyle: 'factual' | 'conversational' | 'storytelling';
    lengthPreference: 'brief' | 'balanced' | 'comprehensive';
  };

  // INTERACTION PATTERNS (5 dimensions)
  interaction: {
    questioningStyle: 'direct' | 'exploratory' | 'philosophical';
    feedbackFrequency: number; // how often they give 👍👎
    followUpEngagement: number; // do they engage with follow-ups?
    initiationStyle: 'specific' | 'broad' | 'casual';
    conversationDepth: 'shallow' | 'moderate' | 'deep';
  };

  // EMOTIONAL INTELLIGENCE (8 dimensions)
  emotional: {
    emotionalRange: ('happy' | 'sad' | 'excited' | 'frustrated' | 'curious' | 'anxious' | 'confident')[];
    emotionalStability: number; // 0-100
    stressThreshold: 'low' | 'medium' | 'high';
    positivityRatio: number; // positive/negative messages
    empathyReceptiveness: number; // how well they respond to empathy
    celebrationStyle: 'understated' | 'moderate' | 'enthusiastic';
    disappointmentResponse: 'resilient' | 'needs-support';
    emotionalExpressiveness: number; // 0-10
  };

  // ADAPTIVE HISTORY (10 dimensions)
  adaptiveHistory: {
    successfulAdaptations: string[];
    failedAdaptations: string[];
    preferredAdaptationSpeed: 'immediate' | 'gradual' | 'cautious';
    responseToChange: 'embracing' | 'neutral' | 'resistant';
    feedbackIncorporationRate: number; // how quickly they adopt suggestions
    experimentalFeatureAdoption: number; // 0-10 (early adopter score)
    consistencyPreference: number; // prefers same vs variety
    surpriseAppreciation: number; // likes unexpected vs predictable
    adaptabilityScore: number; // how adaptable is the user
    metaLearningRate: number; // how fast MOTTO learns them
  };
}

export class UltraPersonalizationService {
  private static instance: UltraPersonalizationService;
  private ultraProfiles: Map<string, UltraProfile> = new Map();

  private constructor() {}

  static getInstance(): UltraPersonalizationService {
    if (!UltraPersonalizationService.instance) {
      UltraPersonalizationService.instance = new UltraPersonalizationService();
    }
    return UltraPersonalizationService.instance;
  }

  // ============================================
  // MULTI-DIMENSIONAL ANALYSIS
  // ============================================

  /**
   * Analyzes user interaction across multiple dimensions to build comprehensive profile
   * 
   * Performs 5-dimensional analysis:
   * - Cognitive patterns (thinking speed, processing depth, abstraction preference)
   * - Personality traits (openness, conscientiousness, extraversion, curiosity, persistence)
   * - Motivation (primary drive, goal orientation, challenge preference, growth mindset)
   * - Temporal patterns (peak hours, morning/night person, weekday/weekend preferences)
   * - Emotional state (emotional range, positivity ratio)
   * 
   * @param userId - Unique identifier for the user
   * @param userInput - The user's input text to analyze
   * @param timeTaken - Time in milliseconds taken for user to provide input
   * @param complexity - Complexity score of the interaction (0-10 scale)
   * 
   * @throws Will throw if profile creation or saving fails
   * 
   * @example
   * ```typescript
   * await service.analyzeInteraction('user123', 'How does React work?', 5000, 7);
   * ```
   */
  async analyzeInteraction(
    userId: string,
    userInput: string,
    timeTaken: number,
    complexity: number
  ): Promise<void> {
    let profile = this.ultraProfiles.get(userId);
    if (!profile) {
      profile = await this.createUltraProfile(userId);
    }

    // Analyze cognitive patterns
    this.analyzeCognitive(userInput, timeTaken, complexity, profile);

    // Analyze personality traits
    this.analyzePersonality(userInput, profile);

    // Analyze motivation
    this.analyzeMotivation(userInput, profile);

    // Analyze temporal patterns
    this.analyzeTemporal(Date.now(), profile);

    // Analyze emotional state
    this.analyzeEmotional(userInput, profile);

    await this.saveUltraProfile(userId);
  }

  /**
   * Analyzes cognitive patterns from user input
   * 
   * Determines:
   * - Thinking speed: fast (<10s), moderate (10-30s), deliberate (>30s)
   * - Processing depth: deep (why/explain questions), moderate (long inputs), shallow
   * - Abstraction preference: abstract (concepts/theories) vs concrete (examples/demos)
   * 
   * @param input - User input text
   * @param timeTaken - Time taken for input (milliseconds)
   * @param complexity - Complexity score (0-10)
   * @param profile - User profile to update (modified in place)
   * 
   * @internal
   */
  private analyzeCognitive(input: string, timeTaken: number, complexity: number, profile: UltraProfile): void {
    // Thinking speed
    if (timeTaken < 10000) profile.cognitiveStyle.thinkingSpeed = 'fast';
    else if (timeTaken < 30000) profile.cognitiveStyle.thinkingSpeed = 'moderate';
    else profile.cognitiveStyle.thinkingSpeed = 'deliberate';

    // Processing depth based on question complexity
    if (input.includes('why') || input.includes('explain deeply')) {
      profile.cognitiveStyle.processingDepth = 'deep';
    } else if (input.length > 100) {
      profile.cognitiveStyle.processingDepth = 'moderate';
    }

    // Abstract vs concrete
    const abstractWords = ['concept', 'theory', 'philosophy', 'abstract', 'principle'];
    const concreteWords = ['example', 'show me', 'demo', 'practical', 'how to'];
    
    const hasAbstract = abstractWords.some(w => input.toLowerCase().includes(w));
    const hasConcrete = concreteWords.some(w => input.toLowerCase().includes(w));
    
    if (hasConcrete && !hasAbstract) {
      profile.cognitiveStyle.abstractionPreference = 'concrete';
    } else if (hasAbstract && !hasConcrete) {
      profile.cognitiveStyle.abstractionPreference = 'abstract';
    }
  }

  private analyzePersonality(input: string, profile: UltraProfile): void {
    const lower = input.toLowerCase();

    // Openness - trying new things
    if (lower.match(/new|different|creative|innovative|unique/)) {
      profile.personality.openness = Math.min(100, profile.personality.openness + 1);
    }

    // Conscientiousness - organized, detailed
    if (lower.match(/plan|organize|detail|thorough|carefully/)) {
      profile.personality.conscientiousness = Math.min(100, profile.personality.conscientiousness + 1);
    }

    // Extraversion - social, outgoing
    if (lower.match(/share|tell everyone|social|group|together/)) {
      profile.personality.extraversion = Math.min(100, profile.personality.extraversion + 1);
    }

    // Curiosity - asking why/how
    if (lower.match(/why|how|curious|wonder|explore/)) {
      profile.personality.curiosity = Math.min(100, profile.personality.curiosity + 1);
    }

    // Persistence - trying again, not giving up
    if (lower.match(/try again|keep trying|persist|continue|don't give up/)) {
      profile.personality.persistence = Math.min(100, profile.personality.persistence + 1);
    }
  }

  private analyzeMotivation(input: string, profile: UltraProfile): void {
    const lower = input.toLowerCase();

    // Achievement drive
    if (lower.match(/achieve|accomplish|succeed|win|goal/)) {
      profile.motivation.primaryDrive = 'achievement';
    }

    // Learning vs performance orientation
    if (lower.match(/learn|understand|grasp|know/)) {
      profile.motivation.goalOrientation = 'learning';
    } else if (lower.match(/perform|execute|do|accomplish/)) {
      profile.motivation.goalOrientation = 'performance';
    }

    // Challenge preference
    if (lower.match(/easy|simple|basic/)) {
      profile.motivation.challengePreference = 'easy';
    } else if (lower.match(/hard|difficult|challenging|complex/)) {
      profile.motivation.challengePreference = 'difficult';
    }

    // Growth mindset indicators
    if (lower.match(/I can learn|I can improve|I can get better|growth/)) {
      profile.motivation.growthMindset = Math.min(10, profile.motivation.growthMindset + 0.5);
    }
  }

  private analyzeTemporal(timestamp: number, profile: UltraProfile): void {
    const hour = new Date(timestamp).getHours();
    const day = new Date(timestamp).getDay();

    // Track peak hours
    if (!profile.temporal.peakHours.includes(hour)) {
      profile.temporal.peakHours.push(hour);
    }

    // Morning vs night person
    if (hour >= 5 && hour < 12) {
      profile.temporal.morningPersonVsNight = 'morning';
    } else if (hour >= 20 || hour < 5) {
      profile.temporal.morningPersonVsNight = 'night';
    }

    // Weekday vs weekend
    if (day >= 1 && day <= 5) {
      profile.temporal.weekdayVsWeekend = 'weekday';
    } else {
      profile.temporal.weekdayVsWeekend = 'weekend';
    }
  }

  private analyzeEmotional(input: string, profile: UltraProfile): void {
    const lower = input.toLowerCase();

    // Detect emotional expressions
    const emotions = {
      'happy': ['happy', 'joy', 'glad', 'pleased', '😊', '😄', '🎉'],
      'excited': ['excited', 'amazing', 'awesome', 'wow', '!', '🚀'],
      'frustrated': ['frustrated', 'annoyed', 'stuck', "can't"],
      'anxious': ['worried', 'anxious', 'nervous', 'concerned'],
      'curious': ['curious', 'wonder', 'interested', '?'],
      'confident': ['I know', 'I can', 'easy', 'sure']
    };

    Object.entries(emotions).forEach(([emotion, keywords]) => {
      if (keywords.some(kw => lower.includes(kw))) {
        if (!profile.emotional.emotionalRange.includes(emotion as any)) {
          profile.emotional.emotionalRange.push(emotion as any);
        }
      }
    });

    // Positivity tracking
    const positiveWords = ['good', 'great', 'thanks', 'love', 'excellent'];
    const negativeWords = ['bad', 'hate', 'terrible', 'awful', 'frustrated'];
    
    const positive = positiveWords.filter(w => lower.includes(w)).length;
    const negative = negativeWords.filter(w => lower.includes(w)).length;
    
    if (positive > negative) {
      profile.emotional.positivityRatio = Math.min(10, profile.emotional.positivityRatio + 0.1);
    } else if (negative > positive) {
      profile.emotional.positivityRatio = Math.max(0, profile.emotional.positivityRatio - 0.1);
    }
  }

  // ============================================
  // ADAPTIVE RESPONSE GENERATION
  // ============================================

  /**
   * Adapts response text based on comprehensive user profile
   * 
   * Applies 5 layers of adaptation:
   * 1. Cognitive: Adjusts length, detail, format (visual/verbal, sequential/random)
   * 2. Personality: Adds creative suggestions, checklists, exploration prompts
   * 3. Motivation: Tailors to achievement/learning goals, challenge level
   * 4. Emotional: Adjusts tone, empathy, encouragement level
   * 5. Expertise: Matches technical depth to user's knowledge level
   * 
   * @param userId - User identifier for profile lookup
   * @param baseResponse - Base response text to adapt
   * @param context - Additional context object (topic, conversation history, etc.)
   * 
   * @returns Adapted response string
   * 
   * @example
   * ```typescript
   * const adapted = await service.ultraAdapt('user123', 'Here is the answer', { topic: 'React' });
   * ```
   */
  async ultraAdapt(
    userId: string,
    baseResponse: string,
    context: any
  ): Promise<string> {
    const profile = this.ultraProfiles.get(userId);
    if (!profile) return baseResponse;

    let adapted = baseResponse;

    // Adapt based on cognitive style
    adapted = this.adaptToCognitive(adapted, profile);

    // Adapt based on personality
    adapted = this.adaptToPersonality(adapted, profile);

    // Adapt based on motivation
    adapted = this.adaptToMotivation(adapted, profile, context);

    // Adapt based on emotional state
    adapted = this.adaptToEmotional(adapted, profile);

    // Adapt based on expertise
    adapted = this.adaptToExpertise(adapted, profile, context);

    return adapted;
  }

  private adaptToCognitive(response: string, profile: UltraProfile): string {
    // Fast thinkers = concise
    if (profile.cognitiveStyle.thinkingSpeed === 'fast') {
      const sentences = response.split('. ');
      response = sentences.slice(0, Math.ceil(sentences.length * 0.7)).join('. ');
    }

    // Deep processors = more detail
    if (profile.cognitiveStyle.processingDepth === 'deep') {
      response += '\n\nTo elaborate further...';
    }

    // Visual vs verbal
    if (profile.cognitiveStyle.verbalVsVisual < 5) {
      response = '📊 [Visual explanation would help here]\n\n' + response;
    }

    // Sequential learners = numbered steps
    if (profile.cognitiveStyle.sequentialVsRandom > 7) {
      if (!response.includes('1.') && response.includes('first')) {
        response = this.convertToNumberedSteps(response);
      }
    }

    return response;
  }

  private adaptToPersonality(response: string, profile: UltraProfile): string {
    // High openness = suggest creative approaches
    if (profile.personality.openness > 70) {
      response += '\n\n💡 Creative idea: Have you considered a different approach?';
    }

    // High conscientiousness = add checklists
    if (profile.personality.conscientiousness > 70) {
      response += '\n\n✓ Don\'t forget to double-check this!';
    }

    // High curiosity = encourage exploration
    if (profile.personality.curiosity > 70) {
      response += '\n\n🔍 Want to explore the underlying principles?';
    }

    // High empathy = warmer tone
    if (profile.personality.empathy > 70) {
      response = response.replace(/^/, 'I understand, ');
    }

    return response;
  }

  private adaptToMotivation(response: string, profile: UltraProfile, context: any): string {
    // Achievement-driven = show progress
    if (profile.motivation.primaryDrive === 'achievement') {
      response += '\n\n🎯 You\'re making great progress!';
    }

    // Mastery-driven = suggest deeper learning
    if (profile.motivation.primaryDrive === 'mastery') {
      response += '\n\n📚 Want to master this? Here are advanced resources...';
    }

    // High challenge seekers = offer difficult tasks
    if (profile.motivation.challengePreference === 'difficult') {
      response += '\n\n💪 Ready for a challenge? Try this advanced problem...';
    }

    // Growth mindset = encourage learning from mistakes
    if (profile.motivation.growthMindset > 7) {
      response = response.replace(/error|mistake|wrong/gi, 'learning opportunity');
    }

    return response;
  }

  private adaptToEmotional(response: string, profile: UltraProfile): string {
    // High positivity = add enthusiasm
    if (profile.emotional.positivityRatio > 7) {
      response += ' ✨';
    }

    // Low emotional stability = extra supportive
    if (profile.emotional.emotionalStability < 50) {
      response = "I'm here to help! " + response;
    }

    // Enthusiastic celebration style
    if (profile.emotional.celebrationStyle === 'enthusiastic') {
      response = response.replace(/good|great|excellent/gi, match => match + '! 🎉');
    }

    return response;
  }

  private adaptToExpertise(response: string, profile: UltraProfile, context: any): string {
    if (!context.topic) return response;

    const expertise = profile.expertise.domainKnowledge.get(context.topic) || 0;

    if (expertise < 3) {
      // Beginner - simplify
      response = '🌱 Beginner-friendly: ' + response;
      response = response.replace(/advanced|complex|sophisticated/gi, 'basic');
    } else if (expertise < 7) {
      // Intermediate
      response = '📈 Intermediate level: ' + response;
    } else {
      // Expert - use advanced terminology
      response = '🎓 Expert mode: ' + response;
      response += '\n\nGiven your expertise, you might also find interesting...';
    }

    return response;
  }

  // ============================================
  // PREDICTIVE ADAPTATION
  // ============================================

  async predictOptimalResponse(
    userId: string,
    context: {
      timeOfDay: number;
      topic: string;
      questionType: string;
      userMood: string;
    }
  ): Promise<{
    tone: string;
    length: string;
    complexity: string;
    format: string;
    shouldAskFollowUp: boolean;
  }> {
    const profile = this.ultraProfiles.get(userId);
    if (!profile) {
      return {
        tone: 'friendly',
        length: 'moderate',
        complexity: 'standard',
        format: 'text',
        shouldAskFollowUp: true
      };
    }

    // Predict optimal tone
    let tone = 'friendly';
    if (profile.social.relationshipStage === 'trusted-advisor') tone = 'mentor';
    else if (profile.personality.extraversion > 70) tone = 'enthusiastic';
    else if (profile.personality.conscientiousness > 70) tone = 'professional';

    // Predict optimal length
    const length = profile.cognitiveStyle.thinkingSpeed === 'fast' ? 'brief' :
                   profile.content.lengthPreference || 'moderate';

    // Predict complexity
    const topicExpertise = profile.expertise.domainKnowledge.get(context.topic) || 0;
    const complexity = topicExpertise < 3 ? 'simple' :
                      topicExpertise < 7 ? 'standard' : 'advanced';

    // Predict format
    const format = profile.content.preferredFormats[0] || 'text';

    // Should ask follow-up?
    const shouldAskFollowUp = profile.interaction.followUpEngagement > 5;

    return {tone, length, complexity, format, shouldAskFollowUp};
  }

  // ============================================
  // PROACTIVE PERSONALIZATION
  // ============================================

  async getProactiveSuggestions(userId: string): Promise<string[]> {
    const profile = this.ultraProfiles.get(userId);
    if (!profile) return [];

    const suggestions: string[] = [];

    // Based on cognitive style
    if (profile.cognitiveStyle.abstractionPreference === 'concrete') {
      suggestions.push('See a practical example');
    }

    // Based on motivation
    if (profile.motivation.challengePreference === 'difficult') {
      suggestions.push('Try an advanced challenge');
    }

    // Based on temporal patterns
    const currentHour = new Date().getHours();
    if (profile.temporal.peakHours.includes(currentHour)) {
      suggestions.push('Tackle something complex (peak hour!)');
    }

    // Based on expertise
    profile.expertise.domainKnowledge.forEach((level, topic) => {
      if (level >= 3 && level < 7) {
        suggestions.push(`Continue learning ${topic} (${Math.round(level * 10)}% mastery)`);
      }
    });

    // Based on gaps
    profile.expertise.knowledgeGaps.slice(0, 2).forEach(gap => {
      suggestions.push(`Learn about ${gap} (identified gap)`);
    });

    return suggestions.slice(0, 8);
  }

  // ============================================
  // UTILITIES
  // ============================================

  private async createUltraProfile(userId: string): Promise<UltraProfile> {
    const profile: UltraProfile = {
      cognitiveStyle: {
        thinkingSpeed: 'moderate',
        processingDepth: 'moderate',
        attentionSpan: 300,
        memoryStrength: 'good',
        learningCurve: 'moderate',
        abstractionPreference: 'balanced',
        analyticalVsCreative: 5,
        detailVsBigPicture: 5,
        sequentialVsRandom: 5,
        verbalVsVisual: 5
      },
      personality: {
        openness: 50,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50,
        curiosity: 50,
        persistence: 50,
        risktaking: 50,
        empathy: 50,
        optimism: 50
      },
      motivation: {
        primaryDrive: 'learning',
        goalOrientation: 'learning',
        timeHorizon: 'short-term',
        rewardSensitivity: 5,
        challengePreference: 'moderate',
        competitiveness: 5,
        growthMindset: 5,
        intrinsicMotivation: 5
      },
      social: {
        communicationPreference: 'diplomatic',
        feedbackStyle: 'constructive',
        relationshipStage: 'acquaintance',
        trustLevel: 30,
        sharingComfort: 30
      },
      temporal: {
        peakHours: [],
        lowEnergyHours: [],
        weekdayVsWeekend: 'both',
        morningPersonVsNight: 'flexible',
        sessionLengthPreference: 15,
        interactionFrequency: 'daily',
        timeZone: 'America/New_York'
      },
      expertise: {
        technicalLevel: 50,
        domainKnowledge: new Map(),
        skillProgress: new Map(),
        knowledgeGaps: [],
        masteredAreas: [],
        strugglingAreas: [],
        learningVelocity: new Map(),
        teachingAbility: 50,
        problemSolvingSkill: 50,
        criticalThinking: 50
      },
      content: {
        preferredFormats: ['text'],
        exampleQuantity: 'moderate',
        codeCommentLevel: 'detailed',
        technicalDepth: 'standard',
        humorLevel: 5,
        emojiUsage: 5,
        narrativeStyle: 'conversational',
        lengthPreference: 'balanced'
      },
      interaction: {
        questioningStyle: 'direct',
        feedbackFrequency: 0,
        followUpEngagement: 5,
        initiationStyle: 'specific',
        conversationDepth: 'moderate'
      },
      emotional: {
        emotionalRange: [],
        emotionalStability: 70,
        stressThreshold: 'medium',
        positivityRatio: 5,
        empathyReceptiveness: 5,
        celebrationStyle: 'moderate',
        disappointmentResponse: 'needs-support',
        emotionalExpressiveness: 5
      },
      adaptiveHistory: {
        successfulAdaptations: [],
        failedAdaptations: [],
        preferredAdaptationSpeed: 'gradual',
        responseToChange: 'neutral',
        feedbackIncorporationRate: 5,
        experimentalFeatureAdoption: 5,
        consistencyPreference: 5,
        surpriseAppreciation: 5,
        adaptabilityScore: 50,
        metaLearningRate: 5
      }
    };

    this.ultraProfiles.set(userId, profile);
    return profile;
  }

  private convertToNumberedSteps(text: string): string {
    const sentences = text.split('. ');
    return sentences.map((s, i) => `${i + 1}. ${s}`).join('\n');
  }

  private async saveUltraProfile(userId: string): Promise<void> {
    const profile = this.ultraProfiles.get(userId);
    if (!profile) return;

    // Convert Maps for storage
    const storable = {
      ...profile,
      expertise: {
        ...profile.expertise,
        domainKnowledge: Object.fromEntries(profile.expertise.domainKnowledge),
        skillProgress: Object.fromEntries(profile.expertise.skillProgress),
        learningVelocity: Object.fromEntries(profile.expertise.learningVelocity)
      }
    };

    await DataService.set(`ultra_profile_${userId}`, storable);
  }

  async getFullProfile(userId: string): Promise<any> {
    const profile = this.ultraProfiles.get(userId);
    if (!profile) return null;

    return {
      cognitive: profile.cognitiveStyle,
      personality: profile.personality,
      motivation: profile.motivation,
      social: profile.social,
      temporal: profile.temporal,
      expertise: {
        ...profile.expertise,
        domainKnowledge: Object.fromEntries(profile.expertise.domainKnowledge),
        skillProgress: Object.fromEntries(profile.expertise.skillProgress)
      },
      content: profile.content,
      interaction: profile.interaction,
      emotional: profile.emotional,
      adaptiveHistory: profile.adaptiveHistory
    };
  }
}

export default UltraPersonalizationService.getInstance();
