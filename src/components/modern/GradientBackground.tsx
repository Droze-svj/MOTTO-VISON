/**
 * Gradient Background Component
 * Modern gradient backgrounds
 */

import React from 'react';
import {
  StyleSheet,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import modernTheme from '../../theme/modernTheme';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  colors?: string[];
  style?: ViewStyle;
  variant?: 'primary' | 'accent' | 'warm' | 'cool' | 'sunset' | 'ocean' | 'purple';
  angle?: number;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  colors,
  style,
  variant = 'primary',
  angle = 135,
}) => {
  const gradientColors = colors || modernTheme.gradients[variant];

  // Calculate start and end points based on angle
  const angleRad = (angle * Math.PI) / 180;
  const startPoint = {
    x: 0.5 - Math.cos(angleRad) / 2,
    y: 0.5 - Math.sin(angleRad) / 2,
  };
  const endPoint = {
    x: 0.5 + Math.cos(angleRad) / 2,
    y: 0.5 + Math.sin(angleRad) / 2,
  };

  return (
    <LinearGradient
      colors={gradientColors}
      start={startPoint}
      end={endPoint}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GradientBackground;
