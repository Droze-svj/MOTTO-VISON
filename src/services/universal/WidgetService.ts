/**
 * Widget Service
 * Provides MOTTO widgets for home screen/today view
 */

interface Widget {
  id: string;
  name: string;
  size: 'small' | 'medium' | 'large';
  content: any;
  updateInterval: number; // minutes
}

class WidgetService {
  private static instance: WidgetService;
  private widgets: Map<string, Widget> = new Map();

  private constructor() {
    this.initializeWidgets();
    console.log('[Widget Service] Service initialized');
  }

  static getInstance(): WidgetService {
    if (!WidgetService.instance) {
      WidgetService.instance = new WidgetService();
    }
    return WidgetService.instance;
  }

  /**
   * Initialize all available widgets
   */
  private initializeWidgets(): void {
    const widgets: Widget[] = [
      {
        id: 'quick_chat',
        name: 'Quick Chat',
        size: 'small',
        content: {
          type: 'input',
          placeholder: 'Ask MOTTO...',
        },
        updateInterval: 0, // Always ready
      },
      {
        id: 'smart_suggestions',
        name: 'Smart Suggestions',
        size: 'medium',
        content: {
          type: 'list',
          suggestions: [],
        },
        updateInterval: 30, // Every 30 minutes
      },
      {
        id: 'daily_assistant',
        name: 'Daily Assistant',
        size: 'large',
        content: {
          type: 'dashboard',
          sections: ['schedule', 'tasks', 'reminders'],
        },
        updateInterval: 15, // Every 15 minutes
      },
      {
        id: 'quick_actions',
        name: 'Quick Actions',
        size: 'small',
        content: {
          type: 'buttons',
          actions: ['Search', 'Translate', 'Timer', 'Note'],
        },
        updateInterval: 0,
      },
    ];

    widgets.forEach(widget => {
      this.widgets.set(widget.id, widget);
    });
  }

  /**
   * Get widget content
   */
  async getWidgetContent(widgetId: string): Promise<any> {
    const widget = this.widgets.get(widgetId);
    if (!widget) {
      throw new Error(`Widget ${widgetId} not found`);
    }

    switch (widgetId) {
      case 'quick_chat':
        return this.getQuickChatContent();
      case 'smart_suggestions':
        return this.getSmartSuggestionsContent();
      case 'daily_assistant':
        return this.getDailyAssistantContent();
      case 'quick_actions':
        return this.getQuickActionsContent();
      default:
        return widget.content;
    }
  }

  /**
   * Quick chat widget content
   */
  private getQuickChatContent(): any {
    const hour = new Date().getHours();
    let greeting = 'Hey!';
    
    if (hour >= 5 && hour < 12) greeting = 'Good morning!';
    else if (hour >= 12 && hour < 17) greeting = 'Good afternoon!';
    else if (hour >= 17 && hour < 22) greeting = 'Good evening!';

    return {
      greeting,
      placeholder: 'Ask MOTTO anything...',
      quickButtons: ['Search', 'Translate', 'Timer'],
    };
  }

  /**
   * Smart suggestions widget content
   */
  private getSmartSuggestionsContent(): any {
    const hour = new Date().getHours();
    const day = new Date().getDay();

    const suggestions = [];

    // Morning suggestions
    if (hour >= 6 && hour < 10) {
      suggestions.push(
        { icon: '☀️', text: 'Good morning routine', action: 'morning' },
        { icon: '📅', text: 'Plan your day', action: 'plan_day' },
        { icon: '🌤️', text: 'Check weather', action: 'weather' }
      );
    }

    // Afternoon suggestions
    if (hour >= 12 && hour < 17) {
      suggestions.push(
        { icon: '☕', text: 'Take a break', action: 'break' },
        { icon: '📝', text: 'Quick note', action: 'note' },
        { icon: '🔍', text: 'Search something', action: 'search' }
      );
    }

    // Evening suggestions
    if (hour >= 18 && hour < 23) {
      suggestions.push(
        { icon: '📊', text: 'Review your day', action: 'review' },
        { icon: '🌙', text: 'Evening routine', action: 'evening' },
        { icon: '😴', text: 'Prepare for sleep', action: 'sleep' }
      );
    }

    // Weekend suggestions
    if (day === 0 || day === 6) {
      suggestions.push(
        { icon: '🎯', text: 'Plan weekend', action: 'weekend' }
      );
    }

    return {
      title: 'Smart Suggestions',
      suggestions: suggestions.slice(0, 3),
      updateTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  /**
   * Daily assistant widget content
   */
  private getDailyAssistantContent(): any {
    return {
      title: 'Your Day',
      sections: [
        {
          type: 'schedule',
          items: [
            { time: '9:00 AM', event: 'Morning Meeting' },
            { time: '2:00 PM', event: 'Project Work' },
          ],
        },
        {
          type: 'tasks',
          items: [
            { task: 'Finish presentation', priority: 'high' },
            { task: 'Reply to emails', priority: 'medium' },
          ],
        },
        {
          type: 'insights',
          message: 'You have 2 tasks due today. Let\'s tackle them!',
        },
      ],
    };
  }

  /**
   * Quick actions widget content
   */
  private getQuickActionsContent(): any {
    return {
      actions: [
        { id: 'search', name: 'Search', icon: '🔍' },
        { id: 'translate', name: 'Translate', icon: '🌍' },
        { id: 'timer', name: 'Timer', icon: '⏱️' },
        { id: 'note', name: 'Note', icon: '📝' },
      ],
    };
  }

  /**
   * Handle widget action
   */
  async handleWidgetAction(widgetId: string, action: string): Promise<void> {
    console.log(`[Widget] Action "${action}" from widget "${widgetId}"`);
    
    // This will open MOTTO app and execute the action
  }

  /**
   * Get all available widgets
   */
  getAvailableWidgets(): Widget[] {
    return Array.from(this.widgets.values());
  }
}

export default WidgetService.getInstance();

