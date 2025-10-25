/**
 * Meeting Agenda Service
 * Helps create professional meeting agendas and notes
 */

interface MeetingRequest {
  purpose: string;
  duration?: number; // minutes
  attendees?: string[];
  type?: 'standup' | 'planning' | 'review' | 'brainstorm' | 'general';
}

interface MeetingAgenda {
  title: string;
  date: string;
  duration: number;
  sections: {
    time: string;
    title: string;
    description: string;
    duration: number;
  }[];
  notes: string[];
}

class MeetingAgendaService {
  private static instance: MeetingAgendaService;

  private constructor() {
    console.log('[Meeting Agenda] Service initialized');
  }

  static getInstance(): MeetingAgendaService {
    if (!MeetingAgendaService.instance) {
      MeetingAgendaService.instance = new MeetingAgendaService();
    }
    return MeetingAgendaService.instance;
  }

  /**
   * Generate meeting agenda
   */
  async generateAgenda(request: MeetingRequest): Promise<MeetingAgenda> {
    const { purpose, duration = 60, type = 'general' } = request;

    console.log(`[Meeting Agenda] Creating ${duration}-min ${type} meeting: ${purpose}`);

    const agenda: MeetingAgenda = {
      title: `Meeting: ${purpose}`,
      date: new Date().toLocaleDateString(),
      duration,
      sections: [],
      notes: [],
    };

    // Generate sections based on meeting type
    if (type === 'standup') {
      agenda.sections = this.generateStandupAgenda(duration);
    } else if (type === 'planning') {
      agenda.sections = this.generatePlanningAgenda(duration, purpose);
    } else if (type === 'review') {
      agenda.sections = this.generateReviewAgenda(duration, purpose);
    } else {
      agenda.sections = this.generateGeneralAgenda(duration, purpose);
    }

    agenda.notes = this.getMeetingBestPractices();

    return agenda;
  }

  /**
   * Generate standup agenda
   */
  private generateStandupAgenda(duration: number) {
    return [
      {
        time: '0:00',
        title: 'What did you do yesterday?',
        description: 'Each person shares completed tasks',
        duration: duration * 0.4,
      },
      {
        time: `${Math.floor(duration * 0.4)}:00`,
        title: 'What will you do today?',
        description: 'Each person shares today\'s plan',
        duration: duration * 0.4,
      },
      {
        time: `${Math.floor(duration * 0.8)}:00`,
        title: 'Any blockers?',
        description: 'Discuss obstacles and needed help',
        duration: duration * 0.2,
      },
    ];
  }

  /**
   * Generate planning agenda
   */
  private generatePlanningAgenda(duration: number, purpose: string) {
    return [
      {
        time: '0:00',
        title: 'Welcome & Objectives',
        description: `Review goals for ${purpose}`,
        duration: duration * 0.1,
      },
      {
        time: `${Math.floor(duration * 0.1)}:00`,
        title: 'Current Status',
        description: 'Review where we are now',
        duration: duration * 0.2,
      },
      {
        time: `${Math.floor(duration * 0.3)}:00`,
        title: 'Planning Discussion',
        description: 'Discuss approach and timeline',
        duration: duration * 0.4,
      },
      {
        time: `${Math.floor(duration * 0.7)}:00`,
        title: 'Action Items',
        description: 'Assign tasks and set deadlines',
        duration: duration * 0.2,
      },
      {
        time: `${Math.floor(duration * 0.9)}:00`,
        title: 'Next Steps',
        description: 'Confirm follow-ups',
        duration: duration * 0.1,
      },
    ];
  }

  /**
   * Generate review agenda
   */
  private generateReviewAgenda(duration: number, purpose: string) {
    return [
      {
        time: '0:00',
        title: 'Introduction',
        description: `Overview of ${purpose} review`,
        duration: duration * 0.1,
      },
      {
        time: `${Math.floor(duration * 0.1)}:00`,
        title: 'What Went Well',
        description: 'Celebrate successes and wins',
        duration: duration * 0.3,
      },
      {
        time: `${Math.floor(duration * 0.4)}:00`,
        title: 'What Could Improve',
        description: 'Discuss challenges and lessons',
        duration: duration * 0.3,
      },
      {
        time: `${Math.floor(duration * 0.7)}:00`,
        title: 'Action Items',
        description: 'Improvements for next time',
        duration: duration * 0.2,
      },
      {
        time: `${Math.floor(duration * 0.9)}:00`,
        title: 'Closing',
        description: 'Wrap up and next steps',
        duration: duration * 0.1,
      },
    ];
  }

  /**
   * Generate general agenda
   */
  private generateGeneralAgenda(duration: number, purpose: string) {
    return [
      {
        time: '0:00',
        title: 'Welcome',
        description: 'Introductions and agenda overview',
        duration: duration * 0.1,
      },
      {
        time: `${Math.floor(duration * 0.1)}:00`,
        title: 'Discussion',
        description: `Main discussion about ${purpose}`,
        duration: duration * 0.7,
      },
      {
        time: `${Math.floor(duration * 0.8)}:00`,
        title: 'Action Items & Next Steps',
        description: 'Assign tasks and schedule follow-ups',
        duration: duration * 0.2,
      },
    ];
  }

  /**
   * Meeting best practices
   */
  private getMeetingBestPractices(): string[] {
    return [
      '✓ Start and end on time',
      '✓ Have a clear agenda',
      '✓ Assign a note-taker',
      '✓ Keep discussion focused',
      '✓ Ensure everyone participates',
      '✓ End with clear action items',
      '✓ Send follow-up summary',
    ];
  }

  /**
   * Format agenda
   */
  formatAgenda(agenda: MeetingAgenda): string {
    let text = `📅 ${agenda.title}\n\n`;
    text += `Date: ${agenda.date}\n`;
    text += `Duration: ${agenda.duration} minutes\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `**Agenda:**\n\n`;
    for (const section of agenda.sections) {
      text += `⏰ ${section.time} - ${section.title} (${section.duration} min)\n`;
      text += `   ${section.description}\n\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📝 Meeting Best Practices:\n${agenda.notes.join('\n')}\n`;

    return text;
  }
}

export default MeetingAgendaService.getInstance();
