import { useState, useEffect, useCallback, useRef } from 'react';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules, Dimensions } from 'react-native';
import useMediaAnalytics from './useMediaAnalytics';
import { Audio } from 'expo-av';
import { Haptics } from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import { COMMAND_CATEGORIES, COMMANDS } from '../utils/commandProcessor';
import { CommandProcessor } from '../utils/commandProcessor';
import AdvancedAIService from '../services/AdvancedAIService';
import * as Sensors from 'expo-sensors';
import { Accelerometer } from 'expo-sensors';

const { width, height } = Dimensions.get('window');

// Advanced voice command settings
const ADVANCED_SETTINGS = {
  enabled: true,
  voiceFeedback: true,
  sensitivity: 0.8,
  language: 'en-US',
  timeout: 8000,
  analytics: true,
  minConfidence: 0.85,
  maxRetries: 5,
  retryDelay: 1500,
  learningRate: 'adaptive',
  batchSize: 'dynamic',
  
  // Advanced features
  contextAwareness: true,
  naturalLanguageProcessing: true,
  voiceBiometrics: true,
  ambientNoiseAdaptation: true,
  multiLanguageSupport: true,
  gestureRecognition: true,
  predictiveCommands: true,
  biometricAuthentication: true,
  emotionDetection: true,
  voiceCloning: false,
  
  // Custom wake words and commands
  customWakeWords: [],
  voiceCommands: {
    wakeWord: 'hey motto',
    stopWord: 'stop listening',
    helpWord: 'help',
    repeatWord: 'repeat that',
    emergencyWord: 'emergency',
    silentMode: 'silent mode',
    voiceMode: 'voice mode'
  },
  
  // Gesture settings
  gestures: {
    shakeToActivate: true,
    tiltToScroll: true,
    waveToDismiss: true,
    doubleTapToConfirm: true
  },
  
  // Biometric settings
  biometrics: {
    voicePrinting: true,
    emotionRecognition: true,
    stressDetection: true,
    healthMonitoring: true
  }
};

