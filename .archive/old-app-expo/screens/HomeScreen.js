import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useNotifications } from '../hooks/useNotifications';
import { useStorage } from '../hooks/useStorage';
import { useNetwork } from '../hooks/useNetwork';
import { useLocation } from '../hooks/useLocation';
import { useOrientation } from '../hooks/useOrientation';
import { useEnhancedVoiceCommand } from '../hooks/useEnhancedVoiceCommand';
import EnhancedCard from '../components/ui/EnhancedCard';
import EnhancedButton from '../components/ui/EnhancedButton';
import EnhancedInput from '../components/ui/EnhancedInput';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/designSystem';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import AIEnhancementService from '../services/AIEnhancementService';
import PerformanceOptimizationService from '../services/PerformanceOptimizationService';
import FuturisticLogo from '../components/FuturisticLogo';

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { permission: notificationPermission } = useNotifications();
  const { isConnected } = useNetwork();
  const { location, error: locationError } = useLocation();
  const { orientation } = useOrientation();
  
  // Enhanced voice command hook
  const {
    isListening,
    isProcessing,
    transcript,
    confidence,
    lastCommand,
    commandHistory,
    startListening,
    stopListening,
    getCommandStats
  } = useEnhancedVoiceCommand({
    contextAwareness: true,
    naturalLanguageProcessing: true
  });

  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [showVoiceStats, setShowVoiceStats] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Fetch tasks and notifications
      const fetchedTasks = await fetchTasks();
      const fetchedNotifications = await fetchNotifications();
      setTasks(fetchedTasks);
      setNotifications(fetchedNotifications);
      
      // Load AI insights and performance metrics
      await loadAIInsights();
      await loadPerformanceMetrics();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setRefreshing(false);
  };

  const fetchTasks = async () => {
    // Simulated task fetching
    return [
      { id: 1, title: 'Complete project proposal', status: 'pending', priority: 'high' },
      { id: 2, title: 'Review code changes', status: 'in_progress', priority: 'medium' },
      { id: 3, title: 'Team meeting', status: 'completed', priority: 'low' },
      { id: 4, title: 'Update documentation', status: 'pending', priority: 'medium' },
    ];
  };

  const fetchNotifications = async () => {
    // Simulated notification fetching
    return [
      { id: 1, message: 'New message from John', type: 'message', timestamp: new Date() },
      { id: 2, message: 'Task deadline approaching', type: 'task', timestamp: new Date() },
      { id: 3, message: 'Meeting reminder', type: 'meeting', timestamp: new Date() },
      { id: 4, message: 'Voice command accuracy improved', type: 'system', timestamp: new Date() },
    ];
  };

  const loadAIInsights = async () => {
    try {
      const insights = await AIEnhancementService.getConversationInsights();
      setAiInsights(insights);
    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  const loadPerformanceMetrics = async () => {
    try {
      const metrics = PerformanceOptimizationService.getPerformanceMetrics();
      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    }
  };

  useEffect(() => {
    onRefresh();
  }, []);

  const handleVoiceCommand = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  const renderQuickActions = () => (
    <EnhancedCard
      title={t('Quick Actions')}
      icon="flash"
      variant="elevated"
      style={styles.section}
    >
      <View style={styles.quickActions}>
        <EnhancedButton
          title={t('Enhanced Chat')}
          icon="chatbubbles"
          variant="gradient"
          gradientColors={colors.gradients.primary}
          onPress={() => navigation.navigate('EnhancedChat')}
          style={styles.actionButton}
        />
        
        <EnhancedButton
          title={t('Tasks')}
          icon="checkmark-circle"
          variant="gradient"
          gradientColors={colors.gradients.success}
          onPress={() => navigation.navigate('Tasks')}
          style={styles.actionButton}
        />
        
        <EnhancedButton
          title={t('Calendar')}
          icon="calendar"
          variant="gradient"
          gradientColors={colors.gradients.secondary}
          onPress={() => navigation.navigate('Calendar')}
          style={styles.actionButton}
        />
        
        <EnhancedButton
          title={t('Media')}
          icon="images"
          variant="gradient"
          gradientColors={colors.gradients.ocean}
          onPress={() => navigation.navigate('MediaGallery')}
          style={styles.actionButton}
        />
        
        <EnhancedButton
          title={t('Peak MOTTO')}
          icon="flash"
          variant="gradient"
          gradientColors={colors.gradients.fire}
          onPress={() => navigation.navigate('PeakMotto')}
          style={styles.actionButton}
        />
      </View>
    </EnhancedCard>
  );

  const renderVoiceCommandSection = () => (
    <EnhancedCard
      title={t('Voice Commands')}
      icon="mic"
      variant="glass"
      style={styles.section}
    >
      <View style={styles.voiceHeader}>
        <EnhancedButton
          title={isListening ? t('Stop Listening') : t('Start Listening')}
          icon={isListening ? "stop" : "mic"}
          variant={isListening ? "outline" : "gradient"}
          gradientColors={colors.gradients.primary}
          onPress={handleVoiceCommand}
          disabled={isProcessing}
          loading={isProcessing}
          size="large"
          fullWidth
        />
      </View>
      
      {isListening && (
        <View style={styles.listeningIndicator}>
          <Text style={[styles.listeningText, { color: colors.primary[500] }]}>
            {t('Listening...')} {transcript && `"${transcript}"`}
          </Text>
        </View>
      )}
      
      {showVoiceStats && (
        <View style={styles.voiceStats}>
          <EnhancedCard
            title={t('Voice Statistics')}
            variant="default"
            size="small"
          >
            <Text style={[styles.statsText, { color: colors.text.secondary }]}>
              {t('Confidence')}: {(confidence * 100).toFixed(1)}%
            </Text>
            <Text style={[styles.statsText, { color: colors.text.secondary }]}>
              {t('Commands')}: {commandHistory.length}
            </Text>
            {lastCommand && (
              <Text style={[styles.statsText, { color: colors.text.secondary }]}>
                {t('Last')}: {lastCommand.command}
              </Text>
            )}
          </EnhancedCard>
        </View>
      )}
      
      <EnhancedButton
        title={showVoiceStats ? t('Hide Stats') : t('Show Stats')}
        variant="ghost"
        onPress={() => setShowVoiceStats(!showVoiceStats)}
        style={styles.toggleStatsButton}
      />
    </EnhancedCard>
  );

  const renderTasks = () => (
    <Card style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('Recent Tasks')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>{t('View All')}</Text>
        </TouchableOpacity>
      </View>
      {tasks.slice(0, 3).map(task => (
        <TouchableOpacity
          key={task.id}
          style={[styles.taskItem, { borderBottomColor: colors.border }]}
          onPress={() => navigation.navigate('Tasks')}
        >
          <View style={styles.taskContent}>
            <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
            <View style={styles.taskMeta}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                <Text style={styles.statusText}>{task.status}</Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                <Text style={styles.priorityText}>{task.priority}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </Card>
  );

  const renderNotifications = () => (
    <Card style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('Notifications')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>{t('View All')}</Text>
        </TouchableOpacity>
      </View>
      {notifications.slice(0, 3).map(notification => (
        <TouchableOpacity
          key={notification.id}
          style={[styles.notificationItem, { borderBottomColor: colors.border }]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <View style={styles.notificationContent}>
            <Ionicons 
              name={getNotificationIcon(notification.type)} 
              size={16} 
              color={getNotificationColor(notification.type)} 
            />
            <Text style={[styles.notificationText, { color: colors.text }]}>{notification.message}</Text>
          </View>
          <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
            {formatTime(notification.timestamp)}
          </Text>
        </TouchableOpacity>
      ))}
    </Card>
  );

  const renderAIInsights = () => {
    if (!aiInsights) return null;

    return (
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('AI Insights')}</Text>
        <View style={styles.insightsGrid}>
          <View style={styles.insightItem}>
            <Text style={[styles.insightValue, { color: colors.primary }]}>
              {aiInsights.totalInteractions || 0}
            </Text>
            <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
              {t('Interactions')}
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={[styles.insightValue, { color: colors.success }]}>
              {Object.keys(aiInsights.commonIntents || {}).length}
            </Text>
            <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
              {t('Intents')}
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={[styles.insightValue, { color: colors.warning }]}>
              {aiInsights.sentimentTrend?.recent?.length || 0}
            </Text>
            <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
              {t('Recent')}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!performanceMetrics) return null;

    return (
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('Performance')}</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: colors.primary }]}>
              {performanceMetrics.hitRate.toFixed(1)}%
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {t('Cache Hit Rate')}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: colors.success }]}>
              {performanceMetrics.cacheEntries}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {t('Cache Entries')}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: colors.info }]}>
              {performanceMetrics.totalApiCalls}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {t('API Calls')}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderSystemStatus = () => (
    <Card style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('System Status')}</Text>
      <View style={styles.statusGrid}>
        <View style={styles.statusItem}>
          <Ionicons 
            name={isConnected ? "wifi" : "wifi-outline"} 
            size={20} 
            color={isConnected ? colors.success : colors.error} 
          />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {isConnected ? t('Connected') : t('Offline')}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Ionicons 
            name={notificationPermission ? "notifications" : "notifications-off"} 
            size={20} 
            color={notificationPermission ? colors.success : colors.warning} 
          />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {notificationPermission ? t('Notifications On') : t('Notifications Off')}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Ionicons 
            name="location" 
            size={20} 
            color={location ? colors.success : colors.error} 
          />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {location ? t('Location On') : t('Location Off')}
          </Text>
        </View>
      </View>
    </Card>
  );

  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'in_progress': return colors.warning;
      case 'pending': return colors.info;
      default: return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': return 'chatbubble';
      case 'task': return 'checkmark-circle';
      case 'meeting': return 'calendar';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message': return colors.primary;
      case 'task': return colors.success;
      case 'meeting': return colors.warning;
      case 'system': return colors.info;
      default: return colors.textSecondary;
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return time.toLocaleDateString();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.lightBackground }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <FuturisticLogo size={80} variant="default" />
        <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
          {t('Your intelligent assistant is ready to help')}
        </Text>
      </View>

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Voice Command Section */}
      {renderVoiceCommandSection()}

      {/* AI Insights */}
      {renderAIInsights()}

      {/* Performance Metrics */}
      {renderPerformanceMetrics()}

      {/* Tasks */}
      {renderTasks()}

      {/* Notifications */}
      {renderNotifications()}

      {/* System Status */}
      {renderSystemStatus()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  welcomeSection: {
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.md,
  },
  welcomeTitle: {
    ...typography.textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    ...typography.textStyles.body1,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    margin: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  viewAllText: {
    ...typography.textStyles.button,
    color: colors.primary[500],
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
    marginBottom: spacing.sm,
  },
  voiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningIndicator: {
    padding: 12,
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    marginBottom: 12,
  },
  listeningText: {
    fontSize: 14,
    fontWeight: '500',
  },
  voiceStats: {
    gap: 4,
    marginBottom: 12,
  },
  statsText: {
    fontSize: 12,
  },
  toggleStatsButton: {
    alignSelf: 'center',
  },
  toggleStatsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  taskItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  taskContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  notificationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 14,
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    marginLeft: 24,
  },
  insightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  insightItem: {
    alignItems: 'center',
  },
  insightValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  insightLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
  },
});

export default HomeScreen; 