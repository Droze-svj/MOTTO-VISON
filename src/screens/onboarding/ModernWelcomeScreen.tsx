/**
 * Modern Welcome Screen - Redesigned with latest trends
 * Features: Glassmorphism, Gradients, Smooth animations
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import modernTheme from '../../theme/modernTheme';

const { width, height } = Dimensions.get('window');

interface ModernWelcomeScreenProps {
  onNext: () => void;
  onSkip?: () => void;
}

export const ModernWelcomeScreen: React.FC<ModernWelcomeScreenProps> = ({
  onNext,
  onSkip,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={modernTheme.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating Orbs (decorative) */}
      <View style={styles.orbContainer}>
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
        <View style={[styles.orb, styles.orb3]} />
      </View>

      {/* Skip Button */}
      {onSkip && (
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Logo with pulse */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>🤖</Text>
          </View>
        </Animated.View>

        {/* Brand */}
        <Animated.View
          style={[
            styles.brandContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.brandName}>MOTTO</Text>
          <Text style={styles.tagline}>Your Intelligent AI Companion</Text>
        </Animated.View>

        {/* Features (Glass cards) */}
        <Animated.View
          style={[
            styles.featuresContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {[
            { icon: '🌍', text: '100+ Languages' },
            { icon: '🧠', text: 'Learns From You' },
            { icon: '⚡', text: 'Lightning Fast' },
          ].map((feature, index) => (
            <Animated.View
              key={index}
              style={[
                styles.featureCard,
                {
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 30],
                        outputRange: [0, 30 + index * 10],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
            </Animated.View>
          ))}
        </Animated.View>
      </View>

      {/* Bottom */}
      <Animated.View
        style={[
          styles.bottom,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Get Started Button */}
        <TouchableOpacity onPress={onNext} activeOpacity={0.9}>
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.startButton}
          >
            <Text style={styles.startButtonText}>Get Started</Text>
            <Text style={styles.startButtonIcon}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Progress Dots */}
        <View style={styles.pagination}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Decorative Orbs
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  orb1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  orb2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -50,
  },
  orb3: {
    width: 150,
    height: 150,
    top: height * 0.4,
    right: -30,
  },

  // Skip
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: modernTheme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  skipText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  // Logo
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...modernTheme.shadows.xl,
  },
  logoIcon: {
    fontSize: 72,
  },

  // Brand
  brandContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  brandName: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // Features
  featuresContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: modernTheme.borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 100,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Bottom
  bottom: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },

  // Start Button (Glass effect)
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: modernTheme.borderRadius.xl,
    gap: 10,
    ...modernTheme.shadows.xl,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: modernTheme.colors.primary,
  },
  startButtonIcon: {
    fontSize: 22,
    color: modernTheme.colors.primary,
  },

  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    width: 28,
    backgroundColor: '#FFFFFF',
  },
});

export default ModernWelcomeScreen;
