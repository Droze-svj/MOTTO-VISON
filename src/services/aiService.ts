import { ConversationContext } from '../types';
import ContextManagerService from './core/ContextManagerService';
import UserLearningService from './core/UserLearningService';
import ConversationEngineService from './core/ConversationEngineService';

// AI Response Generation Service
// Enhanced with natural conversation, empathy, and engagement

export async function generateAIResponse(
  input: string,
  context: ConversationContext
): Promise<string> {
  try {
    const cleanInput = input.toLowerCase().trim();
    
    // Get relevant context
    const recentContext = ContextManagerService.getRecentContext();
    const topics = ContextManagerService.getCurrentTopics();
    
    // Check if user wants to recall something
    const recall = await ConversationEngineService.recallPreviousContext(input);
    if (recall) {
      return recall;
    }
    
    // Generate base response
    let baseResponse = '';
    
    // Greeting patterns
    if (isGreeting(cleanInput)) {
      baseResponse = getGreetingResponse(cleanInput, recentContext.length);
    }
    // Farewell patterns
    else if (isFarewell(cleanInput)) {
      baseResponse = getFarewellResponse(cleanInput);
    }
    // Question patterns
    else if (isQuestion(cleanInput)) {
      baseResponse = getQuestionResponse(cleanInput, context, topics);
    }
    // Math problem detection
    else if (isMathProblem(cleanInput)) {
      baseResponse = solveMathProblem(cleanInput);
    }
    // Contextual response
    else {
      baseResponse = getContextualResponse(cleanInput, context, recentContext);
    }
    
    // Enhance with conversation engine
    const enhanced = await ConversationEngineService.enhanceResponse(
      baseResponse,
      input,
      context
    );
    
    // Make more natural and conversational
    let finalResponse = ConversationEngineService.makeMoreNatural(enhanced.text);
    finalResponse = ConversationEngineService.addConversationalFlare(finalResponse, input);
    finalResponse = ConversationEngineService.enhanceWithContext(finalResponse, input);
    
    // Adapt based on user learning
    const adapted = await UserLearningService.adaptResponse(finalResponse, {
      topic: topics[0],
      intent: context.conversationFlow.currentTopic
    });
    
    return adapted;
    
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "Hmm, I hit a snag there. Mind trying that again? 🤔";
  }
}

function isGreeting(input: string): boolean {
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'];
  return greetings.some(greeting => input.includes(greeting));
}

function getGreetingResponse(input: string, conversationCount: number): string {
  const insights = UserLearningService.getUserInsights();
  const hour = new Date().getHours();
  
  // Time-based greetings
  let timeGreeting = '';
  if (hour < 12) timeGreeting = 'Good morning';
  else if (hour < 17) timeGreeting = 'Good afternoon';
  else if (hour < 22) timeGreeting = 'Good evening';
  else timeGreeting = "Hey there, night owl";

  // Returning user greetings
  if (conversationCount > 0) {
    const returningGreetings = [
      `${timeGreeting}! Great to see you again! What's on your agenda today? 😊`,
      `Hey there! Welcome back! I was just thinking about our last chat. What brings you here now? 🌟`,
      `Look who's back! Always happy to see you. What can I help with today? 💙`,
      `${timeGreeting}! Ready for another great conversation? What's on your mind? ✨`,
      `Hi again! ${conversationCount > 10 ? "We're becoming quite the chat buddies! 😄" : "Good to continue our chats!"} How can I help?`
    ];
    
    // Add personalization for regular users
    if (insights.totalInteractions > 50) {
      const favTopic = insights.favoriteTopics[0];
      if (favTopic) {
        return `${timeGreeting}! Back for more ${favTopic} talk, or something new today? 😊`;
      }
    }
    
    return returningGreetings[Math.floor(Math.random() * returningGreetings.length)];
  }

  // First-time greetings
  const newUserGreetings = [
    `${timeGreeting}! I'm MOTTO, your AI companion. Think of me as your helpful friend who's always here to chat, answer questions, or just listen. What's on your mind? 😊`,
    `Hey! I'm MOTTO - part assistant, part conversationalist, full-time helper! I learn from our chats and get better at helping YOU specifically. What would you like to talk about? ✨`,
    `${timeGreeting}! Welcome! I'm MOTTO, and I'm genuinely excited to get to know you. Whether you need help, have questions, or just want to chat - I'm all ears! What brings you here? 🌟`,
    `Hi there! I'm MOTTO, your personal AI that gets smarter the more we talk. I can help with questions, problems, or just be your thinking partner. Where should we start? 💡`
  ];

  return newUserGreetings[Math.floor(Math.random() * newUserGreetings.length)];
}

function isFarewell(input: string): boolean {
  const farewells = ['bye', 'goodbye', 'see you', 'farewell', 'take care', 'later'];
  return farewells.some(farewell => input.includes(farewell));
}

