/**
 * Loading Spinner Component
 * Beautiful loading indicators for MOTTO
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  variant?: 'default' | 'dots' | 'pulse' | 'thinking';
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#4F46E5',
  message,
  variant = 'default',
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (variant === 'pulse') {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (variant === 'dots' || variant === 'thinking') {
      // Dots animation (staggered)
      Animated.loop(
        Animated.stagger(150, [
          Animated.sequence([
            Animated.timing(dot1Anim, {
              toValue: -10,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot1Anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dot2Anim, {
              toValue: -10,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dot3Anim, {
              toValue: -10,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }
  }, [variant]);

  if (variant === 'dots' || variant === 'thinking') {
    return (
      <View style={[styles.dotsContainer, style]}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: color, transform: [{ translateY: dot1Anim }] },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: color, transform: [{ translateY: dot2Anim }] },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: color, transform: [{ translateY: dot3Anim }] },
          ]}
        />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    );
  }

  if (variant === 'pulse') {
    return (
      <View style={[styles.container, style]}>
        <Animated.View
          style={[
            styles.pulseCircle,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={styles.pulseIcon}>🤖</Text>
        </Animated.View>
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    );
  }

  // Default spinner
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseIcon: {
    fontSize: 40,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default LoadingSpinner;
