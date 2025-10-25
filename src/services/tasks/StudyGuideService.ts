/**
 * Study Guide Service
 * Helps create study materials, flashcards, and learning aids
 */

interface StudyGuideRequest {
  subject: string;
  topics?: string[];
  format?: 'outline' | 'flashcards' | 'summary' | 'quiz';
}

interface StudyGuide {
  subject: string;
  format: string;
  content: any;
  studyTips: string[];
}

class StudyGuideService {
  private static instance: StudyGuideService;

  private constructor() {
    console.log('[Study Guide] Service initialized');
  }

  static getInstance(): StudyGuideService {
    if (!StudyGuideService.instance) {
      StudyGuideService.instance = new StudyGuideService();
    }
    return StudyGuideService.instance;
  }

  /**
   * Generate study guide
   */
  async generateGuide(request: StudyGuideRequest): Promise<StudyGuide> {
    const { subject, format = 'outline' } = request;

    console.log(`[Study Guide] Creating ${format} for: ${subject}`);

    let content: any;

    switch (format) {
      case 'flashcards':
        content = this.generateFlashcards(subject);
        break;
      case 'summary':
        content = this.generateSummary(subject);
        break;
      case 'quiz':
        content = this.generateQuiz(subject);
        break;
      default:
        content = this.generateOutline(subject);
    }

    return {
      subject,
      format,
      content,
      studyTips: this.getStudyTips(),
    };
  }

  /**
   * Generate outline
   */
  private generateOutline(subject: string) {
    return {
      title: `Study Guide: ${subject}`,
      sections: [
        {
          title: 'Key Concepts',
          points: [
            `• Core concept 1 of ${subject}`,
            `• Core concept 2`,
            `• Core concept 3`,
          ],
        },
        {
          title: 'Important Terms',
          points: [
            '• Term 1: Definition',
            '• Term 2: Definition',
            '• Term 3: Definition',
          ],
        },
        {
          title: 'Key Examples',
          points: [
            `• Example 1 related to ${subject}`,
            '• Example 2',
            '• Example 3',
          ],
        },
      ],
    };
  }

  /**
   * Generate flashcards
   */
  private generateFlashcards(subject: string) {
    return {
      cards: [
        {
          front: `What is ${subject}?`,
          back: `${subject} is [definition]`,
        },
        {
          front: `Key components of ${subject}?`,
          back: '1. Component A\n2. Component B\n3. Component C',
        },
        {
          front: `Why is ${subject} important?`,
          back: `${subject} is important because [reasons]`,
        },
        {
          front: `Common applications of ${subject}?`,
          back: '• Application 1\n• Application 2\n• Application 3',
        },
      ],
    };
  }

  /**
   * Generate summary
   */
  private generateSummary(subject: string) {
    return {
      overview: `${subject} encompasses several key areas...`,
      keyPoints: [
        `Main point 1 about ${subject}`,
        'Main point 2',
        'Main point 3',
      ],
      takeaways: [
        `${subject} is fundamental because...`,
        'Remember to focus on...',
        'Apply this by...',
      ],
    };
  }

  /**
   * Generate quiz
   */
  private generateQuiz(subject: string) {
    return {
      questions: [
        {
          number: 1,
          question: `What is the definition of ${subject}?`,
          type: 'multiple-choice',
          options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
          answer: 'C',
        },
        {
          number: 2,
          question: `Explain the importance of ${subject}.`,
          type: 'short-answer',
        },
        {
          number: 3,
          question: `True or False: ${subject} is widely used.`,
          type: 'true-false',
          answer: 'True',
        },
      ],
    };
  }

  /**
   * Get study tips
   */
  private getStudyTips(): string[] {
    return [
      '✓ Study in 25-minute focused sessions (Pomodoro)',
      '✓ Test yourself frequently',
      '✓ Teach the material to someone else',
      '✓ Take breaks every hour',
      '✓ Review material before bed',
      '✓ Use active recall, not passive reading',
    ];
  }

  /**
   * Format study guide
   */
  formatGuide(guide: StudyGuide): string {
    let text = `📚 Study Guide: ${guide.subject}\n\n`;
    text += `Format: ${guide.format.charAt(0).toUpperCase() + guide.format.slice(1)}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (guide.format === 'flashcards') {
      text += `**Flashcards:**\n\n`;
      for (let i = 0; i < guide.content.cards.length; i++) {
        const card = guide.content.cards[i];
        text += `Card ${i + 1}:\n`;
        text += `❓ Front: ${card.front}\n`;
        text += `✅ Back: ${card.back}\n\n`;
      }
    } else if (guide.format === 'quiz') {
      text += `**Quiz:**\n\n`;
      for (const q of guide.content.questions) {
        text += `${q.number}. ${q.question}\n`;
        if (q.options) {
          text += q.options.join('\n') + '\n';
        }
        text += `\n`;
      }
    } else {
      text += JSON.stringify(guide.content, null, 2);
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📝 Study Tips:\n${guide.studyTips.join('\n')}\n`;

    return text;
  }
}

export default StudyGuideService.getInstance();
