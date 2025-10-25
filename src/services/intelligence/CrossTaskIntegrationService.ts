/**
 * Cross-Task Integration Service
 * Intelligently connects different tasks and uses insights across them
 */

interface TaskRelationship {
  taskA: string;
  taskB: string;
  relationship: 'prerequisite' | 'complement' | 'alternative' | 'followup';
  suggestion: string;
}

interface IntegratedWorkflow {
  mainTask: string;
  relatedTasks: string[];
  workflow: {
    step: number;
    task: string;
    description: string;
    optional: boolean;
  }[];
  benefits: string[];
}

class CrossTaskIntegrationService {
  private static instance: CrossTaskIntegrationService;

  // Define task relationships
  private taskRelationships: TaskRelationship[] = [
    {
      taskA: 'research',
      taskB: 'essay',
      relationship: 'prerequisite',
      suggestion: 'Research first to gather information for your essay',
    },
    {
      taskA: 'outline',
      taskB: 'presentation',
      relationship: 'prerequisite',
      suggestion: 'Create an outline before building your presentation',
    },
    {
      taskA: 'brainstorm',
      taskB: 'writing',
      relationship: 'prerequisite',
      suggestion: 'Brainstorm ideas before you start writing',
    },
    {
      taskA: 'code',
      taskB: 'documentation',
      relationship: 'complement',
      suggestion: 'Document your code for better maintainability',
    },
    {
      taskA: 'essay',
      taskB: 'presentation',
      relationship: 'alternative',
      suggestion: 'Consider turning your essay into a presentation',
    },
    {
      taskA: 'meeting',
      taskB: 'email',
      relationship: 'followup',
      suggestion: 'Send follow-up email after meeting with action items',
    },
    {
      taskA: 'resume',
      taskB: 'cover-letter',
      relationship: 'complement',
      suggestion: 'Pair your resume with a tailored cover letter',
    },
    {
      taskA: 'study',
      taskB: 'quiz',
      relationship: 'followup',
      suggestion: 'Test yourself with a quiz after studying',
    },
  ];

  private constructor() {
    console.log('[Cross-Task Integration] Service initialized');
  }

  static getInstance(): CrossTaskIntegrationService {
    if (!CrossTaskIntegrationService.instance) {
      CrossTaskIntegrationService.instance = new CrossTaskIntegrationService();
    }
    return CrossTaskIntegrationService.instance;
  }

  /**
   * Suggest related tasks
   */
  async suggestRelatedTasks(currentTask: string): Promise<string[]> {
    const suggestions: string[] = [];

    for (const rel of this.taskRelationships) {
      if (currentTask.toLowerCase().includes(rel.taskA)) {
        suggestions.push(`${rel.taskB}: ${rel.suggestion}`);
      }
    }

    return suggestions;
  }

  /**
   * Create integrated workflow for complex goals
   */
  async createWorkflow(goal: string): Promise<IntegratedWorkflow> {
    console.log(`[Cross-Task] Creating workflow for: ${goal}`);

    const lower = goal.toLowerCase();
    
    // Detect what kind of complex goal
    if (lower.includes('project') || lower.includes('major assignment')) {
      return this.createProjectWorkflow(goal);
    }

    if (lower.includes('job') || lower.includes('career')) {
      return this.createJobSearchWorkflow(goal);
    }

    if (lower.includes('learn') || lower.includes('master')) {
      return this.createLearningWorkflow(goal);
    }

    // Default comprehensive workflow
    return this.createGeneralWorkflow(goal);
  }

  /**
   * Project workflow
   */
  private createProjectWorkflow(goal: string): IntegratedWorkflow {
    return {
      mainTask: goal,
      relatedTasks: ['research', 'planning', 'execution', 'presentation'],
      workflow: [
        {
          step: 1,
          task: 'brainstorm',
          description: 'Generate and explore ideas',
          optional: false,
        },
        {
          step: 2,
          task: 'research',
          description: 'Gather information and resources',
          optional: false,
        },
        {
          step: 3,
          task: 'planning',
          description: 'Create detailed project plan',
          optional: false,
        },
        {
          step: 4,
          task: 'execution',
          description: 'Work on the main deliverable',
          optional: false,
        },
        {
          step: 5,
          task: 'review',
          description: 'Get feedback and revise',
          optional: true,
        },
        {
          step: 6,
          task: 'presentation',
          description: 'Create slides to present your work',
          optional: true,
        },
        {
          step: 7,
          task: 'documentation',
          description: 'Write final report or documentation',
          optional: false,
        },
      ],
      benefits: [
        'Systematic approach ensures nothing is missed',
        'Each step builds on previous work',
        'Clear milestones for tracking progress',
        'Professional-quality output',
      ],
    };
  }

