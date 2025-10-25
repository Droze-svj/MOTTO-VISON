import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';
import ErrorRecoveryService from './ErrorRecoveryService';
import PerformanceOptimizationService from './PerformanceOptimizationService';
import EnhancedVoiceService from './EnhancedVoiceService';

class EmotionalIntelligenceService {
  constructor() {
    this.isInitialized = false;
    
    // Emotional intelligence capabilities
    this.emotionalCapabilities = {
      emotionDetection: true,
      moodTracking: true,
      empatheticResponses: true,
      emotionalMemory: true,
      sentimentAnalysis: true,
      personalityAnalysis: true,
      stressDetection: true,
      emotionalWellness: true
    };
    
    // Emotion types and their characteristics
    this.emotionTypes = {
      joy: {
        valence: 0.8,
        arousal: 0.6,
        dominance: 0.7,
        color: '#4CAF50',
        description: 'Feeling happy, cheerful, and positive'
      },
      sadness: {
        valence: -0.8,
        arousal: -0.3,
        dominance: -0.5,
        color: '#2196F3',
        description: 'Feeling down, melancholy, or blue'
      },
      anger: {
        valence: -0.6,
        arousal: 0.8,
        dominance: 0.3,
        color: '#F44336',
        description: 'Feeling frustrated, irritated, or enraged'
      },
      fear: {
        valence: -0.7,
        arousal: 0.7,
        dominance: -0.8,
        color: '#FF9800',
        description: 'Feeling anxious, worried, or scared'
      },
      surprise: {
        valence: 0.2,
        arousal: 0.9,
        dominance: 0.1,
        color: '#9C27B0',
        description: 'Feeling startled, amazed, or astonished'
      },
      disgust: {
        valence: -0.9,
        arousal: 0.2,
        dominance: -0.3,
        color: '#795548',
        description: 'Feeling repulsed, revolted, or nauseated'
      },
      neutral: {
        valence: 0.0,
        arousal: 0.0,
        dominance: 0.0,
        color: '#607D8B',
        description: 'Feeling calm, balanced, or indifferent'
      }
    };
    
    // Mood tracking
    this.moodHistory = [];
    this.currentMood = 'neutral';
    this.moodTrends = [];
    this.maxMoodHistory = 1000;
    
    // Emotional memory
    this.emotionalMemory = new Map();
    this.emotionalPatterns = [];
    this.emotionalTriggers = [];
    
    // Personality traits (Big Five)
    this.personalityTraits = {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5
    };
    
    // Stress detection
    this.stressLevel = 0.0;
    this.stressHistory = [];
    this.stressTriggers = [];
    
    // Emotional wellness
    this.wellnessScore = 0.8;
    this.wellnessHistory = [];
    this.wellnessRecommendations = [];
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await ErrorRecoveryService.initialize();
      await PerformanceOptimizationService.initialize();
      await EnhancedVoiceService.initialize();
      await this.loadEmotionalData();
      await this.loadMoodHistory();
      await this.loadPersonalityProfile();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing EmotionalIntelligenceService:', error);
    }
  }

  // Emotion Detection and Analysis
  async detectEmotion(input, type = 'text') {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const operation = {
        service: 'emotion_detection',
        execute: async () => {
          return await this.performEmotionDetection(input, type);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { input, type });
      
      // Update mood tracking
      await this.updateMoodTracking(result);
      
      // Store emotional memory
      await this.storeEmotionalMemory(result);
      
      // Update personality analysis
      await this.updatePersonalityAnalysis(result);
      
      await MetricsService.log('emotion_detected', {
        duration: Date.now() - startTime,
        success: true,
        emotion: result.primaryEmotion,
        confidence: result.confidence,
        type: type
      });
      
      return result;
      
    } catch (error) {
      await MetricsService.log('emotion_detection_error', {
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }

  async performEmotionDetection(input, type) {
    let emotionData;
    
    switch (type) {
      case 'text':
        emotionData = await this.analyzeTextEmotion(input);
        break;
      case 'voice':
        emotionData = await this.analyzeVoiceEmotion(input);
        break;
      case 'multimodal':
        emotionData = await this.analyzeMultimodalEmotion(input);
        break;
      default:
        emotionData = await this.analyzeTextEmotion(input);
    }
    
    return {
      primaryEmotion: emotionData.primary,
      confidence: emotionData.confidence,
      allEmotions: emotionData.allEmotions,
      valence: emotionData.valence,
      arousal: emotionData.arousal,
      dominance: emotionData.dominance,
      type: type,
      timestamp: new Date().toISOString()
    };
  }

  async analyzeTextEmotion(text) {
    // Analyze text for emotional content
    const words = text.toLowerCase().split(/\s+/);
    const emotionScores = { ...this.emotionTypes };
    
    // Emotion keywords
    const emotionKeywords = {
      joy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'love', 'like', 'enjoy'],
      sadness: ['sad', 'depressed', 'down', 'blue', 'melancholy', 'grief', 'sorrow', 'unhappy', 'disappointed'],
      anger: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'rage', 'hate', 'disgusted'],
      fear: ['afraid', 'scared', 'worried', 'anxious', 'nervous', 'terrified', 'panic', 'fear', 'concerned'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'startled', 'wow', 'incredible', 'unexpected'],
      disgust: ['disgusted', 'revolted', 'sick', 'nauseated', 'repulsed', 'gross', 'yuck', 'awful']
    };
    
    // Calculate emotion scores
    Object.keys(emotionKeywords).forEach(emotion => {
      let score = 0;
      emotionKeywords[emotion].forEach(keyword => {
        words.forEach(word => {
          if (word.includes(keyword)) {
            score += 1;
          }
        });
      });
      emotionScores[emotion].confidence = Math.min(score / words.length * 10, 1);
    });
    
    // Find primary emotion
    const primaryEmotion = Object.keys(emotionScores).reduce((a, b) => 
      emotionScores[a].confidence > emotionScores[b].confidence ? a : b
    );
    
    return {
      primary: primaryEmotion,
      confidence: emotionScores[primaryEmotion].confidence,
      allEmotions: emotionScores,
      valence: emotionScores[primaryEmotion].valence,
      arousal: emotionScores[primaryEmotion].arousal,
      dominance: emotionScores[primaryEmotion].dominance
    };
  }

  async analyzeVoiceEmotion(audioData) {
    // Use enhanced voice service for emotion detection
    const voiceResult = await EnhancedVoiceService.detectEmotion(audioData);
    
    return {
      primary: voiceResult.primary,
      confidence: voiceResult.confidence,
      allEmotions: voiceResult.allEmotions,
      valence: this.emotionTypes[voiceResult.primary]?.valence || 0,
      arousal: this.emotionTypes[voiceResult.primary]?.arousal || 0,
      dominance: this.emotionTypes[voiceResult.primary]?.dominance || 0
    };
  }

  async analyzeMultimodalEmotion(input) {
    // Combine text and voice emotion analysis
    const textEmotion = await this.analyzeTextEmotion(input.text || '');
    const voiceEmotion = await this.analyzeVoiceEmotion(input.audio || []);
    
    // Weighted combination
    const combinedEmotion = this.combineEmotions(textEmotion, voiceEmotion);
    
    return combinedEmotion;
  }

  combineEmotions(textEmotion, voiceEmotion) {
    // Weighted combination of text and voice emotions
    const textWeight = 0.6;
    const voiceWeight = 0.4;
    
    const combinedScores = {};
    Object.keys(this.emotionTypes).forEach(emotion => {
      combinedScores[emotion] = {
        confidence: (textEmotion.allEmotions[emotion]?.confidence || 0) * textWeight +
                   (voiceEmotion.allEmotions[emotion]?.confidence || 0) * voiceWeight,
        valence: this.emotionTypes[emotion].valence,
        arousal: this.emotionTypes[emotion].arousal,
        dominance: this.emotionTypes[emotion].dominance
      };
    });
    
    const primaryEmotion = Object.keys(combinedScores).reduce((a, b) => 
      combinedScores[a].confidence > combinedScores[b].confidence ? a : b
    );
    
    return {
      primary: primaryEmotion,
      confidence: combinedScores[primaryEmotion].confidence,
      allEmotions: combinedScores,
      valence: combinedScores[primaryEmotion].valence,
      arousal: combinedScores[primaryEmotion].arousal,
      dominance: combinedScores[primaryEmotion].dominance
    };
  }

  // Mood Tracking
  async updateMoodTracking(emotionResult) {
    const moodEntry = {
      id: this.generateMoodId(),
      emotion: emotionResult.primaryEmotion,
      confidence: emotionResult.confidence,
      valence: emotionResult.valence,
      arousal: emotionResult.arousal,
      dominance: emotionResult.dominance,
      timestamp: new Date().toISOString()
    };
    
    this.moodHistory.push(moodEntry);
    this.currentMood = emotionResult.primaryEmotion;
    
    // Maintain history size
    if (this.moodHistory.length > this.maxMoodHistory) {
      this.moodHistory = this.moodHistory.slice(-this.maxMoodHistory);
    }
    
    // Update mood trends
    await this.updateMoodTrends();
    
    await this.saveMoodHistory();
  }

  async updateMoodTrends() {
    if (this.moodHistory.length < 10) return;
    
    // Calculate mood trends over different time periods
    const now = new Date();
    const periods = {
      lastHour: 60 * 60 * 1000,
      lastDay: 24 * 60 * 60 * 1000,
      lastWeek: 7 * 24 * 60 * 60 * 1000
    };
    
    this.moodTrends = [];
    
    Object.keys(periods).forEach(period => {
      const cutoff = new Date(now.getTime() - periods[period]);
      const recentMoods = this.moodHistory.filter(entry => 
        new Date(entry.timestamp) > cutoff
      );
      
      if (recentMoods.length > 0) {
        const avgValence = recentMoods.reduce((sum, entry) => sum + entry.valence, 0) / recentMoods.length;
        const avgArousal = recentMoods.reduce((sum, entry) => sum + entry.arousal, 0) / recentMoods.length;
        const dominantEmotion = this.getDominantEmotion(recentMoods);
        
        this.moodTrends.push({
          period,
          avgValence,
          avgArousal,
          dominantEmotion,
          moodCount: recentMoods.length,
          trend: this.calculateMoodTrend(recentMoods)
        });
      }
    });
  }

  getDominantEmotion(moods) {
    const emotionCounts = {};
    moods.forEach(mood => {
      emotionCounts[mood.emotion] = (emotionCounts[mood.emotion] || 0) + 1;
    });
    
    return Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b
    );
  }

  calculateMoodTrend(moods) {
    if (moods.length < 2) return 'stable';
    
    const firstHalf = moods.slice(0, Math.floor(moods.length / 2));
    const secondHalf = moods.slice(Math.floor(moods.length / 2));
    
    const firstAvgValence = firstHalf.reduce((sum, mood) => sum + mood.valence, 0) / firstHalf.length;
    const secondAvgValence = secondHalf.reduce((sum, mood) => sum + mood.valence, 0) / secondHalf.length;
    
    const difference = secondAvgValence - firstAvgValence;
    
    if (difference > 0.2) return 'improving';
    if (difference < -0.2) return 'declining';
    return 'stable';
  }

  // Emotional Memory
  async storeEmotionalMemory(emotionResult) {
    const memoryKey = `${emotionResult.primaryEmotion}_${new Date().toDateString()}`;
    
    if (!this.emotionalMemory.has(memoryKey)) {
      this.emotionalMemory.set(memoryKey, {
        emotion: emotionResult.primaryEmotion,
        occurrences: 0,
        avgConfidence: 0,
        avgValence: 0,
        avgArousal: 0,
        avgDominance: 0,
        firstOccurrence: new Date().toISOString(),
        lastOccurrence: new Date().toISOString()
      });
    }
    
    const memory = this.emotionalMemory.get(memoryKey);
    memory.occurrences++;
    memory.avgConfidence = (memory.avgConfidence * (memory.occurrences - 1) + emotionResult.confidence) / memory.occurrences;
    memory.avgValence = (memory.avgValence * (memory.occurrences - 1) + emotionResult.valence) / memory.occurrences;
    memory.avgArousal = (memory.avgArousal * (memory.occurrences - 1) + emotionResult.arousal) / memory.occurrences;
    memory.avgDominance = (memory.avgDominance * (memory.occurrences - 1) + emotionResult.dominance) / memory.occurrences;
    memory.lastOccurrence = new Date().toISOString();
    
    await this.saveEmotionalMemory();
  }

  // Personality Analysis
  async updatePersonalityAnalysis(emotionResult) {
    // Update Big Five personality traits based on emotional patterns
    const emotionalStability = this.calculateEmotionalStability();
    const extraversion = this.calculateExtraversion();
    const agreeableness = this.calculateAgreeableness();
    const conscientiousness = this.calculateConscientiousness();
    const openness = this.calculateOpenness();
    
    this.personalityTraits = {
      neuroticism: 1 - emotionalStability, // Neuroticism is inverse of emotional stability
      extraversion,
      agreeableness,
      conscientiousness,
      openness
    };
    
    await this.savePersonalityProfile();
  }

  calculateEmotionalStability() {
    if (this.moodHistory.length < 5) return 0.5;
    
    const valences = this.moodHistory.map(mood => mood.valence);
    const variance = this.calculateVariance(valences);
    
    // Lower variance = higher emotional stability
    return Math.max(0, 1 - variance);
  }

  calculateExtraversion() {
    if (this.moodHistory.length < 5) return 0.5;
    
    const highArousalMoods = this.moodHistory.filter(mood => mood.arousal > 0.5);
    const positiveMoods = this.moodHistory.filter(mood => mood.valence > 0.3);
    
    return (highArousalMoods.length + positiveMoods.length) / (this.moodHistory.length * 2);
  }

  calculateAgreeableness() {
    if (this.moodHistory.length < 5) return 0.5;
    
    const positiveMoods = this.moodHistory.filter(mood => mood.valence > 0.2);
    const lowDominanceMoods = this.moodHistory.filter(mood => mood.dominance < 0.2);
    
    return (positiveMoods.length + lowDominanceMoods.length) / (this.moodHistory.length * 2);
  }

  calculateConscientiousness() {
    // This would typically require behavioral data, using mood consistency as proxy
    if (this.moodHistory.length < 5) return 0.5;
    
    const moodConsistency = 1 - this.calculateMoodVariance();
    return moodConsistency;
  }

  calculateOpenness() {
    if (this.moodHistory.length < 5) return 0.5;
    
    const uniqueEmotions = new Set(this.moodHistory.map(mood => mood.emotion));
    return uniqueEmotions.size / Object.keys(this.emotionTypes).length;
  }

  calculateMoodVariance() {
    if (this.moodHistory.length < 2) return 0;
    
    const valences = this.moodHistory.map(mood => mood.valence);
    return this.calculateVariance(valences);
  }

  calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  // Stress Detection
  async detectStress(emotionResult) {
    // Detect stress based on emotional patterns
    const stressIndicators = this.analyzeStressIndicators(emotionResult);
    this.stressLevel = stressIndicators.stressLevel;
    
    const stressEntry = {
      id: this.generateStressId(),
      stressLevel: this.stressLevel,
      indicators: stressIndicators.indicators,
      timestamp: new Date().toISOString()
    };
    
    this.stressHistory.push(stressEntry);
    
    // Maintain history size
    if (this.stressHistory.length > this.maxMoodHistory) {
      this.stressHistory = this.stressHistory.slice(-this.maxMoodHistory);
    }
    
    await this.saveStressHistory();
    
    return stressIndicators;
  }

  analyzeStressIndicators(emotionResult) {
    const indicators = [];
    let stressScore = 0;
    
    // High arousal + negative valence = stress
    if (emotionResult.arousal > 0.6 && emotionResult.valence < -0.3) {
      indicators.push('high_arousal_negative_valence');
      stressScore += 0.4;
    }
    
    // Fear or anger emotions
    if (['fear', 'anger'].includes(emotionResult.primaryEmotion)) {
      indicators.push('negative_emotion');
      stressScore += 0.3;
    }
    
    // Low dominance
    if (emotionResult.dominance < -0.5) {
      indicators.push('low_dominance');
      stressScore += 0.2;
    }
    
    // Recent stress pattern
    if (this.stressHistory.length > 0) {
      const recentStress = this.stressHistory.slice(-5);
      const avgRecentStress = recentStress.reduce((sum, entry) => sum + entry.stressLevel, 0) / recentStress.length;
      if (avgRecentStress > 0.6) {
        indicators.push('recent_stress_pattern');
        stressScore += 0.1;
      }
    }
    
    return {
      stressLevel: Math.min(stressScore, 1.0),
      indicators,
      recommendations: this.generateStressRecommendations(stressScore)
    };
  }

  generateStressRecommendations(stressLevel) {
    const recommendations = [];
    
    if (stressLevel > 0.7) {
      recommendations.push('Consider taking a break or practicing relaxation techniques');
      recommendations.push('Try deep breathing exercises or meditation');
    } else if (stressLevel > 0.4) {
      recommendations.push('Take a moment to reflect on what might be causing stress');
      recommendations.push('Consider talking to someone about your feelings');
    } else {
      recommendations.push('You seem to be managing stress well');
    }
    
    return recommendations;
  }

  // Emotional Wellness
  async calculateWellnessScore() {
    if (this.moodHistory.length < 5) {
      this.wellnessScore = 0.8;
      return this.wellnessScore;
    }
    
    // Calculate wellness based on multiple factors
    const moodScore = this.calculateMoodScore();
    const stressScore = 1 - this.stressLevel;
    const emotionalStability = this.calculateEmotionalStability();
    const positiveEmotionRatio = this.calculatePositiveEmotionRatio();
    
    this.wellnessScore = (
      moodScore * 0.3 +
      stressScore * 0.3 +
      emotionalStability * 0.2 +
      positiveEmotionRatio * 0.2
    );
    
    // Store wellness history
    const wellnessEntry = {
      id: this.generateWellnessId(),
      score: this.wellnessScore,
      moodScore,
      stressScore,
      emotionalStability,
      positiveEmotionRatio,
      timestamp: new Date().toISOString()
    };
    
    this.wellnessHistory.push(wellnessEntry);
    
    // Maintain history size
    if (this.wellnessHistory.length > this.maxMoodHistory) {
      this.wellnessHistory = this.wellnessHistory.slice(-this.maxMoodHistory);
    }
    
    await this.saveWellnessHistory();
    
    return this.wellnessScore;
  }

  calculateMoodScore() {
    const recentMoods = this.moodHistory.slice(-10);
    if (recentMoods.length === 0) return 0.5;
    
    const avgValence = recentMoods.reduce((sum, mood) => sum + mood.valence, 0) / recentMoods.length;
    return (avgValence + 1) / 2; // Convert from [-1, 1] to [0, 1]
  }

  calculatePositiveEmotionRatio() {
    const recentMoods = this.moodHistory.slice(-20);
    if (recentMoods.length === 0) return 0.5;
    
    const positiveMoods = recentMoods.filter(mood => mood.valence > 0.2);
    return positiveMoods.length / recentMoods.length;
  }

  // Empathetic Response Generation
  async generateEmpatheticResponse(emotionResult, context = {}) {
    const empathyLevel = this.calculateEmpathyLevel(emotionResult);
    const responseTone = this.determineResponseTone(emotionResult);
    const personalizedResponse = this.personalizeResponse(emotionResult, context);
    
    return {
      response: personalizedResponse,
      empathyLevel,
      responseTone,
      emotionalSupport: this.generateEmotionalSupport(emotionResult),
      recommendations: this.generateEmotionalRecommendations(emotionResult)
    };
  }

  calculateEmpathyLevel(emotionResult) {
    // Higher empathy for negative emotions
    if (emotionResult.valence < -0.3) {
      return Math.min(0.9, 0.5 + Math.abs(emotionResult.valence) * 0.5);
    }
    return 0.6; // Default empathy level
  }

  determineResponseTone(emotionResult) {
    if (emotionResult.valence < -0.5) {
      return 'supportive';
    } else if (emotionResult.valence > 0.5) {
      return 'enthusiastic';
    } else if (emotionResult.arousal > 0.6) {
      return 'calming';
    } else {
      return 'neutral';
    }
  }

  personalizeResponse(emotionResult, context) {
    const baseResponses = {
      joy: "I'm glad to hear you're feeling happy! That's wonderful.",
      sadness: "I can sense you're feeling down. I'm here to listen and help.",
      anger: "I understand you're feeling frustrated. Let's work through this together.",
      fear: "I can see you're feeling anxious. You're safe here, and I'm here to support you.",
      surprise: "Wow, that sounds surprising! Tell me more about what happened.",
      disgust: "I can understand why you'd feel that way. That sounds unpleasant.",
      neutral: "I'm here to help. How can I assist you today?"
    };
    
    let response = baseResponses[emotionResult.primaryEmotion] || baseResponses.neutral;
    
    // Personalize based on personality traits
    if (this.personalityTraits.extraversion > 0.7) {
      response += " I'm excited to help you with whatever you need!";
    } else if (this.personalityTraits.agreeableness > 0.7) {
      response += " I want to make sure you feel heard and supported.";
    }
    
    return response;
  }

  generateEmotionalSupport(emotionResult) {
    const supportStrategies = {
      joy: ["Keep up the positive energy!", "Share your happiness with others"],
      sadness: ["It's okay to feel sad", "Consider talking to someone you trust", "Take care of yourself"],
      anger: ["Take deep breaths", "Try to identify what's causing the anger", "Consider physical activity to release tension"],
      fear: ["You're safe here", "Try grounding techniques", "Focus on what you can control"],
      surprise: ["Take a moment to process this", "Ask questions to understand better"],
      disgust: ["It's natural to feel this way", "Try to focus on something positive"],
      neutral: ["I'm here whenever you need support"]
    };
    
    return supportStrategies[emotionResult.primaryEmotion] || supportStrategies.neutral;
  }

  generateEmotionalRecommendations(emotionResult) {
    const recommendations = [];
    
    if (emotionResult.valence < -0.5) {
      recommendations.push("Consider engaging in activities that bring you joy");
      recommendations.push("Practice gratitude by listing things you're thankful for");
    }
    
    if (emotionResult.arousal > 0.6) {
      recommendations.push("Try relaxation techniques like deep breathing or meditation");
      recommendations.push("Consider physical exercise to help manage energy levels");
    }
    
    if (this.stressLevel > 0.6) {
      recommendations.push("Take breaks throughout the day");
      recommendations.push("Consider talking to a mental health professional");
    }
    
    return recommendations;
  }

  // Utility Methods
  generateMoodId() {
    return `mood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateStressId() {
    return `stress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateWellnessId() {
    return `wellness_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Persistence
  async loadEmotionalData() {
    try {
      const stored = await AsyncStorage.getItem('emotional_memory');
      if (stored) {
        const data = JSON.parse(stored);
        this.emotionalMemory = new Map(data);
      }
    } catch (error) {
      console.error('Error loading emotional data:', error);
    }
  }

  async saveEmotionalMemory() {
    try {
      const data = Array.from(this.emotionalMemory.entries());
      await AsyncStorage.setItem('emotional_memory', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving emotional memory:', error);
    }
  }

  async loadMoodHistory() {
    try {
      const stored = await AsyncStorage.getItem('mood_history');
      if (stored) {
        this.moodHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading mood history:', error);
    }
  }

  async saveMoodHistory() {
    try {
      await AsyncStorage.setItem('mood_history', JSON.stringify(this.moodHistory));
    } catch (error) {
      console.error('Error saving mood history:', error);
    }
  }

  async loadPersonalityProfile() {
    try {
      const stored = await AsyncStorage.getItem('personality_profile');
      if (stored) {
        this.personalityTraits = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading personality profile:', error);
    }
  }

  async savePersonalityProfile() {
    try {
      await AsyncStorage.setItem('personality_profile', JSON.stringify(this.personalityTraits));
    } catch (error) {
      console.error('Error saving personality profile:', error);
    }
  }

  async saveStressHistory() {
    try {
      await AsyncStorage.setItem('stress_history', JSON.stringify(this.stressHistory));
    } catch (error) {
      console.error('Error saving stress history:', error);
    }
  }

  async saveWellnessHistory() {
    try {
      await AsyncStorage.setItem('wellness_history', JSON.stringify(this.wellnessHistory));
    } catch (error) {
      console.error('Error saving wellness history:', error);
    }
  }

  // Health Check
  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      emotionalCapabilities: this.emotionalCapabilities,
      currentMood: this.currentMood,
      stressLevel: this.stressLevel,
      wellnessScore: this.wellnessScore,
      personalityTraits: this.personalityTraits,
      moodHistorySize: this.moodHistory.length,
      emotionalMemorySize: this.emotionalMemory.size,
      stressHistorySize: this.stressHistory.length,
      wellnessHistorySize: this.wellnessHistory.length
    };
  }
}

export default new EmotionalIntelligenceService();
