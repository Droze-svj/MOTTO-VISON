/**
 * Message Bubble with Feedback Buttons
 * Allows users to rate responses for learning
 */

import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Message} from '../types';

interface MessageWithFeedbackProps {
  message: Message;
  onFeedback?: (reaction: 'positive' | 'negative') => void;
}

export const MessageWithFeedback: React.FC<MessageWithFeedbackProps> = React.memo(({
  message,
  onFeedback,
}) => {
  const [userReaction, setUserReaction] = useState<'positive' | 'negative' | null>(null);
  const isUser = message.role === 'user';

  const handleFeedback = (reaction: 'positive' | 'negative') => {
    setUserReaction(reaction);
    onFeedback?.(reaction);
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.text}
        </Text>
      </View>
      
      {/* Feedback buttons for assistant messages only */}
      {!isUser && onFeedback && (
        <View style={styles.feedbackContainer}>
          <TouchableOpacity
            style={[styles.feedbackButton, userReaction === 'positive' && styles.feedbackActive]}
            onPress={() => handleFeedback('positive')}
          >
            <Text style={styles.feedbackIcon}>👍</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.feedbackButton, userReaction === 'negative' && styles.feedbackActive]}
            onPress={() => handleFeedback('negative')}
          >
            <Text style={styles.feedbackIcon}>👎</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

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
  feedbackContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 8,
  },
  feedbackButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  feedbackActive: {
    backgroundColor: '#007AFF20',
  },
  feedbackIcon: {
    fontSize: 16,
  },
});
