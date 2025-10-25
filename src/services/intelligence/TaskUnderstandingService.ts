/**
 * Task Understanding Service
 * Deeply understands user intent, context, and goals
 */

interface TaskAnalysis {
  intent: string;
  goal: string;
  context: {
    urgency: 'low' | 'medium' | 'high';
    complexity: 'simple' | 'medium' | 'complex';
    domain: string;
    prerequisites: string[];
  };
  clarificationNeeded: boolean;
  clarifyingQuestions: string[];
  suggestedApproach: string;
  estimatedTime: string;
  breakdown: {
    step: number;
    action: string;
    description: string;
  }[];
}

class TaskUnderstandingService {
  private static instance: TaskUnderstandingService;

  private constructor() {
    console.log('[Task Understanding] Service initialized');
  }

  static getInstance(): TaskUnderstandingService {
    if (!TaskUnderstandingService.instance) {
      TaskUnderstandingService.instance = new TaskUnderstandingService();
    }
    return TaskUnderstandingService.instance;
  }

  /**
   * Deeply analyze and understand a task
   */
  async analyzeTask(userInput: string, conversationContext?: any): Promise<TaskAnalysis> {
    console.log(`[Task Understanding] Analyzing: "${userInput}"`);

    // Parse the intent
    const intent = this.extractIntent(userInput);
    const goal = this.identifyGoal(userInput, intent);
    
    // Analyze context
    const urgency = this.detectUrgency(userInput);
    const complexity = this.assessComplexity(userInput);
    const domain = this.identifyDomain(userInput);
    const prerequisites = this.identifyPrerequisites(userInput, domain);

    // Determine if clarification is needed
    const { needed, questions } = this.needsClarification(userInput, intent, goal);

    // Generate approach
    const suggestedApproach = this.generateApproach(userInput, intent, complexity);
    const estimatedTime = this.estimateTime(complexity, domain);

    // Break down the task
    const breakdown = this.breakdownTask(userInput, intent, complexity);

    return {
      intent,
      goal,
      context: {
        urgency,
        complexity,
        domain,
        prerequisites,
      },
      clarificationNeeded: needed,
      clarifyingQuestions: questions,
      suggestedApproach,
      estimatedTime,
      breakdown,
    };
  }

  /**
   * Extract user's intent
   */
  private extractIntent(input: string): string {
    const lower = input.toLowerCase();

    // Action verbs
    if (lower.match(/create|make|build|generate|design/)) return 'create';
    if (lower.match(/fix|debug|solve|resolve|troubleshoot/)) return 'fix';
    if (lower.match(/learn|understand|explain|teach|study/)) return 'learn';
    if (lower.match(/write|draft|compose|author/)) return 'write';
    if (lower.match(/analyze|examine|evaluate|assess/)) return 'analyze';
    if (lower.match(/plan|organize|schedule|arrange/)) return 'plan';
    if (lower.match(/improve|enhance|optimize|upgrade/)) return 'improve';
    if (lower.match(/compare|contrast|differentiate/)) return 'compare';
    if (lower.match(/summarize|condense|brief/)) return 'summarize';
    if (lower.match(/help|assist|support|guide/)) return 'help';

    return 'general';
  }

