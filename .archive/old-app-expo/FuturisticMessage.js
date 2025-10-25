import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { futuristicColors, futuristicTypography, futuristicSpacing, futuristicBorderRadius, futuristicShadows } from '../constants/futuristicDesignSystem';

const FuturisticMessage = ({ 
  message,
  isUser = false,
  isError = false,
  isTyping = false,
  onPress,
  onLongPress,
  style,
  showActions = true
}) => {
  const scaleAnimation = React.useRef(new Animated.Value(0.95)).current;
  const glowAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    if (isUser) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, { toValue: 1, duration: 2000, useNativeDriver: false }),
          Animated.timing(glowAnimation, { toValue: 0, duration: 2000, useNativeDriver: false }),
        ])
      ).start();
    }
  }, []);

  const getMessageStyle = () => {
    if (isError) {
      return styles.errorMessage;
    }
    if (isUser) {
      return styles.userMessage;
    }
    return styles.assistantMessage;
  };

  const getAvatarStyle = () => {
    if (isUser) {
      return styles.userAvatar;
    }
    if (isError) {
      return styles.errorAvatar;
    }
    return styles.assistantAvatar;
  };

  const getAvatarText = () => {
    if (isUser) return '👤';
    if (isError) return '⚠️';
    return '🤖';
  };

  const getRoleText = () => {
    if (isUser) return 'You';
    if (isError) return 'System';
    return 'MOTTO AI';
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnimation }],
          alignSelf: isUser ? 'flex-end' : 'flex-start',
        },
        style
      ]}
    >
      <TouchableOpacity
        style={[
          styles.messageCard,
          getMessageStyle(),
          {
            shadowOpacity: isUser ? glowAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.6],
            }) : 0.3,
          }
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
      >
        <View style={styles.messageHeader}>
          <View style={[styles.avatar, getAvatarStyle()]}>
            <Text style={styles.avatarText}>{getAvatarText()}</Text>
          </View>
          <Text style={styles.roleText}>{getRoleText()}</Text>
          <View style={styles.connectionStatus}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: isError ? futuristicColors.status.error : futuristicColors.status.online }
            ]} />
            <Text style={styles.statusText}>ONLINE</Text>
          </View>
        </View>
        
        <View style={styles.messageContent}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText,
            isError && styles.errorText
          ]}>
            {message.text}
          </Text>
          
          {isTyping && (
            <View style={styles.typingIndicator}>
              <View style={styles.typingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          )}
        </View>

        {showActions && !isTyping && !isError && (
          <View style={styles.messageActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>👍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>👎</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>💬</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: futuristicSpacing.xs,
    maxWidth: '85%',
  },
  messageCard: {
    borderRadius: futuristicBorderRadius.lg,
    padding: futuristicSpacing.md,
    ...futuristicShadows.md,
    borderWidth: 1,
  },
  userMessage: {
    backgroundColor: futuristicColors.primary[500],
    borderColor: futuristicColors.primary[600],
    shadowColor: futuristicColors.primary[500],
  },
  assistantMessage: {
    backgroundColor: futuristicColors.dark.card,
    borderColor: futuristicColors.dark.border,
    shadowColor: futuristicColors.dark.border,
  },
  errorMessage: {
    backgroundColor: futuristicColors.status.error + '20',
    borderColor: futuristicColors.status.error,
    shadowColor: futuristicColors.status.error,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: futuristicSpacing.sm,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: futuristicSpacing.sm,
  },
  userAvatar: {
    backgroundColor: futuristicColors.primary[400],
  },
  assistantAvatar: {
    backgroundColor: futuristicColors.dark.border,
  },
  errorAvatar: {
    backgroundColor: futuristicColors.status.error,
  },
  avatarText: {
    fontSize: futuristicTypography.fontSize.xs,
  },
  roleText: {
    fontSize: futuristicTypography.fontSize.xs,
    fontWeight: futuristicTypography.fontWeight.semibold,
    color: futuristicColors.primary[500],
    flex: 1,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: futuristicSpacing.xs,
  },
  statusText: {
    fontSize: futuristicTypography.fontSize.xs,
    color: futuristicColors.dark.textTertiary,
    fontWeight: futuristicTypography.fontWeight.medium,
  },
  messageContent: {
    marginBottom: futuristicSpacing.sm,
  },
  messageText: {
    fontSize: futuristicTypography.fontSize.lg,
    lineHeight: futuristicTypography.lineHeight.normal,
  },
  userText: {
    color: futuristicColors.dark.text,
  },
  assistantText: {
    color: futuristicColors.dark.text,
  },
  errorText: {
    color: futuristicColors.status.error,
  },
  typingIndicator: {
    marginTop: futuristicSpacing.sm,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: futuristicColors.primary[500],
    marginRight: futuristicSpacing.xs,
  },
  dot1: {
    animationDelay: '0ms',
  },
  dot2: {
    animationDelay: '150ms',
  },
  dot3: {
    animationDelay: '300ms',
  },
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: futuristicColors.dark.border,
    paddingTop: futuristicSpacing.sm,
  },
  actionButton: {
    paddingHorizontal: futuristicSpacing.sm,
    paddingVertical: futuristicSpacing.xs,
    marginLeft: futuristicSpacing.xs,
    borderRadius: futuristicBorderRadius.sm,
    backgroundColor: futuristicColors.dark.border,
  },
  actionText: {
    fontSize: futuristicTypography.fontSize.sm,
  },
});

export default FuturisticMessage;
