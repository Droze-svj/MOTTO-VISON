/**
 * Assignment Helper Service
 * Comprehensive help for any type of assignment
 */

interface AssignmentRequest {
  type: string;
  subject?: string;
  dueDate?: Date;
  pages?: number;
  instructions?: string;
}

interface AssignmentGuide {
  type: string;
  outline: {
    title: string;
    sections: string[];
    tips: string[];
  };
  timeline: {
    phase: string;
    tasks: string[];
    duration: string;
  }[];
  resources: string[];
  checklist: string[];
}

class AssignmentHelperService {
  private static instance: AssignmentHelperService;

  private constructor() {
    console.log('[Assignment Helper] Service initialized');
  }

  static getInstance(): AssignmentHelperService {
    if (!AssignmentHelperService.instance) {
      AssignmentHelperService.instance = new AssignmentHelperService();
    }
    return AssignmentHelperService.instance;
  }

  /**
   * Generate complete assignment guide
   */
  async generateGuide(request: AssignmentRequest): Promise<AssignmentGuide> {
    const { type, subject = 'General' } = request;

    console.log(`[Assignment Helper] Creating guide for: ${type} (${subject})`);

    const assignmentType = this.detectAssignmentType(type);
    
    return {
      type: assignmentType,
      outline: this.generateOutline(assignmentType, subject),
      timeline: this.generateTimeline(assignmentType),
      resources: this.getResources(assignmentType, subject),
      checklist: this.getChecklist(assignmentType),
    };
  }

  /**
   * Detect specific assignment type
   */
  private detectAssignmentType(type: string): string {
    const lower = type.toLowerCase();

    if (lower.includes('research') || lower.includes('paper')) return 'Research Paper';
    if (lower.includes('lab') || lower.includes('experiment')) return 'Lab Report';
    if (lower.includes('case study')) return 'Case Study';
    if (lower.includes('book report') || lower.includes('book review')) return 'Book Report';
    if (lower.includes('analysis') || lower.includes('analytical')) return 'Analysis Essay';
    if (lower.includes('compare') || lower.includes('contrast')) return 'Compare/Contrast Essay';
    if (lower.includes('literature review')) return 'Literature Review';
    if (lower.includes('annotated bibliography')) return 'Annotated Bibliography';
    if (lower.includes('project')) return 'Project';
    if (lower.includes('presentation')) return 'Presentation Assignment';

    return 'General Assignment';
  }

