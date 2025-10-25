import { create } from 'zustand';
import { AppState, AppActions, Message, ConversationContext, UserProfile } from '../types';
import { generateAIResponse } from '../services/aiService';
import ContextManagerService from '../services/core/ContextManagerService';
import NotificationService from '../services/core/NotificationService';
import UserLearningService from '../services/core/UserLearningService';

const initialConversationContext: ConversationContext = {
  lastUserInput: '',
  lastInteractionTime: Date.now(),
  conversationStartTime: Date.now(),
  topicsDiscussed: [],
  conversationFlow: {
    currentTopic: '',
    previousTopics: [],
    conversationMood: 'neutral',
    interactionStyle: 'friendly',
    responseDepth: 'medium',
    followUpQuestions: [],
    sharedExperiences: []
  },
  userPreferences: {
    preferredComplexity: 'medium',
    interests: [],
    lastActiveTopics: [],
    communicationStyle: 'conversational',
    responseLength: 'balanced'
  },
  conversationHistory: [],
  contextContinuity: {
    lastResponseType: '',
    pendingFollowUps: [],
    conversationThread: []
  }
};

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // Initial State
  isConnected: false,
  messages: [],
  input: '',
  isSending: false,
  conversationContext: initialConversationContext,
  userProfile: {},
  activeCapabilities: [],
  complexityLevel: 'advanced',
  reasoningSteps: [],
  hasError: false,
  errorMessage: undefined,

  // Connection Actions
  setIsConnected: (connected: boolean) => set({ isConnected: connected }),

  // Message Actions
  setInput: (input: string) => set({ input }),
  
  addMessage: (message: Message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setMessages: (messages: Message[]) => set({ messages }),
  
  setIsSending: (sending: boolean) => set({ isSending: sending }),

  // Context Actions
  updateConversationContext: (context: Partial<ConversationContext>) => 
    set((state) => ({
      conversationContext: { ...state.conversationContext, ...context }
    })),

  updateUserProfile: (profile: Partial<UserProfile>) =>
    set((state) => ({
      userProfile: { ...state.userProfile, ...profile }
    })),

  // Capability Actions
  setActiveCapabilities: (capabilities: string[]) => 
    set({ activeCapabilities: capabilities }),
  
  setComplexityLevel: (level: 'simple' | 'medium' | 'advanced') =>
    set({ complexityLevel: level }),
  
  setReasoningSteps: (steps: string[]) =>
    set({ reasoningSteps: steps }),

  // Error Actions
  setError: (hasError: boolean, message?: string) =>
    set({ hasError, errorMessage: message }),

  // Main Actions
  sendMessage: async (text: string) => {
    const state = get();
    
    try {
      set({ isSending: true });

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        text,
        timestamp: Date.now()
      };
      
      set((state) => ({ messages: [...state.messages, userMessage] }));

      // Add to context manager
      await ContextManagerService.addMessage(userMessage);

      // Update context
      set((state) => ({
        conversationContext: {
          ...state.conversationContext,
          lastUserInput: text,
          lastInteractionTime: Date.now(),
          topicsDiscussed: [...state.conversationContext.topicsDiscussed, text]
        }
      }));

      // Generate AI response with context awareness
      const response = await generateAIResponse(text, state.conversationContext);

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: response,
        timestamp: Date.now()
      };

      set((state) => ({ messages: [...state.messages, assistantMessage] }));
      await ContextManagerService.addMessage(assistantMessage);
      set({ input: '' });

      // Smart notifications based on learning
      await sendSmartNotification(text, response, state);

    } catch (error) {
      console.error('Error sending message:', error);
      set({ 
        hasError: true, 
        errorMessage: 'Failed to send message. Please try again.' 
      });
    } finally {
      set({ isSending: false });
    }
  },

  clearMessages: () => set({ messages: [] }),

  resetApp: () => set({
    isConnected: false,
    messages: [],
    input: '',
    isSending: false,
    conversationContext: initialConversationContext,
    userProfile: {},
    activeCapabilities: [],
    complexityLevel: 'advanced',
    reasoningSteps: [],
    hasError: false,
    errorMessage: undefined
  })
}));

// Helper function for smart notifications
async function sendSmartNotification(
  userInput: string,
  botResponse: string,
  state: any
): Promise<void> {
  try {
    // Get user insights
    const insights = UserLearningService.getUserInsights();
    
    // Send notification if:
    // 1. User is highly engaged (50+ interactions)
    // 2. Response contains important info
    // 3. User isn't currently active (for reminders)
    
    if (insights.totalInteractions > 50) {
      const isImportant = botResponse.includes('important') || 
                          botResponse.includes('remember') ||
                          botResponse.length > 200;
      
      if (isImportant) {
        // Schedule a follow-up notification
        await NotificationService.scheduleLocal(
          'MOTTO Insight',
          `You asked about "${userInput.substring(0, 30)}..." - I can help you explore this further!`,
          3600 // 1 hour later
        );
      }
    }
  } catch (error) {
    console.error('Smart notification error:', error);
  }
}

