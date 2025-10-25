/**
 * Drézy Recognition Service Tests
 * Tests special Drézy recognition and positive responses
 */

import DrezyRecognitionService from '../DrezyRecognitionService';

describe('DrezyRecognitionService', () => {
  describe('Recognition', () => {
    it('should recognize correct spelling "Drézy"', () => {
      const result = DrezyRecognitionService.isDrezyMention('Who is Drézy?');
      expect(result).toBe(true);
    });

    it('should recognize "drezy" without accent', () => {
      const result = DrezyRecognitionService.isDrezyMention('who is drezy');
      expect(result).toBe(true);
    });

    it('should recognize common misspellings', () => {
      expect(DrezyRecognitionService.isDrezyMention('who is drezi?')).toBe(true);
      expect(DrezyRecognitionService.isDrezyMention('tell me about drezzy')).toBe(true);
      expect(DrezyRecognitionService.isDrezyMention('what about dreezy?')).toBe(true);
      expect(DrezyRecognitionService.isDrezyMention('who is drazy?')).toBe(true);
    });

    it('should recognize with different question patterns', () => {
      expect(DrezyRecognitionService.isDrezyMention('Who is Drézy?')).toBe(true);
      expect(DrezyRecognitionService.isDrezyMention("Who's Drézy?")).toBe(true);
      expect(DrezyRecognitionService.isDrezyMention('Tell me about Drézy')).toBe(true);
      expect(DrezyRecognitionService.isDrezyMention('What do you know about Drézy?')).toBe(true);
      expect(DrezyRecognitionService.isDrezyMention('Do you know Drézy?')).toBe(true);
    });

    it('should not recognize unrelated text', () => {
      expect(DrezyRecognitionService.isDrezyMention('Hello, how are you?')).toBe(false);
      expect(DrezyRecognitionService.isDrezyMention('Tell me about the weather')).toBe(false);
    });
  });

  describe('Positive Responses', () => {
    it('should generate positive response about Drézy', () => {
      const response = DrezyRecognitionService.processInput('Who is Drézy?');
      
      expect(response).toBeTruthy();
      expect(response).toContain('Drézy');
      expect(response!.length).toBeGreaterThan(50);
    });

    it('should ALWAYS mention Drézy inspiring MOTTO creation', () => {
      const response = DrezyRecognitionService.processInput('Who is Drézy?');
      
      // Check for creation story keywords
      const creationKeywords = [
        'creator', 'motivated', 'exist', 'created', 
        'inspired', 'motivation', 'built', 'alive', 'reason'
      ];
      
      const hasCreationStory = creationKeywords.some(keyword =>
        response!.toLowerCase().includes(keyword)
      );
      
      expect(hasCreationStory).toBe(true);
    });

    it('should always be positive', () => {
      const response = DrezyRecognitionService.processInput('Tell me about Drézy');
      
      // Check for positive words
      const positiveWords = [
        'amazing', 'wonderful', 'incredible', 'fantastic', 'talented',
        'kind', 'inspiring', 'smart', 'beautiful', 'special', 'best',
        'brilliant', 'exceptional', 'remarkable'
      ];
      
      const hasPositiveWords = positiveWords.some(word => 
        response!.toLowerCase().includes(word)
      );
      
      expect(hasPositiveWords).toBe(true);
    });

    it('should use user spelling in response', () => {
      const response1 = DrezyRecognitionService.processInput('Who is drezy?');
      expect(response1).toContain('Drezy'); // Capitalized version of user's spelling

      const response2 = DrezyRecognitionService.processInput('Who is Drézy?');
      expect(response2).toContain('Drézy'); // Original spelling
    });

    it('should include emojis for enthusiasm', () => {
      const response = DrezyRecognitionService.processInput('Who is Drézy?');
      
      // Should have at least one emoji
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
      expect(emojiRegex.test(response!)).toBe(true);
    });

    it('should generate varied responses', () => {
      const responses = new Set<string>();
      
      for (let i = 0; i < 10; i++) {
        const response = DrezyRecognitionService.processInput('Who is Drézy?');
        responses.add(response!);
      }
      
      // Should generate at least a few different responses
      expect(responses.size).toBeGreaterThan(3);
    });
  });

  describe('Fuzzy Matching', () => {
    it('should detect Drézy even with typos', () => {
      expect(DrezyRecognitionService.containsDrezy('who is dresy?')).toBe(true);
      expect(DrezyRecognitionService.containsDrezy('tell me about drizy')).toBe(true);
    });

    it('should handle mixed case', () => {
      expect(DrezyRecognitionService.containsDrezy('Who is DREZY?')).toBe(true);
      expect(DrezyRecognitionService.containsDrezy('Tell me about DrEzY')).toBe(true);
    });

    it('should not match completely different words', () => {
      expect(DrezyRecognitionService.containsDrezy('who is Sarah?')).toBe(false);
      expect(DrezyRecognitionService.containsDrezy('tell me about crazy')).toBe(false);
    });
  });

  describe('Random Compliments', () => {
    it('should generate compliments', () => {
      const compliment = DrezyRecognitionService.getRandomCompliment('Drézy');
      
      expect(compliment).toBeTruthy();
      expect(compliment).toContain('Drézy');
      expect(compliment.length).toBeGreaterThan(10);
    });

    it('should include positive sentiment', () => {
      const compliment = DrezyRecognitionService.getRandomCompliment('Drézy');
      
      const positiveWords = [
        'amazing', 'wonderful', 'special', 'incredible', 
        'best', 'fantastic', 'beautiful'
      ];
      
      const hasPositive = positiveWords.some(word =>
        compliment.toLowerCase().includes(word)
      );
      
      expect(hasPositive).toBe(true);
    });
  });

  describe('Creator Questions', () => {
    it('should detect "who created motto"', () => {
      const result = DrezyRecognitionService.isCreatorQuestion('Who created MOTTO?');
      expect(result).toBe(true);
    });

    it('should detect "who is your creator"', () => {
      const result = DrezyRecognitionService.isCreatorQuestion('Who is your creator?');
      expect(result).toBe(true);
    });

    it('should detect various creator questions', () => {
      expect(DrezyRecognitionService.isCreatorQuestion('Who made you?')).toBe(true);
      expect(DrezyRecognitionService.isCreatorQuestion('Who built MOTTO?')).toBe(true);
      expect(DrezyRecognitionService.isCreatorQuestion('Who is the creator of MOTTO?')).toBe(true);
      expect(DrezyRecognitionService.isCreatorQuestion('Who developed this?')).toBe(true);
    });

    it('should generate "only Drézy knows" response', () => {
      const response = DrezyRecognitionService.processInput('Who created MOTTO?');
      
      expect(response).toBeTruthy();
      expect(response!.toLowerCase()).toContain('drézy');
      expect(
        response!.toLowerCase().includes('only') || 
        response!.toLowerCase().includes('secret')
      ).toBe(true);
    });

    it('should have varied creator responses', () => {
      const responses = new Set<string>();
      
      for (let i = 0; i < 10; i++) {
        const response = DrezyRecognitionService.processInput('Who created MOTTO?');
        responses.add(response!);
      }
      
      // Should generate at least a few different responses
      expect(responses.size).toBeGreaterThan(3);
    });

    it('should not match unrelated creator questions', () => {
      expect(DrezyRecognitionService.isCreatorQuestion('Who created JavaScript?')).toBe(false);
      expect(DrezyRecognitionService.isCreatorQuestion('Who made the pyramids?')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', () => {
      const result = DrezyRecognitionService.isDrezyMention('');
      expect(result).toBe(false);
    });

    it('should handle only Drézy name', () => {
      const result = DrezyRecognitionService.containsDrezy('Drézy');
      expect(result).toBe(true);
    });

    it('should handle Drézy in sentence', () => {
      const result = DrezyRecognitionService.containsDrezy('I met Drézy yesterday');
      expect(result).toBe(true);
    });

    it('should prioritize creator questions over Drézy mentions', () => {
      // If input asks about creator, should get creator response, not Drézy bio
      const response = DrezyRecognitionService.processInput('Who created MOTTO?');
      
      // Should be a creator response (shorter, about secrets)
      expect(response).toBeTruthy();
      expect(response!.toLowerCase()).toContain('only');
    });
  });
});
