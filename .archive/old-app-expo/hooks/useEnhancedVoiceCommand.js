import { useState, useEffect, useCallback, useRef } from 'react';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import useMediaAnalytics from './useMediaAnalytics';
import { Audio } from 'expo-av';
import { Haptics } from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import { COMMAND_CATEGORIES, COMMANDS } from '../utils/commandProcessor';
import { CommandProcessor } from '../utils/commandProcessor';
import { parseCompoundCommand } from '../utils/compoundCommandParser';
import AIEnhancementService from '../services/AIEnhancementService';
import BritishVoiceSynthesisService from '../services/BritishVoiceSynthesisService';
import AdvancedVoiceToTextService from '../services/AdvancedVoiceToTextService';
import RealTimeTranscriptionService from '../services/RealTimeTranscriptionService';
import IntelligentVoiceCommandProcessor from '../services/IntelligentVoiceCommandProcessor';

// Enhanced default settings
const ENHANCED_DEFAULT_SETTINGS = {
  enabled: true,
  voiceFeedback: true,
  sensitivity: 0.7,
  language: 'en-US',
  timeout: 5000,
  analytics: true,
  minConfidence: 0.8,
  maxRetries: 3,
  retryDelay: 1000,
  learningRate: 'adaptive',
  batchSize: 'dynamic',
  // New enhanced features
  contextAwareness: true,
  naturalLanguageProcessing: true,
  voiceBiometrics: false,
  ambientNoiseAdaptation: true,
  multiLanguageSupport: true,
  customWakeWords: [],
  voiceCommands: {
    wakeWord: 'hey motto',
    stopWord: 'stop listening',
    helpWord: 'help',
    repeatWord: 'repeat that'
  }
};

