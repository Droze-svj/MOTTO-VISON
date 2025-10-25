/**
 * MultilingualService Tests
 * Tests language detection and translation
 */

import MultilingualService from '../MultilingualService';

describe('MultilingualService', () => {
  const userId = 'test-user-ml';

  beforeEach(async () => {
    await MultilingualService.initializeUserLanguage(userId);
  });

  describe('Language Detection', () => {
    it('should detect English', async () => {
      const result = await MultilingualService.detectLanguage(
        'Hello, how are you today?'
      );
      
      expect(result.language).toBe('en');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect Spanish', async () => {
      const result = await MultilingualService.detectLanguage(
        'Hola, ¿cómo estás?'
      );
      
      expect(result.language).toBe('es');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect French', async () => {
      const result = await MultilingualService.detectLanguage(
        'Bonjour, comment allez-vous?'
      );
      
      expect(result.language).toBe('fr');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should provide alternatives', async () => {
      const result = await MultilingualService.detectLanguage('Hello');
      
      expect(result.alternatives).toBeDefined();
      expect(Array.isArray(result.alternatives)).toBe(true);
    });
  });

  describe('User Language Management', () => {
    it('should set user language', async () => {
      await MultilingualService.setUserLanguage(userId, 'es');
      const profile = MultilingualService.getUserLanguageProfile(userId);
      
      expect(profile?.primaryLanguage).toBe('es');
    });

    it('should add secondary languages', async () => {
      await MultilingualService.addSecondaryLanguage(userId, 'fr');
      await MultilingualService.addSecondaryLanguage(userId, 'de');
      
      const profile = MultilingualService.getUserLanguageProfile(userId);
      
      expect(profile?.secondaryLanguages).toContain('fr');
      expect(profile?.secondaryLanguages).toContain('de');
    });
  });

  describe('Language Utilities', () => {
    it('should list supported languages', () => {
      const languages = MultilingualService.getSupportedLanguages();
      
      expect(languages.length).toBeGreaterThan(50);
      expect(languages[0]).toHaveProperty('code');
      expect(languages[0]).toHaveProperty('name');
    });

    it('should check if language is supported', () => {
      expect(MultilingualService.isLanguageSupported('en')).toBe(true);
      expect(MultilingualService.isLanguageSupported('es')).toBe(true);
      expect(MultilingualService.isLanguageSupported('zzz')).toBe(false);
    });

    it('should get language name', () => {
      expect(MultilingualService.getLanguageName('en')).toBe('English');
      expect(MultilingualService.getLanguageName('es')).toBe('Spanish');
    });
  });

  describe('Smart Translation', () => {
    it('should detect when translation not needed', async () => {
      await MultilingualService.setUserLanguage(userId, 'en');
      
      const result = await MultilingualService.smartTranslate(userId, 'Hello');
      
      expect(result.wasTranslated).toBe(false);
      expect(result.translated).toBe('Hello');
    });
  });
});
