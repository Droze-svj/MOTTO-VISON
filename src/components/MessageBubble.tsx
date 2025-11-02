import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Haptics } from '../utils/haptics';
import { formatTimeAgo } from '../utils/formatTime';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  onLongPress?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onLongPress, onDelete }) => {
  const isUser = message.role === 'user';

  // Trigger subtle haptic when AI message appears
  useEffect(() => {
    if (!isUser) {
      Haptics.light();
    }
  }, [isUser]);

  const handleLongPress = () => {
    Haptics.medium();
    
    // Show action menu
    const buttons = [
      {
        text: 'Copy',
        onPress: () => {
          Clipboard.setString(message.text);
          Haptics.success();
          // Optional: Show toast notification
          Alert.alert('Copied!', 'Message copied to clipboard', [{ text: 'OK' }], { cancelable: true });
        },
      },
    ];

    // Add delete option for user messages
    if (isUser && onDelete) {
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
                onPress: () => {
                  Haptics.medium();
                  onDelete(message.id);
                },
              },
            ]
          );
        },
      });
    }

    buttons.push({ text: 'Cancel', style: 'cancel' as const });

    // Trigger custom handler if provided, otherwise show default menu
    if (onLongPress) {
      onLongPress(message);
    } else {
      Alert.alert('Message Options', '', buttons);
    }
  };

  return (
    <TouchableOpacity
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}
    >
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.text}
        </Text>
        
        {/* Timestamp */}
        {message.timestamp && (
          <Text style={[styles.timestamp, isUser && styles.timestampUser]}>
            {formatTimeAgo(message.timestamp)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 16,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#E9ECEF',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#000000',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    opacity: 0.8,
  },
  timestampUser: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