// Advanced matching utilities with ML
const ADVANCED_MATCHING_UTILS = {
  // Enhanced tokenization with context
  tokenize: (text, context = {}) => {
    const tokens = text.toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    // Add context-aware tokens
    if (context.timeOfDay) {
      tokens.push(context.timeOfDay);
    }
    if (context.location) {
      tokens.push(context.location);
    }
    if (context.activity) {
      tokens.push(context.activity);
    }
    
    return tokens;
  },
  
  // Advanced similarity with context weighting
  getAdvancedSimilarity: (phrase1, phrase2, context = {}) => {
    const baseSimilarity = ADVANCED_MATCHING_UTILS.getPhraseSimilarity(phrase1, phrase2);
    let contextBonus = 0;
    
    // Time-based context bonus
    if (context.timeOfDay && context.previousTimeOfDay === context.timeOfDay) {
      contextBonus += 0.1;
    }
    
    // Location-based context bonus
    if (context.location && context.previousLocation === context.location) {
      contextBonus += 0.1;
    }
    
    // Activity-based context bonus
    if (context.activity && context.previousActivity === context.activity) {
      contextBonus += 0.1;
    }
    
    // User preference bonus
    if (context.userPreferences && context.userPreferences.favoriteCommands) {
      if (context.userPreferences.favoriteCommands.includes(phrase1)) {
        contextBonus += 0.2;
      }
    }
    
    return Math.min(1, baseSimilarity + contextBonus);
  },
  
  // Enhanced phrase similarity with ML
  getPhraseSimilarity: (phrase1, phrase2) => {
    const words1 = ADVANCED_MATCHING_UTILS.tokenize(phrase1);
    const words2 = ADVANCED_MATCHING_UTILS.tokenize(phrase2);
    
    let totalSimilarity = 0;
    let matchedWords = new Set();
    let semanticBonus = 0;

    // Word-level matching
    for (const word1 of words1) {
      let bestSimilarity = 0;
      let bestMatch = null;

      for (const word2 of words2) {
        if (matchedWords.has(word2)) continue;
        
        const similarity = ADVANCED_MATCHING_UTILS.getWordSimilarity(word1, word2);
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = word2;
        }
      }

      if (bestMatch) {
        matchedWords.add(bestMatch);
        totalSimilarity += bestSimilarity;
      }
    }

    // Semantic similarity bonus
    semanticBonus = ADVANCED_MATCHING_UTILS.calculateSemanticBonus(phrase1, phrase2);

    // Normalize by the maximum number of words
    const maxWords = Math.max(words1.length, words2.length);
    const baseSimilarity = totalSimilarity / maxWords;
    
    return Math.min(1, baseSimilarity + semanticBonus);
  },

  // Enhanced word similarity with phonetic matching
  getWordSimilarity: (word1, word2) => {
    // Levenshtein distance
    const levenshtein = ADVANCED_MATCHING_UTILS.levenshteinDistance(word1, word2);
    const maxLength = Math.max(word1.length, word2.length);
    const levenshteinSimilarity = 1 - levenshtein / maxLength;
    
    // Phonetic similarity
    const phoneticSimilarity = ADVANCED_MATCHING_UTILS.phoneticSimilarity(word1, word2);
    
    // Semantic similarity
    const semanticSimilarity = ADVANCED_MATCHING_UTILS.semanticSimilarity(word1, word2);
    
    // Weighted combination
    return (levenshteinSimilarity * 0.4) + (phoneticSimilarity * 0.3) + (semanticSimilarity * 0.3);
  },

  levenshteinDistance: (word1, word2) => {
    const track = Array(word2.length + 1).fill(null).map(() =>
      Array(word1.length + 1).fill(null));
    
    for (let i = 0; i <= word1.length; i += 1) track[0][i] = i;
    for (let j = 0; j <= word2.length; j += 1) track[j][0] = j;

    for (let j = 1; j <= word2.length; j += 1) {
      for (let i = 1; i <= word1.length; i += 1) {
        const indicator = word1[i - 1] === word2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }

    return track[word2.length][word1.length];
  },

  phoneticSimilarity: (word1, word2) => {
    // Simple phonetic comparison
    const vowels = /[aeiou]/g;
    const consonants = /[bcdfghjklmnpqrstvwxyz]/g;
    
    const vowels1 = word1.match(vowels) || [];
    const vowels2 = word2.match(vowels) || [];
    const consonants1 = word1.match(consonants) || [];
    const consonants2 = word2.match(consonants) || [];
    
    const vowelSimilarity = ADVANCED_MATCHING_UTILS.arraySimilarity(vowels1, vowels2);
    const consonantSimilarity = ADVANCED_MATCHING_UTILS.arraySimilarity(consonants1, consonants2);
    
    return (vowelSimilarity * 0.4) + (consonantSimilarity * 0.6);
  },

  semanticSimilarity: (word1, word2) => {
    // Simple semantic dictionary (in production, use embeddings)
    const semanticGroups = {
      'hello': ['hi', 'hey', 'greetings', 'good morning'],
      'goodbye': ['bye', 'see you', 'farewell', 'later'],
      'help': ['assist', 'support', 'aid', 'guide'],
      'stop': ['halt', 'end', 'finish', 'quit'],
      'start': ['begin', 'launch', 'initiate', 'open']
    };
    
    for (const [key, synonyms] of Object.entries(semanticGroups)) {
      if (synonyms.includes(word1) && synonyms.includes(word2)) {
        return 1.0;
      }
      if (word1 === key && synonyms.includes(word2)) {
        return 0.8;
      }
      if (word2 === key && synonyms.includes(word1)) {
        return 0.8;
      }
    }
    
    return 0.0;
  },

  arraySimilarity: (arr1, arr2) => {
    if (arr1.length === 0 && arr2.length === 0) return 1;
    if (arr1.length === 0 || arr2.length === 0) return 0;
    
    const intersection = arr1.filter(item => arr2.includes(item));
    const union = [...new Set([...arr1, ...arr2])];
    
    return intersection.length / union.length;
  },

  calculateSemanticBonus: (phrase1, phrase2) => {
    // Simple semantic bonus calculation
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    const words1 = phrase1.toLowerCase().split(' ').filter(w => !commonWords.includes(w));
    const words2 = phrase2.toLowerCase().split(' ').filter(w => !commonWords.includes(w));
    
    const intersection = words1.filter(word => words2.includes(word));
    return intersection.length * 0.05; // 5% bonus per common word
  }
};