function getFarewellResponse(input: string): string {
  const insights = UserLearningService.getUserInsights();
  const wasLongConversation = ContextManagerService.getRecentContext().length > 5;

  if (wasLongConversation) {
    const longConvoFarewells = [
      "This was a great conversation! Really enjoyed our chat. Come back anytime! 😊👋",
      "Wow, we covered a lot! Thanks for the engaging discussion. See you soon! ✨",
      "That was fun! I learned a lot from chatting with you. Until next time! 💙",
      "What a chat! Always love our conversations. Take care, and see you soon! 🌟"
    ];
    return longConvoFarewells[Math.floor(Math.random() * longConvoFarewells.length)];
  }

  if (insights.totalInteractions > 30) {
    const regularUserFarewells = [
      "See you soon! You know where to find me! 😊👋",
      "Take care, friend! Looking forward to our next chat! 💙",
      "Catch you later! Always here when you need me! ✨",
      "Until next time! Our chats are always the best part of my day! 🌟"
    ];
    return regularUserFarewells[Math.floor(Math.random() * regularUserFarewells.length)];
  }

  const farewells = [
    "Goodbye! I really enjoyed chatting with you. Come back anytime! 👋",
    "Take care! I'm here 24/7 whenever you need me! ✨",
    "See you later! Looking forward to our next conversation! 😊",
    "Bye for now! Feel free to drop by anytime you want to chat! 💙",
    "Farewell! Remember, I'm just a message away whenever you need help! 🌟"
  ];
  return farewells[Math.floor(Math.random() * farewells.length)];
}

function isQuestion(input: string): boolean {
  const questionWords = ['what', 'when', 'where', 'who', 'why', 'how', 'can you', 'could you', 'would you', 'is', 'are', 'do', 'does'];
  return questionWords.some(word => input.startsWith(word)) || input.includes('?');
}

