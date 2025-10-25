/**
 * Clarification Service
 * Asks intelligent follow-up questions to better understand user needs
 */

interface ClarificationContext {
  originalRequest: string;
  missingInfo: string[];
  suggestions: string[];
  intelligentQuestions: string[];
}

class ClarificationService {
  private static instance: ClarificationService;

  private constructor() {
    console.log('[Clarification] Service initialized');
  }

  static getInstance(): ClarificationService {
    if (!ClarificationService.instance) {
      ClarificationService.instance = new ClarificationService();
    }
    return ClarificationService.instance;
  }

  /**
   * Generate clarifying questions intelligently
   */
  async generateQuestions(userInput: string, detectedTaskType?: string): Promise<ClarificationContext> {
    const missingInfo = this.identifyMissingInfo(userInput, detectedTaskType);
    const suggestions = this.generateSuggestions(userInput, detectedTaskType);
    const intelligentQuestions = this.craftIntelligentQuestions(userInput, detectedTaskType, missingInfo);

    return {
      originalRequest: userInput,
      missingInfo,
      suggestions,
      intelligentQuestions,
    };
  }

  /**
   * Identify what information is missing
   */
  private identifyMissingInfo(input: string, taskType?: string): string[] {
    const missing: string[] = [];
    const lower = input.toLowerCase();

    // Task-specific missing info
    if (taskType === 'assignment' || taskType === 'essay') {
      if (!lower.match(/page|word|length/)) missing.push('Length requirements');
      if (!lower.match(/due|deadline/)) missing.push('Deadline');
      if (!lower.match(/format|style|apa|mla/)) missing.push('Format/Citation style');
    }

    if (taskType === 'presentation') {
      if (!lower.match(/slide|page/)) missing.push('Number of slides');
      if (!lower.match(/minute|time|duration/)) missing.push('Presentation duration');
      if (!lower.match(/audience|for|who/)) missing.push('Target audience');
    }

    if (taskType === 'code') {
      if (!lower.match(/language|framework|react|python|javascript/)) missing.push('Programming language');
      if (!lower.match(/feature|function|component/)) missing.push('Specific functionality');
    }

    if (taskType === 'homework') {
      if (!lower.match(/subject|math|science|history/)) missing.push('Subject');
      if (!lower.match(/grade|level|year/)) missing.push('Grade level');
    }

    // General missing info
    if (input.length < 30 && !lower.match(/about|regarding|for/)) {
      missing.push('Context or topic');
    }

    return missing;
  }

  /**
   * Generate helpful suggestions
   */
  private generateSuggestions(input: string, taskType?: string): string[] {
    const suggestions: string[] = [];

    // Task-specific suggestions
    const taskSuggestions = {
      'assignment': [
        'Specify the type (research paper, essay, report)',
        'Include page/word count',
        'Mention deadline if applicable',
      ],
      'code': [
        'Mention programming language',
        'Describe desired functionality',
        'Note any constraints or requirements',
      ],
      'presentation': [
        'State number of slides needed',
        'Describe your audience',
        'Mention key points to cover',
      ],
      'homework': [
        'Specify the subject',
        'Mention grade level',
        'Describe the specific problem',
      ],
    };

    if (taskType && taskSuggestions[taskType]) {
      suggestions.push(...taskSuggestions[taskType]);
    } else {
      suggestions.push(
        'Provide more context about your goal',
        'Mention any constraints or requirements',
        'Include relevant deadlines'
      );
    }

    return suggestions;
  }

  /**
   * Craft intelligent, natural questions
   */
  private craftIntelligentQuestions(
    input: string,
    taskType?: string,
    missingInfo: string[]
  ): string[] {
    const questions: string[] = [];

    // Context-aware questions
    if (missingInfo.includes('Length requirements')) {
      questions.push('How long should this be? (pages/words/slides)');
    }

    if (missingInfo.includes('Deadline')) {
      questions.push('When do you need this by?');
    }

    if (missingInfo.includes('Target audience')) {
      questions.push('Who is your audience? (students, professionals, general public?)');
    }

    if (missingInfo.includes('Programming language')) {
      questions.push('What programming language should I use?');
    }

    if (missingInfo.includes('Subject')) {
      questions.push('What subject is this for?');
    }

    if (missingInfo.includes('Context or topic')) {
      questions.push('Can you tell me more about what you\'re trying to achieve?');
    }

    // Add helpful follow-ups
    if (questions.length > 0 && input.length < 50) {
      questions.push('What\'s the main goal or purpose?');
    }

    return questions.slice(0, 4); // Max 4 questions
  }

  /**
   * Check if input needs clarification
   */
  needsClarification(userInput: string, detectedTaskType?: string): boolean {
    // Very short inputs likely need clarification
    if (userInput.length < 20) return true;

    // Vague keywords
    const vague = ['something', 'anything', 'stuff', 'things', 'it', 'this', 'that'];
    const words = userInput.toLowerCase().split(/\s+/);
    if (vague.some(v => words.includes(v)) && words.length < 10) return true;

    // Missing critical info for specific tasks
    const missingInfo = this.identifyMissingInfo(userInput, detectedTaskType);
    if (missingInfo.length >= 3) return true;

    return false;
  }

  /**
   * Format clarification response
   */
  formatClarification(context: ClarificationContext): string {
    let text = `I'd love to help with that! To give you the best assistance, I need a bit more information:\n\n`;
    
    if (context.intelligentQuestions.length > 0) {
      text += `**Questions:**\n`;
      context.intelligentQuestions.forEach((q, i) => {
        text += `${i + 1}. ${q}\n`;
      });
      text += `\n`;
    }

    if (context.suggestions.length > 0) {
      text += `**💡 Helpful to include:**\n`;
      context.suggestions.forEach(s => {
        text += `• ${s}\n`;
      });
      text += `\n`;
    }

    text += `Feel free to share any additional details, and I'll create exactly what you need! 😊`;

    return text;
  }
}

export default ClarificationService.getInstance();
