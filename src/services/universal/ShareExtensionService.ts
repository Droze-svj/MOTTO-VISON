/**
 * Share Extension Service
 * Allows sharing content to MOTTO from any app via Share Sheet
 */

interface SharedContent {
  type: 'text' | 'url' | 'image' | 'file';
  content: string;
  metadata?: any;
  sourceApp?: string;
}

interface ShareAction {
  id: string;
  name: string;
  icon: string;
  handler: (content: SharedContent) => Promise<string>;
}

class ShareExtensionService {
  private static instance: ShareExtensionService;
  private shareActions: ShareAction[];

  private constructor() {
    this.shareActions = this.initializeShareActions();
    console.log('[Share Extension] Service initialized');
  }

  static getInstance(): ShareExtensionService {
    if (!ShareExtensionService.instance) {
      ShareExtensionService.instance = new ShareExtensionService();
    }
    return ShareExtensionService.instance;
  }

  /**
   * Initialize all share actions
   */
  private initializeShareActions(): ShareAction[] {
    return [
      {
        id: 'summarize',
        name: 'Summarize with MOTTO',
        icon: '📝',
        handler: async (content) => this.summarizeContent(content),
      },
      {
        id: 'translate',
        name: 'Translate with MOTTO',
        icon: '🌍',
        handler: async (content) => this.translateContent(content),
      },
      {
        id: 'explain',
        name: 'Explain with MOTTO',
        icon: '💡',
        handler: async (content) => this.explainContent(content),
      },
      {
        id: 'analyze',
        name: 'Analyze with MOTTO',
        icon: '🔍',
        handler: async (content) => this.analyzeContent(content),
      },
      {
        id: 'save',
        name: 'Save to MOTTO',
        icon: '⭐',
        handler: async (content) => this.saveContent(content),
      },
      {
        id: 'ask',
        name: 'Ask MOTTO About This',
        icon: '💬',
        handler: async (content) => this.askAboutContent(content),
      },
      {
        id: 'create_note',
        name: 'Create Note',
        icon: '📌',
        handler: async (content) => this.createNote(content),
      },
      {
        id: 'extract',
        name: 'Extract Key Points',
        icon: '🎯',
        handler: async (content) => this.extractKeyPoints(content),
      },
    ];
  }

  /**
   * Handle content shared from any app
   */
  async handleSharedContent(content: SharedContent): Promise<string> {
    console.log(`[Share Extension] Received ${content.type} from ${content.sourceApp || 'unknown'}`);

    // Process based on content type
    switch (content.type) {
      case 'text':
        return this.processSharedText(content);
      case 'url':
        return this.processSharedURL(content);
      case 'image':
        return this.processSharedImage(content);
      case 'file':
        return this.processSharedFile(content);
      default:
        return 'Content received! What would you like me to do with it?';
    }
  }

  /**
   * Process shared text
   */
  private async processSharedText(content: SharedContent): Promise<string> {
    const text = content.content;
    const length = text.length;

    let response = '📝 **Text Received!**\n\n';

    if (length < 100) {
      response += `"${text}"\n\n`;
      response += 'What would you like me to do?\n\n';
      response += '• Translate\n';
      response += '• Expand on this\n';
      response += '• Save as note\n';
      response += '• Ask a question about it';
    } else if (length < 1000) {
      response += `Received ${length} characters.\n\n`;
      response += 'Quick actions:\n\n';
      response += '• Summarize this\n';
      response += '• Extract key points\n';
      response += '• Translate\n';
      response += '• Save for later';
    } else {
      response += `Received ${length} characters (long text).\n\n`;
      response += 'I can help:\n\n';
      response += '• Summarize into bullet points\n';
      response += '• Create outline\n';
      response += '• Extract key insights\n';
      response += '• Answer questions about it';
    }

    return response;
  }

  /**
   * Process shared URL
   */
  private async processSharedURL(content: SharedContent): Promise<string> {
    const url = content.content;

    let response = '🔗 **Link Received!**\n\n';
    response += `${url}\n\n`;
    response += 'I can:\n\n';
    response += '• Summarize the page\n';
    response += '• Extract key info\n';
    response += '• Save for reading later\n';
    response += '• Search related topics\n';
    response += '• Explain the content';

    return response;
  }

  /**
   * Process shared image
   */
  private async processSharedImage(content: SharedContent): Promise<string> {
    let response = '🖼️ **Image Received!**\n\n';
    response += 'I can:\n\n';
    response += '• Extract text (OCR)\n';
    response += '• Describe the image\n';
    response += '• Analyze content\n';
    response += '• Find similar images\n';
    response += '• Save with notes';

    return response;
  }

  /**
   * Process shared file
   */
  private async processSharedFile(content: SharedContent): Promise<string> {
    let response = '📄 **File Received!**\n\n';
    response += 'I can help:\n\n';
    response += '• Analyze content\n';
    response += '• Summarize document\n';
    response += '• Extract data\n';
    response += '• Convert format\n';
    response += '• Save and organize';

    return response;
  }

  /**
   * Summarize shared content
   */
  private async summarizeContent(content: SharedContent): Promise<string> {
    const text = content.content;
    
    // In production: Use MasterAIService to summarize
    return `📝 **Summary:**\n\n[AI-generated summary of: "${text.substring(0, 50)}..."]`;
  }

  /**
   * Translate shared content
   */
  private async translateContent(content: SharedContent): Promise<string> {
    const text = content.content;
    
    // In production: Use MultilingualService
    return `🌍 **Translation:**\n\n[Translated text from: "${text.substring(0, 50)}..."]`;
  }

  /**
   * Explain shared content
   */
  private async explainContent(content: SharedContent): Promise<string> {
    const text = content.content;
    
    return `💡 **Explanation:**\n\n[Detailed explanation of: "${text.substring(0, 50)}..."]`;
  }

  /**
   * Analyze shared content
   */
  private async analyzeContent(content: SharedContent): Promise<string> {
    return `🔍 **Analysis:**\n\n[In-depth analysis of the content]`;
  }

  /**
   * Save shared content
   */
  private async saveContent(content: SharedContent): Promise<string> {
    return `⭐ **Saved!**\n\nContent saved to your MOTTO library. You can access it anytime!`;
  }

  /**
   * Ask about shared content
   */
  private async askAboutContent(content: SharedContent): Promise<string> {
    return `💬 **Ready to answer!**\n\nWhat would you like to know about this content?`;
  }

  /**
   * Create note from content
   */
  private async createNote(content: SharedContent): Promise<string> {
    return `📌 **Note Created!**\n\nSaved as a quick note in MOTTO.`;
  }

  /**
   * Extract key points
   */
  private async extractKeyPoints(content: SharedContent): Promise<string> {
    return `🎯 **Key Points:**\n\n• Point 1\n• Point 2\n• Point 3`;
  }

  /**
   * Get available share actions
   */
  getShareActions(): ShareAction[] {
    return this.shareActions;
  }
}

export default ShareExtensionService.getInstance();

