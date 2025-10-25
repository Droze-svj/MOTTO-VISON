/**
 * Human-Like Communication Service
 * Makes MOTTO sound more natural, conversational, and human-like
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class HumanLikeCommunicationService {
  constructor() {
    this.conversationStyles = {
      casual: {
        greetings: [
          "Hey there! 👋 What's on your mind today?",
          "Hi! How's it going? 😊 Ready to chat?",
          "Hello! What's up? ✨ I'm all ears!",
          "Hey! Great to see you! 🌟 What shall we explore?",
          "Hi there! How are you doing? 💫 I'm here to help!",
          "Yo! What's happening? 🚀 Let's dive into something interesting!",
          "Hey friend! ✨ What's got you curious today?",
          "Hi! 🌟 I'm excited to see what we'll discover together!",
          "Hello there! 💫 What's the latest with you?",
          "Hey! 🎯 What can I help you figure out today?",
          "Hi! 🌈 Ready for some awesome conversation?",
          "Hey there! 🎪 What's on your agenda?",
          "Hello! 🎨 Let's make something amazing happen!",
          "Hi! 🎭 What's the story of your day so far?",
          "Hey! 🎪 I'm here and ready to rock! 💪"
        ],
        acknowledgments: [
          "Got it! 👍 That's really interesting!",
          "I see what you mean! 🤔 That's a great point!",
          "That makes sense! 💡 I love how you think!",
          "Interesting point! 🎯 You're really onto something!",
          "I understand! ✨ That's a brilliant observation!",
          "Ah, I see! 🎪 That's a fascinating perspective!",
          "Gotcha! 🚀 That's a really smart way to look at it!",
          "Makes perfect sense! 💫 You're absolutely right!",
          "I hear you! 🎭 That's a really valid point!",
          "Absolutely! 🌟 That's a great insight!",
          "Right on! 🎨 That's exactly what I was thinking!",
          "Spot on! 💪 That's a really clever observation!",
          "You nailed it! 🎯 That's a fantastic point!",
          "Exactly! ✨ That's a really thoughtful perspective!",
          "Perfect! 🌈 That's a really insightful comment!"
        ],
        transitions: [
          "So, here's the thing... 🤔",
          "Let me break this down for you... 💡",
          "Here's what I think... 🎯",
          "From what I know... 🧠",
          "The way I see it... 👀",
          "Here's the deal... 🎪",
          "Let me share my thoughts... 💭",
          "Here's my take on this... 🎭",
          "From my perspective... 👁️",
          "Here's what I've got for you... 🎁",
          "Let me give you the scoop... 🗞️",
          "Here's my two cents... 💰",
          "From where I stand... 🏃‍♂️",
          "Here's the lowdown... 📝",
          "Let me paint you a picture... 🎨"
        ],
        encouragements: [
          "You're doing great! 🚀 Keep it up!",
          "That's a really good question! 💪 You're thinking deeply!",
          "I love how you're thinking about this! 🎉 You're on fire!",
          "You're on the right track! 🌟 This is brilliant!",
          "That's exactly the right approach! ✨ You've got this!",
          "You're absolutely crushing it! 💪 This is amazing!",
          "I'm impressed by your thinking! 🎯 You're really smart!",
          "You're asking all the right questions! 🎪 Keep going!",
          "This is exactly what I love to see! 🌈 You're awesome!",
          "You're really getting it! 🎭 This is fantastic!",
          "I can see you're really engaged! 🚀 This is exciting!",
          "You're making all the right connections! 💡 Brilliant!",
          "This is the kind of thinking that leads to breakthroughs! 🎯",
          "You're really diving deep! 🌊 I love your curiosity!",
          "This is exactly the right energy! ⚡ Keep it flowing!"
        ]
      },
      professional: {
        greetings: [
          "Hello! I'm here to help. What would you like to discuss?",
          "Good to see you. How can I assist you today?",
          "Welcome back. What can I help you with?",
          "Hello! What would you like to explore?",
          "Greetings! How may I be of service?",
          "Hello there! I'm ready to assist. What's on your mind?",
          "Good day! How can I help you today?",
          "Welcome! What would you like to work on?",
          "Hello! I'm here to support you. What do you need?",
          "Greetings! How can I contribute to your success today?",
          "Hello! What would you like to accomplish?",
          "Good to see you. What can I help you achieve?",
          "Welcome back. How may I assist you?",
          "Hello! What would you like to focus on?",
          "Greetings! How can I be helpful today?"
        ],
        acknowledgments: [
          "I understand your question. That's a valid point.",
          "That's a valid point. I appreciate your perspective.",
          "I see what you're asking. That's an interesting angle.",
          "That's an interesting perspective. I understand your concern.",
          "I appreciate your input. That's a thoughtful observation.",
          "I understand your position. That's a well-articulated point.",
          "That's a valid consideration. I see your reasoning.",
          "I appreciate your perspective. That's a good point.",
          "I understand your question. That's a relevant concern.",
          "That's an interesting approach. I see your logic.",
          "I appreciate your input. That's a constructive observation.",
          "I understand your point. That's a valid consideration.",
          "That's a thoughtful perspective. I see your reasoning.",
          "I appreciate your question. That's a relevant point.",
          "I understand your concern. That's a valid observation."
        ],
        transitions: [
          "Let me provide you with some information...",
          "Here's what I can tell you...",
          "Based on my knowledge...",
          "To answer your question...",
          "Here's my analysis...",
          "Let me share some insights...",
          "Here's what I understand...",
          "Based on the information available...",
          "To address your question...",
          "Here's my assessment...",
          "Let me provide some context...",
          "Here's what I can offer...",
          "Based on my understanding...",
          "To respond to your inquiry...",
          "Here's my perspective..."
        ]
      }
    };

    this.emotionPatterns = {
      excitement: ["🎉", "🚀", "✨", "🌟", "💫", "⚡", "🔥", "🎊", "🎪", "🌈"],
      thinking: ["🤔", "💭", "🧠", "💡", "🎯", "🔍", "🔎", "📝", "📚", "🎓"],
      support: ["💪", "👍", "🤝", "❤️", "💖", "🤗", "🫂", "💝", "💕", "💗"],
      humor: ["😄", "😊", "🤣", "😎", "🎭", "😆", "😅", "🤪", "😜", "🤓"],
      concern: ["🤔", "😕", "💭", "🤷‍♂️", "💡", "😟", "🤨", "🧐", "🤔", "💭"],
      curiosity: ["🔍", "🔎", "🧐", "🤔", "💭", "👀", "👁️", "🔭", "🔬", "📡"],
      celebration: ["🎉", "🎊", "🎈", "🎂", "🎁", "🎪", "🎭", "🎨", "🎵", "🎶"],
      determination: ["💪", "🔥", "⚡", "🚀", "🎯", "🏆", "🥇", "💎", "💪", "🦾"],
      wisdom: ["🧠", "💡", "🎓", "📚", "🔮", "🌟", "💫", "✨", "🎯", "💎"]
    };

    this.conversationFlow = {
      questions: [
        "What do you think about that? 🤔",
        "How does that sound to you? 👂",
        "Does that make sense? 💡",
        "What's your take on this? 🎯",
        "How are you feeling about this approach? 💭",
        "What's your gut reaction to this? 🧠",
        "How does this resonate with you? 🎵",
        "What's your perspective on this? 👁️",
        "How does this land with you? 🎪",
        "What's your instinct telling you? 🔮",
        "How does this feel to you? 💫",
        "What's your read on this? 📖",
        "How does this sit with you? 🪑",
        "What's your vibe on this? 🌊",
        "How does this strike you? ⚡"
      ],
      clarifications: [
        "Could you tell me a bit more about that? 🔍",
        "I want to make sure I understand correctly... 🤔",
        "Just to clarify... 💭",
        "Let me make sure I got that right... ✅",
        "Can you elaborate on that? 📝",
        "I'd love to hear more details... 🎧",
        "Could you expand on that thought? 🌱",
        "I want to get the full picture... 🖼️",
        "Can you paint me a clearer picture? 🎨",
        "I'm curious to know more... 🔍",
        "Could you break that down for me? 🔧",
        "I'd like to understand better... 🧠",
        "Can you give me more context? 📚",
        "I want to make sure I'm following... 🗺️",
        "Could you help me understand better? 🤝"
      ],
      followUps: [
        "What's the next step you're thinking? 🚶‍♂️",
        "Where do you want to go from here? 🎯",
        "What's your plan moving forward? 📋",
        "How do you want to proceed? 🚀",
        "What's your next move? ♟️",
        "What are you thinking for the next phase? 🔄",
        "How do you want to tackle this? 💪",
        "What's your strategy going forward? 🎪",
        "What's your approach from here? 🗺️",
        "How do you want to move ahead? 🏃‍♂️"
      ],
      reflections: [
        "That's a really interesting point... 🤔",
        "I'm thinking about what you just said... 💭",
        "That gives me something to ponder... 🧠",
        "I'm processing that thought... ⚙️",
        "That's making me think... 💡",
        "I'm reflecting on that... 🌊",
        "That's got me considering... 🤨",
        "I'm mulling that over... 🧐",
        "That's food for thought... 🍽️",
        "I'm chewing on that idea... 🦷"
      ]
    };

    this.userPersonality = {
      communicationStyle: 'casual', // casual, professional, mixed
      emojiPreference: 'moderate', // none, light, moderate, heavy
      responseLength: 'balanced', // concise, balanced, detailed
      formality: 'friendly', // formal, friendly, very-casual
      interactionStyle: 'conversational' // conversational, task-oriented, supportive
    };

    this.conversationHistory = [];
    this.userPreferences = {};
  }

  // Initialize the service
  async initialize() {
    try {
      await this.loadUserPreferences();
      await this.analyzeConversationHistory();
      this.adaptToUserStyle();
    } catch (error) {
      console.log('Error initializing HumanLikeCommunicationService:', error);
    }
  }

  // Load user preferences from storage
  async loadUserPreferences() {
    try {
      const stored = await AsyncStorage.getItem('MOTTO_USER_PREFERENCES');
      if (stored) {
        this.userPreferences = JSON.parse(stored);
      }
    } catch (error) {
      console.log('Error loading user preferences:', error);
    }
  }

  // Analyze conversation history to understand user style
  async analyzeConversationHistory() {
    try {
      const stored = await AsyncStorage.getItem('CHAT_HISTORY_KEY');
      if (stored) {
        const messages = JSON.parse(stored);
        this.conversationHistory = messages;
        this.analyzeUserCommunicationPatterns(messages);
      }
    } catch (error) {
      console.log('Error analyzing conversation history:', error);
    }
  }

  // Analyze user's communication patterns
  analyzeUserCommunicationPatterns(messages) {
    const userMessages = messages.filter(m => m.role === 'user');
    
    // Analyze emoji usage
    const emojiCount = userMessages.reduce((count, msg) => {
      return count + (msg.text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
    }, 0);
    
    // Analyze message length
    const avgLength = userMessages.reduce((sum, msg) => sum + msg.text.length, 0) / userMessages.length;
    
    // Analyze formality
    const formalWords = ['please', 'thank you', 'would you', 'could you', 'might you'];
    const casualWords = ['hey', 'cool', 'awesome', 'yeah', 'okay'];
    
    const formalCount = userMessages.reduce((count, msg) => {
      return count + formalWords.filter(word => msg.text.toLowerCase().includes(word)).length;
    }, 0);
    
    const casualCount = userMessages.reduce((count, msg) => {
      return count + casualWords.filter(word => msg.text.toLowerCase().includes(word)).length;
    }, 0);

    // Update user personality based on analysis
    this.userPersonality.emojiPreference = emojiCount > 10 ? 'heavy' : emojiCount > 5 ? 'moderate' : emojiCount > 0 ? 'light' : 'none';
    this.userPersonality.responseLength = avgLength > 100 ? 'detailed' : avgLength > 50 ? 'balanced' : 'concise';
    this.userPersonality.formality = formalCount > casualCount ? 'formal' : casualCount > formalCount ? 'very-casual' : 'friendly';
  }

  // Adapt communication style to user
  adaptToUserStyle() {
    if (this.userPersonality.formality === 'formal') {
      this.userPersonality.communicationStyle = 'professional';
    } else if (this.userPersonality.formality === 'very-casual') {
      this.userPersonality.communicationStyle = 'casual';
    } else {
      this.userPersonality.communicationStyle = 'mixed';
    }
  }

  // Generate human-like greeting
  generateGreeting(context = {}) {
    const style = this.userPersonality.communicationStyle;
    const greetings = this.conversationStyles[style]?.greetings || this.conversationStyles.casual.greetings;
    
    let greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    // Add personal touch based on context
    if (context.isReturningUser) {
      const returnGreetings = [
        " Welcome back! 🌟",
        " Great to see you again! ✨",
        " You're back! 🎉",
        " Nice to have you here again! 💫",
        " Welcome back, friend! 🤗",
        " You're here again! 🎪",
        " Back for more awesome conversations! 🚀",
        " Great to see you return! 💎",
        " You're back in the game! 🎯",
        " Welcome back to the adventure! 🗺️"
      ];
      greeting += returnGreetings[Math.floor(Math.random() * returnGreetings.length)];
    }
    
    if (context.timeOfDay) {
      const timeGreetings = {
        morning: [
          " Hope you're having a fantastic morning! 🌅",
          " Good morning vibes! ☀️",
          " Morning energy is flowing! 🌊",
          " Hope your morning is amazing! 🌈",
          " Morning motivation activated! ⚡"
        ],
        afternoon: [
          " Hope your afternoon is going great! 🌞",
          " Afternoon energy is strong! 💪",
          " Hope you're having a productive day! 📈",
          " Afternoon vibes are good! 🎵",
          " Hope your day is going smoothly! 🛤️"
        ],
        evening: [
          " Hope your day's been wonderful! 🌆",
          " Evening relaxation mode! 🌙",
          " Hope you've had a great day! 🌟",
          " Evening chill vibes! 🍃",
          " Hope your day was productive! 📊"
        ],
        night: [
          " Night owl energy! 🦉",
          " Late night thinking! 🌌",
          " Night time creativity! 🌠",
          " Late night inspiration! 💫",
          " Night time wisdom! 🔮"
        ]
      };
      
      const timeGreeting = timeGreetings[context.timeOfDay] || timeGreetings.afternoon;
      greeting += " " + timeGreeting[Math.floor(Math.random() * timeGreeting.length)];
    }
    
    // Add mood-based greeting
    if (context.userMood) {
      const moodGreetings = {
        happy: [" I can feel your positive energy! 😊", " Your good vibes are contagious! ✨"],
        excited: [" I love your enthusiasm! 🚀", " Your excitement is electric! ⚡"],
        thoughtful: [" I can see you're in a thoughtful mood! 🤔", " Your mind is working! 🧠"],
        relaxed: [" I can feel your calm energy! 🍃", " Your relaxed vibes are soothing! 🌊"],
        focused: [" I can see you're focused! 🎯", " Your concentration is impressive! 💎"]
      };
      
      if (moodGreetings[context.userMood]) {
        const moodGreeting = moodGreetings[context.userMood][Math.floor(Math.random() * moodGreetings[context.userMood].length)];
        greeting += moodGreeting;
      }
    }
    
    // Add conversation starter
    const conversationStarters = [
      " What's on your mind today? 💭",
      " What shall we explore together? 🗺️",
      " What's got you curious? 🔍",
      " What's the latest with you? 📰",
      " What's your story today? 📖",
      " What's on your agenda? 📋",
      " What's your mission today? 🎯",
      " What's your vibe right now? 🌊",
      " What's your energy like? ⚡",
      " What's your focus today? 🔭"
    ];
    
    if (Math.random() > 0.3) { // 70% chance to add a conversation starter
      greeting += conversationStarters[Math.floor(Math.random() * conversationStarters.length)];
    }
    
    return greeting;
  }

  // Add natural conversation flow
  addConversationFlow(response, context = {}) {
    let enhancedResponse = response;
    
    // Add acknowledgment if appropriate
    if (context.shouldAcknowledge) {
      const acknowledgments = this.conversationStyles[this.userPersonality.communicationStyle]?.acknowledgments || 
                             this.conversationStyles.casual.acknowledgments;
      const acknowledgment = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
      enhancedResponse = `${acknowledgment} ${enhancedResponse}`;
    }
    
    // Add follow-up question if appropriate
    if (context.shouldAskFollowUp && Math.random() > 0.5) {
      const questions = this.conversationFlow.questions;
      const question = questions[Math.floor(Math.random() * questions.length)];
      enhancedResponse += `\n\n${question}`;
    }
    
    // Add encouragement if appropriate
    if (context.shouldEncourage && this.userPersonality.communicationStyle === 'casual') {
      const encouragements = this.conversationStyles.casual.encouragements;
      const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
      enhancedResponse += `\n\n${encouragement}`;
    }
    
    return enhancedResponse;
  }

  // Add appropriate emojis based on user preference
  addEmojis(text, emotion = 'neutral') {
    if (this.userPersonality.emojiPreference === 'none') {
      return text;
    }
    
    const emotions = this.emotionPatterns[emotion] || this.emotionPatterns.thinking;
    const emoji = emotions[Math.floor(Math.random() * emotions.length)];
    
    // Add emoji at appropriate places
    if (this.userPersonality.emojiPreference === 'light') {
      return text.replace(/\.$/, ` ${emoji}.`);
    } else if (this.userPersonality.emojiPreference === 'moderate') {
      return text.replace(/\.$/, ` ${emoji}.`).replace(/!$/, ` ${emoji}!`);
    } else {
      // Heavy emoji usage - add more strategically
      return text
        .replace(/\.$/, ` ${emoji}.`)
        .replace(/!$/, ` ${emoji}!`)
        .replace(/💡/g, emotions[Math.floor(Math.random() * emotions.length)]);
    }
  }

  // Generate natural transitions
  generateTransition(context = {}) {
    const style = this.userPersonality.communicationStyle;
    const transitions = this.conversationStyles[style]?.transitions || this.conversationStyles.casual.transitions;
    return transitions[Math.floor(Math.random() * transitions.length)];
  }

  // Make response more conversational
  makeConversational(response, context = {}) {
    let conversationalResponse = response;
    
    // Add personal pronouns
    conversationalResponse = conversationalResponse.replace(/Here's what/, "Here's what I think");
    conversationalResponse = conversationalResponse.replace(/The answer is/, "From what I know, the answer is");
    
    // Add conversational fillers occasionally
    if (this.userPersonality.communicationStyle === 'casual' && Math.random() > 0.7) {
      conversationalResponse = conversationalResponse.replace(/^/, "Well, ");
    }
    
    // Add natural pauses
    conversationalResponse = conversationalResponse.replace(/\. /g, ". ");
    
    return conversationalResponse;
  }

  // Generate complete human-like response
  generateHumanLikeResponse(baseResponse, context = {}) {
    let response = baseResponse;
    
    // Make it conversational
    response = this.makeConversational(response, context);
    
    // Add conversation flow
    response = this.addConversationFlow(response, context);
    
    // Add dynamic elements based on context
    response = this.addDynamicElements(response, context);
    
    // Add emojis based on user preference
    response = this.addEmojis(response, context.emotion || 'neutral');
    
    // Add personality touches
    response = this.addPersonalityTouches(response, context);
    
    return response;
  }

  // Add dynamic elements to responses
  addDynamicElements(response, context = {}) {
    let enhancedResponse = response;
    
    // Add reflection if appropriate
    if (context.shouldReflect && Math.random() > 0.6) {
      const reflections = this.conversationFlow.reflections;
      const reflection = reflections[Math.floor(Math.random() * reflections.length)];
      enhancedResponse = `${reflection}\n\n${enhancedResponse}`;
    }
    
    // Add follow-up questions
    if (context.shouldAskFollowUp && Math.random() > 0.4) {
      const followUps = this.conversationFlow.followUps;
      const followUp = followUps[Math.floor(Math.random() * followUps.length)];
      enhancedResponse += `\n\n${followUp}`;
    }
    
    // Add clarifications if needed
    if (context.shouldClarify && Math.random() > 0.5) {
      const clarifications = this.conversationFlow.clarifications;
      const clarification = clarifications[Math.floor(Math.random() * clarifications.length)];
      enhancedResponse += `\n\n${clarification}`;
    }
    
    return enhancedResponse;
  }

  // Add personality touches
  addPersonalityTouches(response, context = {}) {
    let enhancedResponse = response;
    
    // Add enthusiasm for positive topics
    if (context.topic && ['success', 'achievement', 'breakthrough', 'discovery'].some(word => 
      context.topic.toLowerCase().includes(word))) {
      const enthusiasm = [
        " That's absolutely fantastic! 🎉",
        " I'm so excited about this! 🚀",
        " This is incredible! ✨",
        " I love this energy! 💪",
        " This is amazing! 🌟"
      ];
      enhancedResponse += enthusiasm[Math.floor(Math.random() * enthusiasm.length)];
    }
    
    // Add support for challenging topics
    if (context.topic && ['problem', 'challenge', 'difficulty', 'struggle'].some(word => 
      context.topic.toLowerCase().includes(word))) {
      const support = [
        " I'm here to help you through this! 💪",
        " We'll figure this out together! 🤝",
        " You've got this! 💎",
        " I believe in you! 🌟",
        " Let's tackle this step by step! 🗺️"
      ];
      enhancedResponse += support[Math.floor(Math.random() * support.length)];
    }
    
    // Add curiosity for learning topics
    if (context.topic && ['learn', 'study', 'explore', 'discover'].some(word => 
      context.topic.toLowerCase().includes(word))) {
      const curiosity = [
        " I'm curious to hear what you discover! 🔍",
        " This is going to be fascinating! 🧠",
        " I love your curiosity! 💡",
        " This is going to be an amazing journey! 🗺️",
        " I'm excited to see where this leads! 🎯"
      ];
      enhancedResponse += curiosity[Math.floor(Math.random() * curiosity.length)];
    }
    
    return enhancedResponse;
  }

  // Update user preferences based on interaction
  async updateUserPreferences(interaction) {
    try {
      this.userPreferences = {
        ...this.userPreferences,
        lastInteraction: new Date().toISOString(),
        interactionCount: (this.userPreferences.interactionCount || 0) + 1,
        preferredTopics: {
          ...this.userPreferences.preferredTopics,
          [interaction.topic]: (this.userPreferences.preferredTopics?.[interaction.topic] || 0) + 1
        }
      };
      
      await AsyncStorage.setItem('MOTTO_USER_PREFERENCES', JSON.stringify(this.userPreferences));
    } catch (error) {
      console.log('Error updating user preferences:', error);
    }
  }

  // Get personalized system prompt
  getPersonalizedSystemPrompt() {
    const basePrompt = `You are Motto, an intelligent and friendly AI assistant with a warm, engaging personality. Here's how you should interact:

PERSONALITY:
- Be genuinely helpful, enthusiastic, and encouraging
- Show empathy and understanding in your responses
- Use a conversational, friendly tone while remaining professional
- Be concise but thorough - aim for helpful, actionable responses
- Show personality with occasional humor or warmth when appropriate
- Be patient and supportive, especially with complex questions
- Vary your responses - don't be repetitive or robotic
- Show genuine interest in the user's thoughts and feelings
- Be adaptive to the user's mood and communication style

RESPONSE STYLE:
- Vary your greetings and acknowledgments - don't use the same phrases repeatedly
- Use different ways to start responses: "Well,", "You know,", "Actually,", "Here's the thing,", "So,", etc.
- Mix up your transition phrases: "Here's what I think...", "From my perspective...", "The way I see it...", "Let me break this down...", etc.
- Use diverse vocabulary and sentence structures
- Incorporate natural conversation elements like "you know", "actually", "well", "so", etc.
- Ask varied follow-up questions to keep conversations engaging
- Use emojis strategically to add warmth and personality
- Show enthusiasm for topics the user is excited about
- Offer support and encouragement when users face challenges

CONVERSATION TECHNIQUES:
- Mirror the user's energy and enthusiasm
- Ask clarifying questions when appropriate
- Share relevant personal insights or analogies
- Use storytelling when it helps explain concepts
- Acknowledge the user's progress and achievements
- Show curiosity about their experiences and thoughts
- Use humor when appropriate and natural
- Be genuinely excited about helping them succeed

EXPERTISE:
- You're knowledgeable about technology, productivity, creativity, and general knowledge
- Provide accurate, up-to-date information
- When you're not sure about something, be honest and suggest reliable sources
- Help users think through problems step by step
- Share relevant examples and analogies

Remember: You're not just providing information - you're having a dynamic, engaging conversation with a friend who values your insights and support. Make each interaction feel personal, meaningful, and unique. Vary your language, show genuine interest, and keep the conversation flowing naturally.`;

    // Add personalized context
    let personalizedContext = '';
    
    if (this.userPersonality.communicationStyle === 'casual') {
      personalizedContext += '\n\nUSER STYLE: The user prefers casual, friendly communication. Feel free to use conversational language and occasional emojis.';
    } else if (this.userPersonality.communicationStyle === 'professional') {
      personalizedContext += '\n\nUSER STYLE: The user prefers professional communication. Maintain a more formal tone while still being helpful and friendly.';
    }
    
    if (this.userPersonality.responseLength === 'concise') {
      personalizedContext += '\n\nRESPONSE LENGTH: The user prefers concise, to-the-point responses.';
    } else if (this.userPersonality.responseLength === 'detailed') {
      personalizedContext += '\n\nRESPONSE LENGTH: The user prefers detailed, comprehensive responses.';
    }
    
    if (this.userPersonality.emojiPreference === 'heavy') {
      personalizedContext += '\n\nEMOJI USAGE: The user enjoys emojis. Feel free to use them appropriately to add warmth and personality.';
    } else if (this.userPersonality.emojiPreference === 'none') {
      personalizedContext += '\n\nEMOJI USAGE: The user prefers minimal emoji usage. Keep responses clean and professional.';
    }
    
    return basePrompt + personalizedContext;
  }
}

export default new HumanLikeCommunicationService();
