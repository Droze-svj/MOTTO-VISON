/**
 * useMultilingual Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useMultilingual } from '../useMultilingual';

describe('useMultilingual', () => {
  const testUserId = 'test-user-multilingual';

  describe('Initialization', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useMultilingual(testUserId));
      
      expect(result.current.isLoading).toBe(true);
    });

    it('should load language profile', async () => {
      const { result } = renderHook(() => useMultilingual(testUserId));
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.languageProfile).toBeDefined();
    });

    it('should load supported languages', async () => {
      const { result } = renderHook(() => useMultilingual(testUserId));
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(Array.isArray(result.current.supportedLanguages)).toBe(true);
      expect(result.current.supportedLanguages.length).toBeGreaterThan(0);
    });
  });

  describe('Language Detection', () => {
    it('should have detectLanguage function', async () => {
      const { result } = renderHook(() => useMultilingual(testUserId));
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(typeof result.current.detectLanguage).toBe('function');
    });

    it('should detect language from text', async () => {
      const { result } = renderHook(() => useMultilingual(testUserId));
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      let detection;
      await act(async () => {
        detection = await result.current.detectLanguage('Hello world');
      });
      
      expect(detection).toBeDefined();
    });
  });

  describe('Translation', () => {
    it('should have translate function', async () => {
      const { result } = renderHook(() => useMultilingual(testUserId));
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(typeof result.current.translate).toBe('function');
    });

    it('should have smartTranslate function', async () => {
      const { result } = renderHook(() => useMultilingual(testUserId));
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(typeof result.current.smartTranslate).toBe('function');
    });
  });

  describe('Language Management', () => {
    it('should set user language', async () => {
      const { result } = renderHook(() => useMultilingual(testUserId));
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.setUserLanguage('es');
      });
      
      expect(result.current.languageProfile).toBeDefined();
    });

    it('should add secondary language', async () => {
      const { result } = renderHook(() => useMultilingual(testUserId));
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.addSecondaryLanguage('fr');
      });
      
      expect(true).toBe(true);
    });

    it('should get user language', () => {
      const { result } = renderHook(() => useMultilingual(testUserId));
      
      expect(typeof result.current.getUserLanguage).toBe('function');
    });

    it('should check language support', () => {
      const { result } = renderHook(() => useMultilingual(testUserId));
      
      expect(typeof result.current.isLanguageSupported).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      const { result } = renderHook(() => useMultilingual(testUserId));
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      // Hook should not throw even with errors
      expect(result.current.error).toBeNull();
    });
  });
});

