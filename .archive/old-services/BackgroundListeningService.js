// Background Listening Service with Wake Word Detection
import Voice from '@react-native-voice/voice';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MetricsService } from './MetricsService';

class BackgroundListeningService {
  constructor() {
    this.isInitialized = false;
    this.isListening = false;
    this.isWakeWordDetected = false;
    this.wakeWords = ['hey motto', 'hi motto', 'hello motto', 'motto'];
    this.confidenceThreshold = 0.7;
    this.silenceTimeout = 3000; // 3 seconds of silence before stopping
    this.maxListeningDuration = 10000; // 10 seconds max listening
    this.batteryOptimization = true;
    this.ambientNoiseLevel = 0;
    this.lastSpeechTime = 0;
    this.silenceTimer = null;
    this.listeningTimer = null;
    this.callbacks = {
      onWakeWordDetected: null,
      onListeningStarted: null,
      onListeningStopped: null,
      onError: null,
      onTranscript: null
    };
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check if voice recognition is available
      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        throw new Error('Voice recognition not available');
      }

      // Set up voice recognition
      await Voice.setSpeechRecognizer(
        Platform.OS === 'ios' ? 'SFSpeechRecognizer' : 'GoogleSpeechRecognizer'
      );

      // Set up event listeners
      this.setupEventListeners();

      // Load settings
      await this.loadSettings();

      this.isInitialized = true;
      console.log('✅ Background Listening Service initialized');
      
