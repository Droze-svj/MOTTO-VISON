import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  AccessibilityInfo,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/ThemeProvider';
import * as Haptics from 'expo-haptics';
import {
  getResponsiveFontSize,
  getResponsivePadding,
  getResponsiveMargin,
  platformStyles,
  deviceStyles,
  orientationStyles,
  isTablet,
  isLandscape,
  isNotchDevice,
  isFoldable,
  DEVICE_CATEGORY,
  SPACING,
  BORDER_RADIUS,
  accessibility,
  PLATFORM,
  gestureConfig,
} from '../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const VoiceCommandButton = ({ onPress, isListening, style }) => {
  const { theme } = useAppTheme();
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const rippleScaleAnim = useRef(new Animated.Value(0)).current;
  const rippleOpacityAnim = useRef(new Animated.Value(1)).current;

  // Check accessibility settings
  useEffect(() => {
    const checkSettings = async () => {
      const [isEnabled, isReduced] = await Promise.all([
        AccessibilityInfo.isScreenReaderEnabled(),
        AccessibilityInfo.isReduceMotionEnabled(),
      ]);
      setIsAccessibilityEnabled(isEnabled);
      setIsReducedMotionEnabled(isReduced);
    };
    checkSettings();

    const subscriptions = [
      AccessibilityInfo.addEventListener('screenReaderChanged', setIsAccessibilityEnabled),
      AccessibilityInfo.addEventListener('reduceMotionChanged', setIsReducedMotionEnabled),
    ];

    return () => subscriptions.forEach(sub => sub.remove());
  }, []);

  // Enhanced animations
  useEffect(() => {
    if (isListening && !isReducedMotionEnabled) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Ripple animation
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(rippleScaleAnim, {
              toValue: 1,
              duration: 1500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(rippleOpacityAnim, {
              toValue: 0,
              duration: 1500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(rippleScaleAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacityAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
      rippleScaleAnim.setValue(0);
      rippleOpacityAnim.setValue(1);
    }
  }, [isListening, isReducedMotionEnabled]);

  // Enhanced pan responder for gesture controls
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
          ...(Platform.OS === 'ios' ? { damping: 15 } : {}),
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 100;
        const scale = Math.max(0.8, 1 - distance / maxDistance);
        scaleAnim.setValue(scale);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          ...(Platform.OS === 'ios' ? { damping: 15 } : {}),
        }).start();

        if (distance < 50) {
          handlePress();
        }
      },
    })
  ).current;

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isAccessibilityEnabled) {
      AccessibilityInfo.announceForAccessibility(
        isListening ? 'Stopping voice command' : 'Starting voice command'
      );
    }

    onPress();
  };

  // Enhanced device-specific layout
  const getButtonLayout = () => {
    const baseSize = isTablet ? 80 : 60;
    const landscapeSize = isLandscape ? baseSize * 0.8 : baseSize;
    const foldableSize = isFoldable ? baseSize * 0.9 : landscapeSize;

    return {
      width: foldableSize,
      height: foldableSize,
      borderRadius: foldableSize / 2,
    };
  };

  const buttonLayout = getButtonLayout();

  // Enhanced accessibility props
  const getAccessibilityProps = () => ({
    accessible: true,
    accessibilityRole: 'button',
    accessibilityLabel: isListening ? 'Stop voice command' : 'Start voice command',
    accessibilityHint: 'Double tap to toggle voice command',
    ...(Platform.OS === 'ios' && {
      accessibilityActions: [
        { name: 'activate', label: 'Toggle voice command' },
      ],
    }),
  });

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: getResponsivePadding(theme.spacing.lg),
      right: getResponsivePadding(theme.spacing.lg),
      ...getButtonLayout(),
    },
    button: {
      width: '100%',
      height: '100%',
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.lg,
    },
    icon: {
      color: theme.colors.onPrimary,
      fontSize: getResponsiveFontSize(theme.typography.iconSize.lg),
    },
    ripple: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: theme.borderRadius.full,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.rippleContainer,
          {
            transform: [{ scale: rippleScaleAnim }],
            opacity: rippleOpacityAnim,
          },
        ]}
      >
        <View
          style={[
            styles.ripple,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: buttonLayout.borderRadius,
            },
          ]}
        />
      </Animated.View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.button,
          buttonLayout,
          {
            backgroundColor: theme.colors.primary,
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim },
            ],
          },
          platformStyles.shadow,
          deviceStyles.button,
        ]}
      >
        <Animated.View
          style={{
            transform: [{ rotate: rotation }],
          }}
        >
          <Ionicons
            name={isListening ? 'mic' : 'mic-outline'}
            size={getResponsiveFontSize(24)}
            color={theme.colors.background}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default VoiceCommandButton; 