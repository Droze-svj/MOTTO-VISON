import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { futuristicColors, futuristicTypography, futuristicSpacing, futuristicBorderRadius, futuristicShadows } from '../constants/futuristicDesignSystem';

const FuturisticInput = ({
  value,
  onChangeText,
  placeholder = "Type your message...",
  onSend,
  onClear,
  onSearch,
  onInsights,
  disabled = false,
  isSending = false,
  style,
  inputStyle,
  showActions = true
}) => {
  const glowAnimation = React.useRef(new Animated.Value(0)).current;
  const scaleAnimation = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isSending) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, { toValue: 1, duration: 1000, useNativeDriver: false }),
          Animated.timing(glowAnimation, { toValue: 0, duration: 1000, useNativeDriver: false }),
        ])
      ).start();
    } else {
      glowAnimation.setValue(0);
    }
  }, [isSending]);

  const handleSend = () => {
    if (value.trim() && !disabled && !isSending) {
      Animated.sequence([
        Animated.timing(scaleAnimation, { toValue: 0.95, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnimation, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      onSend && onSend();
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnimation }],
        },
        style
      ]}
    >
      <View style={[
        styles.inputCard,
        {
          shadowOpacity: glowAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.8],
          }),
        }
      ]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={futuristicColors.dark.textTertiary}
          style={[
            styles.input,
            inputStyle
          ]}
          multiline
          maxHeight={100}
          textAlignVertical="top"
          editable={!disabled}
        />
        
        {showActions && (
          <View style={styles.actions}>
            <View style={styles.leftActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.clearButton]}
                onPress={onClear}
                disabled={!value.trim()}
              >
                <Text style={styles.clearButtonText}>🗑️</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.searchButton]}
                onPress={onSearch}
              >
                <Text style={styles.searchButtonText}>🔍</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.insightsButton]}
                onPress={onInsights}
              >
                <Text style={styles.insightsButtonText}>📊</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.actionButton,
                styles.sendButton,
                disabled || !value.trim() || isSending ? styles.sendButtonDisabled : null
              ]}
              onPress={handleSend}
              disabled={disabled || !value.trim() || isSending}
            >
              <Text style={styles.sendButtonText}>
                {isSending ? '⏳' : '🚀'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: futuristicColors.dark.surface,
    borderTopWidth: 1,
    borderTopColor: futuristicColors.primary[500],
  },
  inputCard: {
    margin: futuristicSpacing.md,
    backgroundColor: futuristicColors.dark.card,
    borderRadius: futuristicBorderRadius.xl,
    padding: futuristicSpacing.md,
    borderWidth: 1,
    borderColor: futuristicColors.primary[500],
    ...futuristicShadows.lg,
  },
  input: {
    fontSize: futuristicTypography.fontSize.lg,
    color: futuristicColors.dark.text,
    maxHeight: 100,
    textAlignVertical: 'top',
    marginBottom: futuristicSpacing.sm,
    backgroundColor: futuristicColors.dark.surface,
    borderRadius: futuristicBorderRadius.lg,
    padding: futuristicSpacing.sm,
    borderWidth: 1,
    borderColor: futuristicColors.dark.border,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: futuristicSpacing.md,
    paddingVertical: futuristicSpacing.sm,
    borderRadius: futuristicBorderRadius.lg,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: futuristicSpacing.xs,
  },
  clearButton: {
    backgroundColor: futuristicColors.dark.border,
    borderWidth: 1,
    borderColor: futuristicColors.dark.border,
  },
  clearButtonText: {
    fontSize: futuristicTypography.fontSize.base,
    color: futuristicColors.dark.text,
  },
  searchButton: {
    backgroundColor: futuristicColors.primary[400],
    borderWidth: 1,
    borderColor: futuristicColors.primary[500],
  },
  searchButtonText: {
    fontSize: futuristicTypography.fontSize.base,
    color: futuristicColors.dark.text,
  },
  insightsButton: {
    backgroundColor: futuristicColors.dark.border,
    borderWidth: 1,
    borderColor: futuristicColors.dark.border,
  },
  insightsButtonText: {
    fontSize: futuristicTypography.fontSize.base,
    color: futuristicColors.dark.text,
  },
  sendButton: {
    backgroundColor: futuristicColors.primary[500],
    borderWidth: 1,
    borderColor: futuristicColors.primary[600],
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: futuristicColors.dark.border,
    borderColor: futuristicColors.dark.border,
  },
  sendButtonText: {
    fontSize: futuristicTypography.fontSize.base,
    color: futuristicColors.dark.text,
    fontWeight: futuristicTypography.fontWeight.semibold,
  },
});

export default FuturisticInput;