  /**
   * Job search workflow
   */
  private createJobSearchWorkflow(goal: string): IntegratedWorkflow {
    return {
      mainTask: goal,
      relatedTasks: ['resume', 'cover-letter', 'interview-prep', 'email'],
      workflow: [
        {
          step: 1,
          task: 'resume',
          description: 'Build or update your resume',
          optional: false,
        },
        {
          step: 2,
          task: 'cover-letter',
          description: 'Write tailored cover letter',
          optional: false,
        },
        {
          step: 3,
          task: 'job-search',
          description: 'Find and apply to positions',
          optional: false,
        },
        {
          step: 4,
          task: 'email',
          description: 'Send professional follow-up emails',
          optional: true,
        },
        {
          step: 5,
          task: 'interview-prep',
          description: 'Prepare for interviews',
          optional: false,
        },
      ],
      benefits: [
        'Complete job search strategy',
        'Professional materials ready',
        'Stand out from other candidates',
        'Organized approach reduces stress',
      ],
    };
  }

  /**
   * Learning workflow
   */
  private createLearningWorkflow(goal: string): IntegratedWorkflow {
    return {
      mainTask: goal,
      relatedTasks: ['study', 'practice', 'test', 'review'],
      workflow: [
        {
          step: 1,
          task: 'study-guide',
          description: 'Create comprehensive study materials',
          optional: false,
        },
        {
          step: 2,
          task: 'flashcards',
          description: 'Make flashcards for key concepts',
          optional: true,
        },
        {
          step: 3,
          task: 'practice',
          description: 'Work through practice problems',
          optional: false,
        },
        {
          step: 4,
          task: 'quiz',
          description: 'Test yourself with quiz questions',
          optional: false,
        },
        {
          step: 5,
          task: 'review',
          description: 'Review mistakes and reinforce learning',
          optional: false,
        },
      ],
      benefits: [
        'Systematic learning approach',
        'Active recall improves retention',
        'Self-testing identifies weak areas',
        'Better long-term understanding',
      ],
    };
  }

  /**
   * General workflow
   */
  private createGeneralWorkflow(goal: string): IntegratedWorkflow {
    return {
      mainTask: goal,
      relatedTasks: ['planning', 'execution', 'review'],
      workflow: [
        {
          step: 1,
          task: 'define',
          description: 'Clearly define what you want to achieve',
          optional: false,
        },
        {
          step: 2,
          task: 'plan',
          description: 'Create action plan with steps',
          optional: false,
        },
        {
          step: 3,
          task: 'execute',
          description: 'Work through your plan',
          optional: false,
        },
        {
          step: 4,
          task: 'review',
          description: 'Check quality and make improvements',
          optional: false,
        },
      ],
      benefits: [
        'Clear path from start to finish',
        'Organized approach',
        'Higher success rate',
        'Less overwhelm',
      ],
    };
  }

  /**
   * Suggest next task based on what user just completed
   */
  async suggestNextTask(completedTask: string, userId: string): Promise<string[]> {
    const suggestions: string[] = [];

    // Find relationships where completedTask is taskA
    for (const rel of this.taskRelationships) {
      if (completedTask.toLowerCase().includes(rel.taskA)) {
        if (rel.relationship === 'followup' || rel.relationship === 'complement') {
          suggestions.push(`Consider: ${rel.suggestion}`);
        }
      }
    }

    return suggestions;
  }

  /**
   * Find prerequisites for a task
   */
  async findPrerequisites(task: string): Promise<string[]> {
    const prerequisites: string[] = [];

    for (const rel of this.taskRelationships) {
      if (task.toLowerCase().includes(rel.taskB) && rel.relationship === 'prerequisite') {
        prerequisites.push(rel.suggestion);
      }
    }

    return prerequisites;
  }

  /**
   * Format workflow
   */
  formatWorkflow(workflow: IntegratedWorkflow): string {
    let text = `🎯 Integrated Workflow: ${workflow.mainTask}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `**Complete Process:**\n\n`;
    for (const step of workflow.workflow) {
      const optional = step.optional ? ' (Optional)' : '';
      text += `**Step ${step.step}: ${step.task}**${optional}\n`;
      text += `${step.description}\n\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `**Benefits:**\n`;
    for (const benefit of workflow.benefits) {
      text += `✓ ${benefit}\n`;
    }

    return text;
  }
}

export default CrossTaskIntegrationService.getInstance();
