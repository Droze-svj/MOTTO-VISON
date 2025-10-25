import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { futuristicColors, futuristicTypography, futuristicShadows } from '../constants/futuristicDesignSystem';

const FuturisticLogo = ({ 
  size = 60, 
  style, 
  animated = true,
  variant = 'default' // 'default', 'compact', 'minimal', 'glow'
}) => {
  const glowAnimation = React.useRef(new Animated.Value(0)).current;
  const pulseAnimation = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (animated) {
      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, { toValue: 1, duration: 2000, useNativeDriver: false }),
          Animated.timing(glowAnimation, { toValue: 0, duration: 2000, useNativeDriver: false }),
        ])
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, { toValue: 1.1, duration: 1500, useNativeDriver: false }),
          Animated.timing(pulseAnimation, { toValue: 1, duration: 1500, useNativeDriver: false }),
        ])
      ).start();
    }
  }, [animated]);

  const getLogoStyle = () => {
    switch (variant) {
      case 'compact':
        return {
          fontSize: size * 0.4,
          fontWeight: futuristicTypography.fontWeight.bold,
          color: futuristicColors.primary[500],
        };
      case 'minimal':
        return {
          fontSize: size * 0.5,
          fontWeight: futuristicTypography.fontWeight.medium,
          color: futuristicColors.neon.blue,
        };
      case 'glow':
        return {
          fontSize: size * 0.6,
          fontWeight: futuristicTypography.fontWeight.bold,
          color: futuristicColors.neon.cyan,
          textShadowColor: futuristicColors.neon.cyan,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: glowAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [5, 15],
          }),
        };
      default:
        return {
          fontSize: size * 0.6,
          fontWeight: futuristicTypography.fontWeight.bold,
          color: futuristicColors.primary[500],
        };
    }
  };

  const getContainerStyle = () => {
    const baseStyle = {
      width: size,
      height: size,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: size / 2,
      backgroundColor: 'transparent',
    };

    if (variant === 'glow') {
      return {
        ...baseStyle,
        transform: [{ scale: pulseAnimation }],
        ...futuristicShadows.glow,
      };
    }

    return baseStyle;
  };

  return (
    <Animated.View style={[getContainerStyle(), style]}>
      <Animated.Text style={getLogoStyle()}>
        MOTTO
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FuturisticLogo;