  /**
   * Generate assignment outline
   */
  private generateOutline(type: string, subject: string): AssignmentGuide['outline'] {
    const outlines = {
      'Research Paper': {
        title: `Research Paper: ${subject}`,
        sections: [
          '1. Title Page',
          '2. Abstract (150-250 words)',
          '3. Introduction',
          '   • Hook/attention grabber',
          '   • Background information',
          '   • Thesis statement',
          '4. Literature Review',
          '   • Previous research',
          '   • Current understanding',
          '   • Research gap',
          '5. Methodology (if applicable)',
          '   • Research approach',
          '   • Data collection',
          '   • Analysis methods',
          '6. Results/Findings',
          '   • Main discoveries',
          '   • Data presentation',
          '   • Analysis',
          '7. Discussion',
          '   • Interpretation',
          '   • Implications',
          '   • Limitations',
          '8. Conclusion',
          '   • Summary of findings',
          '   • Future research',
          '9. References (APA/MLA/Chicago)',
          '10. Appendices (if needed)',
        ],
        tips: [
          '✓ Start with a strong thesis',
          '✓ Use credible sources (5-10 minimum)',
          '✓ Cite everything properly',
          '✓ Proofread multiple times',
          '✓ Follow formatting guidelines',
        ],
      },
      'Lab Report': {
        title: `Lab Report: ${subject}`,
        sections: [
          '1. Title',
          '2. Abstract',
          '3. Introduction',
          '   • Background theory',
          '   • Purpose/objective',
          '   • Hypothesis',
          '4. Materials & Methods',
          '   • Equipment list',
          '   • Procedure steps',
          '   • Safety notes',
          '5. Results',
          '   • Data tables',
          '   • Graphs/charts',
          '   • Observations',
          '6. Discussion',
          '   • Analysis of results',
          '   • Compare to hypothesis',
          '   • Sources of error',
          '7. Conclusion',
          '   • Summary',
          '   • Hypothesis verdict',
          '8. References',
        ],
        tips: [
          '✓ Use past tense for methods',
          '✓ Be precise with measurements',
          '✓ Label all figures/tables',
          '✓ Explain unexpected results',
          '✓ Include raw data in appendix',
        ],
      },
      'Case Study': {
        title: `Case Study: ${subject}`,
        sections: [
          '1. Executive Summary',
          '2. Introduction',
          '   • Background',
          '   • Context',
          '   • Purpose',
          '3. Case Description',
          '   • Key facts',
          '   • Timeline',
          '   • Stakeholders',
          '4. Problem Statement',
          '   • Main issues',
          '   • Challenges',
          '5. Analysis',
          '   • Apply theories',
          '   • Examine causes',
          '   • Consider alternatives',
          '6. Solutions/Recommendations',
          '   • Proposed actions',
          '   • Justification',
          '   • Implementation plan',
          '7. Conclusion',
          '8. References',
        ],
        tips: [
          '✓ Be objective and analytical',
          '✓ Use real data/evidence',
          '✓ Consider multiple perspectives',
          '✓ Provide actionable recommendations',
          '✓ Follow case study format',
        ],
      },
      'Book Report': {
        title: `Book Report: ${subject}`,
        sections: [
          '1. Introduction',
          '   • Book title, author, publication',
          '   • Genre',
          '   • Brief overview',
          '2. Summary',
          '   • Main plot/content',
          '   • Key characters/concepts',
          '   • Setting (if fiction)',
          '3. Themes',
          '   • Major themes',
          '   • Messages',
          '   • Symbolism',
          '4. Analysis',
          '   • Writing style',
          '   • Strengths',
          '   • Weaknesses',
          '5. Personal Reaction',
          '   • Your thoughts',
          '   • Impact on you',
          '   • Recommendations',
          '6. Conclusion',
          '   • Final thoughts',
          '   • Overall rating',
        ],
        tips: [
          '✓ Don\'t just summarize - analyze',
          '✓ Support opinions with examples',
          '✓ Avoid spoilers (or warn first)',
          '✓ Be honest but respectful',
          '✓ Compare to similar works',
        ],
      },
      'General Assignment': {
        title: `Assignment: ${subject}`,
        sections: [
          '1. Introduction',
          '   • Topic introduction',
          '   • Purpose/objective',
          '   • Thesis/main idea',
          '2. Body',
          '   • Main point 1',
          '   • Main point 2',
          '   • Main point 3',
          '   • Supporting evidence',
          '3. Analysis/Discussion',
          '   • Interpretation',
          '   • Critical thinking',
          '   • Connections',
          '4. Conclusion',
          '   • Summary',
          '   • Final thoughts',
          '5. References (if required)',
        ],
        tips: [
          '✓ Read instructions carefully',
          '✓ Follow rubric/guidelines',
          '✓ Start early',
          '✓ Revise and edit',
          '✓ Check formatting',
        ],
      },
    };

    return outlines[type] || outlines['General Assignment'];
  }