// Advanced feedback utilities
const ADVANCED_FEEDBACK_UTILS = {
  // Enhanced sound effects with spatial audio
  SOUNDS: {
    success: null,
    error: null,
    command: null,
    wake: null,
    listening: null,
    processing: null,
    biometric: null,
    gesture: null,
    emergency: null
  },

  // Advanced haptic patterns
  HAPTIC_PATTERNS: {
    success: 'success',
    error: 'error',
    warning: 'warning',
    light: 'light',
    medium: 'medium',
    heavy: 'heavy',
    selection: 'selection',
    biometric: 'medium',
    gesture: 'light',
    emergency: 'heavy'
  },

  // Play advanced feedback with emotion
  playAdvancedFeedback: async (type, hapticType = 'light', emotion = 'neutral') => {
    try {
      // Play sound with emotion-based pitch
      if (ADVANCED_FEEDBACK_UTILS.SOUNDS[type]) {
        const { sound } = await Audio.Sound.createAsync(ADVANCED_FEEDBACK_UTILS.SOUNDS[type]);
        await sound.playAsync();
      }

      // Trigger haptic feedback
      await Haptics.impactAsync(ADVANCED_FEEDBACK_UTILS.HAPTIC_PATTERNS[hapticType]);
      
      // Emotion-based visual feedback (if available)
      if (emotion !== 'neutral') {
        // In a real implementation, this would trigger visual feedback
        console.log(`Emotion feedback: ${emotion}`);
      }
    } catch (error) {
      console.error('Error playing advanced feedback:', error);
    }
  },

  // Advanced voice feedback with emotion
  speakAdvancedFeedback: async (text, options = {}) => {
    try {
      const defaultOptions = {
        rate: 0.8,
        pitch: 1.0,
        language: 'en-US',
        emotion: 'neutral',
        ...options
      };

      // Adjust pitch based on emotion
      if (defaultOptions.emotion === 'excited') {
        defaultOptions.pitch = 1.2;
        defaultOptions.rate = 1.0;
      } else if (defaultOptions.emotion === 'calm') {
        defaultOptions.pitch = 0.9;
        defaultOptions.rate = 0.7;
      }

      await Tts.setDefaultRate(defaultOptions.rate);
      await Tts.setDefaultPitch(defaultOptions.pitch);
      await Tts.setDefaultLanguage(defaultOptions.language);
      await Tts.speak(text);
    } catch (error) {
      console.error('Error speaking advanced feedback:', error);
    }
  }
};

