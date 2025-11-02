/**
 * ChatScreen - Main MOTTO Interface
 * Features: Multi-language chat, voice input, personalization, source citations
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Animated,
  Alert,
  RefreshControl,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import MasterAIService from '../services/core/MasterAIService';
import MultilingualService from '../services/core/MultilingualService';
import ContextMemoryService from '../services/core/ContextMemoryService';
import VoiceIntegrationService from '../services/core/VoiceIntegrationService';
import { useMultilingual } from '../hooks/useMultilingual';
import LoadingSpinner from '../components/LoadingSpinner';
import { FriendlyErrorMessages } from '../utils/errorMessages';
import { Haptics } from '../utils/haptics';
import { formatTimeAgo } from '../utils/formatTime';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: string[];
  confidence?: number;
  language?: string;
  responseTime?: number;
}

const ChatScreen: React.FC = () => {
  // Generate a consistent userId for this session
  const userId = React.useMemo(() => 'user_' + Date.now(), []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const {
    languageProfile,
    supportedLanguages,
    setUserLanguage
  } = useMultilingual(userId);

  // Pulse animation for loading
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isLoading]);

  // Auto-scroll to bottom when new message
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Refresh chat (pull to refresh)
  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.light();
    
    try {
      // Reload context and conversation history
      const contextData = await ContextMemoryService.getContext(userId, '');
      
      // Optional: Could reload messages from backend/storage here
      // For now, just refresh the context
      
      // Small delay for UX (feels more responsive)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Haptics.success();
    } catch (error) {
      console.error('Refresh error:', error);
      Haptics.error();
    } finally {
      setRefreshing(false);
    }
  };

  // Delete message
  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    Haptics.success();
  };

  // Copy message
  const handleCopyMessage = (message: Message) => {
    Clipboard.setString(message.content);
    Haptics.success();
    Alert.alert('Copied!', 'Message copied to clipboard', [{ text: 'OK' }], { cancelable: true });
  };

  // Clear all chat messages
  const handleClearChat = () => {
    Haptics.medium();
    Alert.alert(
      'Clear Chat',
      'Delete all messages and start fresh?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setMessages([]);
            await ContextMemoryService.clearContext(userId);
            Haptics.success();
            // Show welcome message after clearing
            const welcomeMessage: Message = {
              id: 'welcome-' + Date.now(),
              role: 'assistant',
              content: '👋 Chat cleared! How can I help you?',
              timestamp: Date.now(),
            };
            setMessages([welcomeMessage]);
          },
        },
      ]
    );
  };

  // Long press message menu
  const handleMessageLongPress = (message: Message) => {
    Haptics.medium();
    
    const isUserMessage = message.role === 'user';
    const buttons = [
      {
        text: 'Copy',
        onPress: () => handleCopyMessage(message),
      },
    ];

    // Add delete for user messages
    if (isUserMessage) {
      buttons.push({
        text: 'Delete',
        style: 'destructive' as const,
        onPress: () => {
          Alert.alert(
            'Delete Message',
            'Are you sure you want to delete this message?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => handleDeleteMessage(message.id),
              },
            ]
          );
        },
      });
    }

    buttons.push({ text: 'Cancel', style: 'cancel' as const });
    Alert.alert('Message Options', '', buttons);
  };

  // Retry failed message
  const handleRetry = async () => {
    if (!failedMessage) return;
    
    Haptics.light();
    setInputText(failedMessage);
    setFailedMessage(null);
    setError(null);
    setRetryCount(0);
    
    // Automatically send the retry
    setTimeout(() => {
      if (failedMessage) {
        handleSend();
      }
    }, 100);
  };

  // Send message
  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    Haptics.light(); // Haptic feedback when sending

    const messageText = inputText.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    const startTime = Date.now();
    const maxRetries = 2;

    try {
      // Add to context memory
      await ContextMemoryService.addMessage(userId, 'user', userMessage.content);

      // Get conversation context
      const contextData = await ContextMemoryService.getContext(userId, userMessage.content);
      
      // Get full response with metadata and context
      const response = await MasterAIService.masterChat(
        userId,
        userMessage.content,
        {
          conversationLength: messages.length,
          isFollowUp: messages.length > 1,
          recentContext: contextData.relevantContext,
          currentTopics: contextData.currentTopics,
        }
      );

      const responseTime = Date.now() - startTime;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        sources: response.sources,
        confidence: response.confidence,
        responseTime,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Add assistant response to context memory
      await ContextMemoryService.addMessage(userId, 'assistant', assistantMessage.content);
      
      // Clear retry state on success
      setFailedMessage(null);
      setRetryCount(0);

    } catch (err) {
      console.error('Chat error:', err);
      
      // Use friendly error message
      const friendlyError = FriendlyErrorMessages.getFriendlyMessage(err, 'chat');
      setError(friendlyError);
      
      // Save failed message for retry
      setFailedMessage(messageText);

      // Auto-retry once if first failure
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        console.log(`Auto-retrying (attempt ${retryCount + 1}/${maxRetries})...`);
        
        // Wait a moment then retry
        setTimeout(async () => {
          setIsLoading(false);
          setInputText(messageText);
          setTimeout(() => handleSend(), 200);
        }, 1000);
        return;
      }

      // Add friendly error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: friendlyError + '\n\n💡 Tap "Retry" below to try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      Haptics.error();
    } finally {
      setIsLoading(false);
      setLoadingPhase('');
    }
  };

  // Voice input (Real implementation!)
  const handleVoiceInput = async () => {
    const voiceAvailable = VoiceIntegrationService.isAvailable();
    
    if (!voiceAvailable.speechToText) {
      Alert.alert(
        'Voice Not Available',
        FriendlyErrorMessages.getFriendlyMessage('Voice not installed', 'voice'),
        [{ text: 'OK' }]
      );
      return;
    }

    setIsListening(true);
    try {
      await VoiceIntegrationService.startListening(
        (transcribedText) => {
          // Text recognized!
          setInputText(transcribedText);
          setIsListening(false);
          console.log('[Voice] Transcribed:', transcribedText);
        },
        (error) => {
          // Error occurred
          console.error('[Voice] Error:', error);
          setError('Voice input failed. Please try typing instead.');
          setIsListening(false);
        },
        languageProfile?.primaryLanguage || 'en-US'
      );
    } catch (err) {
      console.error('Voice error:', err);
      const friendlyError = FriendlyErrorMessages.getFriendlyMessage(err, 'voice');
      setError(friendlyError);
      setIsListening(false);
    }
  };

  // Change language
  const handleLanguageChange = async (langCode: string) => {
    try {
      await setUserLanguage(langCode);
      setShowLanguageModal(false);
      
      // Add system message
      const langName = supportedLanguages.find(l => l.code === langCode)?.name;
      const systemMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Language changed to ${langName}! I'll now respond in ${langName}. 🌍`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, systemMessage]);
    } catch (err) {
      console.error('Language change error:', err);
    }
  };

  // Welcome message (better, shorter alternative)
  useEffect(() => {
    if (messages.length === 0) {
      const hour = new Date().getHours();
      let greeting = 'Hey there!';
      
      if (hour >= 5 && hour < 12) greeting = 'Good morning!';
      else if (hour >= 12 && hour < 17) greeting = 'Good afternoon!';
      else if (hour >= 17 && hour < 22) greeting = 'Good evening!';

      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `${greeting} 👋

I'm MOTTO - ready to help with anything! Ask me questions, get advice, learn new things... I'm here for you.

What's on your mind?`,
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Text style={styles.logo}>💭</Text>
          </Animated.View>
          <View>
            <Text style={styles.headerTitle}>MOTTO</Text>
            <Text style={styles.headerSubtitle}>
              {languageProfile?.primaryLanguage 
                ? supportedLanguages.find(l => l.code === languageProfile.primaryLanguage)?.name
                : 'English'}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowLanguageModal(true)}
          >
            <Text style={styles.iconButtonText}>🌍</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleClearChat}
          >
            <Text style={styles.iconButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Banner with Retry */}
      {error && (
        <View style={styles.errorBanner}>
          <View style={styles.errorContent}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            {failedMessage && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
              >
                <Text style={styles.retryButtonText}>🔄 Retry</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => {
            setError(null);
            setFailedMessage(null);
            setRetryCount(0);
          }}>
            <Text style={styles.errorClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4F46E5"
            colors={['#4F46E5']}
            title="Pull to refresh..."
            titleColor="#666"
          />
        }
      >
        {/* Empty State */}
        {messages.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💭</Text>
            <Text style={styles.emptyTitle}>Start a Conversation</Text>
            <Text style={styles.emptySubtitle}>
              I'm MOTTO, your intelligent AI assistant.{'\n'}Ask me anything!
            </Text>
            
            {/* Suggested Prompts */}
            <View style={styles.suggestions}>
              <Text style={styles.suggestionsLabel}>Try asking:</Text>
              {[
                "Tell me a joke",
                "Help me learn something new",
                "What can you help me with?",
                "Explain a concept to me"
              ].map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionChip}
                  onPress={() => {
                    Haptics.light();
                    setInputText(prompt);
                    inputRef.current?.focus();
                  }}
                >
                  <Text style={styles.suggestionText}>💡 {prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isUser={message.role === 'user'}
            onLongPress={() => handleMessageLongPress(message)}
          />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner 
              variant="thinking" 
              color="#4F46E5"
              message={loadingPhase || FriendlyErrorMessages.getLoadingMessage('chat')}
            />
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity
            style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
            onPress={handleVoiceInput}
            disabled={isLoading}
          >
            <Text style={styles.voiceButtonText}>
              {isListening ? '🔴' : '🎤'}
            </Text>
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type or speak..."
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
            editable={!isLoading}
            onSubmitEditing={handleSend}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>
              {isLoading ? '⏳' : '🚀'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsHint}>
            💬 Type, tap 🎤 to speak, or tap 🌍 for language
          </Text>
        </View>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language 🌍</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.languageList}>
              {supportedLanguages.slice(0, 20).map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageItem,
                    languageProfile?.primaryLanguage === lang.code && styles.languageItemActive
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <Text style={styles.languageName}>{lang.name}</Text>
                  {languageProfile?.primaryLanguage === lang.code && (
                    <Text style={styles.languageCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.languageNote}>
              And 80+ more languages available!
            </Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

// Message Bubble Component
const MessageBubble: React.FC<{ 
  message: Message; 
  isUser: boolean;
  onLongPress?: () => void;
}> = ({
  message,
  isUser,
  onLongPress,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const handlePress = () => {
    setShowDetails(!showDetails);
  };

  const handleLongPressInternal = () => {
    if (onLongPress) {
      onLongPress();
    } else {
      setShowDetails(!showDetails);
    }
  };

  return (
    <View style={[styles.messageBubbleContainer, isUser && styles.messageBubbleContainerUser]}>
      <TouchableOpacity
        style={[
          styles.messageBubble,
          isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant
        ]}
        onPress={handlePress}
        onLongPress={handleLongPressInternal}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.messageText,
          isUser && styles.messageTextUser
        ]}>
          {message.content}
        </Text>

        {/* Timestamp - Always visible */}
        <Text style={[
          styles.timestamp,
          isUser && styles.timestampUser
        ]}>
          {formatTimeAgo(message.timestamp)}
        </Text>

        {/* Metadata */}
        {!isUser && (showDetails || message.sources) && (
          <View style={styles.messageMetadata}>
            {message.sources && message.sources.length > 0 && (
              <View style={styles.sources}>
                <Text style={styles.sourcesLabel}>📚 Sources:</Text>
                <Text style={styles.sourcesText}>
                  {message.sources.slice(0, 3).join(', ')}
                  {message.sources.length > 3 && ` +${message.sources.length - 3} more`}
                </Text>
              </View>
            )}

            {showDetails && (
              <>
                {message.confidence !== undefined && (
                  <Text style={styles.metadataItem}>
                    🎯 Confidence: {message.confidence}%
                  </Text>
                )}
                {message.responseTime && (
                  <Text style={styles.metadataItem}>
                    ⚡ Response time: {(message.responseTime / 1000).toFixed(1)}s
                  </Text>
                )}
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 20,
  },

  // Error Banner
  errorBanner: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  errorClose: {
    color: '#991B1B',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 4,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  suggestions: {
    width: '100%',
    gap: 12,
  },
  suggestionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
    textAlign: 'center',
  },
  suggestionChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionText: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubbleContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  messageBubbleContainerUser: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageBubbleAssistant: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageBubbleUser: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1F2937',
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  timestampUser: {
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Metadata
  messageMetadata: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sources: {
    marginBottom: 4,
  },
  sourcesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  sourcesText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  metadataItem: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // Loading
  loadingContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },

  // Input
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonActive: {
    backgroundColor: '#FEE2E2',
  },
  voiceButtonText: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 20,
  },
  quickActions: {
    marginTop: 8,
  },
  quickActionsHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Language Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalClose: {
    fontSize: 24,
    color: '#6B7280',
    padding: 4,
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  languageItemActive: {
    backgroundColor: '#EFF6FF',
  },
  languageName: {
    fontSize: 16,
    color: '#1F2937',
  },
  languageCheck: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  languageNote: {
    textAlign: 'center',
    padding: 16,
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

export default ChatScreen;