      await MetricsService.logEvent('background_listening_initialized', {
        wakeWords: this.wakeWords,
        confidenceThreshold: this.confidenceThreshold
      });
    } catch (error) {
      console.error('❌ Failed to initialize Background Listening Service:', error);
      throw error;
    }
  }

  setupEventListeners() {
    Voice.onSpeechStart = () => {
      console.log('🎤 Background speech started');
      this.lastSpeechTime = Date.now();
      this.clearSilenceTimer();
    };

    Voice.onSpeechEnd = () => {
      console.log('🎤 Background speech ended');
      this.startSilenceTimer();
    };

    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        const transcript = e.value[0].toLowerCase();
        console.log('🎤 Background transcript:', transcript);
        
        this.handleTranscript(transcript);
        this.callbacks.onTranscript?.(transcript);
      }
    };

    Voice.onSpeechPartialResults = (e) => {
      if (e.value && e.value.length > 0) {
        const transcript = e.value[0].toLowerCase();
        this.handleTranscript(transcript);
      }
    };

    Voice.onSpeechError = (e) => {
      console.error('❌ Background speech error:', e.error);
      this.handleError(e.error);
    };

    Voice.onSpeechVolumeChanged = (e) => {
      this.ambientNoiseLevel = e.value;
    };
  }

  async startBackgroundListening() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isListening) {
      console.log('⚠️ Background listening already active');
      return;
    }

    try {
      // Start continuous listening
      await Voice.start('en-US');
      this.isListening = true;
      this.isWakeWordDetected = false;

      // Set up listening timeout
      this.listeningTimer = setTimeout(() => {
        this.stopBackgroundListening();
      }, this.maxListeningDuration);

      console.log('🎤 Background listening started');
      this.callbacks.onListeningStarted?.();
      
      await MetricsService.logEvent('background_listening_started', {
        timestamp: Date.now(),
        batteryOptimization: this.batteryOptimization
      });
    } catch (error) {
      console.error('❌ Failed to start background listening:', error);
      this.handleError(error);
    }
  }

  async stopBackgroundListening() {
    if (!this.isListening) return;

    try {
      await Voice.stop();
      this.isListening = false;
      this.isWakeWordDetected = false;
      this.clearTimers();

      console.log('🎤 Background listening stopped');
      this.callbacks.onListeningStopped?.();
      
      await MetricsService.logEvent('background_listening_stopped', {
        timestamp: Date.now(),
        wasWakeWordDetected: this.isWakeWordDetected
      });
    } catch (error) {
      console.error('❌ Failed to stop background listening:', error);
      this.handleError(error);
    }
  }

  handleTranscript(transcript) {
    // Check for wake words
    const wakeWordDetected = this.detectWakeWord(transcript);
    
    if (wakeWordDetected && !this.isWakeWordDetected) {
      this.isWakeWordDetected = true;
      console.log('🎯 Wake word detected:', transcript);
      
      this.callbacks.onWakeWordDetected?.(transcript);
      
      // Stop background listening and start active listening
      this.stopBackgroundListening();
    }

    this.lastSpeechTime = Date.now();
  }

  detectWakeWord(transcript) {
    return this.wakeWords.some(wakeWord => {
      // Exact match
      if (transcript.includes(wakeWord)) {
        return true;
      }
      
      // Fuzzy match for better detection
      const words = transcript.split(' ');
      const wakeWords = wakeWord.split(' ');
      
      if (words.length >= wakeWords.length) {
        let matchCount = 0;
        for (let i = 0; i <= words.length - wakeWords.length; i++) {
          let currentMatch = 0;
          for (let j = 0; j < wakeWords.length; j++) {
            if (this.calculateSimilarity(words[i + j], wakeWords[j]) > 0.8) {
              currentMatch++;
            }
          }
          if (currentMatch === wakeWords.length) {
            return true;
          }
        }
      }
      
      return false;
    });
  }

  calculateSimilarity(word1, word2) {
    if (word1 === word2) return 1;
    
    const longer = word1.length > word2.length ? word1 : word2;
    const shorter = word1.length > word2.length ? word2 : word1;
    
    if (longer.length === 0) return 1;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  startSilenceTimer() {
    this.clearSilenceTimer();
    this.silenceTimer = setTimeout(() => {
      if (this.isListening && !this.isWakeWordDetected) {
        console.log('🔇 Silence timeout - stopping background listening');
        this.stopBackgroundListening();
      }
    }, this.silenceTimeout);
  }

  clearSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  clearTimers() {
    this.clearSilenceTimer();
    if (this.listeningTimer) {
      clearTimeout(this.listeningTimer);
      this.listeningTimer = null;
    }
  }

  handleError(error) {
    console.error('❌ Background listening error:', error);
    this.callbacks.onError?.(error);
    
    // Auto-restart listening after error (with delay)
    if (this.isListening) {
      setTimeout(() => {
        this.restartListening();
      }, 2000);
    }
  }

  async restartListening() {
    console.log('🔄 Restarting background listening...');
    await this.stopBackgroundListening();
    setTimeout(() => {
      this.startBackgroundListening();
    }, 1000);
  }

  // Callback registration
  onWakeWordDetected(callback) {
    this.callbacks.onWakeWordDetected = callback;
  }

  onListeningStarted(callback) {
    this.callbacks.onListeningStarted = callback;
  }

  onListeningStopped(callback) {
    this.callbacks.onListeningStopped = callback;
  }

  onError(callback) {
    this.callbacks.onError = callback;
  }

  onTranscript(callback) {
    this.callbacks.onTranscript = callback;
  }

  // Settings management
  async loadSettings() {
    try {
      const settings = await AsyncStorage.getItem('background_listening_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.wakeWords = parsed.wakeWords || this.wakeWords;
        this.confidenceThreshold = parsed.confidenceThreshold || this.confidenceThreshold;
        this.silenceTimeout = parsed.silenceTimeout || this.silenceTimeout;
        this.maxListeningDuration = parsed.maxListeningDuration || this.maxListeningDuration;
        this.batteryOptimization = parsed.batteryOptimization !== false;
      }
    } catch (error) {
      console.error('Error loading background listening settings:', error);
    }
  }

  async saveSettings() {
    try {
      const settings = {
        wakeWords: this.wakeWords,
        confidenceThreshold: this.confidenceThreshold,
        silenceTimeout: this.silenceTimeout,
        maxListeningDuration: this.maxListeningDuration,
        batteryOptimization: this.batteryOptimization
      };
      await AsyncStorage.setItem('background_listening_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving background listening settings:', error);
    }
  }

  // Configuration methods
  setWakeWords(words) {
    this.wakeWords = words;
    this.saveSettings();
  }

  setConfidenceThreshold(threshold) {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
    this.saveSettings();
  }

  setSilenceTimeout(timeout) {
    this.silenceTimeout = Math.max(1000, timeout);
    this.saveSettings();
  }

  setMaxListeningDuration(duration) {
    this.maxListeningDuration = Math.max(5000, duration);
    this.saveSettings();
  }

  setBatteryOptimization(enabled) {
    this.batteryOptimization = enabled;
    this.saveSettings();
  }

  // Status methods
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isListening: this.isListening,
      isWakeWordDetected: this.isWakeWordDetected,
      wakeWords: this.wakeWords,
      confidenceThreshold: this.confidenceThreshold,
      ambientNoiseLevel: this.ambientNoiseLevel,
      batteryOptimization: this.batteryOptimization
    };
  }

  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      isListening: this.isListening,
      isWakeWordDetected: this.isWakeWordDetected,
      wakeWords: this.wakeWords,
      confidenceThreshold: this.confidenceThreshold,
      ambientNoiseLevel: this.ambientNoiseLevel,
      batteryOptimization: this.batteryOptimization,
      lastSpeechTime: this.lastSpeechTime,
      uptime: this.isInitialized ? Date.now() - this.lastSpeechTime : 0
    };
  }

  // Cleanup
  async destroy() {
    await this.stopBackgroundListening();
    this.clearTimers();
    Voice.removeAllListeners();
    this.isInitialized = false;
    console.log('🧹 Background Listening Service destroyed');
  }
}

export default new BackgroundListeningService();
