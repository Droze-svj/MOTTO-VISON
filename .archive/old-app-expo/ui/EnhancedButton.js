import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows, animation } from '../../constants/designSystem';

const EnhancedButton = ({
  title,
  onPress,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'gradient'
  size = 'medium', // 'small', 'medium', 'large'
  icon,
  iconPosition = 'left', // 'left', 'right'
  loading = false,
  disabled = false,
  fullWidth = false,
  gradientColors,
  style,
  textStyle,
  iconStyle,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: animation.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: animation.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    
    setIsPressed(false);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: animation.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: animation.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;
    onPress?.();
  };

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: colors.primary[500],
          ...shadows.sm,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.neutral[100],
          borderWidth: 1,
          borderColor: colors.neutral[300],
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.primary[500],
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      case 'gradient':
        return {
          ...baseStyle,
          ...shadows.md,
        };
      default:
        return baseStyle;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          minHeight: 36,
        };
      case 'large':
        return {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
          minHeight: 56,
        };
      default:
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          minHeight: 44,
        };
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontWeight: typography.fontWeight.medium,
      textAlign: 'center',
    };

    switch (size) {
      case 'small':
        return {
          ...baseTextStyle,
          fontSize: typography.fontSize.sm,
        };
      case 'large':
        return {
          ...baseTextStyle,
          fontSize: typography.fontSize.lg,
        };
      default:
        return {
          ...baseTextStyle,
          fontSize: typography.fontSize.base,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'gradient':
        return colors.text.inverse;
      case 'secondary':
        return colors.text.primary;
      case 'outline':
        return colors.primary[500];
      case 'ghost':
        return colors.primary[500];
      default:
        return colors.text.primary;
    }
  };

  const getIconColor = () => {
    return getTextColor();
  };

  const renderIcon = () => {
    if (!icon || loading) return null;

    return (
      <Ionicons
        name={icon}
        size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
        color={getIconColor()}
        style={[
          iconPosition === 'right' ? styles.iconRight : styles.iconLeft,
          iconStyle,
        ]}
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'small'}
          color={getTextColor()}
        />
      );
    }

    return (
      <>
        {iconPosition === 'left' && renderIcon()}
        {title && (
          <Text style={[
            getTextStyle(),
            { color: getTextColor() },
            textStyle,
          ]}>
            {title}
          </Text>
        )}
        {iconPosition === 'right' && renderIcon()}
      </>
    );
  };

  const ButtonContainer = variant === 'gradient' ? LinearGradient : TouchableOpacity;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.6 : opacityAnim,
          width: fullWidth ? '100%' : 'auto',
        },
        style,
      ]}
    >
      <ButtonContainer
        colors={variant === 'gradient' ? (gradientColors || colors.gradients.primary) : undefined}
        start={variant === 'gradient' ? { x: 0, y: 0 } : undefined}
        end={variant === 'gradient' ? { x: 1, y: 1 } : undefined}
        style={[
          getButtonStyle(),
          getSizeStyle(),
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={1}
        {...props}
      >
        {renderContent()}
      </ButtonContainer>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});

export default EnhancedButton;