  /**
   * Identify the end goal
   */
  private identifyGoal(input: string, intent: string): string {
    // Extract what comes after action verbs
    const goalPatterns = [
      /(?:create|make|build|write|design)\s+(?:a|an)?\s*(.+?)(?:\.|$|for|about)/i,
      /(?:help|assist)\s+(?:me\s+)?(?:with|to)?\s*(.+?)(?:\.|$)/i,
      /(?:learn|understand)\s+(?:about|how to)?\s*(.+?)(?:\.|$)/i,
    ];

    for (const pattern of goalPatterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return `${intent} something`;
  }

  /**
   * Detect urgency level
   */
  private detectUrgency(input: string): 'low' | 'medium' | 'high' {
    const lower = input.toLowerCase();

    // High urgency indicators
    if (lower.match(/urgent|asap|immediately|now|today|emergency|critical/)) {
      return 'high';
    }

    // Low urgency indicators
    if (lower.match(/eventually|whenever|no rush|someday|future/)) {
      return 'low';
    }

    // Medium by default
    return 'medium';
  }

  /**
   * Assess task complexity
   */
  private assessComplexity(input: string): 'simple' | 'medium' | 'complex' {
    const lower = input.toLowerCase();

    // Complexity indicators
    let complexityScore = 0;

    // Simple indicators (subtract)
    if (lower.match(/simple|basic|quick|easy|straightforward/)) complexityScore -= 2;
    if (input.length < 50) complexityScore -= 1;

    // Complex indicators (add)
    if (lower.match(/complex|advanced|detailed|comprehensive|in-depth/)) complexityScore += 3;
    if (lower.match(/multiple|several|various|different|many/)) complexityScore += 2;
    if (lower.match(/research|analysis|investigation|study/)) complexityScore += 2;
    if (input.length > 150) complexityScore += 1;

    // Medium indicators
    if (lower.match(/moderate|standard|normal|typical/)) complexityScore += 0;

    if (complexityScore <= -1) return 'simple';
    if (complexityScore >= 3) return 'complex';
    return 'medium';
  }

  /**
   * Identify domain/subject area
   */
  private identifyDomain(input: string): string {
    const lower = input.toLowerCase();

    // Domain keywords
    const domains = {
      'Academic': ['school', 'homework', 'assignment', 'study', 'exam', 'course', 'class'],
      'Professional': ['work', 'business', 'meeting', 'presentation', 'job', 'career', 'office'],
      'Technical': ['code', 'programming', 'software', 'app', 'website', 'api', 'database'],
      'Creative': ['design', 'creative', 'art', 'music', 'video', 'content', 'social media'],
      'Personal': ['personal', 'family', 'home', 'friend', 'life', 'daily'],
      'Financial': ['money', 'budget', 'finance', 'investment', 'expense', 'income'],
      'Health': ['health', 'fitness', 'exercise', 'diet', 'wellness', 'medical'],
      'Research': ['research', 'investigate', 'explore', 'discover', 'analyze data'],
    };

    for (const [domain, keywords] of Object.entries(domains)) {
      if (keywords.some(keyword => lower.includes(keyword))) {
        return domain;
      }
    }

    return 'General';
  }

  /**
   * Identify what's needed before starting
   */
  private identifyPrerequisites(input: string, domain: string): string[] {
    const prerequisites: string[] = [];

    // Domain-specific prerequisites
    const domainPrereqs = {
      'Academic': ['Course materials', 'Assignment instructions', 'Deadline information'],
      'Professional': ['Project requirements', 'Stakeholder input', 'Company guidelines'],
      'Technical': ['Development environment', 'Required tools/libraries', 'Specifications'],
      'Creative': ['Design brief', 'Brand guidelines', 'Target audience info'],
      'Research': ['Research question', 'Sources/databases', 'Methodology'],
    };

    if (domainPrereqs[domain]) {
      prerequisites.push(...domainPrereqs[domain]);
    }

    return prerequisites;
  }

  /**
   * Determine if clarification is needed
   */
  private needsClarification(
    input: string,
    intent: string,
    goal: string
  ): { needed: boolean; questions: string[] } {
    const questions: string[] = [];

    // Very short or vague inputs need clarification
    if (input.length < 20) {
      questions.push(`Can you tell me more about what you're trying to ${intent}?`);
      questions.push(`What's the context or purpose?`);
    }

    // Goal is too vague
    if (goal.length < 10 || goal.includes('something')) {
      questions.push(`What specific outcome are you looking for?`);
    }

    // Missing important details
    const lower = input.toLowerCase();
    if (lower.includes('assignment') && !lower.match(/due|deadline/)) {
      questions.push(`When is this due?`);
    }
    if (lower.includes('presentation') && !lower.match(/audience|for who/)) {
      questions.push(`Who is your audience?`);
    }
    if (lower.includes('code') && !lower.match(/language|framework/)) {
      questions.push(`What programming language or framework?`);
    }

    return {
      needed: questions.length > 0,
      questions: questions.slice(0, 3), // Max 3 questions
    };
  }

  /**
   * Generate suggested approach
   */
  private generateApproach(input: string, intent: string, complexity: string): string {
    const approaches = {
      create: {
        simple: 'Start with a basic template or outline, then customize it to your needs.',
        medium: 'Plan the structure first, gather necessary resources, then build systematically.',
        complex: 'Break into phases: research/planning, initial creation, iteration, and refinement.',
      },
      fix: {
        simple: 'Identify the issue, find the root cause, apply the solution.',
        medium: 'Reproduce the problem, diagnose systematically, test potential fixes.',
        complex: 'Full diagnostic process: gather info, isolate issue, test hypotheses, implement fix, verify.',
      },
      learn: {
        simple: 'Start with basics, practice with examples, apply to real situations.',
        medium: 'Study theory, work through examples, practice problems, review and reinforce.',
        complex: 'Deep dive: foundational concepts, advanced topics, hands-on projects, teach others.',
      },
      write: {
        simple: 'Outline main points, write first draft, quick edit.',
        medium: 'Research topic, create detailed outline, draft, revise, proofread.',
        complex: 'Extensive research, structured planning, multiple drafts, peer review, final polish.',
      },
    };

    return approaches[intent]?.[complexity] || 
      'Break the task into manageable steps, work through systematically, and review your progress.';
  }

  /**
   * Estimate time needed
   */
  private estimateTime(complexity: string, domain: string): string {
    const baseTime = {
      simple: 30,
      medium: 120,
      complex: 300,
    };

    const multipliers = {
      'Academic': 1.2,
      'Professional': 1.3,
      'Technical': 1.5,
      'Research': 2.0,
    };

    const minutes = baseTime[complexity] * (multipliers[domain] || 1);
    
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.round(minutes / 60 * 10) / 10;
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  /**
   * Break down task into steps
   */
  private breakdownTask(
    input: string,
    intent: string,
    complexity: string
  ): TaskAnalysis['breakdown'] {
    // Generic breakdown by complexity
    const simpleBreakdown = [
      { step: 1, action: 'Prepare', description: 'Gather what you need and understand requirements' },
      { step: 2, action: 'Execute', description: 'Complete the main task' },
      { step: 3, action: 'Review', description: 'Check your work and finalize' },
    ];

    const mediumBreakdown = [
      { step: 1, action: 'Plan', description: 'Outline approach and identify resources' },
      { step: 2, action: 'Research', description: 'Gather information and examples' },
      { step: 3, action: 'Create', description: 'Build the first version' },
      { step: 4, action: 'Refine', description: 'Improve and polish' },
      { step: 5, action: 'Finalize', description: 'Final check and completion' },
    ];

    const complexBreakdown = [
      { step: 1, action: 'Define', description: 'Clarify objectives and success criteria' },
      { step: 2, action: 'Research', description: 'Deep dive into topic and gather resources' },
      { step: 3, action: 'Plan', description: 'Create detailed roadmap and timeline' },
      { step: 4, action: 'Develop', description: 'Work through main components systematically' },
      { step: 5, action: 'Test', description: 'Verify everything works as intended' },
      { step: 6, action: 'Refine', description: 'Iterate and improve based on testing' },
      { step: 7, action: 'Finalize', description: 'Polish and prepare for delivery' },
    ];

    if (complexity === 'simple') return simpleBreakdown;
    if (complexity === 'complex') return complexBreakdown;
    return mediumBreakdown;
  }

  /**
   * Format task analysis for display
   */
  formatAnalysis(analysis: TaskAnalysis): string {
    let text = `🎯 Task Understanding\n\n`;
    text += `**Intent:** ${analysis.intent.charAt(0).toUpperCase() + analysis.intent.slice(1)}\n`;
    text += `**Goal:** ${analysis.goal}\n\n`;
    
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    text += `📊 **Analysis:**\n`;
    text += `• Domain: ${analysis.context.domain}\n`;
    text += `• Complexity: ${analysis.context.complexity.charAt(0).toUpperCase() + analysis.context.complexity.slice(1)}\n`;
    text += `• Urgency: ${analysis.context.urgency.charAt(0).toUpperCase() + analysis.context.urgency.slice(1)}\n`;
    text += `• Estimated Time: ${analysis.estimatedTime}\n\n`;

    if (analysis.context.prerequisites.length > 0) {
      text += `📋 **Prerequisites:**\n`;
      for (const prereq of analysis.context.prerequisites) {
        text += `• ${prereq}\n`;
      }
      text += `\n`;
    }

    if (analysis.clarificationNeeded) {
      text += `❓ **I'd like to know:**\n`;
      for (const question of analysis.clarifyingQuestions) {
        text += `• ${question}\n`;
      }
      text += `\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    text += `💡 **Suggested Approach:**\n${analysis.suggestedApproach}\n\n`;
    
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    text += `📝 **Step-by-Step Breakdown:**\n\n`;
    for (const step of analysis.breakdown) {
      text += `**Step ${step.step}: ${step.action}**\n`;
      text += `${step.description}\n\n`;
    }

    return text;
  }
}

export default TaskUnderstandingService.getInstance();
