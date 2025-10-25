/**
 * Command Execution Service
 * Executes commands and gets things done directly
 */

import { Alert, Linking, Share, Clipboard } from 'react-native';

interface CommandResult {
  success: boolean;
  action: string;
  result?: any;
  message: string;
}

interface QuickAction {
  id: string;
  name: string;
  icon: string;
  action: () => Promise<CommandResult>;
}

class CommandExecutionService {
  private static instance: CommandExecutionService;

  private constructor() {
    console.log('[Command Execution] Service initialized');
  }

  static getInstance(): CommandExecutionService {
    if (!CommandExecutionService.instance) {
      CommandExecutionService.instance = new CommandExecutionService();
    }
    return CommandExecutionService.instance;
  }

  /**
   * Detect if user wants to execute a command
   */
  isExecutableCommand(input: string): boolean {
    const lower = input.toLowerCase();
    
    const actionKeywords = [
      'open', 'launch', 'start', 'run', 'execute', 'show', 'display',
      'copy', 'paste', 'share', 'send', 'forward',
      'call', 'text', 'email', 'message', 'contact',
      'set reminder', 'create event', 'add to calendar', 'schedule',
      'take note', 'save', 'bookmark', 'download',
      'search', 'find', 'lookup', 'google', 'navigate',
      'play', 'pause', 'stop', 'skip', 'volume',
      'brightness', 'wifi', 'bluetooth', 'airplane',
      'mute', 'unmute', 'silent', 'do not disturb',
    ];

    return actionKeywords.some(keyword => lower.includes(keyword));
  }

  /**
   * Execute detected command
   */
  async executeCommand(userInput: string): Promise<CommandResult> {
    const lower = userInput.toLowerCase();

    console.log(`[Command Execution] Executing: ${userInput}`);

    // Open URL/App
    if (lower.match(/open|launch|start/)) {
      return this.openApp(userInput);
    }

    // Copy to clipboard
    if (lower.includes('copy')) {
      return this.copyToClipboard(userInput);
    }

    // Share content
    if (lower.includes('share')) {
      return this.shareContent(userInput);
    }

    // Call/Text
    if (lower.match(/call|text|message/)) {
      return this.initiateContact(userInput);
    }

    // Email
    if (lower.includes('email')) {
      return this.sendEmail(userInput);
    }

    // Calendar
    if (lower.match(/calendar|event|reminder/)) {
      return this.handleCalendar(userInput);
    }

    // Search
    if (lower.match(/search|google|find|lookup/)) {
      return this.searchWeb(userInput);
    }

    // Navigate
    if (lower.match(/navigate|directions|route|go to/)) {
      return this.navigate(userInput);
    }

    // System controls
    if (lower.match(/brightness|volume|wifi|bluetooth/)) {
      return this.systemControl(userInput);
    }

    // Quick save
    if (lower.match(/save|download|bookmark/)) {
      return this.quickSave(userInput);
    }

    return {
      success: false,
      action: 'unknown',
      message: 'Command not recognized. What would you like me to do?',
    };
  }

  /**
   * Open app or URL
   */
  private async openApp(input: string): Promise<CommandResult> {
    // Detect what to open
    const apps = {
      'safari': 'https://www.apple.com',
      'settings': 'app-settings:',
      'maps': 'maps://',
      'mail': 'mailto:',
      'phone': 'tel:',
      'messages': 'sms:',
      'calendar': 'calshow:',
      'notes': 'mobilenotes:',
      'reminders': 'x-apple-reminder:',
      'photos': 'photos-redirect://',
    };

    const lower = input.toLowerCase();
    
    for (const [app, url] of Object.entries(apps)) {
      if (lower.includes(app)) {
        try {
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
            return {
              success: true,
              action: 'open_app',
              message: `✅ Opened ${app.charAt(0).toUpperCase() + app.slice(1)}!`,
            };
          }
        } catch (error) {
          return {
            success: false,
            action: 'open_app',
            message: `❌ Couldn't open ${app}. Make sure it's installed.`,
          };
        }
      }
    }

