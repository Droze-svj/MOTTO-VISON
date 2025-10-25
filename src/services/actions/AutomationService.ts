/**
 * Automation Service
 * Creates and executes automated workflows
 */

import { Alert } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: string;
  actions: AutomationAction[];
  description: string;
}

interface AutomationAction {
  type: 'open' | 'copy' | 'share' | 'notify' | 'save' | 'search';
  target: string;
  params?: Record<string, any>;
}

interface WorkflowResult {
  workflowId: string;
  completed: boolean;
  actionsExecuted: number;
  errors: string[];
  message: string;
}

class AutomationService {
  private static instance: AutomationService;
  private workflows: Map<string, AutomationWorkflow> = new Map();

  private constructor() {
    console.log('[Automation] Service initialized');
    this.initializeDefaultWorkflows();
  }

  static getInstance(): AutomationService {
    if (!AutomationService.instance) {
      AutomationService.instance = new AutomationService();
    }
    return AutomationService.instance;
  }

  /**
   * Initialize common workflows
   */
  private initializeDefaultWorkflows() {
    // Morning routine
    this.workflows.set('morning', {
      id: 'morning',
      name: 'Morning Routine',
      trigger: 'good morning',
      actions: [
        { type: 'notify', target: '☀️ Good morning! Starting your day...' },
        { type: 'search', target: 'weather today' },
        { type: 'open', target: 'calendar' },
        { type: 'notify', target: '✅ You\'re all set for the day!' },
      ],
      description: 'Start your day organized and informed',
    });

    // Evening routine
    this.workflows.set('evening', {
      id: 'evening',
      name: 'Evening Routine',
      trigger: 'good evening',
      actions: [
        { type: 'notify', target: '🌙 Good evening! Let\'s wind down...' },
        { type: 'notify', target: 'Review: What did you accomplish today?' },
        { type: 'notify', target: '💡 Prep for tomorrow' },
        { type: 'notify', target: '😴 Time to relax!' },
      ],
      description: 'Wind down and prepare for tomorrow',
    });

    // Study session (Pomodoro)
    this.workflows.set('study', {
      id: 'study',
      name: 'Study Session (Pomodoro)',
      trigger: 'start studying',
      actions: [
        { type: 'notify', target: '📚 Study Mode Activated!' },
        { type: 'notify', target: '⏱️ 25-minute focus session starting...' },
        { type: 'notify', target: '📴 Minimize distractions' },
        { type: 'notify', target: '🎯 Focus on one topic at a time' },
      ],
      description: 'Focused Pomodoro study session',
    });

    // Break time
    this.workflows.set('break', {
      id: 'break',
      name: 'Take a Break',
      trigger: 'take a break',
      actions: [
        { type: 'notify', target: '☕ Break Time!' },
        { type: 'notify', target: '🚶 Stand up and stretch' },
        { type: 'notify', target: '💧 Drink some water' },
        { type: 'notify', target: '⏱️ 5-minute timer started' },
      ],
      description: 'Healthy break reminder',
    });

    // Work mode
    this.workflows.set('work', {
      id: 'work',
      name: 'Work Mode',
      trigger: 'start work',
      actions: [
        { type: 'notify', target: '💼 Work Mode Activated!' },
        { type: 'open', target: 'calendar' },
        { type: 'notify', target: '✓ Email ready' },
        { type: 'notify', target: '✓ Calendar open' },
        { type: 'notify', target: '🎯 Focus on priorities!' },
      ],
      description: 'Get into productive work mode',
    });

    // Homework session
    this.workflows.set('homework', {
      id: 'homework',
      name: 'Homework Session',
      trigger: 'do homework',
      actions: [
        { type: 'notify', target: '📝 Homework Time!' },
        { type: 'notify', target: '1. Start with hardest subject' },
        { type: 'notify', target: '2. Take notes as you work' },
        { type: 'notify', target: '3. Check your work' },
        { type: 'notify', target: '⏱️ Set a time limit' },
      ],
      description: 'Structured homework approach',
    });

    // Exercise/workout
    this.workflows.set('exercise', {
      id: 'exercise',
      name: 'Exercise Mode',
      trigger: 'start workout',
      actions: [
        { type: 'notify', target: '💪 Let\'s get moving!' },
        { type: 'notify', target: '🏃 Warm up first (5 min)' },
        { type: 'notify', target: '🎯 Focus on form, not speed' },
        { type: 'notify', target: '💧 Stay hydrated!' },
      ],
      description: 'Healthy exercise routine',
    });

    // Bedtime routine
    this.workflows.set('sleep', {
      id: 'sleep',
      name: 'Bedtime Routine',
      trigger: 'going to sleep',
      actions: [
        { type: 'notify', target: '😴 Bedtime Routine' },
        { type: 'notify', target: '📴 Put phone away' },
        { type: 'notify', target: '📚 Quick review of today' },
        { type: 'notify', target: '🌙 Sleep well! Tomorrow is a new day.' },
      ],
      description: 'Healthy sleep preparation',
    });

    // Meeting prep
    this.workflows.set('meeting', {
      id: 'meeting',
      name: 'Meeting Prep',
      trigger: 'prepare for meeting',
      actions: [
        { type: 'notify', target: '📅 Meeting Prep Mode' },
        { type: 'notify', target: '✓ Review agenda' },
        { type: 'notify', target: '✓ Prepare materials' },
        { type: 'notify', target: '✓ Test tech (video/audio)' },
        { type: 'open', target: 'calendar' },
      ],
      description: 'Professional meeting preparation',
    });

    // Deep focus
    this.workflows.set('focus', {
      id: 'focus',
      name: 'Deep Focus Mode',
      trigger: 'deep focus',
      actions: [
        { type: 'notify', target: '🎯 Deep Focus Activated!' },
        { type: 'notify', target: '📴 Notifications silenced' },
        { type: 'notify', target: '⏱️ 90-minute deep work session' },
        { type: 'notify', target: '🔒 Lock in!' },
      ],
      description: 'Intense focused work session',
    });
  }