// Enhanced command matching with NLP
const ENHANCED_MATCHING_UTILS = {
  // Tokenize text into words with better handling
  tokenize: (text) => {
    return text.toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  },
  
  // Enhanced word similarity using multiple algorithms
  getWordSimilarity: (word1, word2) => {
    // Levenshtein distance
    const levenshtein = ENHANCED_MATCHING_UTILS.levenshteinDistance(word1, word2);
    const maxLength = Math.max(word1.length, word2.length);
    const levenshteinSimilarity = 1 - levenshtein / maxLength;
    
    // Phonetic similarity (if available)
    const phoneticSimilarity = ENHANCED_MATCHING_UTILS.phoneticSimilarity(word1, word2);
    
    // Combined similarity score
    return (levenshteinSimilarity * 0.7) + (phoneticSimilarity * 0.3);
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
    // Simple phonetic comparison (can be enhanced with libraries like metaphone)
    const vowels = /[aeiou]/g;
    const consonants = /[bcdfghjklmnpqrstvwxyz]/g;
    
    const vowels1 = word1.match(vowels) || [];
    const vowels2 = word2.match(vowels) || [];
    const consonants1 = word1.match(consonants) || [];
    const consonants2 = word2.match(consonants) || [];
    
    const vowelSimilarity = ENHANCED_MATCHING_UTILS.arraySimilarity(vowels1, vowels2);
    const consonantSimilarity = ENHANCED_MATCHING_UTILS.arraySimilarity(consonants1, consonants2);
    
    return (vowelSimilarity * 0.4) + (consonantSimilarity * 0.6);
  },

  arraySimilarity: (arr1, arr2) => {
    if (arr1.length === 0 && arr2.length === 0) return 1;
    if (arr1.length === 0 || arr2.length === 0) return 0;
    
    const intersection = arr1.filter(item => arr2.includes(item));
    const union = [...new Set([...arr1, ...arr2])];
    
    return intersection.length / union.length;
  },

  // Enhanced phrase similarity with context awareness
  getPhraseSimilarity: (phrase1, phrase2, context = {}) => {
    const words1 = ENHANCED_MATCHING_UTILS.tokenize(phrase1);
    const words2 = ENHANCED_MATCHING_UTILS.tokenize(phrase2);
    
    let totalSimilarity = 0;
    let matchedWords = new Set();
    let contextBonus = 0;

    // Match each word in phrase1 to the best matching word in phrase2
    for (const word1 of words1) {
      let bestSimilarity = 0;
      let bestMatch = null;

      for (const word2 of words2) {
        if (matchedWords.has(word2)) continue;
        
        const similarity = ENHANCED_MATCHING_UTILS.getWordSimilarity(word1, word2);
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

    // Apply context bonus if available
    if (context.recentCommands && context.recentCommands.length > 0) {
      const recentCommand = context.recentCommands[context.recentCommands.length - 1];
      if (recentCommand && ENHANCED_MATCHING_UTILS.getPhraseSimilarity(phrase1, recentCommand) > 0.8) {
        contextBonus = 0.1;
      }
    }

    // Normalize by the maximum number of words
    const maxWords = Math.max(words1.length, words2.length);
    const baseSimilarity = totalSimilarity / maxWords;
    
    return Math.min(1, baseSimilarity + contextBonus);
  }
};

// Enhanced feedback utilities
const ENHANCED_FEEDBACK_UTILS = {
  // Enhanced sound effects with different types
  SOUNDS: {
    success: null, // require('../assets/sounds/success.mp3'),
    error: null, // require('../assets/sounds/error.mp3'),
    command: null, // require('../assets/sounds/command.mp3'),
    wake: null, // require('../assets/sounds/wake.mp3'),
    listening: null, // require('../assets/sounds/listening.mp3'),
    processing: null // require('../assets/sounds/processing.mp3')
  },

  // Enhanced haptic patterns
  HAPTIC_PATTERNS: {
    success: 'success',
    error: 'error',
    warning: 'warning',
    light: 'light',
    medium: 'medium',
    heavy: 'heavy',
    selection: 'selection'
  },

  // Play enhanced feedback
  playFeedback: async (type, hapticType = 'light') => {
    try {
      // Play sound
      if (ENHANCED_FEEDBACK_UTILS.SOUNDS[type]) {
        const { sound } = await Audio.Sound.createAsync(ENHANCED_FEEDBACK_UTILS.SOUNDS[type]);
        await sound.playAsync();
      }

      // Trigger haptic feedback
      await Haptics.impactAsync(ENHANCED_FEEDBACK_UTILS.HAPTIC_PATTERNS[hapticType]);
    } catch (error) {
      console.error('Error playing feedback:', error);
    }
  },

  // Enhanced voice feedback with British voice
  speakFeedback: async (text, options = {}) => {
    try {
      // Use British voice synthesis service
      await BritishVoiceSynthesisService.speak(text, {
        rate: 0.5,
        pitch: 1.1,
        language: 'en-GB',
        ...options
      });
    } catch (error) {
      console.error('Error speaking feedback:', error);
      // Fallback to regular TTS
      const defaultOptions = {
        rate: 0.8,
        pitch: 1.0,
        language: 'en-US',
        ...options
      };

      await Tts.setDefaultRate(defaultOptions.rate);
      await Tts.setDefaultPitch(defaultOptions.pitch);
      await Tts.setDefaultLanguage(defaultOptions.language);
      await Tts.speak(text);
    }
  }
};

export const useEnhancedVoiceCommand = (options = {}) => {
  const settings = { ...ENHANCED_DEFAULT_SETTINGS, ...options };
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState(null);
  const [lastCommand, setLastCommand] = useState(null);
  const [commandHistory, setCommandHistory] = useState([]);
  const [isWakeWordDetected, setIsWakeWordDetected] = useState(false);
  const [ambientNoiseLevel, setAmbientNoiseLevel] = useState(0);
  
  const { trackEvent } = useMediaAnalytics();
  const timeoutRef = useRef(null);
  const retryCountRef = useRef(0);
  const contextRef = useRef({
    recentCommands: [],
    userPreferences: {},
    sessionStartTime: Date.now()
  });

  // Initialize voice recognition
  useEffect(() => {
    const initializeVoice = async () => {
      try {
        await Voice.isAvailable();
        await Voice.setSpeechRecognizer(Platform.OS === 'ios' ? 'SFSpeechRecognizer' : 'GoogleSpeechRecognizer');
        
        Voice.onSpeechStart = handleSpeechStart;
        Voice.onSpeechEnd = handleSpeechEnd;
        Voice.onSpeechResults = handleSpeechResults;
        Voice.onSpeechError = handleSpeechError;
        Voice.onSpeechPartialResults = handleSpeechPartialResults;
        Voice.onSpeechVolumeChanged = handleSpeechVolumeChanged;
        
        // Load user preferences
        await loadUserPreferences();
        
        console.log('Enhanced Voice Command initialized successfully');
      } catch (error) {
        console.error('Failed to initialize voice recognition:', error);
        setError('Voice recognition not available');
      }
    };

    initializeVoice();
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // Load user preferences
  const loadUserPreferences = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('enhanced_voice_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        Object.assign(settings, parsedSettings);
      }
    } catch (error) {
      console.error('Error loading voice settings:', error);
    }
  };

  // Save user preferences
  const saveUserPreferences = async () => {
    try {
      await AsyncStorage.setItem('enhanced_voice_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving voice settings:', error);
    }
  };

  // Enhanced speech start handler
  const handleSpeechStart = useCallback(async () => {
    setIsListening(true);
    setIsProcessing(false);
    setError(null);
    setTranscript('');
    setConfidence(0);
    
    // Play listening sound
    await ENHANCED_FEEDBACK_UTILS.playFeedback('listening', 'light');
    
    // Track analytics
    trackEvent('voice_command_started', {
      timestamp: Date.now(),
      settings: settings
    });
  }, [settings, trackEvent]);

  // Enhanced speech end handler
  const handleSpeechEnd = useCallback(async () => {
    setIsListening(false);
    setIsProcessing(true);
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Process the transcript
    await processTranscript();
  }, []);

  // Enhanced speech results handler
  const handleSpeechResults = useCallback(async (event) => {
    const results = event.value || [];
    if (results.length > 0) {
      const bestResult = results[0];
      setTranscript(bestResult);
      
      // Process with confidence
      if (event.confidence) {
        setConfidence(event.confidence[0] || 0);
      }
    }
  }, []);

  // Enhanced speech partial results handler
  const handleSpeechPartialResults = useCallback((event) => {
    const results = event.value || [];
    if (results.length > 0) {
      setTranscript(results[0]);
    }
  }, []);

  // Enhanced speech error handler
  const handleSpeechError = useCallback(async (event) => {
    setIsListening(false);
    setIsProcessing(false);
    setError(event.error?.message || 'Speech recognition error');
    
    // Handle retries
    if (retryCountRef.current < settings.maxRetries) {
      retryCountRef.current++;
      setTimeout(() => {
        startListening();
      }, settings.retryDelay);
    } else {
      retryCountRef.current = 0;
      await ENHANCED_FEEDBACK_UTILS.playFeedback('error', 'error');
      await ENHANCED_FEEDBACK_UTILS.speakFeedback('Sorry, I couldn\'t understand that. Please try again.');
    }
    
    // Track error analytics
    trackEvent('voice_command_error', {
      error: event.error,
      retryCount: retryCountRef.current
    });
  }, [settings.maxRetries, settings.retryDelay, trackEvent]);

  // Enhanced speech volume changed handler
  const handleSpeechVolumeChanged = useCallback((event) => {
    const volume = event.value || 0;
    setAmbientNoiseLevel(volume);
    
    // Adapt sensitivity based on ambient noise
    if (settings.ambientNoiseAdaptation) {
      const adaptiveSensitivity = Math.max(0.3, settings.sensitivity - (volume * 0.2));
      // Update sensitivity dynamically
    }
  }, [settings.ambientNoiseAdaptation, settings.sensitivity]);

  // Enhanced transcript processing
  const processTranscript = useCallback(async () => {
    try {
      if (!transcript.trim()) {
        setIsProcessing(false);
        return;
      }

      // Check for wake word
      if (!isWakeWordDetected && !isWakeWordInTranscript(transcript)) {
        setIsProcessing(false);
        return;
      }

      // If wake word detected, remove it from transcript
      const cleanTranscript = removeWakeWord(transcript);
      
      // Process with AI enhancement if enabled
      let processedCommand = cleanTranscript;
      if (settings.contextAwareness) {
        const aiResponse = await AIEnhancementService.getEnhancedResponse(cleanTranscript, {
          confidence,
          ambientNoiseLevel,
          recentCommands: contextRef.current.recentCommands
        });
        
        // Use AI suggestions if confidence is low
        if (confidence < settings.minConfidence && aiResponse.suggestions.length > 0) {
          processedCommand = aiResponse.suggestions[0];
        }
      }

      // If compound, process steps sequentially
      const steps = parseCompoundCommand(processedCommand);
      if (steps.length > 1) {
        for (const step of steps) {
          const stepText = [step.action, step.app, step.text].filter(Boolean).join(' ');
          const matched = await matchCommand(stepText || processedCommand);
          if (matched) {
            await executeCommand(matched);
          }
        }
      } else {
        // Enhanced command matching
        const matchedCommand = await matchCommand(processedCommand);
        if (matchedCommand) {
          await executeCommand(matchedCommand);
        } else {
          // Fallback to AI processing
          await handleUnrecognizedCommand(processedCommand);
        }
      }

      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing transcript:', error);
      setIsProcessing(false);
      setError('Failed to process command');
    }
  }, [transcript, confidence, isWakeWordDetected, settings, ambientNoiseLevel]);

  // Enhanced command matching
  const matchCommand = useCallback(async (text) => {
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

    // Fuzzy matching with context awareness
    for (const [command, config] of Object.entries(COMMANDS)) {
      const similarity = ENHANCED_MATCHING_UTILS.getPhraseSimilarity(
        text, 
        command, 
        contextRef.current
      );
      
      if (similarity > bestScore && similarity >= settings.minConfidence) {
        bestScore = similarity;
        bestMatch = { command, config, score: similarity, type: 'fuzzy' };
      }
    }

    return bestMatch;
  }, [settings.minConfidence]);

  // Enhanced command execution
  const executeCommand = useCallback(async (matchedCommand) => {
    try {
      const { command, config, score, type } = matchedCommand;
      
      // Update command history
      const commandEntry = {
        command,
        transcript,
        score,
        type,
        timestamp: Date.now(),
        confidence
      };
      
      setCommandHistory(prev => [...prev.slice(-9), commandEntry]);
      contextRef.current.recentCommands = [...contextRef.current.recentCommands.slice(-4), command];
      
      // Execute the command
      const processor = new CommandProcessor();
      const result = await processor.executeCommand(command, config.params);
      
      // Provide feedback
      if (result.success) {
        await ENHANCED_FEEDBACK_UTILS.playFeedback('success', 'light');
        if (settings.voiceFeedback) {
          await ENHANCED_FEEDBACK_UTILS.speakFeedback(`Executed ${command}`);
        }
      } else {
        await ENHANCED_FEEDBACK_UTILS.playFeedback('error', 'error');
        if (settings.voiceFeedback) {
          await ENHANCED_FEEDBACK_UTILS.speakFeedback(`Failed to execute ${command}`);
        }
      }
      
      setLastCommand(commandEntry);
      
      // Track analytics
      trackEvent('voice_command_executed', {
        command,
        score,
        type,
        confidence,
        success: result.success
      });
      
    } catch (error) {
      console.error('Error executing command:', error);
      await ENHANCED_FEEDBACK_UTILS.playFeedback('error', 'error');
    }
  }, [transcript, confidence, settings.voiceFeedback, trackEvent]);

  // Handle unrecognized commands
  const handleUnrecognizedCommand = useCallback(async (text) => {
    try {
      // Use AI to understand and respond
      const aiResponse = await AIEnhancementService.getEnhancedResponse(text, {
        confidence,
        ambientNoiseLevel,
        recentCommands: contextRef.current.recentCommands
      });
      
      if (settings.voiceFeedback) {
        await ENHANCED_FEEDBACK_UTILS.speakFeedback(aiResponse.response);
      }
      
      // Track unrecognized command
      trackEvent('voice_command_unrecognized', {
        transcript: text,
        confidence,
        aiResponse: aiResponse.analysis
      });
      
    } catch (error) {
      console.error('Error handling unrecognized command:', error);
      if (settings.voiceFeedback) {
        await ENHANCED_FEEDBACK_UTILS.speakFeedback('I didn\'t understand that command. Please try again.');
      }
    }
  }, [confidence, ambientNoiseLevel, settings.voiceFeedback, trackEvent]);

  // Wake word detection
  const isWakeWordInTranscript = useCallback((text) => {
    const wakeWords = [settings.voiceCommands.wakeWord, ...settings.customWakeWords];
    return wakeWords.some(wakeWord => 
      text.toLowerCase().includes(wakeWord.toLowerCase())
    );
  }, [settings.voiceCommands.wakeWord, settings.customWakeWords]);

  // Remove wake word from transcript
  const removeWakeWord = useCallback((text) => {
    const wakeWords = [settings.voiceCommands.wakeWord, ...settings.customWakeWords];
    let cleanText = text;
    
    for (const wakeWord of wakeWords) {
      cleanText = cleanText.replace(new RegExp(wakeWord, 'gi'), '').trim();
    }
    
    return cleanText;
  }, [settings.voiceCommands.wakeWord, settings.customWakeWords]);

  // Start listening with enhanced features
  const startListening = useCallback(async () => {
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
      console.error('Error starting voice recognition:', error);
      setError('Failed to start voice recognition');
    }
  }, [settings.language, settings.timeout, isListening]);

  // Stop listening
  const stopListening = useCallback(async () => {
    try {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      await Voice.stop();
      setIsListening(false);
      setIsProcessing(false);
      
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings) => {
    Object.assign(settings, newSettings);
    await saveUserPreferences();
  }, []);

  // Clear command history
  const clearHistory = useCallback(() => {
    setCommandHistory([]);
    contextRef.current.recentCommands = [];
  }, []);

  // Get command statistics
  const getCommandStats = useCallback(() => {
    const stats = {
      totalCommands: commandHistory.length,
      averageConfidence: commandHistory.reduce((sum, cmd) => sum + cmd.score, 0) / commandHistory.length || 0,
      mostUsedCommands: {},
      successRate: 0
    };
    
    // Calculate most used commands
    commandHistory.forEach(cmd => {
      stats.mostUsedCommands[cmd.command] = (stats.mostUsedCommands[cmd.command] || 0) + 1;
    });
    
    return stats;
  }, [commandHistory]);

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
    
    // Actions
    startListening,
    stopListening,
    updateSettings,
    clearHistory,
    getCommandStats,
    
    // Settings
    settings
  };
};