    // Try to open as URL
    const urlMatch = input.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) {
      try {
        await Linking.openURL(urlMatch[1]);
        return {
          success: true,
          action: 'open_url',
          message: '✅ Opened link!',
        };
      } catch (error) {
        return {
          success: false,
          action: 'open_url',
          message: '❌ Invalid URL',
        };
      }
    }

    return {
      success: false,
      action: 'open_app',
      message: 'What would you like to open? (safari, maps, mail, settings, etc.)',
    };
  }

  /**
   * Copy to clipboard
   */
  private async copyToClipboard(input: string): Promise<CommandResult> {
    // Extract what to copy
    const copyMatch = input.match(/copy\s+(.+)/i);
    if (copyMatch) {
      const textToCopy = copyMatch[1];
      await Clipboard.setString(textToCopy);
      return {
        success: true,
        action: 'copy',
        message: `✅ Copied "${textToCopy.substring(0, 50)}..." to clipboard!`,
      };
    }

    return {
      success: false,
      action: 'copy',
      message: 'What would you like me to copy?',
    };
  }

  /**
   * Share content
   */
  private async shareContent(input: string): Promise<CommandResult> {
    const shareMatch = input.match(/share\s+(.+)/i);
    if (shareMatch) {
      const content = shareMatch[1];
      try {
        await Share.share({
          message: content,
        });
        return {
          success: true,
          action: 'share',
          message: '✅ Share dialog opened!',
        };
      } catch (error) {
        return {
          success: false,
          action: 'share',
          message: '❌ Sharing failed',
        };
      }
    }

    return {
      success: false,
      action: 'share',
      message: 'What would you like to share?',
    };
  }

  /**
   * Initiate call or text
   */
  private async initiateContact(input: string): Promise<CommandResult> {
    // Extract phone number
    const phoneMatch = input.match(/(\d{3}[-.]?\d{3}[-.]?\d{4})/);
    
    if (phoneMatch) {
      const phone = phoneMatch[1].replace(/[^0-9]/g, '');
      const isCall = input.toLowerCase().includes('call');
      const url = isCall ? `tel:${phone}` : `sms:${phone}`;
      
      try {
        await Linking.openURL(url);
        return {
          success: true,
          action: isCall ? 'call' : 'text',
          message: `✅ ${isCall ? 'Calling' : 'Texting'} ${phone}!`,
        };
      } catch (error) {
        return {
          success: false,
          action: isCall ? 'call' : 'text',
          message: '❌ Failed to initiate contact',
        };
      }
    }

    return {
      success: false,
      action: 'contact',
      message: 'Please provide a phone number.',
    };
  }

  /**
   * Send email
   */
  private async sendEmail(input: string): Promise<CommandResult> {
    // Extract email
    const emailMatch = input.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const subjectMatch = input.match(/subject:\s*(.+?)(?:\s+body:|$)/i);
    const bodyMatch = input.match(/body:\s*(.+)$/i);

    if (emailMatch) {
      let url = `mailto:${emailMatch[1]}`;
      const params: string[] = [];
      
      if (subjectMatch) params.push(`subject=${encodeURIComponent(subjectMatch[1])}`);
      if (bodyMatch) params.push(`body=${encodeURIComponent(bodyMatch[1])}`);
      
      if (params.length > 0) url += '?' + params.join('&');

      try {
        await Linking.openURL(url);
        return {
          success: true,
          action: 'email',
          message: `✅ Email draft opened to ${emailMatch[1]}!`,
        };
      } catch (error) {
        return {
          success: false,
          action: 'email',
          message: '❌ Failed to open email',
        };
      }
    }

    return {
      success: false,
      action: 'email',
      message: 'Please provide an email address.',
    };
  }

  /**
   * Handle calendar/reminder
   */
  private async handleCalendar(input: string): Promise<CommandResult> {
    try {
      await Linking.openURL('calshow:');
      return {
        success: true,
        action: 'calendar',
        message: '✅ Calendar opened! Add your event manually.',
      };
    } catch (error) {
      return {
        success: false,
        action: 'calendar',
        message: '❌ Couldn\'t open calendar',
      };
    }
  }

  /**
   * Search the web
   */
  private async searchWeb(input: string): Promise<CommandResult> {
    // Extract search query
    const queryMatch = input.match(/(?:search|google|find|lookup)\s+(?:for\s+)?(.+)/i);
    
    if (queryMatch) {
      const query = queryMatch[1].trim();
      const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      
      try {
        await Linking.openURL(url);
        return {
          success: true,
          action: 'search',
          message: `✅ Searching for "${query}"!`,
        };
      } catch (error) {
        return {
          success: false,
          action: 'search',
          message: '❌ Couldn\'t open search',
        };
      }
    }

    return {
      success: false,
      action: 'search',
      message: 'What would you like to search for?',
    };
  }

  /**
   * Navigate to location
   */
  private async navigate(input: string): Promise<CommandResult> {
    // Extract location
    const locationMatch = input.match(/(?:navigate|directions|route|go)\s+(?:to\s+)?(.+)/i);
    
    if (locationMatch) {
      const location = locationMatch[1].trim();
      const url = `maps://?q=${encodeURIComponent(location)}`;
      
      try {
        await Linking.openURL(url);
        return {
          success: true,
          action: 'navigate',
          message: `✅ Getting directions to "${location}"!`,
        };
      } catch (error) {
        return {
          success: false,
          action: 'navigate',
          message: '❌ Couldn\'t open maps',
        };
      }
    }

    return {
      success: false,
      action: 'navigate',
      message: 'Where would you like to go?',
    };
  }

  /**
   * System controls
   */
  private async systemControl(input: string): Promise<CommandResult> {
    const lower = input.toLowerCase();

    // Direct to settings for system controls
    try {
      if (lower.includes('wifi') || lower.includes('bluetooth')) {
        await Linking.openSettings();
        return {
          success: true,
          action: 'system',
          message: '✅ Opened Settings! Adjust your preferences there.',
        };
      }

      // Other system controls would need native modules
      return {
        success: false,
        action: 'system',
        message: '💡 You can adjust system settings in the Settings app. Want me to open it?',
      };
    } catch (error) {
      return {
        success: false,
        action: 'system',
        message: '❌ Couldn\'t access system controls',
      };
    }
  }

  /**
   * Quick save/bookmark
   */
  private async quickSave(input: string): Promise<CommandResult> {
    // Extract what to save
    const saveMatch = input.match(/(?:save|download|bookmark)\s+(.+)/i);
    
    if (saveMatch) {
      const content = saveMatch[1].trim();
      
      // Copy to clipboard as a quick save
      await Clipboard.setString(content);
      
      return {
        success: true,
        action: 'save',
        message: `✅ Saved "${content.substring(0, 50)}..." to clipboard! You can paste it anywhere.`,
      };
    }

    return {
      success: false,
      action: 'save',
      message: 'What would you like to save?',
    };
  }

  /**
   * Get available quick actions
   */
  getQuickActions(): QuickAction[] {
    return [
      {
        id: 'open_settings',
        name: 'Open Settings',
        icon: '⚙️',
        action: async () => {
          try {
            await Linking.openSettings();
            return {
              success: true,
              action: 'open_settings',
              message: '✅ Opened Settings!',
            };
          } catch (error) {
            return {
              success: false,
              action: 'open_settings',
              message: '❌ Couldn\'t open Settings',
            };
          }
        },
      },
      {
        id: 'open_maps',
        name: 'Open Maps',
        icon: '🗺️',
        action: async () => {
          try {
            await Linking.openURL('maps://');
            return {
              success: true,
              action: 'open_maps',
              message: '✅ Opened Maps!',
            };
          } catch (error) {
            return {
              success: false,
              action: 'open_maps',
              message: '❌ Couldn\'t open Maps',
            };
          }
        },
      },
      {
        id: 'share',
        name: 'Share',
        icon: '📤',
        action: async () => {
          try {
            await Share.share({
              message: 'Check out MOTTO - the most intelligent AI assistant!',
            });
            return {
              success: true,
              action: 'share',
              message: '✅ Share dialog opened!',
            };
          } catch (error) {
            return {
              success: false,
              action: 'share',
              message: '❌ Sharing failed',
            };
          }
        },
      },
    ];
  }

  /**
   * Format command result
   */
  formatResult(result: CommandResult): string {
    return `${result.message}\n\n${result.success ? '✨ Action completed!' : '💡 Try being more specific.'}`;
  }
}

export default CommandExecutionService.getInstance();
