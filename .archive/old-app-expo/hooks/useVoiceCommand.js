import { useState, useEffect, useCallback, useRef } from 'react';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import { useMediaAnalytics } from './useMediaAnalytics';
import { Audio } from 'expo-av';
import { Haptics } from 'expo-haptics';
import crypto from 'crypto';
import { COMMAND_CATEGORIES, COMMANDS } from '../utils/commandProcessor';
import { CommandProcessor } from '../utils/commandProcessor';

// Default settings
const DEFAULT_SETTINGS = {
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
  batchSize: 'dynamic'
};

// Command matching utilities
const MATCHING_UTILS = {
  // Tokenize text into words
  tokenize: (text) => text.toLowerCase().trim().split(/\s+/),
  
  // Get word similarity using Levenshtein distance
  getWordSimilarity: (word1, word2) => {
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

    const maxLength = Math.max(word1.length, word2.length);
    return 1 - track[word2.length][word1.length] / maxLength;
  },

  // Get phrase similarity using word-level matching
  getPhraseSimilarity: (phrase1, phrase2) => {
    const words1 = MATCHING_UTILS.tokenize(phrase1);
    const words2 = MATCHING_UTILS.tokenize(phrase2);
    
    let totalSimilarity = 0;
    let matchedWords = new Set();

    // Match each word in phrase1 to the best matching word in phrase2
    for (const word1 of words1) {
      let bestSimilarity = 0;
      let bestMatch = null;

      for (const word2 of words2) {
        if (matchedWords.has(word2)) continue;
        
        const similarity = MATCHING_UTILS.getWordSimilarity(word1, word2);
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

    // Normalize by the maximum number of words
    const maxWords = Math.max(words1.length, words2.length);
    return totalSimilarity / maxWords;
  }
};

// Feedback utilities
const FEEDBACK_UTILS = {
  // Sound effects
  SOUNDS: {
    success: require('../assets/sounds/success.mp3'),
    error: require('../assets/sounds/error.mp3'),
    command: require('../assets/sounds/command.mp3')
  },

  // Haptic patterns
  HAPTICS: {
    success: Haptics.NotificationFeedbackType.Success,
    error: Haptics.NotificationFeedbackType.Error,
    warning: Haptics.NotificationFeedbackType.Warning
  },

  // Feedback messages
  MESSAGES: {
    commandRecognized: (command) => `Recognized: ${command}`,
    commandExecuted: (command) => `Executing: ${command}`,
    commandFailed: (command) => `Failed to execute: ${command}`,
    commandNotFound: (text) => `Command not found: ${text}`,
    listeningStarted: 'Listening...',
    listeningStopped: 'Stopped listening',
    error: (error) => `Error: ${error}`
  },

  // Initialize sound effects
  async initSounds() {
    try {
      const sounds = {};
      for (const [key, source] of Object.entries(FEEDBACK_UTILS.SOUNDS)) {
        const { sound } = await Audio.Sound.createAsync(source);
        sounds[key] = sound;
      }
      return sounds;
    } catch (error) {
      console.error('Error initializing sounds:', error);
      return {};
    }
  },

  // Play sound effect
  async playSound(sound, volume = 1.0) {
    try {
      await sound.setVolumeAsync(volume);
      await sound.replayAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  },

  // Trigger haptic feedback
  async triggerHaptic(type) {
    try {
      await Haptics.notificationAsync(FEEDBACK_UTILS.HAPTICS[type]);
    } catch (error) {
      console.error('Error triggering haptic:', error);
    }
  }
};

// Error utilities
const ERROR_UTILS = {
  // Error types with specific handling
  TYPES: {
    NETWORK: 'NetworkError',
    PERMISSION: 'PermissionError',
    TIMEOUT: 'TimeoutError',
    RECOGNITION: 'RecognitionError',
    AUDIO: 'AudioError',
    TTS: 'TtsError',
    HAPTIC: 'HapticError',
    COMMAND: 'CommandError',
    QUEUE: 'QueueError',
    UNKNOWN: 'UnknownError'
  },

  // Error recovery strategies
  RECOVERY: {
    NetworkError: {
      maxRetries: 3,
      backoffFactor: 2,
      baseDelay: 1000,
      shouldRetry: (error) => error.code !== 'ECONNREFUSED'
    },
    PermissionError: {
      maxRetries: 2,
      shouldRetry: (error) => error.code !== 'PERMISSION_DENIED'
    },
    TimeoutError: {
      maxRetries: 1,
      shouldRetry: () => true
    },
    RecognitionError: {
      maxRetries: 2,
      shouldRetry: (error) => error.code !== 'NO_MATCH'
    },
    AudioError: {
      maxRetries: 1,
      shouldRetry: (error) => error.code !== 'AUDIO_INIT_FAILED'
    },
    TtsError: {
      maxRetries: 1,
      shouldRetry: (error) => error.code !== 'TTS_INIT_FAILED'
    },
    HapticError: {
      maxRetries: 1,
      shouldRetry: () => true
    },
    CommandError: {
      maxRetries: 0,
      shouldRetry: () => false
    },
    QueueError: {
      maxRetries: 1,
      shouldRetry: () => true
    },
    UnknownError: {
      maxRetries: 1,
      shouldRetry: () => false
    }
  },

  // Error messages
  MESSAGES: {
    NetworkError: 'Network connection error. Please check your internet connection.',
    PermissionError: 'Permission denied. Please grant necessary permissions.',
    TimeoutError: 'Operation timed out. Please try again.',
    RecognitionError: 'Speech recognition error. Please try again.',
    AudioError: 'Audio system error. Please check your device settings.',
    TtsError: 'Text-to-speech error. Please check your device settings.',
    HapticError: 'Haptic feedback error. Please check your device settings.',
    CommandError: 'Command processing error. Please try again.',
    QueueError: 'Feedback queue error. Please try again.',
    UnknownError: 'An unknown error occurred. Please try again.'
  }
};

// Analytics utilities
const ANALYTICS_UTILS = {
  // Event types for tracking
  EVENTS: {
    ERROR: 'error',
    FEEDBACK: 'feedback',
    COMMAND: 'command',
    QUEUE: 'queue',
    PERFORMANCE: 'performance'
  },

  // Performance metrics
  METRICS: {
    QUEUE_PROCESSING_TIME: 'queueProcessingTime',
    COMMAND_PROCESSING_TIME: 'commandProcessingTime',
    ERROR_RECOVERY_TIME: 'errorRecoveryTime',
    FEEDBACK_DELIVERY_TIME: 'feedbackDeliveryTime'
  },

  // Track event with timing
  trackEvent: (type, data = {}) => {
    const event = {
      type,
      timestamp: Date.now(),
      ...data
    };
    console.log('Analytics Event:', event);
    return event;
  },

  // Track performance metric
  trackMetric: (metric, value) => {
    const event = {
      type: ANALYTICS_UTILS.EVENTS.PERFORMANCE,
      metric,
      value,
      timestamp: Date.now()
    };
    console.log('Performance Metric:', event);
    return event;
  }
};

// Queue utilities
const QUEUE_UTILS = {
  // Priority levels
  PRIORITY: {
    CRITICAL: 3,    // System errors, critical notifications
    HIGH: 2,        // Command feedback, important notifications
    NORMAL: 1,      // Regular feedback, status updates
    LOW: 0          // Background updates, non-critical info
  }
};

// Main hook implementation
export const useVoiceCommand = (options = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const settings = useRef({ ...DEFAULT_SETTINGS, ...options });
  const sounds = useRef(null);
  const commandProcessor = useRef(new CommandProcessor());

  // Initialize sounds
  useEffect(() => {
    const init = async () => {
      sounds.current = await FEEDBACK_UTILS.initSounds();
    };
    init();
  }, []);

  // Start listening
  const startListening = useCallback(async () => {
    try {
      setIsListening(true);
      setError(null);
      await Voice.start(settings.current.language);
      if (sounds.current?.command) {
        await FEEDBACK_UTILS.playSound(sounds.current.command);
      }
      await FEEDBACK_UTILS.triggerHaptic('success');
    } catch (err) {
      setError(err.message);
      setIsListening(false);
      if (sounds.current?.error) {
        await FEEDBACK_UTILS.playSound(sounds.current.error);
      }
      await FEEDBACK_UTILS.triggerHaptic('error');
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
      setIsListening(false);
      if (sounds.current?.success) {
        await FEEDBACK_UTILS.playSound(sounds.current.success);
      }
      await FEEDBACK_UTILS.triggerHaptic('success');
    } catch (err) {
      setError(err.message);
      if (sounds.current?.error) {
        await FEEDBACK_UTILS.playSound(sounds.current.error);
      }
      await FEEDBACK_UTILS.triggerHaptic('error');
    }
  }, []);

  // Process command
  const processCommand = useCallback(async (command) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Validate command
      if (!command || typeof command !== 'string' || command.trim() === '') {
        throw new Error('Invalid command: Command cannot be empty');
      }

      // Use CommandProcessor to validate the command
      const result = commandProcessor.current.processCommand(command);
      
      if (!result) {
        throw new Error(`Invalid command: "${command}" is not recognized`);
      }
      
      // Simulate command processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setIsProcessing(false);
      if (sounds.current?.success) {
        await FEEDBACK_UTILS.playSound(sounds.current.success);
      }
      await FEEDBACK_UTILS.triggerHaptic('success');
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
      if (sounds.current?.error) {
        await FEEDBACK_UTILS.playSound(sounds.current.error);
      }
      await FEEDBACK_UTILS.triggerHaptic('error');
    }
  }, []);

  return {
    isListening,
    isProcessing,
    error,
    startListening,
    stopListening,
    processCommand
  };
}; 