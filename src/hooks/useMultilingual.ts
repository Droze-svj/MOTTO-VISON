/**
 * useMultilingual Hook
 * Easy access to MOTTO's multilingual capabilities
 */

import { useState, useEffect, useCallback } from 'react';
import MultilingualService from '../services/core/MultilingualService';

export const useMultilingual = (userId: string) => {
  const [languageProfile, setLanguageProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supportedLanguages, setSupportedLanguages] = useState<any[]>([]);

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Initialize user language profile
        await MultilingualService.initializeUserLanguage(userId);
        
        // Load profile
        const profile = MultilingualService.getUserLanguageProfile(userId);
        setLanguageProfile(profile);
        
        // Load supported languages
        const languages = MultilingualService.getSupportedLanguages();
        setSupportedLanguages(languages);
        
      } catch (err) {
        setError('Failed to load multilingual profile');
        console.error('useMultilingual error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [userId]);

  // Detect language
  const detectLanguage = useCallback(async (text: string) => {
    try {
      return await MultilingualService.detectLanguage(text);
    } catch (err) {
      setError('Language detection failed');
      return null;
    }
  }, []);

  // Translate text
  const translate = useCallback(async (
    text: string,
    targetLang: string,
    sourceLang: string = 'auto'
  ) => {
    try {
      return await MultilingualService.translate(text, targetLang, sourceLang);
    } catch (err) {
      setError('Translation failed');
      return null;
    }
  }, []);

  // Smart translate (auto to user's language)
  const smartTranslate = useCallback(async (text: string) => {
    try {
      return await MultilingualService.smartTranslate(userId, text);
    } catch (err) {
      setError('Smart translation failed');
      return null;
    }
  }, [userId]);

  // Set user's primary language
  const setUserLanguage = useCallback(async (language: string) => {
    try {
      await MultilingualService.setUserLanguage(userId, language);
      const profile = MultilingualService.getUserLanguageProfile(userId);
      setLanguageProfile(profile);
    } catch (err) {
      setError('Failed to set language');
    }
  }, [userId]);

  // Add secondary language
  const addSecondaryLanguage = useCallback(async (language: string) => {
    try {
      await MultilingualService.addSecondaryLanguage(userId, language);
      const profile = MultilingualService.getUserLanguageProfile(userId);
      setLanguageProfile(profile);
    } catch (err) {
      setError('Failed to add secondary language');
    }
  }, [userId]);

  // Get most used languages
  const getMostUsedLanguages = useCallback((limit: number = 5) => {
    return MultilingualService.getMostUsedLanguages(userId, limit);
  }, [userId]);

  // Get language name
  const getLanguageName = useCallback((code: string) => {
    return MultilingualService.getLanguageName(code);
  }, []);

  // Check if language is supported
  const isLanguageSupported = useCallback((code: string) => {
    return MultilingualService.isLanguageSupported(code);
  }, []);

  return {
    languageProfile,
    isLoading,
    error,
    supportedLanguages,
    detectLanguage,
    translate,
    smartTranslate,
    setUserLanguage,
    addSecondaryLanguage,
    getMostUsedLanguages,
    getLanguageName,
    isLanguageSupported
  };
};