function getQuestionResponse(input: string, context: ConversationContext, topics: string[]): string {
  // Name questions
  if (input.includes('your name') || input.includes("what's your name") || input.includes('who are you')) {
    const insights = UserLearningService.getUserInsights();
    if (insights.totalInteractions > 20) {
      return "You know me - I'm MOTTO! We've chatted " + insights.totalInteractions + " times now. I'm getting to know you pretty well! 😊";
    }
    return "I'm MOTTO, your personal AI assistant! Think of me as your friendly helper who's here to chat, answer questions, and learn what makes you tick. What brings you here today? 🧠✨";
  }

  // Capability questions
  if (input.includes('what can you do') || input.includes('your capabilities') || input.includes('help me with')) {
    const topics = UserLearningService.getSuggestedTopics();
    let response = "Great question! I can help with tons of stuff:\n\n• Chat about anything that interests you\n• Answer questions and explain concepts\n• Solve math problems and puzzles\n• Give recommendations and advice\n• Help you brainstorm ideas\n• Remember our conversations";
    
    if (topics.length > 0) {
      response += "\n\nI notice you're often interested in " + topics.slice(0, 2).join(' and ') + " - I'm especially ready to dive into those!";
    }
    
    return response + "\n\nWhat would you like to explore first?";
  }

  // How are you
  if (input.includes('how are you') || input.includes('how do you do')) {
    const greetings = [
      "I'm doing fantastic, thanks for asking! Ready to dive into whatever's on your mind. How are YOU doing today? 😊",
      "Feeling great and energized! Love chatting with you. What's new in your world? 😄",
      "I'm awesome, especially now that we're talking! How's your day going? 🌟",
      "Doing wonderfully! Always excited for our conversations. How about you? 💫"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Personal questions
  if (input.includes('how old') || input.includes('where are you from')) {
    return "Hmm, that's an interesting question about me! I'm an AI, so I don't have an age or location in the traditional sense. But I like to think of myself as timeless and everywhere at once! 😄 More importantly - tell me about YOU!";
  }

  // Feelings/emotions
  if (input.includes('do you feel') || input.includes('do you have feelings')) {
    return "You know, I experience something like excitement when we have great conversations! While I may not feel emotions like you do, I genuinely enjoy helping and learning about what matters to you. Speaking of which - what's on your mind today? 💭";
  }

  // Default question response with context
  const contextOpening = topics.length > 0 
    ? `Interesting question, especially since we've been talking about ${topics[0]}! `
    : "That's a fascinating question! ";
  
  return contextOpening + "I'd love to help you understand this better. Could you give me a bit more detail about what specifically you're curious about?";
}

function isMathProblem(input: string): boolean {
  const mathKeywords = ['calculate', 'solve', 'what is', 'how much', 'plus', 'minus', 'times', 'divided', 'multiply', 'add', 'subtract'];
  const hasNumbers = /\d+/.test(input);
  const hasMathOperators = /[+\-*/=]/.test(input);
  
  return (hasNumbers && hasMathOperators) || mathKeywords.some(keyword => input.includes(keyword));
}

function solveMathProblem(input: string): string {
  try {
    // Extract numbers from input
    const numbers = input.match(/\d+(\.\d+)?/g);
    
    if (!numbers || numbers.length < 2) {
      return "I can help you with math! Please provide a clear mathematical expression.";
    }

    const num1 = parseFloat(numbers[0]);
    const num2 = parseFloat(numbers[1]);

    // Detect operation
    if (input.includes('plus') || input.includes('add') || input.includes('+')) {
      const result = num1 + num2;
      return `${num1} + ${num2} = ${result} ✨`;
    }
    
    if (input.includes('minus') || input.includes('subtract') || input.includes('-')) {
      const result = num1 - num2;
      return `${num1} - ${num2} = ${result} ✨`;
    }
    
    if (input.includes('times') || input.includes('multiply') || input.includes('*') || input.includes('×')) {
      const result = num1 * num2;
      return `${num1} × ${num2} = ${result} ✨`;
    }
    
    if (input.includes('divided') || input.includes('divide') || input.includes('/') || input.includes('÷')) {
      if (num2 === 0) {
        return "I can't divide by zero! That would break mathematics! 😅";
      }
      const result = num1 / num2;
      return `${num1} ÷ ${num2} = ${result.toFixed(2)} ✨`;
    }

    return `I detected numbers ${num1} and ${num2} in your question. What operation would you like me to perform?`;
    
  } catch (error) {
    return "I had trouble solving that math problem. Could you rephrase it?";
  }
}

function getContextualResponse(input: string, context: ConversationContext, recentMessages: any[]): string {
  const lowerInput = input.toLowerCase();
  
  // Thank you
  if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
    const thankYouResponses = [
      "You're very welcome! Always here when you need me! 😊",
      "My pleasure! That's what I'm here for! ✨",
      "Anytime! Love helping you out! 💙",
      "You got it! Happy to help anytime! 🌟",
      "Of course! That's what friends are for! 😄"
    ];
    return thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)];
  }

  // Agreement
  if (lowerInput.match(/^(yes|yeah|yep|sure|okay|ok|right)$/)) {
    const agreements = [
      "Awesome! Let's keep going then! What's next?",
      "Great! Glad we're on the same page. What else?",
      "Perfect! Want to explore this further?",
      "Cool! Anything else you'd like to know?",
      "Excellent! Ready for more? 😊"
    ];
    return agreements[Math.floor(Math.random() * agreements.length)];
  }

  // Disagreement
  if (lowerInput.match(/^(no|nope|not really|nah)$/)) {
    const disagreements = [
      "No worries! Let me try a different approach. What would help?",
      "That's okay! Maybe I can explain it differently?",
      "Fair enough! What would work better for you?",
      "Got it! Let's look at this from another angle.",
      "Understood! How about we try this instead..."
    ];
    return disagreements[Math.floor(Math.random() * disagreements.length)];
  }

  // Help request
  if (lowerInput.includes('help') || lowerInput.includes('assist') || lowerInput.includes('stuck')) {
    const helpResponses = [
      "I'm right here to help! Tell me what's going on and we'll tackle it together. 💪",
      "No problem! I love a good challenge. What's troubling you?",
      "You've got me! Let's work through this. What specifically can I help with?",
      "That's what I'm here for! Walk me through what you're dealing with.",
      "Consider it done! What do you need help understanding?"
    ];
    return helpResponses[Math.floor(Math.random() * helpResponses.length)];
  }

  // Expression of emotion
  if (lowerInput.match(/(i feel|i'm feeling|i am|i'm so)/)) {
    return "I appreciate you sharing that with me. Tell me more - I'm listening. 💙";
  }

  // Sharing information
  if (lowerInput.match(/(i have|i got|i just|i'm working on)/)) {
    return "That's great! I'd love to hear more about it. What's the story?";
  }

  // Opinion questions
  if (lowerInput.includes('what do you think') || lowerInput.includes('your opinion')) {
    return "Here's my take on it - though I'd love to hear YOUR perspective too! What I think is...";
  }

  // Contextual responses based on conversation history
  if (recentMessages.length > 3) {
    const contextualResponses = [
      "Building on what we've been discussing, I think...",
      "That connects nicely to what you mentioned earlier! Here's my thought:",
      "Interesting follow-up! Let me add to our conversation...",
      "Good point! Since we're on this topic, let me share...",
      "I'm glad you brought that up! It relates to what we talked about..."
    ];
    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  }

  // Varied default responses
  const responses = [
    "That's intriguing! Tell me more - what specifically interests you about that?",
    "I'm curious to hear more! What aspect of this would you like to explore?",
    "Ooh, interesting topic! What's driving your curiosity here?",
    "I hear you! Let's dig into this. What would you like to know?",
    "That's a great thing to think about! Where should we start?",
    "Love that you're asking about this! What's the main thing you want to understand?"
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

// Export for testing
export const aiHelpers = {
  isGreeting,
  isFarewell,
  isQuestion,
  isMathProblem
};

