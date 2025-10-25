/**
 * Proactive Assistant Service
 * Anticipates user needs and provides smart recommendations before being asked
 */

interface UserPattern {
  userId: string;
  commonTasks: string[];
  timePatterns: { task: string; timeOfDay: string; frequency: number }[];
  preferences: Record<string, any>;
  lastActivities: { task: string; timestamp: number }[];
}

interface ProactiveSuggestion {
  type: 'reminder' | 'suggestion' | 'tip' | 'recommendation' | 'insight';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  action?: string;
  reasoning: string;
}

class ProactiveAssistantService {
  private static instance: ProactiveAssistantService;
  private userPatterns: Map<string, UserPattern> = new Map();

  private constructor() {
    console.log('[Proactive Assistant] Service initialized');
  }

  static getInstance(): ProactiveAssistantService {
    if (!ProactiveAssistantService.instance) {
      ProactiveAssistantService.instance = new ProactiveAssistantService();
    }
    return ProactiveAssistantService.instance;
  }

  /**
   * Analyze user activity and generate proactive suggestions
   */
  async generateSuggestions(userId: string, currentContext?: any): Promise<ProactiveSuggestion[]> {
    console.log(`[Proactive] Generating suggestions for user: ${userId}`);

    const suggestions: ProactiveSuggestion[] = [];
    const pattern = this.getUserPattern(userId);

    // Time-based suggestions
    suggestions.push(...this.getTimeBasedSuggestions(pattern));

    // Pattern-based suggestions
    suggestions.push(...this.getPatternBasedSuggestions(pattern));

    // Context-based suggestions
    if (currentContext) {
      suggestions.push(...this.getContextBasedSuggestions(pattern, currentContext));
    }

    // Productivity tips
    suggestions.push(...this.getProductivityTips(pattern));

    // Sort by priority
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }).slice(0, 5); // Top 5 suggestions
  }

  /**
   * Time-based suggestions
   */
  private getTimeBasedSuggestions(pattern: UserPattern): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();

    // Morning suggestions
    if (hour >= 6 && hour < 10) {
      suggestions.push({
        type: 'suggestion',
        priority: 'medium',
        title: 'Good Morning! Ready to plan your day?',
        message: 'Would you like me to help you organize your tasks for today?',
        action: 'Create daily plan',
        reasoning: 'Morning is ideal for planning',
      });
    }

    // Afternoon productivity
    if (hour >= 14 && hour < 16) {
      suggestions.push({
        type: 'tip',
        priority: 'low',
        title: 'Afternoon Energy Tip',
        message: 'Take a 5-minute break! Quick walks boost afternoon productivity by 30%.',
        reasoning: 'Afternoon dip in energy',
      });
    }

    // Evening wrap-up
    if (hour >= 18 && hour < 22) {
      suggestions.push({
        type: 'reminder',
        priority: 'medium',
        title: 'Time to Review Your Day',
        message: 'Reflecting on your day helps solidify learning. Want to review what you accomplished?',
        action: 'Daily review',
        reasoning: 'Evening reflection improves retention',
      });
    }

    // Weekend planning (Friday evening)
    if (dayOfWeek === 5 && hour >= 16) {
      suggestions.push({
        type: 'suggestion',
        priority: 'medium',
        title: 'Weekend Coming Up!',
        message: 'Want to plan your weekend or finish any pending tasks before Friday ends?',
        action: 'Weekend planning',
        reasoning: 'Friday planning prevents weekend stress',
      });
    }

    return suggestions;
  }

  /**
   * Pattern-based suggestions
   */
  private getPatternBasedSuggestions(pattern: UserPattern): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];

    // Detect common patterns
    if (pattern.commonTasks.includes('homework')) {
      suggestions.push({
        type: 'recommendation',
        priority: 'medium',
        title: 'Homework Helper Ready!',
        message: 'I notice you often work on homework. Need help with any subject today?',
        action: 'Get homework help',
        reasoning: 'User frequently asks for homework help',
      });
    }

    if (pattern.commonTasks.includes('coding')) {
      suggestions.push({
        type: 'tip',
        priority: 'low',
        title: 'Code Quality Tip',
        message: 'Remember: Write tests as you code - it saves debugging time later!',
        reasoning: 'User works with code frequently',
      });
    }

    if (pattern.commonTasks.includes('writing')) {
      suggestions.push({
        type: 'suggestion',
        priority: 'medium',
        title: 'Writing Session?',
        message: 'Ready to work on that essay or article? I can help with structure and editing!',
        action: 'Start writing',
        reasoning: 'User has writing pattern',
      });
    }

    return suggestions;
  }

  /**
   * Context-based suggestions
   */
  private getContextBasedSuggestions(pattern: UserPattern, context: any): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];

    // If user just finished a task
    if (context.taskCompleted) {
      suggestions.push({
        type: 'suggestion',
        priority: 'high',
        title: 'Great Work! What\'s Next?',
        message: 'You just completed a task. Want to tackle another one or take a break?',
        action: 'Next task or break',
        reasoning: 'Task just completed',
      });
    }

    // If deadline approaching
    if (context.upcomingDeadline) {
      suggestions.push({
        type: 'reminder',
        priority: 'high',
        title: 'Deadline Approaching!',
        message: `You have a deadline coming up: ${context.upcomingDeadline}. Need help finishing up?`,
        action: 'Work on deadline',
        reasoning: 'Urgent deadline',
      });
    }

    // If stuck on same task
    if (context.stuckOnTask) {
      suggestions.push({
        type: 'suggestion',
        priority: 'high',
        title: 'Need a Different Approach?',
        message: 'You\'ve been working on this for a while. Want to break it down differently or try a new strategy?',
        action: 'Get unstuck',
        reasoning: 'User appears stuck',
      });
    }

    return suggestions;
  }

  /**
   * Productivity tips and insights
   */
  private getProductivityTips(pattern: UserPattern): ProactiveSuggestion[] {
    const tips = [
      {
        type: 'tip' as const,
        priority: 'low' as const,
        title: 'Pomodoro Technique',
        message: '25 minutes of focused work + 5-minute break = Better productivity!',
        reasoning: 'General productivity tip',
      },
      {
        type: 'insight' as const,
        priority: 'low' as const,
        title: 'Your Most Productive Time',
        message: 'You seem most productive in the morning! Schedule important tasks then.',
        reasoning: 'Based on user activity patterns',
      },
      {
        type: 'tip' as const,
        priority: 'low' as const,
        title: 'Break Tasks Down',
        message: 'Big tasks feel overwhelming. Break them into 15-minute chunks!',
        reasoning: 'Task management best practice',
      },
      {
        type: 'insight' as const,
        priority: 'low' as const,
        title: 'You\'re Making Progress!',
        message: `You've completed ${pattern.lastActivities.length} tasks recently. Keep up the momentum!`,
        reasoning: 'Positive reinforcement',
      },
    ];

    // Return 1-2 random tips
    return tips.sort(() => Math.random() - 0.5).slice(0, 2);
  }

  /**
   * Track user activity for pattern recognition
   */
  async trackActivity(userId: string, activity: { task: string; timestamp: number; metadata?: any }) {
    let pattern = this.userPatterns.get(userId);
    
    if (!pattern) {
      pattern = {
        userId,
        commonTasks: [],
        timePatterns: [],
        preferences: {},
        lastActivities: [],
      };
      this.userPatterns.set(userId, pattern);
    }

    // Add to recent activities
    pattern.lastActivities.push(activity);
    if (pattern.lastActivities.length > 20) {
      pattern.lastActivities = pattern.lastActivities.slice(-20);
    }

    // Update common tasks
    const taskCounts = pattern.lastActivities.reduce((acc, act) => {
      acc[act.task] = (acc[act.task] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    pattern.commonTasks = Object.entries(taskCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([task]) => task);

    console.log(`[Proactive] Tracked activity: ${activity.task} for user ${userId}`);
  }

  /**
   * Get user pattern
   */
  private getUserPattern(userId: string): UserPattern {
    let pattern = this.userPatterns.get(userId);
    
    if (!pattern) {
      pattern = {
        userId,
        commonTasks: [],
        timePatterns: [],
        preferences: {},
        lastActivities: [],
      };
      this.userPatterns.set(userId, pattern);
    }

    return pattern;
  }

  /**
   * Anticipate next action
   */
  async anticipateNextAction(userId: string, currentActivity: string): Promise<string | null> {
    const pattern = this.getUserPattern(userId);

    // Find what usually comes after current activity
    const activities = pattern.lastActivities.map(a => a.task);
    const currentIndex = activities.lastIndexOf(currentActivity);

    if (currentIndex >= 0 && currentIndex < activities.length - 1) {
      return activities[currentIndex + 1];
    }

    return null;
  }

  /**
   * Check if user might need help
   */
  async checkIfNeedsHelp(userId: string, timeSpentOnTask: number): Promise<boolean> {
    // If spending more than 30 minutes on one task, might need help
    return timeSpentOnTask > 30 * 60 * 1000;
  }

  /**
   * Generate contextual reminder
   */
  async generateReminder(userId: string, context: any): Promise<ProactiveSuggestion | null> {
    // Check for common reminder scenarios
    if (context.deadline && context.daysUntilDeadline <= 2) {
      return {
        type: 'reminder',
        priority: 'high',
        title: 'Deadline Alert!',
        message: `Your ${context.taskName} is due in ${context.daysUntilDeadline} days. Time to finish up!`,
        action: 'Work on task',
        reasoning: 'Deadline approaching',
      };
    }

    if (context.incompleteTask && context.hoursSinceLastWorked > 24) {
      return {
        type: 'reminder',
        priority: 'medium',
        title: 'Remember This?',
        message: `You started working on "${context.incompleteTask}" yesterday. Want to continue?`,
        action: 'Resume task',
        reasoning: 'Incomplete task reminder',
      };
    }

    return null;
  }

  /**
   * Smart next step suggestion
   */
  async suggestNextStep(userId: string, completedTask: string): Promise<ProactiveSuggestion> {
    const nextSteps = {
      'homework': {
        title: 'What\'s Next?',
        message: 'Homework done! Want to review what you learned or move to another subject?',
        action: 'Review or next subject',
      },
      'essay': {
        title: 'Essay Complete!',
        message: 'Great job! Want me to help proofread or work on something else?',
        action: 'Proofread or new task',
      },
      'code': {
        title: 'Code Written!',
        message: 'Nice work! Ready to write tests or document your code?',
        action: 'Test or document',
      },
      'presentation': {
        title: 'Presentation Ready!',
        message: 'Slides done! Want to practice your delivery or create notes?',
        action: 'Practice or notes',
      },
    };

    const taskType = Object.keys(nextSteps).find(key => completedTask.includes(key));
    const suggestion = taskType ? nextSteps[taskType] : {
      title: 'Task Complete!',
      message: 'Well done! What would you like to tackle next?',
      action: 'Next task',
    };

    return {
      type: 'suggestion',
      priority: 'medium',
      ...suggestion,
      reasoning: 'Suggesting logical next step',
    };
  }

  /**
   * Format suggestions for display
   */
  formatSuggestions(suggestions: ProactiveSuggestion[]): string {
    if (suggestions.length === 0) {
      return 'No suggestions at the moment. You\'re doing great! 😊';
    }

    let text = '💡 **Proactive Suggestions:**\n\n';

    for (const suggestion of suggestions) {
      const icon = {
        reminder: '⏰',
        suggestion: '💡',
        tip: '🎯',
        recommendation: '✨',
        insight: '📊',
      }[suggestion.type];

      const priority = suggestion.priority === 'high' ? ' [!]' : '';

      text += `${icon} **${suggestion.title}**${priority}\n`;
      text += `${suggestion.message}\n`;
      if (suggestion.action) {
        text += `→ _${suggestion.action}_\n`;
      }
      text += `\n`;
    }

    return text;
  }
}

export default ProactiveAssistantService.getInstance();