  /**
   * Generate work timeline
   */
  private generateTimeline(type: string): AssignmentGuide['timeline'] {
    const timelines = {
      'Research Paper': [
        {
          phase: 'Research & Planning (Days 1-3)',
          tasks: [
            'Choose/refine topic',
            'Find and read 5-10 sources',
            'Take detailed notes',
            'Create outline',
          ],
          duration: '3 days',
        },
        {
          phase: 'First Draft (Days 4-6)',
          tasks: [
            'Write introduction',
            'Complete body paragraphs',
            'Write conclusion',
            'Add in-text citations',
          ],
          duration: '3 days',
        },
        {
          phase: 'Revision (Days 7-8)',
          tasks: [
            'Review for clarity',
            'Strengthen arguments',
            'Check organization',
            'Improve transitions',
          ],
          duration: '2 days',
        },
        {
          phase: 'Final Polish (Days 9-10)',
          tasks: [
            'Proofread carefully',
            'Format references',
            'Check citations',
            'Final read-through',
          ],
          duration: '2 days',
        },
      ],
      'Lab Report': [
        {
          phase: 'During Lab',
          tasks: [
            'Take detailed notes',
            'Record all measurements',
            'Note observations',
            'Save data carefully',
          ],
          duration: 'Lab session',
        },
        {
          phase: 'Analysis (Day 1-2)',
          tasks: [
            'Organize data',
            'Create graphs/tables',
            'Calculate results',
            'Identify patterns',
          ],
          duration: '2 days',
        },
        {
          phase: 'Writing (Day 3-4)',
          tasks: [
            'Write methods',
            'Present results',
            'Discuss findings',
            'Draw conclusions',
          ],
          duration: '2 days',
        },
        {
          phase: 'Finalize (Day 5)',
          tasks: [
            'Format properly',
            'Check calculations',
            'Proofread',
            'Submit on time',
          ],
          duration: '1 day',
        },
      ],
      'General Assignment': [
        {
          phase: 'Preparation (20% of time)',
          tasks: [
            'Understand requirements',
            'Research topic',
            'Create outline',
            'Gather materials',
          ],
          duration: '20% of time',
        },
        {
          phase: 'Creation (50% of time)',
          tasks: [
            'Complete first draft',
            'Develop main ideas',
            'Add supporting details',
            'Follow structure',
          ],
          duration: '50% of time',
        },
        {
          phase: 'Refinement (30% of time)',
          tasks: [
            'Revise content',
            'Edit for clarity',
            'Proofread',
            'Final check',
          ],
          duration: '30% of time',
        },
      ],
    };

    return timelines[type] || timelines['General Assignment'];
  }

  /**
   * Get helpful resources
   */
  private getResources(type: string, subject: string): string[] {
    const baseResources = [
      '📚 Your textbook and class notes',
      '🔍 Google Scholar for academic sources',
      '📖 Library databases (JSTOR, PubMed, etc.)',
      '✍️ Grammarly or Hemingway Editor',
      '📝 Citation tools (Zotero, Mendeley)',
    ];

    const specificResources = {
      'Research Paper': [
        '📊 Data sources (if needed)',
        '📄 Academic journals',
        '🎓 Professor office hours',
        '📚 Writing center',
      ],
      'Lab Report': [
        '🧪 Lab manual',
        '📊 Excel/graphing software',
        '🔬 Lab partner notes',
        '👨‍🔬 TA assistance',
      ],
    };

    return [...baseResources, ...(specificResources[type] || [])];
  }

  /**
   * Get submission checklist
   */
  private getChecklist(type: string): string[] {
    return [
      '☑️ All requirements met',
      '☑️ Proper formatting (font, spacing, margins)',
      '☑️ Citations & references complete',
      '☑️ Spell-checked and proofread',
      '☑️ Name, date, course on assignment',
      '☑️ Page numbers (if required)',
      '☑️ File named correctly',
      '☑️ Submitted on time',
      '☑️ Confirmation received',
      '☑️ Backup copy saved',
    ];
  }

  /**
   * Format assignment guide
   */
  formatGuide(guide: AssignmentGuide): string {
    let text = `📚 Assignment Guide: ${guide.type}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Outline
    text += `## ${guide.outline.title}\n\n`;
    text += `**Structure:**\n\n`;
    for (const section of guide.outline.sections) {
      text += `${section}\n`;
    }
    text += `\n**Tips:**\n${guide.outline.tips.join('\n')}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Timeline
    text += `⏱️ **Work Timeline:**\n\n`;
    for (const phase of guide.timeline) {
      text += `**${phase.phase}**\n`;
      for (const task of phase.tasks) {
        text += `• ${task}\n`;
      }
      text += `\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Resources
    text += `📖 **Helpful Resources:**\n${guide.resources.join('\n')}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Checklist
    text += `✅ **Before Submitting:**\n${guide.checklist.join('\n')}\n`;

    return text;
  }

  /**
   * Quick assignment tips
   */
  getQuickTips(assignmentType: string): string[] {
    return [
      '🎯 Start early - don\'t procrastinate',
      '📋 Read ALL instructions carefully',
      '🗓️ Break into smaller tasks',
      '📚 Use quality sources',
      '✍️ Write multiple drafts',
      '🔍 Proofread thoroughly',
      '💾 Save work frequently',
      '🤝 Ask for help when needed',
      '📧 Email questions to professor',
      '⏰ Submit before deadline',
    ];
  }
}

export default AssignmentHelperService.getInstance();
