/**
 * Quick Actions Service
 * Provides instant actions for common tasks
 */

import { Linking, Share, Clipboard, Alert } from 'react-native';

interface QuickActionDef {
  id: string;
  name: string;
  icon: string;
  category: 'productivity' | 'communication' | 'system' | 'utility';
  execute: (params?: any) => Promise<{ success: boolean; message: string }>;
}

class QuickActionsService {
  private static instance: QuickActionsService;
  private actions: Map<string, QuickActionDef> = new Map();

  private constructor() {
    console.log('[Quick Actions] Service initialized');
    this.registerDefaultActions();
  }

  static getInstance(): QuickActionsService {
    if (!QuickActionsService.instance) {
      QuickActionsService.instance = new QuickActionsService();
    }
    return QuickActionsService.instance;
  }

  /**
   * Register default quick actions
   */
  private registerDefaultActions() {
    // System actions
    this.registerAction({
      id: 'open_settings',
      name: 'Open Settings',
      icon: '⚙️',
      category: 'system',
      execute: async () => {
        try {
          await Linking.openSettings();
          return { success: true, message: 'Settings opened!' };
        } catch {
          return { success: false, message: 'Couldn\'t open settings' };
        }
      },
    });

    // Productivity actions
    this.registerAction({
      id: 'start_timer',
      name: 'Start Timer',
      icon: '⏱️',
      category: 'productivity',
      execute: async (params) => {
        const minutes = params?.minutes || 25;
        Alert.alert('Timer Started', `${minutes} minute focus session!`);
        return { success: true, message: `${minutes}-minute timer started!` };
      },
    });

    this.registerAction({
      id: 'take_break',
      name: 'Take Break',
      icon: '☕',
      category: 'productivity',
      execute: async () => {
        Alert.alert('Break Time!', 'Take 5 minutes to rest. You deserve it! 😊');
        return { success: true, message: 'Break reminder set!' };
      },
    });

    // Communication actions
    this.registerAction({
      id: 'quick_share',
      name: 'Quick Share',
      icon: '📤',
      category: 'communication',
      execute: async (params) => {
        try {
          await Share.share({
            message: params?.message || 'Check this out!',
          });
          return { success: true, message: 'Share dialog opened!' };
        } catch {
          return { success: false, message: 'Share failed' };
        }
      },
    });

    this.registerAction({
      id: 'copy_response',
      name: 'Copy Response',
      icon: '📋',
      category: 'utility',
      execute: async (params) => {
        try {
          await Clipboard.setString(params?.text || '');
          return { success: true, message: 'Copied to clipboard!' };
        } catch {
          return { success: false, message: 'Copy failed' };
        }
      },
    });

    // Utility actions
    this.registerAction({
      id: 'open_maps',
      name: 'Open Maps',
      icon: '🗺️',
      category: 'utility',
      execute: async (params) => {
        try {
          const query = params?.location || '';
          const url = query ? `maps://?q=${encodeURIComponent(query)}` : 'maps://';
          await Linking.openURL(url);
          return { success: true, message: 'Maps opened!' };
        } catch {
          return { success: false, message: 'Couldn\'t open maps' };
        }
      },
    });

    this.registerAction({
      id: 'search_web',
      name: 'Search Web',
      icon: '🔍',
      category: 'utility',
      execute: async (params) => {
        try {
          const query = params?.query || '';
          const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
          await Linking.openURL(url);
          return { success: true, message: 'Search opened in browser!' };
        } catch {
          return { success: false, message: 'Search failed' };
        }
      },
    });

    // More productivity actions
    this.registerAction({
      id: 'take_note',
      name: 'Quick Note',
      icon: '📝',
      category: 'productivity',
      execute: async (params) => {
        const note = params?.note || '';
        await Clipboard.setString(`NOTE: ${note}\n${new Date().toLocaleString()}`);
        return { success: true, message: 'Note saved to clipboard!' };
      },
    });

    this.registerAction({
      id: 'set_goal',
      name: 'Set Goal',
      icon: '🎯',
      category: 'productivity',
      execute: async (params) => {
        const goal = params?.goal || 'Complete 3 tasks';
        Alert.alert('Goal Set', goal);
        return { success: true, message: `Goal: ${goal}` };
      },
    });

    this.registerAction({
      id: 'check_weather',
      name: 'Weather',
      icon: '🌤️',
      category: 'utility',
      execute: async (params) => {
        const location = params?.location || 'current location';
        const url = `https://www.google.com/search?q=weather+${encodeURIComponent(location)}`;
        await Linking.openURL(url);
        return { success: true, message: 'Weather opened!' };
      },
    });

    this.registerAction({
      id: 'translate_text',
      name: 'Translate',
      icon: '🌍',
      category: 'utility',
      execute: async (params) => {
        const text = params?.text || '';
        const url = `https://translate.google.com/?text=${encodeURIComponent(text)}`;
        await Linking.openURL(url);
        return { success: true, message: 'Translator opened!' };
      },
    });

    this.registerAction({
      id: 'call_contact',
      name: 'Quick Call',
      icon: '📞',
      category: 'communication',
      execute: async (params) => {
        const phone = params?.phone || '';
        await Linking.openURL(`tel:${phone}`);
        return { success: true, message: 'Calling...' };
      },
    });

    this.registerAction({
      id: 'quick_email',
      name: 'Quick Email',
      icon: '📧',
      category: 'communication',
      execute: async (params) => {
        const email = params?.email || '';
        await Linking.openURL(`mailto:${email}`);
        return { success: true, message: 'Email opened!' };
      },
    });
  }

  /**
   * Register a new action
   */
  registerAction(action: QuickActionDef) {
    this.actions.set(action.id, action);
    console.log(`[Quick Actions] Registered: ${action.name}`);
  }

  /**
   * Execute action by ID
   */
  async executeAction(actionId: string, params?: any): Promise<{ success: boolean; message: string }> {
    const action = this.actions.get(actionId);
    
    if (!action) {
      return { success: false, message: 'Action not found' };
    }

    console.log(`[Quick Actions] Executing: ${action.name}`);
    return await action.execute(params);
  }

  /**
   * Get actions by category
   */
  getActionsByCategory(category: string): QuickActionDef[] {
    return Array.from(this.actions.values())
      .filter(action => action.category === category);
  }

  /**
   * Get all actions
   */
  getAllActions(): QuickActionDef[] {
    return Array.from(this.actions.values());
  }

  /**
   * Suggest relevant actions based on context
   */
  suggestActions(context: string): QuickActionDef[] {
    const lower = context.toLowerCase();
    const suggested: QuickActionDef[] = [];

    // Context-based suggestions
    if (lower.includes('focus') || lower.includes('study') || lower.includes('work')) {
      suggested.push(...this.getActionsByCategory('productivity'));
    }

    if (lower.includes('share') || lower.includes('send') || lower.includes('tell')) {
      suggested.push(...this.getActionsByCategory('communication'));
    }

    if (lower.includes('search') || lower.includes('find') || lower.includes('locate')) {
      const searchActions = Array.from(this.actions.values())
        .filter(a => a.id === 'search_web' || a.id === 'open_maps');
      suggested.push(...searchActions);
    }

    return suggested.slice(0, 5); // Top 5 suggestions
  }
}

export default QuickActionsService.getInstance();
