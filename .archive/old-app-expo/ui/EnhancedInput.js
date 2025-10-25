import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows, animation } from '../../constants/designSystem';

const EnhancedInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  onFocus,
  onBlur,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  error,
  success,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'default', // 'default', 'outlined', 'filled'
  size = 'medium', // 'small', 'medium', 'large'
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
    
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: animation.normal,
        useNativeDriver: false,
      }),
      Animated.timing(labelAnim, {
        toValue: 1,
        duration: animation.normal,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
    
    if (!value) {
      Animated.timing(labelAnim, {
        toValue: 0,
        duration: animation.normal,
        useNativeDriver: false,
      }).start();
    }
    
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: animation.normal,
      useNativeDriver: false,
    }).start();
  };

  const handleChangeText = (text) => {
    onChangeText?.(text);
    
    if (text && !value) {
      Animated.timing(labelAnim, {
        toValue: 1,
        duration: animation.normal,
        useNativeDriver: false,
      }).start();
    } else if (!text && value) {
      Animated.timing(labelAnim, {
        toValue: 0,
        duration: animation.normal,
        useNativeDriver: false,
      }).start();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getInputStyle = () => {
    const baseStyle = {
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      color: colors.text.primary,
      fontSize: typography.fontSize.base,
      fontFamily: typography.fontFamily.regular,
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 2,
          borderColor: isFocused 
            ? colors.primary[500] 
            : error 
              ? colors.accent.error 
              : success 
                ? colors.accent.success 
                : colors.neutral[300],
          backgroundColor: colors.background.primary,
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: isFocused 
            ? colors.background.secondary 
            : colors.neutral[100],
          borderWidth: 0,
        };
      default:
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: isFocused 
            ? colors.primary[500] 
            : error 
              ? colors.accent.error 
              : success 
                ? colors.accent.success 
                : colors.neutral[300],
          backgroundColor: colors.background.primary,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.sm,
          minHeight: 36,
        };
      case 'large':
        return {
          paddingVertical: spacing.lg,
          minHeight: 56,
        };
      default:
        return {
          paddingVertical: spacing.md,
          minHeight: 44,
        };
    }
  };

  const getLabelStyle = () => {
    const baseLabelStyle = {
      position: 'absolute',
      left: spacing.md,
      color: isFocused 
        ? colors.primary[500] 
        : error 
          ? colors.accent.error 
          : success 
            ? colors.accent.success 
            : colors.text.secondary,
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
    };

    const labelTranslateY = labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -20],
    });

    const labelScale = labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.85],
    });

    return {
      ...baseLabelStyle,
      transform: [
        { translateY: labelTranslateY },
        { scale: labelScale },
      ],
    };
  };

  const renderLeftIcon = () => {
    if (!leftIcon) return null;

    return (
      <View style={styles.leftIconContainer}>
        <Ionicons
          name={leftIcon}
          size={20}
          color={isFocused 
            ? colors.primary[500] 
            : error 
              ? colors.accent.error 
              : success 
                ? colors.accent.success 
                : colors.text.secondary}
        />
      </View>
    );
  };

  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity
          style={styles.rightIconContainer}
          onPress={togglePasswordVisibility}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={colors.text.secondary}
          />
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      return (
        <TouchableOpacity
          style={styles.rightIconContainer}
          onPress={onRightIconPress}
          disabled={!onRightIconPress}
        >
          <Ionicons
            name={rightIcon}
            size={20}
            color={isFocused 
              ? colors.primary[500] 
              : error 
                ? colors.accent.error 
                : success 
                  ? colors.accent.success 
                  : colors.text.secondary}
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Animated.Text style={[getLabelStyle(), labelStyle]}>
          {label}
        </Animated.Text>
      )}
      
      <View style={styles.inputContainer}>
        {renderLeftIcon()}
        
        <TextInput
          style={[
            styles.input,
            getInputStyle(),
            getSizeStyle(),
            inputStyle,
          ]}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={!label ? placeholder : undefined}
          placeholderTextColor={colors.text.tertiary}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={!disabled && !loading}
          {...props}
        />
        
        {renderRightIcon()}
      </View>
      
      {(error || success) && (
        <View style={styles.messageContainer}>
          <Ionicons
            name={error ? 'alert-circle' : 'checkmark-circle'}
            size={16}
            color={error ? colors.accent.error : colors.accent.success}
            style={styles.messageIcon}
          />
          <Text style={[
            styles.messageText,
            { color: error ? colors.accent.error : colors.accent.success },
            errorStyle,
          ]}>
            {error || success}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  leftIconContainer: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  rightIconContainer: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 1,
    padding: spacing.xs,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  messageIcon: {
    marginRight: spacing.xs,
  },
  messageText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
  },
});

export default EnhancedInput;
