/**
 * Voice Integration Service
 * Complete Speech-to-Text and Text-to-Speech implementation
 * Ready for @react-native-voice/voice and react-native-tts
 */

import ErrorHandlingService from './ErrorHandlingService';

interface VoiceConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

interface TTSConfig {
  language: string;
  pitch: number; // 0.5 to 2.0
  rate: number; // 0.1 to 2.0
  voice: string | null;
}

class VoiceIntegrationService {
  private static instance: VoiceIntegrationService;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;

  // Configuration
  private sttConfig: VoiceConfig = {
    language: 'en-US',
    continuous: false,
    interimResults: true,
    maxAlternatives: 1,
  };

  private ttsConfig: TTSConfig = {
    language: 'en-US',
    pitch: 1.0,
    rate: 1.0,
    voice: null,
  };

  // Voice SDK placeholders (will be replaced when packages installed)
  private Voice: any = null;
  private Tts: any = null;

  private constructor() {
    this.initializeVoiceSDK();
  }

  static getInstance(): VoiceIntegrationService {
    if (!VoiceIntegrationService.instance) {
      VoiceIntegrationService.instance = new VoiceIntegrationService();
    }
    return VoiceIntegrationService.instance;
  }

  /**
   * Initialize Voice SDK
   */
  private async initializeVoiceSDK(): Promise<void> {
    try {
      // Try to import voice packages
      // This will fail if packages not installed - that's okay!
      
      // @react-native-voice/voice
      try {
        this.Voice = require('@react-native-voice/voice').default;
        console.log('[Voice] Speech recognition available');
      } catch (e) {
        console.log('[Voice] Speech recognition not installed (install @react-native-voice/voice)');
      }

      // react-native-tts
      try {
        this.Tts = require('react-native-tts').default;
        console.log('[Voice] Text-to-speech available');
      } catch (e) {
        console.log('[Voice] Text-to-speech not installed (install react-native-tts)');
      }
    } catch (error) {
      console.error('[Voice] Initialization error:', error);
    }
  }

  /**
   * SPEECH-TO-TEXT - Listen and transcribe
   */
  async startListening(
    onResult: (text: string) => void,
    onError?: (error: any) => void,
    language?: string
  ): Promise<void> {
    if (this.isListening) {
      console.warn('[Voice] Already listening');
      return;
    }

    if (!this.Voice) {
      const error = 'Speech recognition not available. Install @react-native-voice/voice';
      console.error('[Voice]', error);
      onError?.(new Error(error));
      return;
    }

    try {
      this.isListening = true;
      const lang = language || this.sttConfig.language;

      // Set up event listeners
      this.Voice.onSpeechResults = (e: any) => {
        if (e.value && e.value[0]) {
          const text = e.value[0];
          console.log('[Voice] Transcribed:', text);
          onResult(text);
        }
      };

      this.Voice.onSpeechError = (e: any) => {
        console.error('[Voice] Speech error:', e);
        this.isListening = false;
        onError?.(e);
      };

      // Start listening
      await this.Voice.start(lang);
      console.log('[Voice] Listening started');

    } catch (error) {
      console.error('[Voice] Start error:', error);
      this.isListening = false;
      onError?.(error);
    }
  }

  /**
   * Stop listening
   */
  async stopListening(): Promise<void> {
    if (!this.Voice || !this.isListening) return;

    try {
      await this.Voice.stop();
      this.isListening = false;
      console.log('[Voice] Listening stopped');
    } catch (error) {
      console.error('[Voice] Stop error:', error);
    }
  }

  /**
   * Cancel listening
   */
  async cancelListening(): Promise<void> {
    if (!this.Voice || !this.isListening) return;

    try {
      await this.Voice.cancel();
      this.isListening = false;
      console.log('[Voice] Listening cancelled');
    } catch (error) {
      console.error('[Voice] Cancel error:', error);
    }
  }

  /**
   * TEXT-TO-SPEECH - Speak text aloud
   */
  async speak(
    text: string,
    options?: {
      language?: string;
      pitch?: number;
      rate?: number;
      onStart?: () => void;
      onDone?: () => void;
      onError?: (error: any) => void;
    }
  ): Promise<void> {
    if (!this.Tts) {
      const error = 'Text-to-speech not available. Install react-native-tts';
      console.error('[Voice]', error);
      options?.onError?.(new Error(error));
      return;
    }

    try {
      this.isSpeaking = true;

      // Configure TTS
      await this.Tts.setDefaultLanguage(options?.language || this.ttsConfig.language);
      await this.Tts.setDefaultPitch(options?.pitch || this.ttsConfig.pitch);
      await this.Tts.setDefaultRate(options?.rate || this.ttsConfig.rate);

      // Set up listeners
      this.Tts.addEventListener('tts-start', () => {
        console.log('[Voice] Speech started');
        options?.onStart?.();
      });

      this.Tts.addEventListener('tts-finish', () => {
        console.log('[Voice] Speech finished');
        this.isSpeaking = false;
        options?.onDone?.();
      });

      this.Tts.addEventListener('tts-error', (event: any) => {
        console.error('[Voice] TTS error:', event);
        this.isSpeaking = false;
        options?.onError?.(event);
      });

      // Speak
      await this.Tts.speak(text);

    } catch (error) {
      console.error('[Voice] Speak error:', error);
      this.isSpeaking = false;
      options?.onError?.(error);
    }
  }

