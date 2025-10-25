import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  AccessibilityInfo,
  Pressable,
  BackHandler,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/ThemeProvider';
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const QuickCommandsMenu = ({ visible, onClose, onCommandSelect }) => {
  const { theme } = useAppTheme();
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const commandScaleAnim = useRef(new Animated.Value(1)).current;

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

  // Handle back button on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (visible) {
          onClose();
          return true;
        }
        return false;
      });

      return () => backHandler.remove();
    }
  }, [visible, onClose]);

  // Enhanced animations
  useEffect(() => {
    if (visible && !isReducedMotionEnabled) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          ...(Platform.OS === 'ios' ? { damping: 15 } : {}),
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          ...(Platform.OS === 'ios' ? { damping: 15 } : {}),
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, isReducedMotionEnabled]);

  // Enhanced pan responder for gesture controls
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy / SCREEN_HEIGHT);
          scaleAnim.setValue(1 - gestureState.dy / SCREEN_HEIGHT * 0.1);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SCREEN_HEIGHT * 0.2) {
          onClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: true,
            ...(Platform.OS === 'ios' ? { damping: 15 } : {}),
          }).start();
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            ...(Platform.OS === 'ios' ? { damping: 15 } : {}),
          }).start();
        }
      },
    })
  ).current;

  const commands = [
    {
      category: 'Navigation',
      items: [
        { icon: 'home-outline', label: 'Go to Home', command: 'go to home' },
        { icon: 'person-outline', label: 'Go to Profile', command: 'go to profile' },
        { icon: 'settings-outline', label: 'Go to Settings', command: 'go to settings' },
      ],
    },
    {
      category: 'Media',
      items: [
        { icon: 'play-outline', label: 'Play', command: 'play' },
        { icon: 'pause-outline', label: 'Pause', command: 'pause' },
        { icon: 'skip-forward-outline', label: 'Next', command: 'next' },
        { icon: 'skip-back-outline', label: 'Previous', command: 'previous' },
      ],
    },
    {
      category: 'Collections',
      items: [
        { icon: 'add-circle-outline', label: 'Create Collection', command: 'create collection' },
        { icon: 'list-outline', label: 'Show Collections', command: 'show collections' },
      ],
    },
  ];

  const handleCommandSelect = (command) => {
    Animated.sequence([
      Animated.spring(commandScaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        ...(Platform.OS === 'ios' ? { damping: 15 } : {}),
      }),
      Animated.spring(commandScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...(Platform.OS === 'ios' ? { damping: 15 } : {}),
      }),
    ]).start(() => {
      onCommandSelect?.(command);
      onClose();
    });

    if (isAccessibilityEnabled) {
      AccessibilityInfo.announceForAccessibility(`Selected command: ${command}`);
    }
  };

  // Enhanced device-specific layout
  const getMenuLayout = () => {
    const baseLayout = {
      width: '90%',
      maxHeight: '80%',
    };

    if (isLandscape) {
      return {
        ...baseLayout,
        width: '50%',
        maxHeight: '80%',
      };
    }

    if (isTablet) {
      return {
        ...baseLayout,
        width: '60%',
        maxHeight: '70%',
      };
    }

    if (DEVICE_CATEGORY.desktop) {
      return {
        ...baseLayout,
        width: '40%',
        maxHeight: '60%',
      };
    }

    if (isFoldable) {
      return {
        ...baseLayout,
        width: '60%',
        maxHeight: '65%',
      };
    }

    return baseLayout;
  };

  const menuLayout = getMenuLayout();

  // Enhanced accessibility props
  const getAccessibilityProps = (item) => ({
    accessible: true,
    accessibilityRole: 'button',
    accessibilityLabel: item.label,
    accessibilityHint: `Double tap to execute ${item.label} command`,
    ...(Platform.OS === 'ios' && {
      accessibilityActions: [
        { name: 'activate', label: `Execute ${item.label} command` },
      ],
    }),
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: opacityAnim,
            backgroundColor: theme.colors.grey[900] + '80',
          },
        ]}
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.menu,
            menuLayout,
            {
              backgroundColor: theme.colors.background.paper,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SCREEN_HEIGHT, 0],
                  }),
                },
                { scale: scaleAnim },
              ],
            },
            platformStyles.shadow,
            deviceStyles.modal,
          ]}
        >
          <View style={[styles.header, { borderBottomColor: theme.colors.grey[200] }]}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text.primary,
                  fontSize: getResponsiveFontSize(20),
                },
              ]}
            >
              Quick Commands
            </Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
              accessibilityHint="Double tap to close the quick commands menu"
            >
              <Ionicons
                name="close"
                size={getResponsiveFontSize(24)}
                color={theme.colors.text.primary}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {commands.map((section) => (
              <View key={section.category} style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: theme.colors.text.primary,
                      fontSize: getResponsiveFontSize(16),
                    },
                  ]}
                >
                  {section.category}
                </Text>
                <View style={styles.commandGrid}>
                  {section.items.map((item) => (
                    <Animated.View
                      key={item.command}
                      style={{
                        transform: [{ scale: commandScaleAnim }],
                      }}
                    >
                      <Pressable
                        style={({ pressed }) => [
                          styles.commandItem,
                          {
                            backgroundColor: theme.colors.background.default,
                            padding: getResponsivePadding(12),
                            margin: getResponsiveMargin(4),
                            borderRadius: theme.borderRadius.md,
                            opacity: pressed ? 0.7 : 1,
                            minHeight: accessibility.minimumTapArea.phone,
                            minWidth: accessibility.minimumTapArea.phone,
                          },
                          deviceStyles.button,
                        ]}
                        onPress={() => handleCommandSelect(item.command)}
                        {...getAccessibilityProps(item)}
                      >
                        <Ionicons
                          name={item.icon}
                          size={getResponsiveFontSize(24)}
                          color={theme.colors.primary.main}
                        />
                        <Text
                          style={[
                            styles.commandLabel,
                            {
                              color: theme.colors.text.primary,
                              fontSize: getResponsiveFontSize(14),
                              marginTop: getResponsiveMargin(4),
                            },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.medium,
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: 'bold',
  },
  closeButton: {
    padding: SPACING.small,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.medium,
  },
  section: {
    marginBottom: SPACING.large,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: SPACING.small,
  },
  commandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  commandItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  commandLabel: {
    textAlign: 'center',
  },
});

export default QuickCommandsMenu; 