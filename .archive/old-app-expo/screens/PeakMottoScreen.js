import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
  PanGestureHandler,
  State,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../providers/ThemeProvider';
import { colors } from '../constants/colors';
import { useAdvancedVoiceCommand } from '../hooks/useAdvancedVoiceCommand';
import AdvancedAIService from '../services/AdvancedAIService';
import PerformanceOptimizationService from '../services/PerformanceOptimizationService';
import FuturisticLogo from '../components/FuturisticLogo';
import { Haptics } from 'expo-haptics';
import { Audio } from 'expo-av';
import * as Sensors from 'expo-sensors';

// Advanced feedback utilities (imported from the hook)
const ADVANCED_FEEDBACK_UTILS = {
  playAdvancedFeedback: async (type, hapticType = 'light') => {
    try {
      await Haptics.impactAsync(hapticType === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy : 
                                hapticType === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : 
                                Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error playing advanced feedback:', error);
    }
  }
};

const { width, height } = Dimensions.get('window');

const PeakMottoScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [aiInsights, setAiInsights] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [systemHealth, setSystemHealth] = useState({});
  const [userProductivity, setUserProductivity] = useState({});
  const [realTimeData, setRealTimeData] = useState({});
  const [isPeakMode, setIsPeakMode] = useState(false);
  const [peakScore, setPeakScore] = useState(0);
  
  // Advanced voice command integration
  const {
    isListening,
    isProcessing,
    transcript,
    confidence,
    lastCommand,
    commandHistory,
    biometricStatus,
    gestureData,
    emotionData,
    predictiveCommands,
    voicePrint,
    healthMetrics,
    startListening,
    stopListening,
    getCommandStats
  } = useAdvancedVoiceCommand({
    contextAwareness: true,
    naturalLanguageProcessing: true,
    voiceBiometrics: true,
    ambientNoiseAdaptation: true,
    gestureRecognition: true,
    predictiveCommands: true,
    biometricAuthentication: true,
    emotionDetection: true
  });

  // Animation refs
  const peakModeAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const rotationAnimation = useRef(new Animated.Value(0)).current;

  // Real-time data refs
  const sensorSubscription = useRef(null);
  const performanceInterval = useRef(null);
  const aiUpdateInterval = useRef(null);

  useEffect(() => {
    initializePeakMode();
    startRealTimeMonitoring();
    loadPeakData();
    
    return () => {
      cleanupRealTimeMonitoring();
    };
  }, []);

  // Initialize peak mode
  const initializePeakMode = async () => {
    try {
      // Initialize advanced AI service
      await AdvancedAIService.initialize();
      
      // Initialize performance optimization
      await PerformanceOptimizationService.initialize();
      
      // Start peak mode animations
      startPeakAnimations();
      
      console.log('Peak MOTTO mode initialized successfully');
    } catch (error) {
      console.error('Error initializing peak mode:', error);
    }
  };

  // Start real-time monitoring
  const startRealTimeMonitoring = () => {
    // Monitor sensors
    if (Sensors.Accelerometer.isAvailableAsync()) {
      sensorSubscription.current = Sensors.Accelerometer.addListener((data) => {
        setRealTimeData(prev => ({
          ...prev,
          accelerometer: data
        }));
      });
    }

    // Monitor performance
    performanceInterval.current = setInterval(() => {
      updatePerformanceMetrics();
    }, 5000);

    // Update AI insights
    aiUpdateInterval.current = setInterval(() => {
      updateAIInsights();
    }, 10000);
  };

  // Cleanup real-time monitoring
  const cleanupRealTimeMonitoring = () => {
    if (sensorSubscription.current) {
      sensorSubscription.current.unsubscribe();
    }
    if (performanceInterval.current) {
      clearInterval(performanceInterval.current);
    }
    if (aiUpdateInterval.current) {
      clearInterval(aiUpdateInterval.current);
    }
  };

  // Load peak data
  const loadPeakData = async () => {
    try {
      setRefreshing(true);
      
      // Load AI insights
      const insights = await AdvancedAIService.getConversationInsights();
      setAiInsights(insights);
      
      // Load performance metrics
      const metrics = PerformanceOptimizationService.getPerformanceMetrics();
      setPerformanceMetrics(metrics);
      
      // Calculate system health
      const health = calculateSystemHealth();
      setSystemHealth(health);
      
      // Calculate user productivity
      const productivity = calculateUserProductivity();
      setUserProductivity(productivity);
      
      // Calculate peak score
      const score = calculatePeakScore(insights, metrics, health, productivity);
      setPeakScore(score);
      
    } catch (error) {
      console.error('Error loading peak data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Start peak animations
  const startPeakAnimations = () => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotationAnimation, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  };

  // Update performance metrics
  const updatePerformanceMetrics = async () => {
    try {
      const metrics = PerformanceOptimizationService.getPerformanceMetrics();
      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Error updating performance metrics:', error);
    }
  };

  // Update AI insights
  const updateAIInsights = async () => {
    try {
      const insights = await AdvancedAIService.getConversationInsights();
      setAiInsights(insights);
    } catch (error) {
      console.error('Error updating AI insights:', error);
    }
  };

  // Calculate system health
  const calculateSystemHealth = () => {
    const commandStats = getCommandStats();
    const voiceHealth = healthMetrics.voiceQuality === 'good' ? 100 : 
                       healthMetrics.voiceQuality === 'fair' ? 75 : 50;
    
    return {
      voiceRecognition: (commandStats.successRate || 0) * 100,
      biometricAccuracy: (commandStats.biometricAccuracy || 0) * 100,
      voiceHealth,
      overall: ((commandStats.successRate || 0) * 100 + (commandStats.biometricAccuracy || 0) * 100 + voiceHealth) / 3
    };
  };

  // Calculate user productivity
  const calculateUserProductivity = () => {
    const totalCommands = commandHistory.length;
    const successfulCommands = commandHistory.filter(cmd => cmd.score > 0.8).length;
    const efficiency = totalCommands > 0 ? (successfulCommands / totalCommands) * 100 : 0;
    
    return {
      totalCommands,
      successfulCommands,
      efficiency,
      averageConfidence: (getCommandStats().averageConfidence || 0) * 100,
      sessionDuration: Date.now() - (aiInsights?.sessionStartTime || Date.now())
    };
  };

  // Calculate peak score
  const calculatePeakScore = (insights, metrics, health, productivity) => {
    const aiScore = insights ? 85 : 50;
    const performanceScore = metrics ? 90 : 50;
    const healthScore = health.overall;
    const productivityScore = productivity.efficiency;
    
    return Math.round((aiScore + performanceScore + healthScore + productivityScore) / 4);
  };

  // Toggle peak mode
  const togglePeakMode = async () => {
    try {
      const newPeakMode = !isPeakMode;
      setIsPeakMode(newPeakMode);
      
      if (newPeakMode) {
        // Enter peak mode
        Animated.timing(peakModeAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
        
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await ADVANCED_FEEDBACK_UTILS.playAdvancedFeedback('success', 'heavy');
        
        // Optimize performance
        await PerformanceOptimizationService.optimizeForPeakMode();
        
        Alert.alert('Peak Mode Activated', 'MOTTO is now operating at maximum potential!');
      } else {
        // Exit peak mode
        Animated.timing(peakModeAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start();
        
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error toggling peak mode:', error);
    }
  };

  // Handle voice command
  const handleVoiceCommand = async () => {
    try {
      if (isListening) {
        await stopListening();
      } else {
        await startListening();
      }
    } catch (error) {
      console.error('Error handling voice command:', error);
    }
  };

  // Handle section change
  const handleSectionChange = (section) => {
    setActiveSection(section);
    Animated.timing(slideAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      slideAnimation.setValue(0);
    });
  };

  // Render peak score indicator
  const renderPeakScore = () => (
    <Animated.View style={[styles.peakScoreContainer, { transform: [{ scale: pulseAnimation }] }]}>
      <LinearGradient
        colors={isPeakMode ? ['#FFD700', '#FFA500'] : ['#4CAF50', '#45A049']}
        style={styles.peakScoreGradient}
      >
        <Text style={styles.peakScoreText}>{peakScore}</Text>
        <Text style={styles.peakScoreLabel}>Peak Score</Text>
      </LinearGradient>
    </Animated.View>
  );

  // Render voice command section
  const renderVoiceCommandSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Advanced Voice Control</Text>
      
      <View style={styles.voiceControlContainer}>
        <TouchableOpacity
          style={[
            styles.voiceButton,
            { backgroundColor: isListening ? colors.error : colors.primary },
            isPeakMode && styles.peakModeVoiceButton
          ]}
          onPress={handleVoiceCommand}
          disabled={isProcessing}
        >
          <Animated.View
            style={{
              transform: [{
                rotate: rotationAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              }]
            }}
          >
            <Ionicons
              name={isListening ? "stop" : "mic"}
              size={32}
              color="white"
            />
          </Animated.View>
        </TouchableOpacity>
        
        <View style={styles.voiceStatusContainer}>
          <Text style={[styles.voiceStatusText, { color: colors.textSecondary }]}>
            {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready'}
          </Text>
          {transcript && (
            <Text style={[styles.transcriptText, { color: colors.text }]}>
              "{transcript}"
            </Text>
          )}
          {confidence > 0 && (
            <Text style={[styles.confidenceText, { color: colors.primary }]}>
              Confidence: {Math.round(confidence * 100)}%
            </Text>
          )}
        </View>
      </View>
      
      {/* Biometric Status */}
      <View style={styles.biometricContainer}>
        <Text style={[styles.biometricLabel, { color: colors.textSecondary }]}>Biometric Status:</Text>
        <View style={styles.biometricIndicators}>
          <View style={[styles.biometricIndicator, { backgroundColor: biometricStatus === 'verified' ? colors.success : colors.warning }]}>
            <Ionicons name="finger-print" size={16} color="white" />
            <Text style={styles.biometricText}>Voice</Text>
          </View>
          <View style={[styles.biometricIndicator, { backgroundColor: emotionData?.emotion ? colors.info : colors.warning }]}>
            <Ionicons name="happy" size={16} color="white" />
            <Text style={styles.biometricText}>Emotion</Text>
          </View>
          <View style={[styles.biometricIndicator, { backgroundColor: healthMetrics.stressLevel === 'low' ? colors.success : colors.error }]}>
            <Ionicons name="heart" size={16} color="white" />
            <Text style={styles.biometricText}>Health</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Render AI insights section
  const renderAIInsightsSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Intelligence</Text>
      
      {aiInsights ? (
        <View style={styles.insightsContainer}>
          <View style={styles.insightCard}>
            <Ionicons name="analytics" size={24} color={colors.primary} />
            <Text style={[styles.insightValue, { color: colors.text }]}>
              {aiInsights?.totalInteractions || 0}
            </Text>
            <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
              Total Interactions
            </Text>
          </View>
          
          <View style={styles.insightCard}>
            <Ionicons name="trending-up" size={24} color={colors.success} />
            <Text style={[styles.insightValue, { color: colors.text }]}>
              {Object.keys(aiInsights?.commonIntents || {}).length}
            </Text>
            <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
              Intent Patterns
            </Text>
          </View>
          
          <View style={styles.insightCard}>
            <Ionicons name="happy" size={24} color={colors.info} />
            <Text style={[styles.insightValue, { color: colors.text }]}>
              {aiInsights?.sentimentTrend?.recent?.[0] || 'neutral'}
            </Text>
            <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
              Current Sentiment
            </Text>
          </View>
        </View>
      ) : (
        <ActivityIndicator size="large" color={colors.primary} />
      )}
    </View>
  );

  // Render performance metrics section
  const renderPerformanceSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance Metrics</Text>
      
      {performanceMetrics ? (
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Ionicons name="speedometer" size={24} color={colors.primary} />
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {(performanceMetrics?.cacheHitRate || 0).toFixed(1)}%
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              Cache Hit Rate
            </Text>
          </View>
          
          <View style={styles.metricCard}>
            <Ionicons name="flash" size={24} color={colors.success} />
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {(performanceMetrics?.averageLoadTime || 0).toFixed(0)}ms
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              Avg Load Time
            </Text>
          </View>
          
          <View style={styles.metricCard}>
            <Ionicons name="cellular" size={24} color={colors.info} />
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {performanceMetrics?.apiCalls || 0}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              API Calls
            </Text>
          </View>
        </View>
      ) : (
        <ActivityIndicator size="large" color={colors.primary} />
      )}
    </View>
  );

  // Render system health section
  const renderSystemHealthSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>System Health</Text>
      
      <View style={styles.healthContainer}>
        <View style={styles.healthMetric}>
          <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>Voice Recognition</Text>
          <View style={styles.healthBar}>
            <View 
              style={[
                styles.healthBarFill, 
                { 
                  width: `${systemHealth.voiceRecognition || 0}%`,
                  backgroundColor: systemHealth.voiceRecognition > 80 ? colors.success : 
                                   systemHealth.voiceRecognition > 60 ? colors.warning : colors.error
                }
              ]} 
            />
          </View>
          <Text style={[styles.healthValue, { color: colors.text }]}>
            {Math.round(systemHealth.voiceRecognition || 0)}%
          </Text>
        </View>
        
        <View style={styles.healthMetric}>
          <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>Biometric Accuracy</Text>
          <View style={styles.healthBar}>
            <View 
              style={[
                styles.healthBarFill, 
                { 
                  width: `${systemHealth.biometricAccuracy || 0}%`,
                  backgroundColor: systemHealth.biometricAccuracy > 80 ? colors.success : 
                                   systemHealth.biometricAccuracy > 60 ? colors.warning : colors.error
                }
              ]} 
            />
          </View>
          <Text style={[styles.healthValue, { color: colors.text }]}>
            {Math.round(systemHealth.biometricAccuracy || 0)}%
          </Text>
        </View>
        
        <View style={styles.healthMetric}>
          <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>Voice Health</Text>
          <View style={styles.healthBar}>
            <View 
              style={[
                styles.healthBarFill, 
                { 
                  width: `${systemHealth.voiceHealth || 0}%`,
                  backgroundColor: systemHealth.voiceHealth > 80 ? colors.success : 
                                   systemHealth.voiceHealth > 60 ? colors.warning : colors.error
                }
              ]} 
            />
          </View>
          <Text style={[styles.healthValue, { color: colors.text }]}>
            {Math.round(systemHealth.voiceHealth || 0)}%
          </Text>
        </View>
      </View>
    </View>
  );

  // Render user productivity section
  const renderProductivitySection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>User Productivity</Text>
      
      <View style={styles.productivityContainer}>
        <View style={styles.productivityCard}>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          <Text style={[styles.productivityValue, { color: colors.text }]}>
            {userProductivity.successfulCommands || 0}
          </Text>
          <Text style={[styles.productivityLabel, { color: colors.textSecondary }]}>
            Successful Commands
          </Text>
        </View>
        
        <View style={styles.productivityCard}>
          <Ionicons name="trending-up" size={24} color={colors.primary} />
          <Text style={[styles.productivityValue, { color: colors.text }]}>
            {Math.round(userProductivity.efficiency || 0)}%
          </Text>
          <Text style={[styles.productivityLabel, { color: colors.textSecondary }]}>
            Efficiency Rate
          </Text>
        </View>
        
        <View style={styles.productivityCard}>
          <Ionicons name="confidence" size={24} color={colors.info} />
          <Text style={[styles.productivityValue, { color: colors.text }]}>
            {Math.round(userProductivity.averageConfidence || 0)}%
          </Text>
          <Text style={[styles.productivityLabel, { color: colors.textSecondary }]}>
            Avg Confidence
          </Text>
        </View>
      </View>
    </View>
  );

  // Render navigation tabs
  const renderNavigationTabs = () => (
    <View style={styles.navigationTabs}>
      {['overview', 'ai', 'performance', 'health', 'productivity'].map((section) => (
        <TouchableOpacity
          key={section}
          style={[
            styles.navTab,
            activeSection === section && styles.activeNavTab
          ]}
          onPress={() => handleSectionChange(section)}
        >
          <Text style={[
            styles.navTabText,
            { color: activeSection === section ? colors.primary : colors.textSecondary }
          ]}>
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render active section content
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'ai':
        return renderAIInsightsSection();
      case 'performance':
        return renderPerformanceSection();
      case 'health':
        return renderSystemHealthSection();
      case 'productivity':
        return renderProductivitySection();
      default:
        return (
          <View>
            {renderVoiceCommandSection()}
            {renderAIInsightsSection()}
            {renderPerformanceSection()}
          </View>
        );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.lightBackground }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadPeakData} />
      }
    >
      {/* Header */}
      <Animated.View style={[
        styles.header,
        {
          transform: [{
            scale: peakModeAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.05],
            })
          }]
        }
      ]}>
        <LinearGradient
          colors={isPeakMode ? ['#FFD700', '#FFA500', '#FF6347'] : ['#4CAF50', '#45A049', '#2E7D32']}
          style={styles.headerGradient}
        >
          <FuturisticLogo size={100} variant="default" />
          <Text style={styles.headerSubtitle}>
            {isPeakMode ? 'Maximum Performance Mode' : 'Advanced AI Assistant'}
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Peak Score */}
      {renderPeakScore()}

      {/* Peak Mode Toggle */}
      <TouchableOpacity
        style={[
          styles.peakModeButton,
          isPeakMode && styles.peakModeActive
        ]}
        onPress={togglePeakMode}
      >
        <Ionicons
          name={isPeakMode ? "flash" : "flash-outline"}
          size={24}
          color={isPeakMode ? "white" : colors.primary}
        />
        <Text style={[
          styles.peakModeText,
          { color: isPeakMode ? "white" : colors.primary }
        ]}>
          {isPeakMode ? 'Peak Mode Active' : 'Activate Peak Mode'}
        </Text>
      </TouchableOpacity>

      {/* Navigation Tabs */}
      {renderNavigationTabs()}

      {/* Content */}
      <Animated.View style={[
        styles.content,
        {
          transform: [{
            translateX: slideAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -20],
            })
          }]
        }
      ]}>
        {renderActiveSection()}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 200,
    marginBottom: 20,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    margin: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
  peakScoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  peakScoreGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  peakScoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  peakScoreLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  peakModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightCard,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  peakModeActive: {
    backgroundColor: colors.primary,
  },
  peakModeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  navigationTabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: colors.lightCard,
    borderRadius: 12,
    padding: 4,
  },
  navTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeNavTab: {
    backgroundColor: colors.primary + '20',
  },
  navTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  voiceControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightCard,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  voiceButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  peakModeVoiceButton: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  voiceStatusContainer: {
    flex: 1,
  },
  voiceStatusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  biometricContainer: {
    backgroundColor: colors.lightCard,
    padding: 16,
    borderRadius: 12,
  },
  biometricLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  biometricIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  biometricIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  biometricText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
    fontWeight: '600',
  },
  insightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insightCard: {
    flex: 1,
    backgroundColor: colors.lightCard,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  insightLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.lightCard,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  healthContainer: {
    backgroundColor: colors.lightCard,
    padding: 16,
    borderRadius: 12,
  },
  healthMetric: {
    marginBottom: 16,
  },
  healthLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  healthBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 4,
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  healthValue: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  productivityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productivityCard: {
    flex: 1,
    backgroundColor: colors.lightCard,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  productivityValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  productivityLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default PeakMottoScreen;
