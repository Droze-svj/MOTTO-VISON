/**
 * Voice Service
 * Consolidates: Voice recognition, TTS, audio processing services
 */

import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';

export class VoiceService {
  private static instance: VoiceService;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;

  private constructor() {
    this.initializeVoice();
    this.initializeTts();
  }

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  private initializeVoice(): void {
    Voice.onSpeechStart = () => console.log('Speech started');
    Voice.onSpeechEnd = () => console.log('Speech ended');
    Voice.onSpeechError = (e) => console.error('Speech error:', e);
  }

  private initializeTts(): void {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);
  }

  async startListening(onResult: (text: string) => void): Promise<void> {
    try {
      this.isListening = true;
      Voice.onSpeechResults = (e) => {
        if (e.value && e.value[0]) {
          onResult(e.value[0]);
        }
      };
      await Voice.start('en-US');
    } catch (error) {
      console.error('Voice start error:', error);
      this.isListening = false;
    }
  }

  async stopListening(): Promise<void> {
    this.isListening = false;
    await Voice.stop();
  }

  async speak(text: string): Promise<void> {
    try {
      this.isSpeaking = true;
      await Tts.speak(text);
      this.isSpeaking = false;
    } catch (error) {
      console.error('TTS error:', error);
      this.isSpeaking = false;
    }
  }

  async stop(): Promise<void> {
    await Tts.stop();
    this.isSpeaking = false;
  }

  getStatus(): {isListening: boolean; isSpeaking: boolean} {
    return {isListening: this.isListening, isSpeaking: this.isSpeaking};
  }
}

export default VoiceService.getInstance();