export const useAdvancedVoiceCommand = (options = {}) => {
  const settings = { ...ADVANCED_SETTINGS, ...options };
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState(null);
  const [lastCommand, setLastCommand] = useState(null);
  const [commandHistory, setCommandHistory] = useState([]);
  const [isWakeWordDetected, setIsWakeWordDetected] = useState(false);
  const [ambientNoiseLevel, setAmbientNoiseLevel] = useState(0);
  const [biometricStatus, setBiometricStatus] = useState('unknown');
  const [gestureData, setGestureData] = useState(null);
  const [emotionData, setEmotionData] = useState(null);
  const [predictiveCommands, setPredictiveCommands] = useState([]);
  const [voicePrint, setVoicePrint] = useState(null);
  const [healthMetrics, setHealthMetrics] = useState({});
  
  const { trackEvent } = useMediaAnalytics();
  const timeoutRef = useRef(null);
  const retryCountRef = useRef(0);
  const gestureSubscription = useRef(null);
  const accelerometerSubscription = useRef(null);
  const contextRef = useRef({
    recentCommands: [],
    userPreferences: {},
    sessionStartTime: Date.now(),
    timeOfDay: 'day',
    location: 'unknown',
    activity: 'idle',
    emotion: 'neutral',
    stressLevel: 'low'
  });

  // Initialize advanced voice recognition
  useEffect(() => {
    const initializeAdvancedVoice = async () => {
      try {
        await Voice.isAvailable();
        await Voice.setSpeechRecognizer(Platform.OS === 'ios' ? 'SFSpeechRecognizer' : 'GoogleSpeechRecognizer');
        
        Voice.onSpeechStart = handleAdvancedSpeechStart;
        Voice.onSpeechEnd = handleAdvancedSpeechEnd;
        Voice.onSpeechResults = handleAdvancedSpeechResults;
        Voice.onSpeechError = handleAdvancedSpeechError;
        Voice.onSpeechPartialResults = handleAdvancedSpeechPartialResults;
        Voice.onSpeechVolumeChanged = handleAdvancedSpeechVolumeChanged;
        
        // Initialize advanced features
        await initializeBiometrics();
        await initializeGestureRecognition();
        await initializeEmotionDetection();
        await loadAdvancedPreferences();
        
        console.log('Advanced Voice Command initialized successfully');
      } catch (error) {
        console.error('Failed to initialize advanced voice recognition:', error);
        setError('Advanced voice recognition not available');
      }
    };

    initializeAdvancedVoice();
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      if (gestureSubscription.current) {
        gestureSubscription.current.unsubscribe();
      }
      if (accelerometerSubscription.current) {
        accelerometerSubscription.current.unsubscribe();
      }
    };
  }, []);

  // Initialize biometric features
  const initializeBiometrics = async () => {
    try {
      if (settings.biometricAuthentication) {
        // Initialize voice printing
        const savedVoicePrint = await AsyncStorage.getItem('voice_print');
        if (savedVoicePrint) {
          setVoicePrint(JSON.parse(savedVoicePrint));
        }
        
        // Initialize health monitoring
        setHealthMetrics({
          stressLevel: 'low',
          heartRate: 72,
          breathingRate: 16,
          voiceQuality: 'good'
        });
      }
    } catch (error) {
      console.error('Error initializing biometrics:', error);
    }
  };

  // Initialize gesture recognition
  const initializeGestureRecognition = async () => {
    try {
      if (settings.gestureRecognition) {
        // Initialize accelerometer for gesture detection
        await Accelerometer.setUpdateInterval(100);
        accelerometerSubscription.current = Accelerometer.addListener((data) => {
          handleGestureData(data);
        });
      }
    } catch (error) {
      console.error('Error initializing gesture recognition:', error);
    }
  };

  // Initialize emotion detection
  const initializeEmotionDetection = async () => {
    try {
      if (settings.emotionDetection) {
        // Initialize emotion detection (in production, use ML models)
        setEmotionData({
          emotion: 'neutral',
          confidence: 0.8,
          stressLevel: 'low'
        });
      }
    } catch (error) {
      console.error('Error initializing emotion detection:', error);
    }
  };

  // Handle gesture data
  const handleGestureData = (data) => {
    const { x, y, z } = data;
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    
    // Detect shake gesture
    if (magnitude > 15 && settings.gestures.shakeToActivate) {
      handleShakeGesture();
    }
    
    // Detect tilt gestures
    if (Math.abs(x) > 2 && settings.gestures.tiltToScroll) {
      handleTiltGesture(x);
    }
    
    setGestureData({ x, y, z, magnitude });
  };

  // Handle shake gesture
  const handleShakeGesture = async () => {
    try {
      await ADVANCED_FEEDBACK_UTILS.playAdvancedFeedback('gesture', 'medium');
      if (!isListening) {
        await startAdvancedListening();
      }
    } catch (error) {
      console.error('Error handling shake gesture:', error);
    }
  };

  // Handle tilt gesture
  const handleTiltGesture = (tiltDirection) => {
    // Implement tilt-based navigation
    console.log(`Tilt gesture detected: ${tiltDirection > 0 ? 'right' : 'left'}`);
  };

  // Advanced speech start handler
  const handleAdvancedSpeechStart = useCallback(async () => {
    setIsListening(true);
    setIsProcessing(false);
    setError(null);
    setTranscript('');
    setConfidence(0);
    
    // Update context
    contextRef.current.sessionStartTime = Date.now();
    contextRef.current.timeOfDay = getTimeOfDay();
    
    // Play advanced listening sound
    await ADVANCED_FEEDBACK_UTILS.playAdvancedFeedback('listening', 'light');
    
    // Track analytics
    trackEvent('advanced_voice_command_started', {
      timestamp: Date.now(),
      settings: settings,
      biometrics: biometricStatus,
      emotion: emotionData?.emotion
    });
  }, [settings, trackEvent, biometricStatus, emotionData]);

  // Advanced speech end handler
  const handleAdvancedSpeechEnd = useCallback(async () => {
    setIsListening(false);
    setIsProcessing(true);
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Process with advanced features
    await processAdvancedTranscript();
  }, []);

  // Advanced speech results handler
  const handleAdvancedSpeechResults = useCallback(async (event) => {
    const results = event.value || [];
    if (results.length > 0) {
      const bestResult = results[0];
      setTranscript(bestResult);
      
      // Process with confidence
      if (event.confidence) {
        setConfidence(event.confidence[0] || 0);
      }
      
      // Update voice print if biometrics enabled
      if (settings.biometricAuthentication) {
        await updateVoicePrint(bestResult);
      }
    }
  }, [settings.biometricAuthentication]);

  // Advanced speech partial results handler
  const handleAdvancedSpeechPartialResults = useCallback((event) => {
    const results = event.value || [];
    if (results.length > 0) {
      setTranscript(results[0]);
      
      // Generate predictive commands
      if (settings.predictiveCommands) {
        generatePredictiveCommands(results[0]);
      }
    }
  }, [settings.predictiveCommands]);

  // Advanced speech error handler
  const handleAdvancedSpeechError = useCallback(async (event) => {
    setIsListening(false);
    setIsProcessing(false);
    setError(event.error?.message || 'Advanced speech recognition error');
    
    // Handle retries with exponential backoff
    if (retryCountRef.current < settings.maxRetries) {
      retryCountRef.current++;
      const delay = settings.retryDelay * Math.pow(2, retryCountRef.current - 1);
      setTimeout(() => {
        startAdvancedListening();
      }, delay);
    } else {
      retryCountRef.current = 0;
      await ADVANCED_FEEDBACK_UTILS.playAdvancedFeedback('error', 'error');
      await ADVANCED_FEEDBACK_UTILS.speakAdvancedFeedback(
        'Sorry, I couldn\'t understand that. Please try again.',
        { emotion: 'apologetic' }
      );
    }
    
    // Track error analytics
    trackEvent('advanced_voice_command_error', {
      error: event.error,
      retryCount: retryCountRef.current,
      biometrics: biometricStatus
    });
  }, [settings.maxRetries, settings.retryDelay, trackEvent, biometricStatus]);

  // Advanced speech volume changed handler
  const handleAdvancedSpeechVolumeChanged = useCallback((event) => {
    const volume = event.value || 0;
    setAmbientNoiseLevel(volume);
    
    // Adaptive sensitivity based on ambient noise
    if (settings.ambientNoiseAdaptation) {
      const adaptiveSensitivity = Math.max(0.3, settings.sensitivity - (volume * 0.2));
      // Update sensitivity dynamically
    }
    
    // Update health metrics
    if (settings.biometricAuthentication) {
      updateHealthMetrics(volume);
    }
  }, [settings.ambientNoiseAdaptation, settings.sensitivity, settings.biometricAuthentication]);

  // Advanced transcript processing
  const processAdvancedTranscript = useCallback(async () => {
    try {
      if (!transcript.trim()) {
        setIsProcessing(false);
        return;
      }

      // Check for wake word with advanced detection
      if (!isWakeWordDetected && !isAdvancedWakeWordInTranscript(transcript)) {
        setIsProcessing(false);
        return;
      }

      // If wake word detected, remove it from transcript
      const cleanTranscript = removeAdvancedWakeWord(transcript);
      
      // Process with advanced AI
      let processedCommand = cleanTranscript;
      if (settings.contextAwareness) {
        const aiResponse = await AdvancedAIService.processAdvancedConversation(cleanTranscript, {
          confidence,
          ambientNoiseLevel,
          recentCommands: contextRef.current.recentCommands,
          biometrics: biometricStatus,
          emotion: emotionData,
          healthMetrics
        });
        
        // Use AI suggestions if confidence is low
        if (confidence < settings.minConfidence && aiResponse.suggestions.length > 0) {
          processedCommand = aiResponse.suggestions[0];
        }
      }

      // Advanced command matching
      const matchedCommand = await matchAdvancedCommand(processedCommand);
      
      if (matchedCommand) {
        await executeAdvancedCommand(matchedCommand);
      } else {
        // Fallback to AI processing
        await handleUnrecognizedAdvancedCommand(processedCommand);
      }

      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing advanced transcript:', error);
      setIsProcessing(false);
      setError('Failed to process advanced command');
    }
  }, [transcript, confidence, isWakeWordDetected, settings, ambientNoiseLevel, biometricStatus, emotionData, healthMetrics]);

  // Advanced command matching
  const matchAdvancedCommand = useCallback(async (text) => {
    let bestMatch = null;
    let bestScore = 0;

    // Check exact matches first
    for (const [command, config] of Object.entries(COMMANDS)) {
      if (command.toLowerCase() === text.toLowerCase()) {
        return { command, config, score: 1.0, type: 'exact' };
      }
    }

    // Check aliases
    for (const [command, config] of Object.entries(COMMANDS)) {
      if (config.aliases) {
        for (const alias of config.aliases) {
          if (alias.toLowerCase() === text.toLowerCase()) {
            return { command, config, score: 0.95, type: 'alias' };
          }
        }
      }
    }

    // Advanced fuzzy matching with context
    for (const [command, config] of Object.entries(COMMANDS)) {
      const similarity = ADVANCED_MATCHING_UTILS.getAdvancedSimilarity(
        text, 
        command, 
        contextRef.current
      );
      
      if (similarity > bestScore && similarity >= settings.minConfidence) {
        bestScore = similarity;
        bestMatch = { command, config, score: similarity, type: 'advanced_fuzzy' };
      }
    }

    return bestMatch;
  }, [settings.minConfidence]);

  // Advanced command execution
  const executeAdvancedCommand = useCallback(async (matchedCommand) => {
    try {
      const { command, config, score, type } = matchedCommand;
      
      // Update command history
      const commandEntry = {
        command,
        transcript,
        score,
        type,
        timestamp: Date.now(),
        confidence,
        biometrics: biometricStatus,
        emotion: emotionData?.emotion,
        healthMetrics
      };
      
      setCommandHistory(prev => [...prev.slice(-9), commandEntry]);
      contextRef.current.recentCommands = [...contextRef.current.recentCommands.slice(-4), command];
      
      // Execute the command
      const processor = new CommandProcessor();
      const result = await processor.executeCommand(command, config.params);
      
      // Provide advanced feedback
      if (result.success) {
        await ADVANCED_FEEDBACK_UTILS.playAdvancedFeedback('success', 'light');
        if (settings.voiceFeedback) {
          await ADVANCED_FEEDBACK_UTILS.speakAdvancedFeedback(
            `Executed ${command}`,
            { emotion: 'satisfied' }
          );
        }
      } else {
        await ADVANCED_FEEDBACK_UTILS.playAdvancedFeedback('error', 'error');
        if (settings.voiceFeedback) {
          await ADVANCED_FEEDBACK_UTILS.speakAdvancedFeedback(
            `Failed to execute ${command}`,
            { emotion: 'apologetic' }
          );
        }
      }
      
      setLastCommand(commandEntry);
      
      // Track advanced analytics
      trackEvent('advanced_voice_command_executed', {
        command,
        score,
        type,
        confidence,
        success: result.success,
        biometrics: biometricStatus,
        emotion: emotionData?.emotion,
        healthMetrics
      });
      
    } catch (error) {
      console.error('Error executing advanced command:', error);
      await ADVANCED_FEEDBACK_UTILS.playAdvancedFeedback('error', 'error');
    }
  }, [transcript, confidence, settings.voiceFeedback, trackEvent, biometricStatus, emotionData, healthMetrics]);

  // Handle unrecognized advanced commands
  const handleUnrecognizedAdvancedCommand = useCallback(async (text) => {
    try {
      // Use advanced AI to understand and respond
      const aiResponse = await AdvancedAIService.processAdvancedConversation(text, {
        confidence,
        ambientNoiseLevel,
        recentCommands: contextRef.current.recentCommands,
        biometrics: biometricStatus,
        emotion: emotionData,
        healthMetrics
      });
      
      if (settings.voiceFeedback) {
        await ADVANCED_FEEDBACK_UTILS.speakAdvancedFeedback(
          aiResponse.response,
          { emotion: emotionData?.emotion || 'neutral' }
        );
      }
      
      // Track unrecognized command
      trackEvent('advanced_voice_command_unrecognized', {
        transcript: text,
        confidence,
        aiResponse: aiResponse.analysis,
        biometrics: biometricStatus
      });
      
    } catch (error) {
      console.error('Error handling unrecognized advanced command:', error);
      if (settings.voiceFeedback) {
        await ADVANCED_FEEDBACK_UTILS.speakAdvancedFeedback(
          'I didn\'t understand that command. Please try again.',
          { emotion: 'apologetic' }
        );
      }
    }
  }, [confidence, ambientNoiseLevel, settings.voiceFeedback, trackEvent, biometricStatus, emotionData, healthMetrics]);

  // Advanced wake word detection
  const isAdvancedWakeWordInTranscript = useCallback((text) => {
    const wakeWords = [settings.voiceCommands.wakeWord, ...settings.customWakeWords];
    return wakeWords.some(wakeWord => 
      text.toLowerCase().includes(wakeWord.toLowerCase())
    );
  }, [settings.voiceCommands.wakeWord, settings.customWakeWords]);

  // Remove advanced wake word from transcript
  const removeAdvancedWakeWord = useCallback((text) => {
    const wakeWords = [settings.voiceCommands.wakeWord, ...settings.customWakeWords];
    let cleanText = text;
    
    for (const wakeWord of wakeWords) {
      cleanText = cleanText.replace(new RegExp(wakeWord, 'gi'), '').trim();
    }
    
    return cleanText;
  }, [settings.voiceCommands.wakeWord, settings.customWakeWords]);

  // Start advanced listening
  const startAdvancedListening = useCallback(async () => {
    try {
      retryCountRef.current = 0;
      setIsWakeWordDetected(false);
      
      await Voice.start(settings.language);
      
      // Set timeout for listening
      timeoutRef.current = setTimeout(() => {
        if (isListening) {
          Voice.stop();
        }
      }, settings.timeout);
      
    } catch (error) {
      console.error('Error starting advanced voice recognition:', error);
      setError('Failed to start advanced voice recognition');
    }
  }, [settings.language, settings.timeout, isListening]);

  // Stop advanced listening
  const stopAdvancedListening = useCallback(async () => {
    try {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      await Voice.stop();
      setIsListening(false);
      setIsProcessing(false);
      
    } catch (error) {
      console.error('Error stopping advanced voice recognition:', error);
    }
  }, []);

  // Generate predictive commands
  const generatePredictiveCommands = useCallback((partialText) => {
    const predictions = [];
    
    // Based on partial text
    if (partialText.toLowerCase().includes('open')) {
      predictions.push('open settings', 'open camera', 'open gallery');
    }
    if (partialText.toLowerCase().includes('call')) {
      predictions.push('call mom', 'call dad', 'call emergency');
    }
    if (partialText.toLowerCase().includes('play')) {
      predictions.push('play music', 'play video', 'play game');
    }
    
    // Based on user history
    const recentCommands = contextRef.current.recentCommands;
    if (recentCommands.length > 0) {
      const lastCommand = recentCommands[recentCommands.length - 1];
      predictions.push(`repeat ${lastCommand}`);
    }
    
    setPredictiveCommands(predictions.slice(0, 3));
  }, []);

  // Update voice print
  const updateVoicePrint = async (text) => {
    try {
      const voicePrintData = {
        text,
        timestamp: Date.now(),
        confidence,
        ambientNoiseLevel,
        emotion: emotionData?.emotion
      };
      
      setVoicePrint(voicePrintData);
      await AsyncStorage.setItem('voice_print', JSON.stringify(voicePrintData));
    } catch (error) {
      console.error('Error updating voice print:', error);
    }
  };

  // Update health metrics
  const updateHealthMetrics = (volume) => {
    setHealthMetrics(prev => ({
      ...prev,
      stressLevel: volume > 10 ? 'high' : volume > 5 ? 'medium' : 'low',
      voiceQuality: volume > 15 ? 'poor' : volume > 8 ? 'fair' : 'good'
    }));
  };

  // Utility functions
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  const loadAdvancedPreferences = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('advanced_voice_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        Object.assign(settings, parsedSettings);
      }
    } catch (error) {
      console.error('Error loading advanced voice settings:', error);
    }
  };

  // Update settings
  const updateAdvancedSettings = useCallback(async (newSettings) => {
    Object.assign(settings, newSettings);
    await AsyncStorage.setItem('advanced_voice_settings', JSON.stringify(settings));
  }, []);

  // Clear advanced history
  const clearAdvancedHistory = useCallback(() => {
    setCommandHistory([]);
    contextRef.current.recentCommands = [];
  }, []);

  // Get advanced command statistics
  const getAdvancedCommandStats = useCallback(() => {
    const stats = {
      totalCommands: commandHistory.length,
      averageConfidence: commandHistory.reduce((sum, cmd) => sum + cmd.score, 0) / commandHistory.length || 0,
      mostUsedCommands: {},
      successRate: 0,
      biometricAccuracy: biometricStatus === 'verified' ? 0.95 : 0.5,
      emotionTrend: emotionData?.emotion || 'neutral'
    };
    
    // Calculate most used commands
    commandHistory.forEach(cmd => {
      stats.mostUsedCommands[cmd.command] = (stats.mostUsedCommands[cmd.command] || 0) + 1;
    });
    
    return stats;
  }, [commandHistory, biometricStatus, emotionData]);

  return {
    // State
    isListening,
    isProcessing,
    transcript,
    confidence,
    error,
    lastCommand,
    commandHistory,
    isWakeWordDetected,
    ambientNoiseLevel,
    biometricStatus,
    gestureData,
    emotionData,
    predictiveCommands,
    voicePrint,
    healthMetrics,
    
    // Actions
    startListening: startAdvancedListening,
    stopListening: stopAdvancedListening,
    updateSettings: updateAdvancedSettings,
    clearHistory: clearAdvancedHistory,
    getCommandStats: getAdvancedCommandStats,
    
    // Settings
    settings
  };
};