  /**
   * Stop speaking
   */
  async stopSpeaking(): Promise<void> {
    if (!this.Tts || !this.isSpeaking) return;

    try {
      await this.Tts.stop();
      this.isSpeaking = false;
      console.log('[Voice] Speaking stopped');
    } catch (error) {
      console.error('[Voice] Stop speaking error:', error);
    }
  }

  /**
   * Get available voices
   */
  async getAvailableVoices(): Promise<any[]> {
    if (!this.Tts) return [];

    try {
      const voices = await this.Tts.voices();
      return voices;
    } catch (error) {
      console.error('[Voice] Get voices error:', error);
      return [];
    }
  }

  /**
   * Set voice language
   */
  setLanguage(language: string): void {
    this.sttConfig.language = language;
    this.ttsConfig.language = language;
    console.log('[Voice] Language set to:', language);
  }

  /**
   * Set speaking rate
   */
  setRate(rate: number): void {
    this.ttsConfig.rate = Math.max(0.1, Math.min(2.0, rate));
  }

  /**
   * Set speaking pitch
   */
  setPitch(pitch: number): void {
    this.ttsConfig.pitch = Math.max(0.5, Math.min(2.0, pitch));
  }

  /**
   * Voice command detection
   */
  detectCommand(text: string): {
    isCommand: boolean;
    command: string | null;
    params: string[];
  } {
    const lower = text.toLowerCase();

    // Wake words
    if (lower.startsWith('hey motto') || lower.startsWith('okay motto')) {
      const withoutWake = lower.replace(/^(hey|okay) motto,?\s*/i, '');
      return {
        isCommand: true,
        command: 'query',
        params: [withoutWake],
      };
    }

    // Direct commands
    const commands: { [key: string]: RegExp } = {
      'change_language': /change language to (\w+)/,
      'clear_history': /clear (my )?history/,
      'show_profile': /show (my )?profile/,
      'open_settings': /open settings/,
      'repeat': /repeat (that|last)/,
      'stop': /stop|cancel|nevermind/,
    };

    for (const [cmd, pattern] of Object.entries(commands)) {
      const match = lower.match(pattern);
      if (match) {
        return {
          isCommand: true,
          command: cmd,
          params: match.slice(1),
        };
      }
    }

    return {
      isCommand: false,
      command: null,
      params: [],
    };
  }

  /**
   * Voice conversation mode (continuous)
   */
  async startConversationMode(
    onMessage: (text: string) => Promise<string>,
    onError?: (error: any) => void
  ): Promise<void> {
    console.log('[Voice] Starting conversation mode');

    // Enable continuous listening
    this.sttConfig.continuous = true;

    // Listen for user speech
    await this.startListening(
      async (userText) => {
        // Stop listening while processing
        await this.stopListening();

        // Get AI response
        const response = await onMessage(userText);

        // Speak response
        await this.speak(response, {
          onDone: async () => {
            // Resume listening after speaking
            await this.startListening(
              (text) => onMessage(text).then(r => this.speak(r)),
              onError
            );
          },
          onError,
        });
      },
      onError
    );
  }

  /**
   * Stop conversation mode
   */
  async stopConversationMode(): Promise<void> {
    await this.stopListening();
    await this.stopSpeaking();
    this.sttConfig.continuous = false;
    console.log('[Voice] Conversation mode stopped');
  }

  /**
   * Check if voice features available
   */
  isAvailable(): {
    speechToText: boolean;
    textToSpeech: boolean;
  } {
    return {
      speechToText: this.Voice !== null,
      textToSpeech: this.Tts !== null,
    };
  }

  /**
   * Get voice status
   */
  getStatus(): {
    isListening: boolean;
    isSpeaking: boolean;
    sttConfig: VoiceConfig;
    ttsConfig: TTSConfig;
  } {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      sttConfig: { ...this.sttConfig },
      ttsConfig: { ...this.ttsConfig },
    };
  }

  /**
   * Initialize voice services (for component lifecycle)
   * Call this when mounting components that use voice
   */
  initialize(): void {
    console.log('[VoiceIntegration] Service initialized for component');
    // Voice SDK is already initialized in constructor
    // This method is for component lifecycle compatibility
  }

  /**
   * Cleanup voice services (for component lifecycle)
   * Call this when unmounting components that use voice
   */
  destroy(): void {
    console.log('[VoiceIntegration] Service cleanup for component');
    
    // Stop any active operations
    if (this.isListening) {
      this.stopListening().catch(err => 
        console.error('[VoiceIntegration] Error stopping listening:', err)
      );
    }
    
    if (this.isSpeaking) {
      this.stopSpeaking().catch(err => 
        console.error('[VoiceIntegration] Error stopping speaking:', err)
      );
    }
  }

  /**
   * Reset voice configuration to defaults
   */
  resetConfig(): void {
    this.sttConfig = {
      language: 'en-US',
      continuous: false,
      interimResults: true,
      maxAlternatives: 1,
    };
    
    this.ttsConfig = {
      language: 'en-US',
      pitch: 1.0,
      rate: 1.0,
      voice: null,
    };
    
    console.log('[VoiceIntegration] Configuration reset to defaults');
  }

  /**
   * Check if currently listening
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Check if currently speaking
   */
  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }
}

export default VoiceIntegrationService.getInstance();
