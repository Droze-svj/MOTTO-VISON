// Core application types

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp?: number;
}

export interface ConversationFlow {
  currentTopic: string;
  previousTopics: string[];
  conversationMood: 'neutral' | 'happy' | 'sad' | 'excited';
  interactionStyle: 'friendly' | 'professional' | 'casual';
  responseDepth: 'shallow' | 'medium' | 'deep';
  followUpQuestions: string[];
  sharedExperiences: string[];
}

export interface UserPreferences {
  preferredComplexity: 'simple' | 'medium' | 'advanced';
  interests: string[];
  lastActiveTopics: string[];
  communicationStyle: 'conversational' | 'formal' | 'technical';
  responseLength: 'brief' | 'balanced' | 'detailed';
}

export interface ContextContinuity {
  lastResponseType: string;
  pendingFollowUps: string[];
  conversationThread: string[];
}

export interface ConversationContext {
  lastUserInput: string;
  lastInteractionTime: number;
  conversationStartTime: number;
  topicsDiscussed: string[];
  conversationFlow: ConversationFlow;
  userPreferences: UserPreferences;
  conversationHistory: Message[];
  contextContinuity: ContextContinuity;
}

export interface UserProfile {
  id?: string;
  name?: string;
  preferences?: UserPreferences;
  [key: string]: any;
}

export interface AppState {
  // Connection
  isConnected: boolean;
  
  // Messages
  messages: Message[];
  input: string;
  isSending: boolean;
  
  // Context
  conversationContext: ConversationContext;
  userProfile: UserProfile;
  
  // Capabilities
  activeCapabilities: string[];
  complexityLevel: 'simple' | 'medium' | 'advanced';
  reasoningSteps: string[];
  
  // Error
  hasError: boolean;
  errorMessage?: string;
}

export interface AppActions {
  // Connection
  setIsConnected: (connected: boolean) => void;
  
  // Messages
  setInput: (input: string) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setIsSending: (sending: boolean) => void;
  
  // Context
  updateConversationContext: (context: Partial<ConversationContext>) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  
  // Capabilities
  setActiveCapabilities: (capabilities: string[]) => void;
  setComplexityLevel: (level: 'simple' | 'medium' | 'advanced') => void;
  setReasoningSteps: (steps: string[]) => void;
  
  // Error
  setError: (hasError: boolean, message?: string) => void;
  
  // Actions
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  resetApp: () => void;
}

