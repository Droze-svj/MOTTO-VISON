/**
 * Keyboard Extension Service
 * Provides MOTTO as a custom keyboard for system-wide text assistance
 */

interface KeyboardSuggestion {
  text: string;
  type: 'completion' | 'correction' | 'suggestion' | 'action';
  confidence: number;
}

class KeyboardExtensionService {
  private static instance: KeyboardExtensionService;
  private isActive: boolean = false;
  private currentContext: string = '';

  private constructor() {
    console.log('[Keyboard Extension] Service initialized');
  }

  static getInstance(): KeyboardExtensionService {
    if (!KeyboardExtensionService.instance) {
      KeyboardExtensionService.instance = new KeyboardExtensionService();
    }
    return KeyboardExtensionService.instance;
  }

  /**
   * Activate MOTTO keyboard
   */
  async activate(): Promise<boolean> {
    console.log('[Keyboard Extension] Activating MOTTO keyboard...');
    
    // In production: Register custom keyboard extension
    this.isActive = true;
    
    console.log('[Keyboard Extension] ✅ Keyboard active');
    return true;
  }

  /**
   * Get smart suggestions as user types
   */
  async getSuggestions(currentText: string, context?: string): Promise<KeyboardSuggestion[]> {
    this.currentContext = context || '';
    
    const suggestions: KeyboardSuggestion[] = [];

    // Grammar corrections
    const corrections = this.getGrammarCorrections(currentText);
    suggestions.push(...corrections);

    // Auto-completions
    const completions = this.getCompletions(currentText);
    suggestions.push(...completions);

    // Smart suggestions based on context
    const contextual = this.getContextualSuggestions(currentText, context);
    suggestions.push(...contextual);

    // Quick actions
    const actions = this.getQuickActions(currentText);
    suggestions.push(...actions);

    return suggestions.slice(0, 5); // Top 5
  }

  /**
   * Grammar corrections
   */
  private getGrammarCorrections(text: string): KeyboardSuggestion[] {
    const corrections: KeyboardSuggestion[] = [];

    // Common corrections
    const rules = [
      { wrong: /your'e/gi, correct: "you're", type: 'correction' },
      { wrong: /\bteh\b/gi, correct: 'the', type: 'correction' },
      { wrong: /\brecieve\b/gi, correct: 'receive', type: 'correction' },
      { wrong: /\boccured\b/gi, correct: 'occurred', type: 'correction' },
    ];

    for (const rule of rules) {
      if (rule.wrong.test(text)) {
        corrections.push({
          text: rule.correct,
          type: 'correction' as const,
          confidence: 0.9,
        });
      }
    }

    return corrections;
  }

  /**
   * Auto-completions
   */
  private getCompletions(text: string): KeyboardSuggestion[] {
    const completions: KeyboardSuggestion[] = [];
    const lastWord = text.split(' ').pop()?.toLowerCase() || '';

    if (lastWord.length < 3) return completions;

    // Common completions
    const commonWords = [
      'because', 'therefore', 'however', 'although', 'through',
      'important', 'necessary', 'possible', 'different', 'available',
    ];

    for (const word of commonWords) {
      if (word.startsWith(lastWord) && word !== lastWord) {
        completions.push({
          text: word,
          type: 'completion',
          confidence: 0.8,
        });
      }
    }

    return completions;
  }

  /**
   * Contextual suggestions
   */
  private getContextualSuggestions(text: string, context?: string): KeyboardSuggestion[] {
    const suggestions: KeyboardSuggestion[] = [];

    // Email context
    if (context?.includes('email') || context?.includes('mail')) {
      if (text.length < 20) {
        suggestions.push({
          text: 'Dear [Name],',
          type: 'suggestion',
          confidence: 0.7,
        });
      }
      if (text.includes('thank')) {
        suggestions.push({
          text: 'Thank you for your time and consideration.',
          type: 'suggestion',
          confidence: 0.8,
        });
      }
    }

    // Messaging context
    if (context?.includes('message') || context?.includes('chat')) {
      suggestions.push(
        { text: '👍', type: 'suggestion', confidence: 0.6 },
        { text: '😊', type: 'suggestion', confidence: 0.6 },
        { text: 'Thanks!', type: 'suggestion', confidence: 0.7 }
      );
    }

    return suggestions;
  }

  /**
   * Quick actions available from keyboard
   */
  private getQuickActions(text: string): KeyboardSuggestion[] {
    if (text.length < 10) return [];

    return [
      {
        text: '📝 Continue writing',
        type: 'action',
        confidence: 0.7,
      },
      {
        text: '🔄 Rephrase',
        type: 'action',
        confidence: 0.7,
      },
      {
        text: '✨ Make formal',
        type: 'action',
        confidence: 0.7,
      },
      {
        text: '🌍 Translate',
        type: 'action',
        confidence: 0.7,
      },
    ];
  }

  /**
   * Handle quick action
   */
  async handleAction(action: string, text: string): Promise<string> {
    console.log(`[Keyboard Extension] Action: ${action}`);

    switch (action) {
      case 'Continue writing':
        return this.continueWriting(text);
      case 'Rephrase':
        return this.rephrase(text);
      case 'Make formal':
        return this.makeFormal(text);
      case 'Translate':
        return this.translateText(text);
      default:
        return text;
    }
  }

  /**
   * Continue writing
   */
  private async continueWriting(text: string): Promise<string> {
    // In production: Use MasterAIService
    return text + ' [AI-generated continuation...]';
  }

  /**
   * Rephrase text
   */
  private async rephrase(text: string): Promise<string> {
    return '[Rephrased version of: ' + text + ']';
  }

  /**
   * Make text formal
   */
  private async makeFormal(text: string): Promise<string> {
    return '[Formal version of: ' + text + ']';
  }

  /**
   * Translate text
   */
  private async translateText(text: string): Promise<string> {
    return '[Translation of: ' + text + ']';
  }

  /**
   * Check if keyboard is active
   */
  isKeyboardActive(): boolean {
    return this.isActive;
  }

  /**
   * Deactivate keyboard
   */
  deactivate(): void {
    this.isActive = false;
    console.log('[Keyboard Extension] Deactivated');
  }
}

export default KeyboardExtensionService.getInstance();

