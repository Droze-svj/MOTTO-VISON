/**
 * Homework Assistant Service
 * Helps with daily homework across all subjects
 */

interface HomeworkRequest {
  subject: string;
  problemType?: string;
  question?: string;
  level?: 'elementary' | 'middle' | 'high' | 'college';
}

interface HomeworkHelp {
  subject: string;
  approach: string;
  steps: string[];
  tips: string[];
  resources: string[];
}

class HomeworkAssistantService {
  private static instance: HomeworkAssistantService;

  private constructor() {
    console.log('[Homework Assistant] Service initialized');
  }

  static getInstance(): HomeworkAssistantService {
    if (!HomeworkAssistantService.instance) {
      HomeworkAssistantService.instance = new HomeworkAssistantService();
    }
    return HomeworkAssistantService.instance;
  }

  /**
   * Get homework help
   */
  async getHelp(request: HomeworkRequest): Promise<HomeworkHelp> {
    const { subject, level = 'high' } = request;

    console.log(`[Homework Assistant] Helping with: ${subject} (${level})`);

    return {
      subject,
      approach: this.getApproach(subject),
      steps: this.getSteps(subject),
      tips: this.getTips(subject),
      resources: this.getResources(subject, level),
    };
  }

  /**
   * Get subject-specific approach
   */
  private getApproach(subject: string): string {
    const approaches = {
      math: 'Break down the problem step-by-step. Identify what you know, what you need to find, and which formulas or methods apply.',
      science: 'Start with the scientific method: observe, hypothesize, experiment (if applicable), analyze, conclude. Connect to real-world examples.',
      english: 'Read carefully, annotate text, identify themes and literary devices. Always support your analysis with evidence from the text.',
      history: 'Create a timeline, identify cause and effect, connect events to broader themes. Consider multiple perspectives.',
      foreign_language: 'Practice regularly, immerse yourself in the language, use flashcards, speak out loud, make mistakes and learn.',
      general: 'Read the question carefully, organize your thoughts, work methodically, check your work, and don\'t be afraid to ask for clarification.',
    };

    const key = subject.toLowerCase();
    if (key.includes('math') || key.includes('algebra') || key.includes('calculus')) return approaches.math;
    if (key.includes('science') || key.includes('biology') || key.includes('chemistry') || key.includes('physics')) return approaches.science;
    if (key.includes('english') || key.includes('literature') || key.includes('writing')) return approaches.english;
    if (key.includes('history') || key.includes('social')) return approaches.history;
    if (key.includes('spanish') || key.includes('french') || key.includes('language')) return approaches.foreign_language;

    return approaches.general;
  }

  /**
   * Get problem-solving steps
   */
  private getSteps(subject: string): string[] {
    const key = subject.toLowerCase();

    if (key.includes('math')) {
      return [
        '1. Read the problem carefully',
        '2. Identify what you\'re solving for',
        '3. List known information',
        '4. Choose appropriate method/formula',
        '5. Show your work step-by-step',
        '6. Check your answer makes sense',
        '7. Verify with different method if possible',
      ];
    }

    if (key.includes('science')) {
      return [
        '1. Understand the concept/theory',
        '2. Identify key variables',
        '3. Apply scientific principles',
        '4. Make predictions',
        '5. Analyze results',
        '6. Draw conclusions',
        '7. Relate to real-world examples',
      ];
    }

    if (key.includes('english') || key.includes('writing')) {
      return [
        '1. Read assignment instructions',
        '2. Understand the prompt/question',
        '3. Brainstorm ideas',
        '4. Create an outline',
        '5. Write thesis statement',
        '6. Develop paragraphs',
        '7. Revise and edit',
      ];
    }

    // General steps
    return [
      '1. Read instructions carefully',
      '2. Understand what\'s being asked',
      '3. Gather necessary materials',
      '4. Work through systematically',
      '5. Double-check your work',
      '6. Ask for help if stuck',
      '7. Learn from mistakes',
    ];
  }

  /**
   * Get subject-specific tips
   */
  private getTips(subject: string): string[] {
    const key = subject.toLowerCase();

    const tips = {
      math: [
        '💡 Draw diagrams when helpful',
        '💡 Keep work organized',
        '💡 Check units and labels',
        '💡 Practice similar problems',
        '💡 Learn from mistakes',
      ],
      science: [
        '💡 Make connections to daily life',
        '💡 Draw/label diagrams',
        '💡 Memorize key formulas',
        '💡 Watch educational videos',
        '💡 Do practice problems',
      ],
      english: [
        '💡 Read actively (annotate)',
        '💡 Use evidence from text',
        '💡 Vary sentence structure',
        '💡 Read answer out loud',
        '💡 Have someone proofread',
      ],
      general: [
        '💡 Start with easier questions',
        '💡 Take breaks when frustrated',
        '💡 Use online resources wisely',
        '💡 Study with classmates',
        '💡 Keep track of what works',
      ],
    };

    if (key.includes('math')) return tips.math;
    if (key.includes('science')) return tips.science;
    if (key.includes('english') || key.includes('writing')) return tips.english;

    return tips.general;
  }

  /**
   * Get helpful resources
   */
  private getResources(subject: string, level: string): string[] {
    const key = subject.toLowerCase();

    const mathResources = [
      '📱 Khan Academy (free video lessons)',
      '📊 Wolfram Alpha (problem solver)',
      '✏️ Practice worksheets online',
      '📖 Textbook examples',
      '👥 Study groups',
    ];

    const scienceResources = [
      '🔬 Khan Academy Science',
      '📺 Crash Course (YouTube)',
      '🧪 Virtual labs',
      '📚 Science textbook',
      '👨‍🏫 Teacher office hours',
    ];

    const englishResources = [
      '📖 SparkNotes/CliffsNotes',
      '✍️ Purdue OWL (writing guide)',
      '📚 Your class notes',
      '🔤 Vocabulary.com',
      '📝 Writing center',
    ];

    if (key.includes('math')) return mathResources;
    if (key.includes('science')) return scienceResources;
    if (key.includes('english')) return englishResources;

    return [
      '📚 Course materials',
      '🔍 Google Scholar',
      '👥 Study group',
      '👨‍🏫 Ask teacher',
      '💻 Educational websites',
    ];
  }

  /**
   * Format homework help
   */
  formatHelp(help: HomeworkHelp): string {
    let text = `📚 Homework Help: ${help.subject}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `**Approach:**\n${help.approach}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `**Steps to Follow:**\n${help.steps.join('\n')}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `**Tips:**\n${help.tips.join('\n')}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `**Resources:**\n${help.resources.join('\n')}\n`;

    return text;
  }

  /**
   * Study strategies
   */
  getStudyStrategies(): string[] {
    return [
      '⏰ Create a homework schedule',
      '🎯 Tackle hardest subjects first',
      '📍 Find a quiet study space',
      '📴 Minimize distractions',
      '⏱️ Use Pomodoro technique (25 min work, 5 min break)',
      '📝 Take good notes in class',
      '❓ Ask questions early',
      '🔄 Review regularly, not just before tests',
      '👥 Form study groups',
      '🎉 Reward yourself for progress',
    ];
  }
}

export default HomeworkAssistantService.getInstance();
