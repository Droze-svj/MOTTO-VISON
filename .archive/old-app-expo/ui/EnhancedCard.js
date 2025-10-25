import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows, animation } from '../../constants/designSystem';

const { width } = Dimensions.get('window');

const EnhancedCard = ({
  title,
  subtitle,
  children,
  onPress,
  variant = 'default', // 'default', 'gradient', 'glass', 'elevated'
  size = 'medium', // 'small', 'medium', 'large'
  icon,
  iconColor,
  gradientColors,
  style,
  contentStyle,
  disabled = false,
  loading = false,
  badge,
  badgeColor,
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
        toValue: 0.98,
        duration: animation.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
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

  const getCardStyle = () => {
    const baseStyle = {
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
    };

    switch (variant) {
      case 'gradient':
        return {
          ...baseStyle,
          ...shadows.lg,
        };
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
        };
      case 'elevated':
        return {
          ...baseStyle,
          ...shadows.xl,
          backgroundColor: colors.background.primary,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: colors.background.primary,
          ...shadows.md,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { padding: spacing.sm };
      case 'large':
        return { padding: spacing.lg };
      default:
        return { padding: spacing.md };
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingDot, { opacity: opacityAnim }]} />
          <Animated.View style={[styles.loadingDot, { opacity: opacityAnim }]} />
          <Animated.View style={[styles.loadingDot, { opacity: opacityAnim }]} />
        </View>
      );
    }

    return (
      <>
        {(title || subtitle || icon) && (
          <View style={styles.header}>
            {icon && (
              <View style={[styles.iconContainer, { backgroundColor: iconColor || colors.primary[100] }]}>
                <Ionicons name={icon} size={20} color={iconColor || colors.primary[600]} />
              </View>
            )}
            <View style={styles.headerText}>
              {title && (
                <Text style={[styles.title, { color: colors.text.primary }]}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                  {subtitle}
                </Text>
              )}
            </View>
            {badge && (
              <View style={[styles.badge, { backgroundColor: badgeColor || colors.accent.success }]}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
        )}
        {children && (
          <View style={[styles.content, contentStyle]}>
            {children}
          </View>
        )}
      </>
    );
  };

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <Animated.View
      style={[
        styles.container,
        getCardStyle(),
        getSizeStyle(),
        {
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.6 : opacityAnim,
        },
        style,
      ]}
    >
      {variant === 'gradient' && gradientColors && (
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      
      <CardContainer
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={1}
        style={styles.cardContent}
        {...props}
      >
        {renderContent()}
      </CardContainer>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  cardContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.textStyles.h5,
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    ...typography.textStyles.body2,
  },
  content: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  badgeText: {
    ...typography.textStyles.caption,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    marginHorizontal: 2,
  },
});

export default EnhancedCard;
