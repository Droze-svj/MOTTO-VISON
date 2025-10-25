/**
 * Message & Email Composer Service
 * Helps draft messages and emails for any situation
 */

interface MessageRequest {
  type: 'message' | 'email';
  purpose: string;
  recipient?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'formal';
  length?: 'brief' | 'normal' | 'detailed';
  context?: string;
}

interface ComposedMessage {
  subject?: string; // For emails
  body: string;
  suggestions: string[];
}

class MessageComposerService {
  private static instance: MessageComposerService;

  private constructor() {
    console.log('[Message Composer] Service initialized');
  }

  static getInstance(): MessageComposerService {
    if (!MessageComposerService.instance) {
      MessageComposerService.instance = new MessageComposerService();
    }
    return MessageComposerService.instance;
  }

  /**
   * Compose message or email
   */
  async compose(request: MessageRequest): Promise<ComposedMessage> {
    const { type, purpose, recipient, tone = 'friendly', length = 'normal', context } = request;

    console.log(`[Message Composer] Composing ${type} for: ${purpose}`);

    if (type === 'email') {
      return this.composeEmail(purpose, recipient, tone, length, context);
    } else {
      return this.composeMessage(purpose, recipient, tone, length, context);
    }
  }

  /**
   * Compose email
   */
  private async composeEmail(
    purpose: string,
    recipient?: string,
    tone: string = 'professional',
    length: string = 'normal',
    context?: string
  ): Promise<ComposedMessage> {
    const subject = this.generateEmailSubject(purpose);
    const body = this.generateEmailBody(purpose, recipient, tone, length, context);
    const suggestions = this.generateEmailSuggestions(purpose, tone);

    return { subject, body, suggestions };
  }

  /**
   * Compose message
   */
  private async composeMessage(
    purpose: string,
    recipient?: string,
    tone: string = 'friendly',
    length: string = 'normal',
    context?: string
  ): Promise<ComposedMessage> {
    const body = this.generateMessageBody(purpose, recipient, tone, length, context);
    const suggestions = this.generateMessageSuggestions(purpose, tone);

    return { body, suggestions };
  }

  /**
   * Generate email subject
   */
  private generateEmailSubject(purpose: string): string {
    // Smart subject generation based on purpose
    const purposeLower = purpose.toLowerCase();

    if (purposeLower.includes('thank')) {
      return 'Thank You';
    }
    if (purposeLower.includes('meeting') || purposeLower.includes('schedule')) {
      return 'Meeting Request';
    }
    if (purposeLower.includes('follow up')) {
      return 'Following Up';
    }
    if (purposeLower.includes('introduction') || purposeLower.includes('introduce')) {
      return 'Introduction';
    }
    if (purposeLower.includes('application') || purposeLower.includes('apply')) {
      return 'Application Inquiry';
    }

    // Default: capitalize first word
    const words = purpose.split(' ');
    return words.slice(0, 5).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  /**
   * Generate email body
   */
  private generateEmailBody(
    purpose: string,
    recipient?: string,
    tone: string,
    length: string,
    context?: string
  ): string {
    const greeting = this.getEmailGreeting(recipient, tone);
    const opening = this.getEmailOpening(purpose, tone);
    const body = this.getEmailMainContent(purpose, tone, length);
    const closing = this.getEmailClosing(tone);
    const signature = this.getEmailSignature(tone);

    return `${greeting}\n\n${opening}\n\n${body}\n\n${closing}\n\n${signature}`;
  }

  /**
   * Generate message body
   */
  private generateMessageBody(
    purpose: string,
    recipient?: string,
    tone: string,
    length: string,
    context?: string
  ): string {
    const greeting = this.getMessageGreeting(recipient, tone);
    const content = this.getMessageContent(purpose, tone, length);
    const closing = this.getMessageClosing(tone);

    if (length === 'brief') {
      return `${greeting} ${content}`;
    }

    return `${greeting}\n\n${content}\n\n${closing}`;
  }

  // Email templates
  private getEmailGreeting(recipient?: string, tone: string = 'professional'): string {
    if (tone === 'formal') {
      return `Dear ${recipient || 'Sir/Madam'},`;
    }
    if (tone === 'professional') {
      return `Hi ${recipient || 'there'},`;
    }
    return `Hey ${recipient || 'there'}!`;
  }

  private getEmailOpening(purpose: string, tone: string): string {
    return `I hope this email finds you well. I'm reaching out regarding ${purpose}.`;
  }

  private getEmailMainContent(purpose: string, tone: string, length: string): string {
    if (length === 'brief') {
      return `[Briefly explain your ${purpose} here]`;
    }
    return `[Explain your ${purpose} in detail. Provide relevant information, context, and any necessary details.]`;
  }

  private getEmailClosing(tone: string): string {
    const closings = {
      formal: 'I look forward to your response.',
      professional: 'Looking forward to hearing from you.',
      friendly: 'Thanks so much!',
      casual: 'Talk soon!',
    };
    return closings[tone] || closings.professional;
  }

  private getEmailSignature(tone: string): string {
    const signatures = {
      formal: 'Sincerely,\n[Your Name]',
      professional: 'Best regards,\n[Your Name]',
      friendly: 'Best,\n[Your Name]',
      casual: 'Cheers,\n[Your Name]',
    };
    return signatures[tone] || signatures.professional;
  }

  // Message templates
  private getMessageGreeting(recipient?: string, tone: string): string {
    const greetings = {
      formal: `Hello ${recipient || 'there'},`,
      professional: `Hi ${recipient || 'there'},`,
      friendly: `Hey ${recipient || 'there'}!`,
      casual: `Hey!`,
    };
    return greetings[tone] || greetings.friendly;
  }

  private getMessageContent(purpose: string, tone: string, length: string): string {
    return `[Your message about ${purpose} goes here]`;
  }

  private getMessageClosing(tone: string): string {
    const closings = {
      formal: 'Thank you.',
      professional: 'Thanks!',
      friendly: 'Thanks! 😊',
      casual: 'Thx!',
    };
    return closings[tone] || closings.friendly;
  }

  private generateEmailSuggestions(purpose: string, tone: string): string[] {
    return [
      '✓ Keep it concise and clear',
      '✓ Proofread before sending',
      '✓ Include a clear call-to-action',
      tone === 'professional' ? '✓ Use professional language' : '✓ Be friendly and approachable',
    ];
  }

  private generateMessageSuggestions(purpose: string, tone: string): string[] {
    return [
      '✓ Be clear and direct',
      '✓ Check for typos',
      tone === 'casual' ? '✓ Keep it friendly' : '✓ Maintain appropriate tone',
    ];
  }
}

export default MessageComposerService.getInstance();
