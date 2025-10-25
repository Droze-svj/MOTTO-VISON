import Tts from 'react-native-tts';
import { Platform } from 'react-native';
import BritishVoiceSynthesisService from '../services/BritishVoiceSynthesisService';

// Default TTS settings
const DEFAULT_TTS_SETTINGS = {
  rate: 0.5,
  pitch: 1.1,
  volume: 1.0,
  language: 'en-GB',
  accent: 'british',
  gender: 'female'
};

// Feedback messages
const FEEDBACK_MESSAGES = {
  // Command feedback
  commandExecuted: (command) => `Executing ${command}`,
  commandNotRecognized: 'Command not recognized',
  commandError: 'Sorry, I couldn\'t process that command',
  
  // System feedback
  listeningStarted: 'Listening...',
  listeningStopped: 'Stopped listening',
  systemReady: 'Voice commands are ready',
  systemError: 'There was an error with the voice system',
  
  // Navigation feedback
  navigatingTo: (screen) => `Navigating to ${screen}`,
  navigationError: 'Could not navigate to that screen',
  
  // Media feedback
  mediaPlaying: 'Playing media',
  mediaPaused: 'Media paused',
  mediaNext: 'Playing next item',
  mediaPrevious: 'Playing previous item',
  mediaVolumeUp: 'Volume increased',
  mediaVolumeDown: 'Volume decreased',
  
  // Collection feedback
  collectionCreated: 'Collection created',
  itemAdded: 'Item added to collection',
  collectionsListed: 'Showing your collections',
  
  // Analytics feedback
  statsShown: 'Showing statistics',
  performanceShown: 'Showing performance data',
  
  // Utility feedback
  helpShown: 'Showing available commands',
  settingsShown: 'Showing settings',
};

class VoiceFeedback {
  constructor() {
    this.settings = { ...DEFAULT_TTS_SETTINGS };
    this.isInitialized = false;
    this.queue = [];
    this.isSpeaking = false;
  }

  // Initialize TTS
  async initialize() {
    try {
      await Tts.setDefaultLanguage(this.settings.language);
      await Tts.setDefaultRate(this.settings.rate);
      await Tts.setDefaultPitch(this.settings.pitch);
      await Tts.setDefaultVolume(this.settings.volume);
      
      // Set up event listeners
      Tts.addEventListener('tts-start', this.onTtsStart);
      Tts.addEventListener('tts-finish', this.onTtsFinish);
      Tts.addEventListener('tts-cancel', this.onTtsCancel);
      Tts.addEventListener('tts-error', this.onTtsError);
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('TTS initialization error:', error);
      return false;
    }
  }

  // Update TTS settings
  async updateSettings(newSettings) {
    try {
      this.settings = { ...this.settings, ...newSettings };
      
      if (newSettings.language) {
        await Tts.setDefaultLanguage(newSettings.language);
      }
      if (newSettings.rate) {
        await Tts.setDefaultRate(newSettings.rate);
      }
      if (newSettings.pitch) {
        await Tts.setDefaultPitch(newSettings.pitch);
      }
      if (newSettings.volume) {
        await Tts.setDefaultVolume(newSettings.volume);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating TTS settings:', error);
      return false;
    }
  }

  // Speak text with British voice synthesis
  async speak(text, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Use British voice synthesis service
      await BritishVoiceSynthesisService.speak(text, { ...this.settings, ...options });
    } catch (error) {
      console.error('Error speaking with British voice:', error);
      // Fallback to regular TTS
      const message = {
        text,
        options: {
          ...this.settings,
          ...options,
        },
      };
      this.queue.push(message);
      this.processQueue();
    }
  }

  // Process the speech queue
  async processQueue() {
    if (this.isSpeaking || this.queue.length === 0) return;

    this.isSpeaking = true;
    const message = this.queue.shift();

    try {
      await Tts.speak(message.text, message.options);
    } catch (error) {
      console.error('Error speaking:', error);
      this.isSpeaking = false;
      this.processQueue();
    }
  }

  // Stop speaking
  async stop() {
    try {
      await Tts.stop();
      this.queue = [];
      this.isSpeaking = false;
    } catch (error) {
      console.error('Error stopping TTS:', error);
    }
  }

  // Event handlers
  onTtsStart = () => {
    this.isSpeaking = true;
  };

  onTtsFinish = () => {
    this.isSpeaking = false;
    this.processQueue();
  };

  onTtsCancel = () => {
    this.isSpeaking = false;
    this.processQueue();
  };

  onTtsError = (error) => {
    console.error('TTS error:', error);
    this.isSpeaking = false;
    this.processQueue();
  };

  // Get feedback message
  getFeedbackMessage(type, params = {}) {
    const message = FEEDBACK_MESSAGES[type];
    if (!message) return '';

    if (typeof message === 'function') {
      return message(params);
    }
    return message;
  }

  // Speak feedback message
  async speakFeedback(type, params = {}) {
    const message = this.getFeedbackMessage(type, params);
    if (message) {
      await this.speak(message);
    }
  }

  // Clean up
  cleanup() {
    Tts.removeEventListener('tts-start', this.onTtsStart);
    Tts.removeEventListener('tts-finish', this.onTtsFinish);
    Tts.removeEventListener('tts-cancel', this.onTtsCancel);
    Tts.removeEventListener('tts-error', this.onTtsError);
    this.stop();
  }
}

// Create singleton instance
const voiceFeedback = new VoiceFeedback();
export default voiceFeedback; 