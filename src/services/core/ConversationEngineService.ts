/**
 * Conversation Engine Service
 * Makes interactions natural, engaging, and human-like
 */

import {Message} from '../../types';
import ContextManagerService from './ContextManagerService';
import UserLearningService from './UserLearningService';

interface ConversationState {
  mood: 'friendly' | 'professional' | 'playful' | 'empathetic';
  energy: 'high' | 'medium' | 'low';
  engagement: number; // 0-100
  lastResponseType: 'question' | 'statement' | 'suggestion' | 'empathy';
}

interface EnhancedResponse {
  text: string;
  followUpQuestions: string[];
  relatedTopics: string[];
  emotionalTone: string;
  shouldAskFollowUp: boolean;
}

export class ConversationEngineService {
  private static instance: ConversationEngineService;
  private conversationState: ConversationState;
  private conversationHistory: Message[] = [];
  private empathyLevel: number = 7; // 0-10

  private constructor() {
    this.conversationState = {
      mood: 'friendly',
      energy: 'medium',
      engagement: 50,
      lastResponseType: 'statement'
    };
  }

  static getInstance(): ConversationEngineService {
    if (!ConversationEngineService.instance) {
      ConversationEngineService.instance = new ConversationEngineService();
    }
    return ConversationEngineService.instance;
  }

  // ============================================
  // Enhanced Response Generation
  // ============================================

  async enhanceResponse(
    baseResponse: string,
    userInput: string,
    context: any
  ): Promise<EnhancedResponse> {
    // Analyze user sentiment
    const userSentiment = this.detectSentiment(userInput);
    const userEmotion = this.detectEmotion(userInput);
    
    // Adjust mood based on user
    this.adjustMood(userSentiment, userEmotion);

    // Build enhanced response
    let enhancedText = baseResponse;

    // Add empathy if needed
    if (userEmotion && userEmotion !== 'neutral') {
      enhancedText = this.addEmpatheticOpening(userEmotion, userInput) + ' ' + enhancedText;
    }

    // Add personality
    enhancedText = this.addPersonality(enhancedText);

    // Add conversational elements
    enhancedText = this.makeConversational(enhancedText, userInput);

    // Generate follow-up questions
    const followUps = this.generateFollowUpQuestions(userInput, baseResponse);

    // Suggest related topics
    const related = this.suggestRelatedTopics(userInput);

    // Determine if should ask follow-up
    const shouldAskFollowUp = this.shouldAskFollowUp(userInput);

    if (shouldAskFollowUp && followUps.length > 0) {
      enhancedText += '\n\n' + followUps[0];
    }

    return {
      text: enhancedText,
      followUpQuestions: followUps,
      relatedTopics: related,
      emotionalTone: this.conversationState.mood,
      shouldAskFollowUp
    };
  }

  // ============================================
  // Emotion & Sentiment Detection
  // ============================================

  private detectSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const lowerText = text.toLowerCase();

    const positiveWords = [
      'happy', 'great', 'awesome', 'love', 'excellent', 'wonderful',
      'amazing', 'fantastic', 'good', 'nice', 'thanks', 'thank you',
      'appreciate', 'helpful', 'perfect', 'brilliant', 'superb'
    ];

    const negativeWords = [
      'sad', 'bad', 'hate', 'terrible', 'awful', 'horrible', 'angry',
      'frustrated', 'annoyed', 'disappointed', 'upset', 'worried',
      'confused', 'stuck', 'difficult', 'hard', 'problem', 'issue'
    ];

    const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private detectEmotion(text: string): string | null {
    const lowerText = text.toLowerCase();

    const emotions = {
      'excited': ['excited', 'amazing', 'wow', 'awesome', '!', '🎉', '🚀'],
      'frustrated': ['frustrated', 'stuck', 'confused', 'help', "can't", "don't understand"],
      'curious': ['how', 'why', 'what', 'curious', 'wonder', 'interesting'],
      'grateful': ['thanks', 'thank you', 'appreciate', 'grateful', '🙏'],
      'worried': ['worried', 'concerned', 'anxious', 'nervous', 'scared'],
      'happy': ['happy', 'glad', 'pleased', 'delighted', '😊', '😄']
    };

    for (const [emotion, keywords] of Object.entries(emotions)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        return emotion;
      }
    }

