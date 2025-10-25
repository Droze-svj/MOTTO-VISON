import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { futuristicColors, futuristicTypography, futuristicSpacing, futuristicShadows, futuristicBorderRadius } from '../constants/futuristicDesignSystem';
import FuturisticLogo from './FuturisticLogo';

const { width } = Dimensions.get('window');

const FuturisticHeader = ({ 
  title = "MOTTO",
  subtitle = "Neural Interface v2.0",
  status = "ONLINE",
  animated = true,
  style 
}) => {
  const glowAnimation = React.useRef(new Animated.Value(0)).current;
  const pulseAnimation = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (animated) {
      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, { toValue: 1, duration: 3000, useNativeDriver: false }),
          Animated.timing(glowAnimation, { toValue: 0, duration: 3000, useNativeDriver: false }),
        ])
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, { toValue: 1.05, duration: 2000, useNativeDriver: false }),
          Animated.timing(pulseAnimation, { toValue: 1, duration: 2000, useNativeDriver: false }),
        ])
      ).start();
    }
  }, [animated]);

  return (
    <Animated.View style={[
      styles.container,
      {
        shadowOpacity: glowAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 0.8],
        }),
        transform: [{ scale: pulseAnimation }],
      },
      style
    ]}>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <FuturisticLogo size={60} variant="glow" />
          <View style={styles.titleSection}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>
        
        <View style={styles.statusSection}>
          <Animated.View 
            style={[
              styles.statusDot,
              {
                backgroundColor: status === 'ONLINE' ? futuristicColors.status.online : futuristicColors.status.offline,
                opacity: pulseAnimation,
              }
            ]}
          />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
      
      {/* Futuristic accent line */}
      <View style={styles.accentLine} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: futuristicColors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: futuristicColors.primary[500],
    paddingTop: 50,
    paddingBottom: futuristicSpacing.md,
    paddingHorizontal: futuristicSpacing.md,
    ...futuristicShadows.glow,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleSection: {
    marginLeft: futuristicSpacing.md,
  },
  title: {
    fontSize: futuristicTypography.fontSize['4xl'],
    fontWeight: futuristicTypography.fontWeight.bold,
    color: futuristicColors.primary[500],
    letterSpacing: 2,
    textShadowColor: futuristicColors.primary[500],
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: futuristicTypography.fontSize.sm,
    color: futuristicColors.dark.textSecondary,
    fontWeight: futuristicTypography.fontWeight.medium,
    letterSpacing: 1,
    marginTop: futuristicSpacing.xs,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: futuristicColors.dark.card,
    paddingHorizontal: futuristicSpacing.sm,
    paddingVertical: futuristicSpacing.xs,
    borderRadius: futuristicBorderRadius.md,
    borderWidth: 1,
    borderColor: futuristicColors.dark.border,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: futuristicSpacing.xs,
  },
  statusText: {
    fontSize: futuristicTypography.fontSize.xs,
    color: futuristicColors.dark.text,
    fontWeight: futuristicTypography.fontWeight.semibold,
    letterSpacing: 1,
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: futuristicColors.primary[500],
    shadowColor: futuristicColors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default FuturisticHeader;