  /**
   * Detect if input triggers a workflow
   */
  detectWorkflow(input: string): AutomationWorkflow | null {
    const lower = input.toLowerCase();
    
    for (const workflow of this.workflows.values()) {
      if (lower.includes(workflow.trigger)) {
        return workflow;
      }
    }

    return null;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string): Promise<WorkflowResult> {
    const workflow = this.workflows.get(workflowId);
    
    if (!workflow) {
      return {
        workflowId,
        completed: false,
        actionsExecuted: 0,
        errors: ['Workflow not found'],
        message: 'Workflow doesn\'t exist',
      };
    }

    console.log(`[Automation] Executing workflow: ${workflow.name}`);

    const errors: string[] = [];
    let completed = 0;

    for (const action of workflow.actions) {
      try {
        await this.executeAction(action);
        completed++;
      } catch (error) {
        errors.push(`Failed: ${action.type} ${action.target}`);
      }
    }

    return {
      workflowId,
      completed: errors.length === 0,
      actionsExecuted: completed,
      errors,
      message: `Executed ${completed}/${workflow.actions.length} actions!`,
    };
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: AutomationAction): Promise<void> {
    console.log(`[Automation] Action: ${action.type} → ${action.target}`);

    switch (action.type) {
      case 'notify':
        Alert.alert('MOTTO', action.target);
        break;
      
      case 'open':
        // Would integrate with CommandExecutionService
        console.log(`Opening: ${action.target}`);
        break;
      
      case 'copy':
        await Clipboard.setString(action.target);
        break;
      
      case 'share':
        // Share functionality disabled - would require react-native Share module
        console.log('[Automation] Share action (disabled):', action.target);
        break;
      
      default:
        console.log(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Create custom workflow
   */
  createWorkflow(
    name: string,
    trigger: string,
    actions: AutomationAction[]
  ): string {
    const id = `custom_${Date.now()}`;
    
    this.workflows.set(id, {
      id,
      name,
      trigger,
      actions,
      description: 'Custom workflow',
    });

    return id;
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): AutomationWorkflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Format workflow result
   */
  formatResult(result: WorkflowResult): string {
    let text = `🤖 Automation: ${result.message}\n\n`;
    
    if (result.completed) {
      text += `✅ All actions completed successfully!\n`;
    } else if (result.errors.length > 0) {
      text += `⚠️ Some actions failed:\n`;
      result.errors.forEach(err => {
        text += `• ${err}\n`;
      });
    }

    text += `\n📊 Executed ${result.actionsExecuted} actions`;
    
    return text;
  }
}

export default AutomationService.getInstance();
