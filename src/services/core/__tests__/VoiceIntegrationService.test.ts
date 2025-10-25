/**
 * VoiceIntegrationService Tests
 * Testing speech-to-text and text-to-speech functionality
 */

import VoiceIntegrationService from '../VoiceIntegrationService';

describe('VoiceIntegrationService', () => {
  describe('Lifecycle Methods', () => {
    it('should initialize without errors', () => {
      expect(() => VoiceIntegrationService.initialize()).not.toThrow();
    });

    it('should destroy without errors', () => {
      expect(() => VoiceIntegrationService.destroy()).not.toThrow();
    });

    it('should handle multiple initialize calls', () => {
      VoiceIntegrationService.initialize();
      VoiceIntegrationService.initialize();
      expect(true).toBe(true); // Should not throw
    });

    it('should handle multiple destroy calls', () => {
      VoiceIntegrationService.destroy();
      VoiceIntegrationService.destroy();
      expect(true).toBe(true); // Should not throw
    });
  });

  describe('Configuration', () => {
    it('should set language', () => {
      VoiceIntegrationService.setLanguage('es-ES');
      const status = VoiceIntegrationService.getStatus();
      expect(status.sttConfig.language).toBe('es-ES');
      expect(status.ttsConfig.language).toBe('es-ES');
    });

    it('should set rate within valid range', () => {
      VoiceIntegrationService.setRate(1.5);
      const status = VoiceIntegrationService.getStatus();
      expect(status.ttsConfig.rate).toBe(1.5);
    });

    it('should clamp rate to valid range', () => {
      VoiceIntegrationService.setRate(5.0); // Too high
      const status = VoiceIntegrationService.getStatus();
      expect(status.ttsConfig.rate).toBeLessThanOrEqual(2.0);
    });

    it('should set pitch within valid range', () => {
      VoiceIntegrationService.setPitch(1.2);
      const status = VoiceIntegrationService.getStatus();
      expect(status.ttsConfig.pitch).toBe(1.2);
    });

    it('should reset configuration', () => {
      VoiceIntegrationService.setLanguage('fr-FR');
      VoiceIntegrationService.setRate(1.8);
      VoiceIntegrationService.resetConfig();
      
      const status = VoiceIntegrationService.getStatus();
      expect(status.sttConfig.language).toBe('en-US');
      expect(status.ttsConfig.rate).toBe(1.0);
    });
  });

  describe('Status Checks', () => {
    it('should return availability status', () => {
      const available = VoiceIntegrationService.isAvailable();
      
      expect(available).toBeDefined();
      expect(available).toHaveProperty('speechToText');
      expect(available).toHaveProperty('textToSpeech');
      expect(typeof available.speechToText).toBe('boolean');
      expect(typeof available.textToSpeech).toBe('boolean');
    });

    it('should return current status', () => {
      const status = VoiceIntegrationService.getStatus();
      
      expect(status).toBeDefined();
      expect(status).toHaveProperty('isListening');
      expect(status).toHaveProperty('isSpeaking');
      expect(status).toHaveProperty('sttConfig');
      expect(status).toHaveProperty('ttsConfig');
    });

    it('should check if currently listening', () => {
      const listening = VoiceIntegrationService.isCurrentlyListening();
      expect(typeof listening).toBe('boolean');
    });

    it('should check if currently speaking', () => {
      const speaking = VoiceIntegrationService.isCurrentlySpeaking();
      expect(typeof speaking).toBe('boolean');
    });
  });

  describe('Voice Commands', () => {
    it('should detect wake words', () => {
      const result = VoiceIntegrationService.detectCommand('Hey MOTTO, what time is it?');
      
      expect(result.isCommand).toBe(true);
      expect(result.command).toBe('query');
      expect(result.params.length).toBeGreaterThan(0);
    });

    it('should detect change language command', () => {
      const result = VoiceIntegrationService.detectCommand('change language to spanish');
      
      expect(result.isCommand).toBe(true);
      expect(result.command).toBe('change_language');
    });

    it('should detect clear history command', () => {
      const result = VoiceIntegrationService.detectCommand('clear my history');
      
      expect(result.isCommand).toBe(true);
      expect(result.command).toBe('clear_history');
    });

    it('should not detect commands in regular text', () => {
      const result = VoiceIntegrationService.detectCommand('I love programming');
      
      expect(result.isCommand).toBe(false);
      expect(result.command).toBeNull();
    });
  });
});

