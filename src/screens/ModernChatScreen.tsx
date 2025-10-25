/**
 * Modern ChatScreen - Redesigned with latest trends
 * Features: Glassmorphism, Gradients, Modern Typography, Micro-interactions
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
  Modal,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MasterAIService from '../services/core/MasterAIService';
import MultilingualService from '../services/core/MultilingualService';
import ContextMemoryService from '../services/core/ContextMemoryService';
import VoiceIntegrationService from '../services/core/VoiceIntegrationService';
import { useMultilingual } from '../hooks/useMultilingual';
import LoadingSpinner from '../components/LoadingSpinner';
import { FriendlyErrorMessages } from '../utils/errorMessages';
import modernTheme from '../theme/modernTheme';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: string[];
  confidence?: number;
  responseTime?: number;
}

interface ModernChatScreenProps {
  userId: string;
}

export const ModernChatScreen: React.FC<ModernChatScreenProps> = ({ userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const messageAnimations = useRef<Map<string, Animated.Value>>(new Map());

  const {
    languageProfile,
    supportedLanguages,
    setUserLanguage,
  } = useMultilingual(userId);

  useEffect(() => {
    // Initialize services
    // Voice integration would be initialized here
  }, [userId]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Animate new messages
  const animateMessage = (messageId: string) => {
    const anim = new Animated.Value(0);
    messageAnimations.current.set(messageId, anim);
    
    Animated.spring(anim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    animateMessage(userMessage.id);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      await ContextMemoryService.addMessage(userId, 'user', userMessage.content);
      const contextData = await ContextMemoryService.getContext(userId, userMessage.content);

      const response = await MasterAIService.masterChat(
        userId,
        userMessage.content,
        {
          conversationLength: messages.length,
          recentContext: contextData.relevantContext,
          currentTopics: contextData.currentTopics,
        }
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        sources: response.sources,
        confidence: response.confidence,
        responseTime: response.responseTime,
      };

      setMessages(prev => [...prev, assistantMessage]);
      animateMessage(assistantMessage.id);
      await ContextMemoryService.addMessage(userId, 'assistant', assistantMessage.content);
    } catch (err) {
      const friendlyError = FriendlyErrorMessages.getFriendlyMessage(err, 'chat');
      setError(friendlyError);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: friendlyError,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      animateMessage(errorMessage.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    const voiceAvailable = VoiceIntegrationService.isAvailable();
    
    if (!voiceAvailable.speechToText) {
      Alert.alert(
        'Voice Not Available',
        FriendlyErrorMessages.getFriendlyMessage('Voice not installed', 'voice')
      );
      return;
    }

    setIsListening(true);
    try {
      await VoiceIntegrationService.startListening(
        (text) => {
          setInputText(text);
          setIsListening(false);
        },
        (error) => {
          const friendlyError = FriendlyErrorMessages.getFriendlyMessage(error, 'voice');
          setError(friendlyError);
          setIsListening(false);
        },
        languageProfile?.primaryLanguage || 'en-US'
      );
    } catch (err) {
      const friendlyError = FriendlyErrorMessages.getFriendlyMessage(err, 'voice');
      setError(friendlyError);
      setIsListening(false);
    }
  };

  // Welcome message
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
        content: `${greeting} 👋\n\nI'm MOTTO - ready to help with anything! Ask away.`,
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
      animateMessage(welcomeMessage.id);
    }
  }, []);

  const getMessageAnimation = (messageId: string) => {
    return messageAnimations.current.get(messageId) || new Animated.Value(1);
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#F8FAFC', '#F1F5F9', '#EEF2FF']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Modern Header */}
      <LinearGradient
        colors={modernTheme.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>🤖</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>MOTTO</Text>
              <Text style={styles.headerSubtitle}>AI Companion</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setShowLanguageModal(true)}
          >
            <Text style={styles.languageIcon}>🌍</Text>
            <Text style={styles.languageText}>
              {languageProfile?.primaryLanguage.toUpperCase() || 'EN'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => {
            const anim = getMessageAnimation(message.id);
            return (
              <Animated.View
                key={message.id}
                style={[
                  styles.messageWrapper,
                  message.role === 'user' ? styles.userMessageWrapper : styles.assistantMessageWrapper,
                  {
                    opacity: anim,
                    transform: [
                      {
                        translateY: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                      {
                        scale: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.95, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {message.role === 'user' ? (
                  // User Message (Gradient)
                  <LinearGradient
                    colors={modernTheme.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.messageBubble, styles.userBubble]}
                  >
                    <Text style={styles.userMessageText}>{message.content}</Text>
                    <Text style={styles.userMessageTime}>
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </LinearGradient>
                ) : (
                  // Assistant Message (Glass effect)
                  <View style={[styles.messageBubble, styles.assistantBubble]}>
                    <Text style={styles.assistantMessageText}>{message.content}</Text>
                    <View style={styles.messageFooter}>
                      {message.sources && message.sources.length > 0 && (
                        <Text style={styles.sources}>
                          {message.sources.slice(0, 2).join(', ')}
                        </Text>
                      )}
                      <Text style={styles.assistantMessageTime}>
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                  </View>
                )}
              </Animated.View>
            );
          })}

          {isLoading && (
            <View style={styles.loadingWrapper}>
              <LoadingSpinner 
                variant="thinking" 
                color={modernTheme.colors.primary}
                message={FriendlyErrorMessages.getLoadingMessage('chat')}
              />
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Modern Input Area */}
        <View style={styles.inputContainer}>
          {/* Glass effect input */}
          <View style={styles.inputWrapper}>
            {/* Voice Button */}
            <TouchableOpacity
              style={[
                styles.voiceButton,
                isListening && styles.voiceButtonActive,
              ]}
              onPress={handleVoiceInput}
              disabled={isLoading}
            >
              <Text style={styles.voiceIcon}>
                {isListening ? '🔴' : '🎤'}
              </Text>
            </TouchableOpacity>

            {/* Text Input */}
            <View style={styles.textInputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Message MOTTO..."
                placeholderTextColor={modernTheme.colors.gray[400]}
                multiline
                maxLength={1000}
                editable={!isLoading}
              />
            </View>

            {/* Send Button */}
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              style={styles.sendButtonWrapper}
            >
              <LinearGradient
                colors={
                  !inputText.trim() || isLoading
                    ? [modernTheme.colors.gray[300], modernTheme.colors.gray[300]]
                    : modernTheme.gradients.primary
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButton}
              >
                <Text style={styles.sendIcon}>
                  {isLoading ? '⏳' : '🚀'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Quick Hint */}
          <Text style={styles.hint}>
            💬 Type • 🎤 Speak • 🌍 Translate
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <ScrollView style={styles.languageList}>
              {supportedLanguages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={styles.languageItem}
                  onPress={async () => {
                    await setUserLanguage(lang.code);
                    setShowLanguageModal(false);
                  }}
                >
                  <Text style={styles.languageName}>{lang.name}</Text>
                  {languageProfile?.primaryLanguage === lang.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 16,
    paddingHorizontal: 20,
    ...modernTheme.shadows.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: modernTheme.borderRadius.full,
  },
  languageIcon: {
    fontSize: 16,
  },
  languageText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  messageWrapper: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
  },
  assistantMessageWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: modernTheme.borderRadius.xl,
    padding: 16,
  },

  // User Message (Gradient)
  userBubble: {
    borderBottomRightRadius: 6,
    ...modernTheme.shadows.md,
  },
  userMessageText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },

  // Assistant Message (Glass)
  assistantBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomLeftRadius: 6,
    ...modernTheme.shadows.lg,
  },
  assistantMessageText: {
    fontSize: 16,
    color: modernTheme.colors.gray[800],
    lineHeight: 24,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  sources: {
    fontSize: 10,
    color: modernTheme.colors.gray[500],
    flex: 1,
  },
  assistantMessageTime: {
    fontSize: 11,
    color: modernTheme.colors.gray[400],
  },

  // Loading
  loadingWrapper: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },

  // Input Area (Glass effect)
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.5)',
    ...modernTheme.shadows.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: modernTheme.colors.gray[50],
    borderRadius: modernTheme.borderRadius.xl,
    paddingVertical: 4,
    paddingHorizontal: 4,
    ...modernTheme.shadows.sm,
  },

  // Voice Button
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...modernTheme.shadows.sm,
  },
  voiceButtonActive: {
    backgroundColor: '#FEE2E2',
  },
  voiceIcon: {
    fontSize: 22,
  },

  // Text Input
  textInputContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    maxHeight: 120,
  },
  textInput: {
    fontSize: 16,
    color: modernTheme.colors.gray[800],
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  // Send Button
  sendButtonWrapper: {
    width: 44,
    height: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...modernTheme.shadows.md,
  },
  sendIcon: {
    fontSize: 20,
  },

  // Hint
  hint: {
    fontSize: 12,
    color: modernTheme.colors.gray[500],
    textAlign: 'center',
    marginTop: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: modernTheme.borderRadius['2xl'],
    padding: 24,
    width: width * 0.85,
    maxHeight: height * 0.7,
    ...modernTheme.shadows.xl,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: modernTheme.colors.gray[900],
    marginBottom: 20,
    textAlign: 'center',
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: modernTheme.colors.gray[100],
  },
  languageName: {
    fontSize: 16,
    color: modernTheme.colors.gray[800],
  },
  checkmark: {
    fontSize: 18,
    color: modernTheme.colors.primary,
    fontWeight: 'bold',
  },
});

export default ModernChatScreen;
