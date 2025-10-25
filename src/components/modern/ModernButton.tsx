/**
 * Modern Button Component
 * Beautiful, interactive buttons with haptic feedback
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import modernTheme from '../../theme/modernTheme';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const buttonStyleKey = `button_${variant}` as keyof typeof styles;
  const buttonSizeKey = `button_${size}` as keyof typeof styles;
  const textStyleKey = `text_${variant}` as keyof typeof styles;
  const textSizeKey = `text_${size}` as keyof typeof styles;

  const buttonStyles = [
    styles.button,
    styles[buttonSizeKey],
    styles[buttonStyleKey],
    fullWidth && styles.fullWidth,
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[textSizeKey],
    styles[textStyleKey],
    disabled && styles.textDisabled,
    textStyle,
  ];

  const renderContent = () => (
    <View style={styles.content}>
      {icon && iconPosition === 'left' && (
        <Text style={styles.icon}>{icon}</Text>
      )}
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'gradient' ? '#FFFFFF' : modernTheme.colors.primary}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
      {icon && iconPosition === 'right' && (
        <Text style={styles.icon}>{icon}</Text>
      )}
    </View>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth]}
      >
        <LinearGradient
          colors={modernTheme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[buttonStyles, styles.gradientButton]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: modernTheme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  fullWidth: {
    width: '100%',
  },

  // Sizes
  button_sm: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  button_md: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  button_lg: {
    paddingVertical: 18,
    paddingHorizontal: 28,
  },

  // Variants
  button_primary: {
    backgroundColor: modernTheme.colors.primary,
    ...modernTheme.shadows.md,
  },
  button_secondary: {
    backgroundColor: modernTheme.colors.gray[100],
    ...modernTheme.shadows.sm,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: modernTheme.colors.primary,
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  gradientButton: {
    ...modernTheme.shadows.glow,
  },

  // States
  buttonDisabled: {
    opacity: 0.5,
  },

  // Text
  text: {
    fontWeight: '600',
  },
  text_sm: {
    fontSize: modernTheme.typography.sizes.sm,
  },
  text_md: {
    fontSize: modernTheme.typography.sizes.base,
  },
  text_lg: {
    fontSize: modernTheme.typography.sizes.lg,
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: modernTheme.colors.gray[700],
  },
  text_outline: {
    color: modernTheme.colors.primary,
  },
  text_ghost: {
    color: modernTheme.colors.primary,
  },
  textDisabled: {
    opacity: 0.7,
  },
});

export default ModernButton;
