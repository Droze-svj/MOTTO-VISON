/**
 * Modern Card Component
 * Latest design with shadows, borders, and hover effects
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import modernTheme from '../../theme/modernTheme';

interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'filled' | 'glass';
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  style,
  onPress,
  variant = 'elevated',
}) => {
  const cardStyles = [
    styles.card,
    styles[`card_${variant}`],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: modernTheme.borderRadius.xl,
    padding: modernTheme.spacing.lg,
  },
  
  // Elevated card (default)
  card_elevated: {
    backgroundColor: '#FFFFFF',
    ...modernTheme.shadows.md,
  },
  
  // Outlined card
  card_outlined: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: modernTheme.colors.gray[200],
  },
  
  // Filled card
  card_filled: {
    backgroundColor: modernTheme.colors.gray[50],
  },
  
  // Glass card
  card_glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...modernTheme.shadows.lg,
  },
});

export default ModernCard;