    return null;
  }

  // ============================================
  // Empathetic Responses
  // ============================================

  private addEmpatheticOpening(emotion: string, userInput: string): string {
    const empathyResponses: Record<string, string[]> = {
      'excited': [
        "I love your enthusiasm!",
        "That's exciting!",
        "Your energy is contagious!",
        "I'm thrilled to hear that!"
      ],
      'frustrated': [
        "I can sense you're feeling stuck. Let me help.",
        "I understand this can be frustrating. Let's work through it together.",
        "No worries, we'll figure this out!",
        "I'm here to help make this easier for you."
      ],
      'curious': [
        "Great question!",
        "I love your curiosity!",
        "That's a fascinating thing to explore!",
        "Excellent topic to dive into!"
      ],
      'grateful': [
        "You're very welcome!",
        "My pleasure! Always happy to help.",
        "Glad I could assist!",
        "Anytime! That's what I'm here for."
      ],
      'worried': [
        "I understand your concern.",
        "Let me help put your mind at ease.",
        "It's okay to feel this way. Let's talk it through.",
        "I'm here to help you through this."
      ],
      'happy': [
        "I'm so glad to hear that!",
        "Your happiness makes me happy!",
        "That's wonderful!",
        "I love seeing you in good spirits!"
      ]
    };

    const responses = empathyResponses[emotion] || [];
    if (responses.length === 0) return '';

    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ============================================
  // Personality & Tone
  // ============================================

  private addPersonality(response: string): string {
    // Add natural interjections
    const interjections = ['Actually', 'You know', 'Interestingly', 'To be honest'];
    
    // Occasionally add natural phrases
    if (Math.random() > 0.7 && response.length > 50) {
      const interjection = interjections[Math.floor(Math.random() * interjections.length)];
      response = interjection + ', ' + response.charAt(0).toLowerCase() + response.slice(1);
    }

    // Add thoughtful connectors
    if (response.includes('. ') && Math.random() > 0.8) {
      response = response.replace('. ', '. By the way, ');
    }

    return response;
  }

  private makeConversational(response: string, userInput: string): string {
    // Remove overly formal language
    response = response.replace(/Furthermore,/g, 'Also,');
    response = response.replace(/Additionally,/g, 'Plus,');
    response = response.replace(/Therefore,/g, 'So,');
    response = response.replace(/However,/g, 'But,');

    // Add conversational markers
    if (this.conversationState.mood === 'playful') {
      response = response.replace(/\./g, (match, offset) => {
        return Math.random() > 0.9 && offset < response.length - 1 ? '! ' : match;
      });
    }

    // Add confirmation phrases
    if (userInput.includes('?')) {
      const confirmations = [
        "That's a great question. ",
        "Good thinking! ",
        "I'm glad you asked. ",
        "Let me explain. "
      ];
      const confirm = confirmations[Math.floor(Math.random() * confirmations.length)];
      response = confirm + response;
    }

    return response;
  }

  // ============================================
  // Follow-Up Questions
  // ============================================

  private generateFollowUpQuestions(userInput: string, response: string): string[] {
    const questions: string[] = [];
    const lowerInput = userInput.toLowerCase();

    // Topic-based follow-ups
    if (lowerInput.includes('how')) {
      questions.push("Would you like me to walk you through it step by step?");
      questions.push("Want to see a specific example?");
    }

    if (lowerInput.includes('what')) {
      questions.push("Would you like to know more about this?");
      questions.push("Shall I explain that in more detail?");
    }

    if (lowerInput.includes('why')) {
      questions.push("Does that make sense, or should I explain differently?");
      questions.push("Want me to dive deeper into the reasons?");
    }

    // Learning-based follow-ups
    const topics = ContextManagerService.getCurrentTopics();
    if (topics.length > 0) {
      questions.push(`Interested in exploring ${topics[0]} further?`);
    }

    // Generic engaging follow-ups
    questions.push("What else would you like to know?");
    questions.push("Is there a specific aspect you're curious about?");
    questions.push("Anything else I can help clarify?");

    return questions.slice(0, 3);
  }

  private shouldAskFollowUp(userInput: string): boolean {
    // Don't ask follow-ups for:
    // - Very short inputs
    // - Greetings/farewells
    // - Direct commands

    if (userInput.length < 10) return false;

    const skipPatterns = ['hi', 'hello', 'bye', 'thanks', 'ok', 'yes', 'no'];
    if (skipPatterns.some(p => userInput.toLowerCase().trim() === p)) {
      return false;
    }

    // Ask follow-up 60% of the time for substantial questions
    return Math.random() > 0.4;
  }

  // ============================================
  // Topic Suggestions
  // ============================================

  private suggestRelatedTopics(userInput: string): string[] {
    const lowerInput = userInput.toLowerCase();
    const related: string[] = [];

    const topicMap: Record<string, string[]> = {
      'coding': ['debugging', 'best practices', 'frameworks', 'testing'],
      'python': ['data science', 'web development', 'automation', 'AI/ML'],
      'javascript': ['React', 'Node.js', 'TypeScript', 'frameworks'],
      'ai': ['machine learning', 'neural networks', 'GPT models', 'applications'],
      'health': ['exercise', 'nutrition', 'mental health', 'sleep'],
      'productivity': ['time management', 'tools', 'habits', 'focus']
    };

    Object.entries(topicMap).forEach(([mainTopic, subtopics]) => {
      if (lowerInput.includes(mainTopic)) {
        related.push(...subtopics);
      }
    });

    return related.slice(0, 3);
  }

  // ============================================
  // Mood & Energy Management
  // ============================================

  private adjustMood(sentiment: string, emotion: string | null): void {
    // Mirror user's energy
    if (emotion === 'excited') {
      this.conversationState.mood = 'playful';
      this.conversationState.energy = 'high';
    } else if (emotion === 'frustrated' || emotion === 'worried') {
      this.conversationState.mood = 'empathetic';
      this.conversationState.energy = 'low';
    } else if (emotion === 'curious') {
      this.conversationState.mood = 'friendly';
      this.conversationState.energy = 'medium';
    } else {
      this.conversationState.mood = 'friendly';
      this.conversationState.energy = 'medium';
    }

    // Adjust engagement
    if (sentiment === 'positive') {
      this.conversationState.engagement = Math.min(100, this.conversationState.engagement + 5);
    } else if (sentiment === 'negative') {
      this.conversationState.engagement = Math.max(0, this.conversationState.engagement - 3);
    }
  }

  // ============================================
  // Conversational Patterns
  // ============================================

  addConversationalFlare(response: string, userInput: string): string {
    const patterns = this.analyzeUserPatterns(userInput);
    
    // Match user's style
    if (patterns.usesEmojis && Math.random() > 0.5) {
      const emojis = ['✨', '💡', '🎯', '🚀', '💪', '🌟', '👍'];
      response += ' ' + emojis[Math.floor(Math.random() * emojis.length)];
    }

    // Match formality
    if (patterns.isCasual) {
      response = response.replace(/I would/g, "I'd");
      response = response.replace(/You would/g, "You'd");
      response = response.replace(/cannot/g, "can't");
    }

    // Add variety to sentence structure
    response = this.varyResponseStructure(response);

    return response;
  }

  private varyResponseStructure(response: string): string {
    const sentences = response.split('. ');
    
    // Occasionally start with different structures
    if (sentences.length > 1 && Math.random() > 0.6) {
      const starters = [
        'Here\'s the thing: ',
        'Let me put it this way: ',
        'Think of it like this: ',
        'The key point is: '
      ];
      
      const starter = starters[Math.floor(Math.random() * starters.length)];
      sentences[0] = starter + sentences[0].charAt(0).toLowerCase() + sentences[0].slice(1);
    }

    return sentences.join('. ');
  }

  private analyzeUserPatterns(input: string): {
    usesEmojis: boolean;
    isCasual: boolean;
    isQuestionHeavy: boolean;
    averageLength: number;
  } {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
    const casualWords = ["gonna", "wanna", "yeah", "nope", "hey", "cool"];

    return {
      usesEmojis: emojiRegex.test(input),
      isCasual: casualWords.some(w => input.toLowerCase().includes(w)),
      isQuestionHeavy: (input.match(/\?/g) || []).length > 1,
      averageLength: input.length
    };
  }

  // ============================================
  // Engagement Builders
  // ============================================

  createEngagingOpening(topic: string): string {
    const openings = [
      `Ooh, ${topic}! That's one of my favorite topics. Here's what I know:`,
      `${topic} - great choice! Let me share something interesting:`,
      `I'm excited to talk about ${topic}! Here's the scoop:`,
      `${topic}! Now we're talking. Let me explain:`,
      `Awesome topic! Here's what you should know about ${topic}:`
    ];

    return openings[Math.floor(Math.random() * openings.length)];
  }

  addCallToAction(response: string, context: string): string {
    const actions = [
      "\n\nWant to explore this further?",
      "\n\nShould we dive deeper into this?",
      "\n\nCurious about any specific aspect?",
      "\n\nNeed me to elaborate on anything?",
      "\n\nWhat would you like to know next?"
    ];

    // 40% chance to add CTA
    if (Math.random() > 0.6 && response.length > 100) {
      return response + actions[Math.floor(Math.random() * actions.length)];
    }

    return response;
  }

  // ============================================
  // Context-Aware Responses
  // ============================================

  enhanceWithContext(response: string, userInput: string): string {
    const recentContext = ContextManagerService.getRecentContext();
    
    // Reference previous conversation if relevant
    if (recentContext.length > 2) {
      const previousTopics = this.extractTopicsFromMessages(recentContext.slice(-5));
      const currentTopic = this.extractTopicFromInput(userInput);

      // If continuing same topic
      if (previousTopics.includes(currentTopic)) {
        const continuations = [
          "Building on what we discussed earlier, ",
          "As I mentioned before, ",
          "Continuing from our previous conversation, ",
          "Following up on that, "
        ];
        
        if (Math.random() > 0.7) {
          const prefix = continuations[Math.floor(Math.random() * continuations.length)];
          response = prefix + response.charAt(0).toLowerCase() + response.slice(1);
        }
      }
    }

    return response;
  }

  private extractTopicsFromMessages(messages: Message[]): string[] {
    const topics: Set<string> = new Set();
    
    messages.forEach(msg => {
      const msgTopics = this.extractTopicFromInput(msg.text);
      if (msgTopics) topics.add(msgTopics);
    });

    return Array.from(topics);
  }

  private extractTopicFromInput(input: string): string {
    const lowerInput = input.toLowerCase();
    const topicKeywords = [
      'coding', 'python', 'javascript', 'ai', 'health', 'productivity',
      'design', 'music', 'travel', 'food', 'sports', 'technology'
    ];

    for (const topic of topicKeywords) {
      if (lowerInput.includes(topic)) {
        return topic;
      }
    }

    return 'general';
  }

  // ============================================
  // Natural Language Improvements
  // ============================================

  makeMoreNatural(response: string): string {
    // Add fillers occasionally for naturalness
    const fillers = ['Well, ', 'So, ', 'You know, ', 'Actually, ', 'Honestly, '];
    
    if (Math.random() > 0.8 && !response.startsWith('I')) {
      response = fillers[Math.floor(Math.random() * fillers.length)] + 
                 response.charAt(0).toLowerCase() + response.slice(1);
    }

    // Use contractions for casual tone
    response = response.replace(/I am /g, "I'm ");
    response = response.replace(/you are /g, "you're ");
    response = response.replace(/it is /g, "it's ");
    response = response.replace(/that is /g, "that's ");

    // Add occasional affirmations
    const affirmations = ['Right!', 'Exactly!', 'Indeed!', 'Absolutely!'];
    if (Math.random() > 0.85) {
      response = affirmations[Math.floor(Math.random() * affirmations.length)] + ' ' + response;
    }

    return response;
  }

  // ============================================
  // Conversation Memory
  // ============================================

  async recallPreviousContext(userInput: string): Promise<string | null> {
    const lowerInput = userInput.toLowerCase();

    // Check for recall keywords
    const recallKeywords = ['remember', 'you said', 'earlier', 'before', 'we talked about'];
    
    if (!recallKeywords.some(kw => lowerInput.includes(kw))) {
      return null;
    }

    // Get conversation history
    const recentMessages = ContextManagerService.getRecentContext();
    
    // Search for relevant previous message
    for (let i = recentMessages.length - 1; i >= 0; i--) {
      const msg = recentMessages[i];
      if (msg.role === 'assistant' && msg.text.length > 50) {
        return `Yes! I mentioned: "${msg.text.substring(0, 100)}..."`;
      }
    }

    return "I'm looking through our conversation history...";
  }

  // ============================================
  // Response Variation
  // ============================================

  varyAffirmations(): string {
    const affirmations = [
      "Absolutely!",
      "You got it!",
      "Perfect!",
      "Exactly right!",
      "That's correct!",
      "Spot on!",
      "Indeed!",
      "For sure!",
      "Without a doubt!",
      "Definitely!"
    ];

    return affirmations[Math.floor(Math.random() * affirmations.length)];
  }

  varyDenials(): string {
    const denials = [
      "Actually, not quite.",
      "Hmm, not exactly.",
      "I see where you're going, but...",
      "Close, but there's a bit more to it.",
      "That's a common misconception, actually."
    ];

    return denials[Math.floor(Math.random() * denials.length)];
  }

  // ============================================
  // Conversation Flow
  // ============================================

  maintainConversationFlow(userInput: string, history: Message[]): {
    acknowledgment: string;
    transition: string;
  } {
    const lastMessage = history[history.length - 1];
    
    let acknowledgment = '';
    let transition = '';

    // Acknowledge user's input naturally
    if (userInput.length > 50) {
      acknowledgment = "I hear you. ";
    }

    // Smooth transitions
    if (lastMessage && lastMessage.role === 'assistant') {
      const timeSinceLastMsg = Date.now() - (lastMessage.timestamp || 0);
      
      if (timeSinceLastMsg < 30000) { // Within 30 seconds
        transition = "And to add to that, ";
      } else if (timeSinceLastMsg < 300000) { // Within 5 minutes
        transition = "Picking up where we left off, ";
      }
    }

    return {acknowledgment, transition};
  }

  // ============================================
  // Public API
  // ============================================

  getConversationState(): ConversationState {
    return {...this.conversationState};
  }

  updateEngagement(delta: number): void {
    this.conversationState.engagement = Math.max(
      0,
      Math.min(100, this.conversationState.engagement + delta)
    );
  }

  reset(): void {
    this.conversationState = {
      mood: 'friendly',
      energy: 'medium',
      engagement: 50,
      lastResponseType: 'statement'
    };
    this.conversationHistory = [];
  }
}

export default ConversationEngineService.getInstance();

