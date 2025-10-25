import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  AccessibilityInfo,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  Easing,
  Image,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/ThemeProvider';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Image as ExpoImage } from 'expo-image';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TUTORIAL_COMPLETED_KEY = '@voice_tutorial_completed';
const PRACTICE_COMMANDS_KEY = '@voice_practice_commands';

const VoiceCommandTutorialScreen = ({ navigation }) => {
  const { theme } = useAppTheme();
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPractice, setShowPractice] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [practiceCommand, setPracticeCommand] = useState('');
  const [practiceProgress, setPracticeProgress] = useState(0);
  const [completedCommands, setCompletedCommands] = useState([]);
  const [showExamples, setShowExamples] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const practiceAnim = useRef(new Animated.Value(0)).current;

  // Load saved progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const [savedCommands, tutorialCompleted] = await Promise.all([
          AsyncStorage.getItem(PRACTICE_COMMANDS_KEY),
          AsyncStorage.getItem(TUTORIAL_COMPLETED_KEY),
        ]);
        
        if (savedCommands) {
          setCompletedCommands(JSON.parse(savedCommands));
        }
        
        if (tutorialCompleted === 'true') {
          navigation.navigate('Home');
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProgress();
  }, []);

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

  // Enhanced animations for step transitions
  useEffect(() => {
    if (!isReducedMotionEnabled) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          ...(Platform.OS === 'ios' ? { damping: 15 } : {}),
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          ...(Platform.OS === 'ios' ? { damping: 15 } : {}),
        }),
      ]).start();

      Animated.timing(progressAnim, {
        toValue: (currentStep + 1) / steps.length,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [currentStep, isReducedMotionEnabled]);

  // Enhanced pan responder for gesture controls
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx } = gestureState;
        const progress = Math.max(0, Math.min(1, 1 - dx / SCREEN_WIDTH));
        progressAnim.setValue(progress);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        if (Math.abs(dx) > SCREEN_WIDTH * 0.3 || Math.abs(vx) > 0.5) {
          if (dx > 0 && currentStep > 0) {
            handlePreviousStep();
          } else if (dx < 0 && currentStep < steps.length - 1) {
            handleNextStep();
          } else {
            Animated.spring(progressAnim, {
              toValue: (currentStep + 1) / steps.length,
              useNativeDriver: false,
            }).start();
          }
        } else {
          Animated.spring(progressAnim, {
            toValue: (currentStep + 1) / steps.length,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const steps = [
    {
      title: 'Welcome to Voice Commands',
      description: 'Control your app with simple voice commands. Let\'s get started!',
      icon: 'mic-outline',
      image: require('../assets/tutorial/welcome.png'),
      examples: ['Say "help" to see available commands', 'Try "go to home" to navigate'],
    },
    {
      title: 'Basic Navigation',
      description: 'Say "go to home" or "go to profile" to navigate between screens.',
      icon: 'navigate-outline',
      image: require('../assets/tutorial/navigation.png'),
      examples: ['"go to settings"', '"go to profile"', '"go back"'],
    },
    {
      title: 'Media Controls',
      description: 'Control your media with commands like "play", "pause", "next", and "previous".',
      icon: 'play-outline',
      image: require('../assets/tutorial/media.png'),
      examples: ['"play video"', '"pause"', '"next track"', '"previous track"'],
    },
    {
      title: 'Collection Management',
      description: 'Create and manage collections with voice commands like "create collection" or "show collections".',
      icon: 'folder-outline',
      image: require('../assets/tutorial/collections.png'),
      examples: ['"create collection"', '"show collections"', '"add to collection"'],
    },
    {
      title: 'Ready to Start!',
      description: 'You\'re all set to use voice commands. Try saying "help" anytime for a list of available commands.',
      icon: 'checkmark-circle-outline',
      image: require('../assets/tutorial/ready.png'),
      examples: ['"help"', '"what can I say?"', '"show commands"'],
    },
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error saving tutorial completion:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to save progress',
        text2: 'Please try again',
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  };

  const handlePracticeCommand = useCallback(async (command) => {
    try {
      setIsListening(true);
      setPracticeCommand(command);
      
      // Simulate voice recognition
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isCorrect = Math.random() > 0.3; // 70% success rate for demo
      
      if (isCorrect) {
        if (!completedCommands.includes(command)) {
          const newCompletedCommands = [...completedCommands, command];
          setCompletedCommands(newCompletedCommands);
          await AsyncStorage.setItem(PRACTICE_COMMANDS_KEY, JSON.stringify(newCompletedCommands));
        }
        
        setPracticeProgress(prev => Math.min(prev + 1, steps[currentStep].examples.length));
        
        Toast.show({
          type: 'success',
          text1: 'Great job!',
          text2: 'Command recognized correctly',
          position: 'bottom',
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Try again',
          text2: 'Command not recognized',
          position: 'bottom',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.error('Error practicing command:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to process command',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setIsListening(false);
    }
  }, [currentStep, completedCommands]);

  const renderPracticeModal = useCallback(() => (
    <Modal
      visible={showPractice}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPractice(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Practice Voice Commands
          </Text>
          
          <View style={styles.practiceProgress}>
            <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
              Progress: {practiceProgress}/{steps[currentStep].examples.length}
            </Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${(practiceProgress / steps[currentStep].examples.length) * 100}%`,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.commandsList}>
            {steps[currentStep].examples.map((command, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.commandItem,
                  {
                    backgroundColor: completedCommands.includes(command)
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                  },
                ]}
                onPress={() => handlePracticeCommand(command)}
                disabled={isListening || completedCommands.includes(command)}
                accessibilityRole="button"
                accessibilityLabel={`Practice command: ${command}`}
                accessibilityState={{
                  disabled: isListening || completedCommands.includes(command),
                  checked: completedCommands.includes(command),
                }}
              >
                <Text
                  style={[
                    styles.commandText,
                    {
                      color: completedCommands.includes(command)
                        ? theme.colors.onPrimaryContainer
                        : theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {command}
                </Text>
                {completedCommands.includes(command) && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={theme.colors.primary}
                  />
                )}
                {isListening && practiceCommand === command && (
                  <ActivityIndicator color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowPractice(false)}
            accessibilityRole="button"
            accessibilityLabel="Close practice mode"
          >
            <Text style={[styles.closeButtonText, { color: theme.colors.onPrimary }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  ), [showPractice, currentStep, practiceProgress, completedCommands, isListening, practiceCommand, theme.colors]);

  const renderExamplesModal = useCallback(() => (
    <Modal
      visible={showExamples}
      transparent
      animationType="slide"
      onRequestClose={() => setShowExamples(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Example Commands
          </Text>
          
          <ScrollView style={styles.examplesList}>
            {steps[currentStep].examples.map((example, index) => (
              <View
                key={index}
                style={[
                  styles.exampleItem,
                  { borderBottomColor: theme.colors.outline },
                ]}
              >
                <Ionicons
                  name="mic-outline"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.exampleText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {example}
                </Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowExamples(false)}
            accessibilityRole="button"
            accessibilityLabel="Close examples"
          >
            <Text style={[styles.closeButtonText, { color: theme.colors.onPrimary }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  ), [showExamples, currentStep, theme.colors]);

  // Enhanced device-specific layout
  const getLayout = () => {
    const baseLayout = {
      padding: SPACING.large,
      maxWidth: 600,
    };

    if (isLandscape) {
      return {
        ...baseLayout,
        flexDirection: 'row',
        alignItems: 'center',
      };
    }

    if (isTablet) {
      return {
        ...baseLayout,
        maxWidth: 800,
      };
    }

    if (DEVICE_CATEGORY.desktop) {
      return {
        ...baseLayout,
        maxWidth: 1000,
      };
    }

    return baseLayout;
  };

  const layout = getLayout();

  // Enhanced accessibility props
  const getAccessibilityProps = (step) => ({
    accessible: true,
    accessibilityRole: 'button',
    accessibilityLabel: `${step.title}. ${step.description}`,
    accessibilityHint: 'Double tap to proceed to the next step',
    ...(Platform.OS === 'ios' && {
      accessibilityActions: [
        { name: 'activate', label: 'Proceed to next step' },
      ],
    }),
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.content,
          layout,
          {
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.onSurface,
                fontSize: getResponsiveFontSize(24),
              },
            ]}
          >
            {steps[currentStep].title}
          </Text>
          <Ionicons
            name={steps[currentStep].icon}
            size={getResponsiveFontSize(32)}
            color={theme.colors.primary}
          />
        </View>

        <Animated.View
          style={[
            styles.imageContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <ExpoImage
            source={steps[currentStep].image}
            style={styles.image}
            contentFit='cover'
            transition={300}
            cachePolicy='memory-disk'
          />
        </Animated.View>

        <Text
          style={[
            styles.description,
            {
              color: theme.colors.onSurface,
              fontSize: getResponsiveFontSize(16),
            },
          ]}
        >
          {steps[currentStep].description}
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primaryContainer }]}
            onPress={() => setShowExamples(true)}
            accessibilityRole="button"
            accessibilityLabel="View example commands"
          >
            <Ionicons
              name="list-outline"
              size={24}
              color={theme.colors.onPrimaryContainer}
            />
            <Text
              style={[
                styles.actionButtonText,
                { color: theme.colors.onPrimaryContainer },
              ]}
            >
              Examples
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primaryContainer }]}
            onPress={() => setShowPractice(true)}
            accessibilityRole="button"
            accessibilityLabel="Practice voice commands"
          >
            <Ionicons
              name="mic-outline"
              size={24}
              color={theme.colors.onPrimaryContainer}
            />
            <Text
              style={[
                styles.actionButtonText,
                { color: theme.colors.onPrimaryContainer },
              ]}
            >
              Practice
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>

        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <Pressable
              onPress={handlePreviousStep}
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                {
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: theme.colors.surfaceVariant,
                },
              ]}
              {...getAccessibilityProps(steps[currentStep - 1])}
            >
              <Ionicons
                name="arrow-back"
                size={getResponsiveFontSize(20)}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: theme.colors.onSurfaceVariant,
                    fontSize: getResponsiveFontSize(16),
                  },
                ]}
              >
                Previous
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleNextStep}
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              {
                opacity: pressed ? 0.7 : 1,
                backgroundColor: theme.colors.primary,
              },
            ]}
            {...getAccessibilityProps(steps[currentStep])}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: theme.colors.onPrimary,
                  fontSize: getResponsiveFontSize(16),
                },
              ]}
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons
              name={currentStep === steps.length - 1 ? 'checkmark' : 'arrow-forward'}
              size={getResponsiveFontSize(20)}
              color={theme.colors.onPrimary}
            />
          </Pressable>
        </View>
      </Animated.View>
      {renderPracticeModal()}
      {renderExamplesModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.large,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: SPACING.medium,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: SPACING.large,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  description: {
    textAlign: 'center',
    marginBottom: SPACING.large,
    lineHeight: getResponsiveFontSize(24),
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.large,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.medium,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 120,
    justifyContent: 'center',
  },
  actionButtonText: {
    marginLeft: SPACING.small,
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    marginBottom: SPACING.large,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.medium,
    borderRadius: BORDER_RADIUS.medium,
    minHeight: accessibility.minimumTapArea.phone,
  },
  primaryButton: {
    flex: 1,
    marginLeft: SPACING.medium,
  },
  secondaryButton: {
    flex: 1,
    marginRight: SPACING.medium,
  },
  buttonText: {
    fontWeight: '600',
    marginHorizontal: SPACING.small,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    padding: SPACING.large,
    borderRadius: BORDER_RADIUS.large,
  },
  modalTitle: {
    fontSize: getResponsiveFontSize(24),
    fontWeight: '600',
    marginBottom: SPACING.large,
    textAlign: 'center',
  },
  practiceProgress: {
    marginBottom: SPACING.large,
  },
  progressText: {
    fontSize: getResponsiveFontSize(16),
    marginBottom: SPACING.small,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  commandsList: {
    marginBottom: SPACING.large,
  },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.medium,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.small,
  },
  commandText: {
    fontSize: getResponsiveFontSize(16),
    flex: 1,
    marginRight: SPACING.small,
  },
  examplesList: {
    maxHeight: 300,
    marginBottom: SPACING.large,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.medium,
    borderBottomWidth: 1,
  },
  exampleText: {
    fontSize: getResponsiveFontSize(16),
    marginLeft: SPACING.medium,
    flex: 1,
  },
  closeButton: {
    padding: SPACING.medium,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
  },
});

export default VoiceCommandTutorialScreen; 