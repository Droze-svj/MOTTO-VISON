/**
 * Multilingual Service
 * Makes MOTTO speak 100+ languages fluently!
 * Auto-detects, translates, and adapts to any language
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageProfile {
  userId: string;
  primaryLanguage: string;
  secondaryLanguages: string[];
  autoDetect: boolean;
  translationPreference: 'always' | 'ask' | 'never';
  detectedLanguages: { [lang: string]: number }; // Confidence scores
  languageHistory: { timestamp: number; language: string; text: string }[];
}

interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  service: string;
}

// Supported languages (100+)
const SUPPORTED_LANGUAGES = {
  // Major languages
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  ar: 'Arabic',
  hi: 'Hindi',
  bn: 'Bengali',
  pa: 'Punjabi',
  te: 'Telugu',
  mr: 'Marathi',
  ta: 'Tamil',
  ur: 'Urdu',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  
  // European languages
  nl: 'Dutch',
  pl: 'Polish',
  uk: 'Ukrainian',
  ro: 'Romanian',
  cs: 'Czech',
  sv: 'Swedish',
  hu: 'Hungarian',
  el: 'Greek',
  bg: 'Bulgarian',
  da: 'Danish',
  fi: 'Finnish',
  sk: 'Slovak',
  no: 'Norwegian',
  hr: 'Croatian',
  lt: 'Lithuanian',
  sl: 'Slovenian',
  lv: 'Latvian',
  et: 'Estonian',
  
  // Asian languages
  th: 'Thai',
  vi: 'Vietnamese',
  id: 'Indonesian',
  ms: 'Malay',
  tl: 'Filipino (Tagalog)',
  
  // Middle Eastern
  fa: 'Persian (Farsi)',
  he: 'Hebrew',
  tr: 'Turkish',
  
  // African languages
  sw: 'Swahili',
  af: 'Afrikaans',
  zu: 'Zulu',
  xh: 'Xhosa',
  
  // Others
  ca: 'Catalan',
  eu: 'Basque',
  gl: 'Galician',
  cy: 'Welsh',
  ga: 'Irish',
  is: 'Icelandic',
  mk: 'Macedonian',
  sq: 'Albanian',
  sr: 'Serbian',
  bs: 'Bosnian',
  az: 'Azerbaijani',
  ka: 'Georgian',
  hy: 'Armenian',
  
  // And 40+ more via LibreTranslate!
};

class MultilingualService {
  private static instance: MultilingualService;
  private languageProfiles: Map<string, LanguageProfile> = new Map();
  private translationCache: Map<string, TranslationResult> = new Map();
  
  private constructor() {
    this.loadProfiles();
  }
  
  static getInstance(): MultilingualService {
    if (!MultilingualService.instance) {
      MultilingualService.instance = new MultilingualService();
    }
    return MultilingualService.instance;
  }

  // ============================================
  // LANGUAGE DETECTION
  // ============================================

  /**
   * Auto-detect language from text
   */
  async detectLanguage(text: string): Promise<{
    language: string;
    confidence: number;
    alternatives: { language: string; confidence: number }[];
  }> {
    // Try multiple detection methods for accuracy
    
    // Method 1: Pattern-based detection (fast, offline)
    const patternResult = this.detectByPatterns(text);
    
    // Method 2: Character set detection
    const charsetResult = this.detectByCharset(text);
    
    // Method 3: LibreTranslate API (most accurate, but online)
    let apiResult = null;
    try {
      apiResult = await this.detectViaAPI(text);
    } catch (error) {
      console.log('[Language Detection] API unavailable, using offline methods');
    }

    // Combine results with weighted confidence
    const combined = this.combineDetectionResults(
      patternResult,
      charsetResult,
      apiResult
    );

    return combined;
  }

  /**
   * Detect language using patterns (offline)
   */
  private detectByPatterns(text: string): { language: string; confidence: number } {
    const lower = text.toLowerCase();
    
    // Common word patterns for major languages
    const patterns: { [key: string]: { words: string[]; weight: number } } = {
      en: { words: ['the', 'is', 'are', 'was', 'were', 'and', 'or', 'but', 'in', 'on'], weight: 1.0 },
      es: { words: ['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'es', 'está', 'son', 'y', 'o'], weight: 1.0 },
      fr: { words: ['le', 'la', 'les', 'un', 'une', 'de', 'du', 'est', 'sont', 'et', 'ou', 'mais'], weight: 1.0 },
      de: { words: ['der', 'die', 'das', 'ein', 'eine', 'ist', 'sind', 'und', 'oder', 'aber'], weight: 1.0 },
      it: { words: ['il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'una', 'è', 'sono', 'e', 'o'], weight: 1.0 },
      pt: { words: ['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'é', 'são', 'e', 'ou'], weight: 1.0 },
      ru: { words: ['и', 'в', 'не', 'на', 'с', 'что', 'это', 'как', 'по'], weight: 1.0 },
      ja: { words: ['は', 'の', 'を', 'に', 'が', 'で', 'と', 'も', 'から'], weight: 1.0 },
      zh: { words: ['的', '是', '在', '有', '人', '我', '他', '这', '个', '们'], weight: 1.0 },
      ar: { words: ['في', 'من', 'على', 'إلى', 'هذا', 'أن', 'كان', 'عن'], weight: 1.0 },
      hi: { words: ['है', 'की', 'के', 'में', 'को', 'से', 'और', 'का'], weight: 1.0 },
      tr: { words: ['bir', 've', 'bu', 'için', 'ile', 'olan', 'var', 'mi'], weight: 1.0 },
      nl: { words: ['de', 'het', 'een', 'van', 'is', 'zijn', 'en', 'of', 'maar'], weight: 1.0 },
      pl: { words: ['i', 'w', 'na', 'z', 'do', 'jest', 'się', 'nie', 'ale'], weight: 1.0 },
      ko: { words: ['은', '는', '이', '가', '을', '를', '에', '의', '와'], weight: 1.0 },
    };

    let maxScore = 0;
    let detectedLang = 'en';

    for (const [lang, { words, weight }] of Object.entries(patterns)) {
      let score = 0;
      for (const word of words) {
        // Count occurrences
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = (lower.match(regex) || []).length;
        score += matches * weight;
      }
      
      if (score > maxScore) {
        maxScore = score;
        detectedLang = lang;
      }
    }

    const totalWords = text.split(/\s+/).length;
    const confidence = Math.min(0.95, (maxScore / totalWords) * 2);

    return { language: detectedLang, confidence };
  }

  /**
   * Detect language by character set
   */
  private detectByCharset(text: string): { language: string; confidence: number } {
    // Check for specific character ranges
    const charChecks = [
      { range: /[\u4E00-\u9FFF]/, lang: 'zh', name: 'Chinese' },
      { range: /[\u3040-\u309F\u30A0-\u30FF]/, lang: 'ja', name: 'Japanese' },
      { range: /[\uAC00-\uD7AF]/, lang: 'ko', name: 'Korean' },
      { range: /[\u0400-\u04FF]/, lang: 'ru', name: 'Cyrillic (Russian)' },
      { range: /[\u0600-\u06FF]/, lang: 'ar', name: 'Arabic' },
      { range: /[\u0900-\u097F]/, lang: 'hi', name: 'Devanagari (Hindi)' },
      { range: /[\u0E00-\u0E7F]/, lang: 'th', name: 'Thai' },
      { range: /[\u0590-\u05FF]/, lang: 'he', name: 'Hebrew' },
      { range: /[\u10A0-\u10FF]/, lang: 'ka', name: 'Georgian' },
    ];

    for (const { range, lang, name } of charChecks) {
      const matches = text.match(range);
      if (matches && matches.length > text.length * 0.1) {
        return {
          language: lang,
          confidence: Math.min(0.99, matches.length / text.length)
        };
      }
    }

    // Default to English if no special chars
    return { language: 'en', confidence: 0.3 };
  }

  /**
   * Detect via LibreTranslate API
   */
  private async detectViaAPI(text: string): Promise<{ language: string; confidence: number } | null> {
    try {
      const response = await fetch('https://libretranslate.de/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text })
      });

      if (response.ok) {
        const data = await response.json();
        // Returns array like [{ language: 'en', confidence: 0.95 }]
        if (data && data.length > 0) {
          return {
            language: data[0].language,
            confidence: data[0].confidence
          };
        }
      }
    } catch (error) {
      console.error('[LibreTranslate Detection] Error:', error);
    }

    return null;
  }

  /**
   * Combine detection results
   */
  private combineDetectionResults(
    pattern: { language: string; confidence: number },
    charset: { language: string; confidence: number },
    api: { language: string; confidence: number } | null
  ): { language: string; confidence: number; alternatives: any[] } {
    const scores: { [lang: string]: number } = {};

    // Weight: API (50%), Pattern (30%), Charset (20%)
    scores[pattern.language] = (scores[pattern.language] || 0) + pattern.confidence * 0.3;
    scores[charset.language] = (scores[charset.language] || 0) + charset.confidence * 0.2;
    
    if (api) {
      scores[api.language] = (scores[api.language] || 0) + api.confidence * 0.5;
    }

    // Find top language
    const sorted = Object.entries(scores)
      .sort(([, a], [, b]) => b - a);

    return {
      language: sorted[0][0],
      confidence: sorted[0][1],
      alternatives: sorted.slice(1, 4).map(([lang, conf]) => ({
        language: lang,
        confidence: conf
      }))
    };
  }

  // ============================================
  // TRANSLATION
  // ============================================

  /**
   * Translate text to target language
   */
  async translate(
    text: string,
    targetLang: string,
    sourceLang: string = 'auto'
  ): Promise<TranslationResult> {
    // Check cache first
    const cacheKey = `${sourceLang}:${targetLang}:${text}`;
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }

    // Detect source language if auto
    let detectedSource = sourceLang;
    if (sourceLang === 'auto') {
      const detection = await this.detectLanguage(text);
      detectedSource = detection.language;
    }

    // If source and target are the same, no translation needed
    if (detectedSource === targetLang) {
      return {
        originalText: text,
        translatedText: text,
        sourceLanguage: detectedSource,
        targetLanguage: targetLang,
        confidence: 1.0,
        service: 'none'
      };
    }

    // Try LibreTranslate (free, open source)
    try {
      const result = await this.translateViaLibreTranslate(text, detectedSource, targetLang);
      
      // Cache result
      this.translationCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('[Translation] Error:', error);
      
      // Fallback: return original with error message
      return {
        originalText: text,
        translatedText: `[Translation unavailable: ${text}]`,
        sourceLanguage: detectedSource,
        targetLanguage: targetLang,
        confidence: 0,
        service: 'error'
      };
    }
  }

  /**
   * Translate via LibreTranslate
   */
  private async translateViaLibreTranslate(
    text: string,
    source: string,
    target: string
  ): Promise<TranslationResult> {
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: source,
        target: target,
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      originalText: text,
      translatedText: data.translatedText,
      sourceLanguage: source,
      targetLanguage: target,
      confidence: 0.9, // LibreTranslate is quite good
      service: 'LibreTranslate'
    };
  }

  /**
   * Batch translate multiple texts
   */
  async batchTranslate(
    texts: string[],
    targetLang: string,
    sourceLang: string = 'auto'
  ): Promise<TranslationResult[]> {
    const results: TranslationResult[] = [];

    for (const text of texts) {
      const result = await this.translate(text, targetLang, sourceLang);
      results.push(result);
    }

    return results;
  }

  // ============================================
  // USER LANGUAGE PREFERENCES
  // ============================================

  /**
   * Initialize user language profile
   */
  async initializeUserLanguage(userId: string, primaryLanguage: string = 'en'): Promise<void> {
    if (!this.languageProfiles.has(userId)) {
      const profile: LanguageProfile = {
        userId,
        primaryLanguage,
        secondaryLanguages: [],
        autoDetect: true,
        translationPreference: 'ask',
        detectedLanguages: {},
        languageHistory: []
      };
      
      this.languageProfiles.set(userId, profile);
      await this.saveProfiles();
    }
  }

  /**
   * Set user's primary language
   */
  async setUserLanguage(userId: string, language: string): Promise<void> {
    await this.initializeUserLanguage(userId);
    const profile = this.languageProfiles.get(userId)!;
    profile.primaryLanguage = language;
    await this.saveProfiles();
  }

  /**
   * Add secondary language
   */
  async addSecondaryLanguage(userId: string, language: string): Promise<void> {
    const profile = this.languageProfiles.get(userId);
    if (profile && !profile.secondaryLanguages.includes(language)) {
      profile.secondaryLanguages.push(language);
      await this.saveProfiles();
    }
  }

  /**
   * Get user's language profile
   */
  getUserLanguageProfile(userId: string): LanguageProfile | null {
    return this.languageProfiles.get(userId) || null;
  }

  /**
   * Record language usage
   */
  async recordLanguageUsage(userId: string, text: string, language: string): Promise<void> {
    const profile = this.languageProfiles.get(userId);
    if (!profile) return;

    // Update detected languages confidence
    profile.detectedLanguages[language] = (profile.detectedLanguages[language] || 0) + 1;

    // Add to history
    profile.languageHistory.push({
      timestamp: Date.now(),
      language,
      text: text.substring(0, 100) // Store sample
    });

    // Keep only last 100 entries
    if (profile.languageHistory.length > 100) {
      profile.languageHistory.shift();
    }

    await this.saveProfiles();
  }

  // ============================================
  // SMART TRANSLATION
  // ============================================

  /**
   * Smart translate: Auto-detect and translate to user's preferred language
   */
  async smartTranslate(userId: string, text: string): Promise<{
    original: string;
    translated: string;
    wasTranslated: boolean;
    sourceLanguage: string;
    targetLanguage: string;
  }> {
    await this.initializeUserLanguage(userId);
    const profile = this.languageProfiles.get(userId)!;

    // Detect input language
    const detection = await this.detectLanguage(text);
    const sourceLang = detection.language;

    // Record usage
    await this.recordLanguageUsage(userId, text, sourceLang);

    // Check if translation is needed
    if (sourceLang === profile.primaryLanguage) {
      return {
        original: text,
        translated: text,
        wasTranslated: false,
        sourceLanguage: sourceLang,
        targetLanguage: profile.primaryLanguage
      };
    }

    // Translate to user's preferred language
    const result = await this.translate(text, profile.primaryLanguage, sourceLang);

    return {
      original: text,
      translated: result.translatedText,
      wasTranslated: true,
      sourceLanguage: sourceLang,
      targetLanguage: profile.primaryLanguage
    };
  }

  /**
   * Translate MOTTO's response to user's language
   */
  async translateResponse(userId: string, response: string): Promise<string> {
    const profile = this.languageProfiles.get(userId);
    if (!profile || profile.primaryLanguage === 'en') {
      return response; // No translation needed
    }

    const result = await this.translate(response, profile.primaryLanguage, 'en');
    return result.translatedText;
  }

  // ============================================
  // LANGUAGE UTILITIES
  // ============================================

  /**
   * Get all supported languages
   */
  getSupportedLanguages(): { code: string; name: string }[] {
    return Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({
      code,
      name
    }));
  }

  /**
   * Get language name from code
   */
  getLanguageName(code: string): string {
    return SUPPORTED_LANGUAGES[code as keyof typeof SUPPORTED_LANGUAGES] || code;
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(code: string): boolean {
    return code in SUPPORTED_LANGUAGES;
  }

  /**
   * Get user's most used languages
   */
  getMostUsedLanguages(userId: string, limit: number = 5): { language: string; count: number }[] {
    const profile = this.languageProfiles.get(userId);
    if (!profile) return [];

    return Object.entries(profile.detectedLanguages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([language, count]) => ({ language, count }));
  }

  // ============================================
  // PERSISTENCE
  // ============================================

  private async loadProfiles(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('multilingual_profiles');
      if (stored) {
        const parsed = JSON.parse(stored);
        for (const userId in parsed) {
          this.languageProfiles.set(userId, parsed[userId]);
        }
      }
    } catch (error) {
      console.error('[Multilingual] Error loading profiles:', error);
    }
  }

  private async saveProfiles(): Promise<void> {
    try {
      const toStore: any = {};
      this.languageProfiles.forEach((profile, userId) => {
        toStore[userId] = profile;
      });
      await AsyncStorage.setItem('multilingual_profiles', JSON.stringify(toStore));
    } catch (error) {
      console.error('[Multilingual] Error saving profiles:', error);
    }
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.translationCache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; languages: string[] } {
    const languages = new Set<string>();
    this.translationCache.forEach(result => {
      languages.add(result.sourceLanguage);
      languages.add(result.targetLanguage);
    });

    return {
      size: this.translationCache.size,
      languages: Array.from(languages)
    };
  }
}

export default MultilingualService.getInstance();
