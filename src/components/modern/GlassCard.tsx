/**
 * Glass Card Component
 * Modern glassmorphism effect
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import modernTheme from '../../theme/modernTheme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 20,
  tint = 'light',
}) => {
  // For iOS/Android with blur support
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      // BlurView only accepts 'light', 'dark', 'xlight', 'prominent', 'regular', 'extraDark'
      const validBlurType = tint === 'default' ? 'light' : tint as 'light' | 'dark';
      return (
        <BlurView
          style={[styles.glassContainer, style]}
          blurType={validBlurType}
          blurAmount={intensity}
          reducedTransparencyFallbackColor={modernTheme.colors.white}
        >
          <View style={styles.innerContainer}>{children}</View>
        </BlurView>
      );
    } catch (e) {
      // Fallback if BlurView not available
    }
  }

  // Fallback without blur
  return (
    <View style={[styles.fallbackContainer, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  glassContainer: {
    borderRadius: modernTheme.borderRadius.xl,
    borderWidth: 1,
    borderColor: modernTheme.colors.glass.border,
    overflow: 'hidden',
    ...modernTheme.shadows.md,
  },
  innerContainer: {
    padding: modernTheme.spacing.base,
  },
  fallbackContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: modernTheme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...modernTheme.shadows.md,
    padding: modernTheme.spacing.base,
  },
});

export default GlassCard;
