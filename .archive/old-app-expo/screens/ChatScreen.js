import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useStorage } from '../hooks/useStorage';
import { useNotifications } from '../hooks/useNotifications';
import { useAnimation } from '../hooks/useAnimation';
import { useGesture } from '../hooks/useGesture';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { colors } from '../constants/colors';
import { useTranslation } from 'react-i18next';

const ChatScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { getItem, setItem } = useStorage();
  const { scheduleNotification } = useNotifications();
  const flatListRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [error, setError] = useState(null);

  const { animation: typingAnimation } = useAnimation(0);
  const { panResponder: messagePanResponder, animatedStyle: messageAnimatedStyle } = useGesture({
    onSwipeLeft: () => handleMessageAction('delete'),
    onSwipeRight: () => handleMessageAction('reply'),
  });

  useEffect(() => {
    loadMessages();
    const interval = setInterval(simulateTyping, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    try {
      const savedMessages = await getItem('messages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages. Please check your connection.');
    }
  };

  const saveMessages = async (updatedMessages) => {
    try {
      await setItem('messages', JSON.stringify(updatedMessages));
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error saving messages:', error);
      setError('Failed to save messages. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    const updatedMessages = [...messages, message];
    await saveMessages(updatedMessages);
    setNewMessage('');

    // Simulate reply after 1-3 seconds
    setTimeout(() => {
      simulateReply();
    }, Math.random() * 2000 + 1000);
  };

  const simulateTyping = () => {
    if (Math.random() > 0.7) {
      setIsTyping(true);
      typingAnimation.setValue(0);
      typingAnimation.start();
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };

  const simulateReply = async () => {
    const replies = [
      "Thanks for your message!",
      "I'll get back to you soon.",
      "That's interesting!",
      "Let me check that for you.",
    ];

    const reply = {
      id: Date.now(),
      text: replies[Math.floor(Math.random() * replies.length)],
      sender: 'other',
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    const updatedMessages = [...messages, reply];
    await saveMessages(updatedMessages);

    // Schedule notification for new message
    await scheduleNotification({
      title: t('New Message'),
      body: reply.text,
      date: new Date(),
    });
  };

  const handleMessageAction = (action) => {
    if (!selectedMessage) return;

    switch (action) {
      case 'delete':
        const updatedMessages = messages.filter(
          msg => msg.id !== selectedMessage.id
        );
        saveMessages(updatedMessages);
        break;
      case 'reply':
        setNewMessage(`Replying to: ${selectedMessage.text} `);
        break;
    }
    setSelectedMessage(null);
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <Animated.View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.otherMessage,
          selectedMessage?.id === item.id && messageAnimatedStyle,
        ]}
        {...messagePanResponder.panHandlers}
      >
        {!isUser && (
          <Avatar
            size={32}
            source={{ uri: 'https://via.placeholder.com/32' }}
            style={styles.avatar}
          />
        )}
        <Card style={[styles.messageBubble, isUser ? styles.userBubble : styles.otherBubble]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </Card>
      </Animated.View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <Avatar
          size={32}
          source={{ uri: 'https://via.placeholder.com/32' }}
          style={styles.avatar}
        />
        <Card style={styles.typingBubble}>
          <Text style={styles.typingText}>...</Text>
        </Card>
      </View>
    );
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText} accessibilityRole="alert">
        {error || 'Unable to load messages. Please check your connection.'}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={loadMessages}
        accessibilityRole="button"
        accessibilityLabel="Retry loading messages"
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // In the render, before messages are loaded
  if (isTyping && messages.length === 0) {
    return (
      <View style={styles.container}>
        <SkeletonLoader rows={6} height={40} style={{ marginBottom: 12 }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={renderTypingIndicator}
        ListEmptyComponent={renderError}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder={t('Type a message...')}
          placeholderTextColor={colors.gray}
          multiline
        />
        <Button
          title={t('Send')}
          onPress={sendMessage}
          style={styles.sendButton}
          disabled={!newMessage.trim()}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
  },
  userBubble: {
    backgroundColor: colors.primary,
  },
  otherBubble: {
    backgroundColor: colors.card,
  },
  messageText: {
    fontSize: 16,
    color: colors.text,
  },
  messageTime: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  typingBubble: {
    padding: 12,
    backgroundColor: colors.card,
  },
  typingText: {
    fontSize: 24,
    color: colors.gray,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    color: colors.text,
  },
  sendButton: {
    width: 80,
    borderRadius: 20,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: colors.errorBackground,
  },
  errorText: {
    color: colors.errorText,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatScreen; 