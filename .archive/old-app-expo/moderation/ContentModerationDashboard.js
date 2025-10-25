import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  Switch
} from 'react-native';
import ContentModerationService from '../../services/ContentModerationService';
import MetricsService from '../../services/MetricsService';

const { width, height } = Dimensions.get('window');

const ContentModerationDashboard = ({ onClose }) => {
  const [moderationData, setModerationData] = useState({
    moderationHistory: [],
    flaggedContent: [],
    blockedContent: [],
    appeals: [],
    userModerationStatus: new Map(),
    moderationMetrics: {}
  });
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [newContent, setNewContent] = useState({ text: '', type: 'text' });
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadModerationData();
    const interval = setInterval(loadModerationData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadModerationData = async () => {
    try {
      setIsLoading(true);
      const healthStatus = await ContentModerationService.getHealthStatus();
      setModerationData(healthStatus);
    } catch (error) {
      console.error('Error loading moderation data:', error);
      Alert.alert('Error', 'Failed to load moderation data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerateContent = async () => {
    if (!newContent.text.trim()) {
      Alert.alert('Error', 'Please enter content to moderate');
      return;
    }

    try {
      const result = await ContentModerationService.moderateContent(
        newContent.text,
        newContent.type
      );
      setShowModerationModal(false);
      setNewContent({ text: '', type: 'text' });
      loadModerationData();
      Alert.alert(
        'Moderation Result',
        `Action: ${result.action}\nSeverity: ${result.severity}\nConfidence: ${(result.confidence * 100).toFixed(1)}%`
      );
    } catch (error) {
      console.error('Error moderating content:', error);
      Alert.alert('Error', 'Failed to moderate content');
    }
  };

  const handleToggleRule = async (category, ruleName, enabled) => {
    try {
      // Update rule in service
      const rules = ContentModerationService.moderationRules;
      if (rules[category] && rules[category][ruleName]) {
        rules[category][ruleName].enabled = enabled;
        await ContentModerationService.saveModerationRules();
        loadModerationData();
      }
    } catch (error) {
      console.error('Error toggling rule:', error);
      Alert.alert('Error', 'Failed to update rule');
    }
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Moderation Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Moderation Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{moderationData.moderationMetrics?.totalContent || 0}</Text>
            <Text style={styles.metricLabel}>Total Content</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{moderationData.moderationMetrics?.flaggedContent || 0}</Text>
            <Text style={styles.metricLabel}>Flagged</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{moderationData.moderationMetrics?.blockedContent || 0}</Text>
            <Text style={styles.metricLabel}>Blocked</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {moderationData.moderationMetrics?.accuracy ? 
                (moderationData.moderationMetrics.accuracy * 100).toFixed(1) + '%' : '0%'}
            </Text>
            <Text style={styles.metricLabel}>Accuracy</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>
            {moderationData.moderationHistorySize || 0} total moderation actions
          </Text>
          <Text style={styles.activityText}>
            {moderationData.flaggedContentSize || 0} flagged content items
          </Text>
          <Text style={styles.activityText}>
            {moderationData.blockedContentSize || 0} blocked content items
          </Text>
          <Text style={styles.activityText}>
            {moderationData.appealsCount || 0} pending appeals
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowModerationModal(true)}
          >
            <Text style={styles.actionButtonText}>Moderate Content</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowRulesModal(true)}
          >
            <Text style={styles.actionButtonText}>Manage Rules</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderContentTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Moderation History ({moderationData.moderationHistorySize || 0})</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            Complete history of all content moderation actions, including flagged and blocked content.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flagged Content ({moderationData.flaggedContentSize || 0})</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            Content that has been flagged for review but not blocked.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Blocked Content ({moderationData.blockedContentSize || 0})</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            Content that has been blocked due to policy violations.
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderRulesTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Moderation Rules</Text>
        <View style={styles.rulesList}>
          {Object.keys(ContentModerationService.moderationRules).map(category => (
            <View key={category} style={styles.ruleCategory}>
              <Text style={styles.ruleCategoryTitle}>{category.toUpperCase()}</Text>
              {Object.keys(ContentModerationService.moderationRules[category]).map(ruleName => {
                const rule = ContentModerationService.moderationRules[category][ruleName];
                return (
                  <View key={ruleName} style={styles.ruleItem}>
                    <View style={styles.ruleInfo}>
                      <Text style={styles.ruleName}>{ruleName}</Text>
                      <Text style={styles.ruleDescription}>
                        Severity: {rule.severity} | Action: {rule.action}
                      </Text>
                    </View>
                    <Switch
                      value={rule.enabled}
                      onValueChange={(enabled) => handleToggleRule(category, ruleName, enabled)}
                      trackColor={{ false: '#333', true: '#4CAF50' }}
                      thumbColor={rule.enabled ? '#ffffff' : '#888'}
                    />
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderAppealsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appeals ({moderationData.appealsCount || 0})</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            User appeals for moderation decisions that need review.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appeal System Status</Text>
        <View style={styles.statusCard}>
          <Text style={styles.statusText}>
            Appeal System: {ContentModerationService.appealConfig.enabled ? 'Enabled' : 'Disabled'}
          </Text>
          <Text style={styles.statusText}>
            Max Appeals per User: {ContentModerationService.appealConfig.maxAppeals}
          </Text>
          <Text style={styles.statusText}>
            Review Time: {ContentModerationService.appealConfig.reviewTime / (24 * 60 * 60 * 1000)} days
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderModerationModal = () => (
    <Modal
      visible={showModerationModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Moderate Content</Text>
          
          <Text style={styles.modalLabel}>Content Type:</Text>
          <View style={styles.typeButtons}>
            {['text', 'image', 'audio', 'video'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  newContent.type === type && styles.typeButtonActive
                ]}
                onPress={() => setNewContent(prev => ({ ...prev, type }))}
              >
                <Text style={[
                  styles.typeButtonText,
                  newContent.type === type && styles.typeButtonTextActive
                ]}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.modalLabel}>Content:</Text>
          <TextInput
            style={[styles.modalInput, styles.contentInput]}
            value={newContent.text}
            onChangeText={(text) => setNewContent(prev => ({ ...prev, text }))}
            placeholder="Enter content to moderate..."
            multiline
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setShowModerationModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonConfirm]}
              onPress={handleModerateContent}
            >
              <Text style={styles.modalButtonText}>Moderate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderRulesModal = () => (
    <Modal
      visible={showRulesModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Moderation Rules</Text>
          
          <ScrollView style={styles.rulesModalContent}>
            {Object.keys(ContentModerationService.moderationRules).map(category => (
              <View key={category} style={styles.ruleCategory}>
                <Text style={styles.ruleCategoryTitle}>{category.toUpperCase()}</Text>
                {Object.keys(ContentModerationService.moderationRules[category]).map(ruleName => {
                  const rule = ContentModerationService.moderationRules[category][ruleName];
                  return (
                    <View key={ruleName} style={styles.ruleItem}>
                      <View style={styles.ruleInfo}>
                        <Text style={styles.ruleName}>{ruleName}</Text>
                        <Text style={styles.ruleDescription}>
                          Severity: {rule.severity} | Action: {rule.action}
                        </Text>
                        {rule.patterns && (
                          <Text style={styles.rulePatterns}>
                            Patterns: {rule.patterns.join(', ')}
                          </Text>
                        )}
                      </View>
                      <Switch
                        value={rule.enabled}
                        onValueChange={(enabled) => handleToggleRule(category, ruleName, enabled)}
                        trackColor={{ false: '#333', true: '#4CAF50' }}
                        thumbColor={rule.enabled ? '#ffffff' : '#888'}
                      />
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonConfirm]}
              onPress={() => setShowRulesModal(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const tabs = [
    { id: 'overview', title: 'Overview' },
    { id: 'content', title: 'Content' },
    { id: 'rules', title: 'Rules' },
    { id: 'appeals', title: 'Appeals' }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Content Moderation</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              selectedTab === tab.id && styles.tabActive
            ]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Text style={[
              styles.tabText,
              selectedTab === tab.id && styles.tabTextActive
            ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {selectedTab === 'overview' && renderOverviewTab()}
      {selectedTab === 'content' && renderContentTab()}
      {selectedTab === 'rules' && renderRulesTab()}
      {selectedTab === 'appeals' && renderAppealsTab()}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* Modals */}
      {renderModerationModal()}
      {renderRulesModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    width: (width - 48) / 2,
    marginBottom: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  activityText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flex: 0.45,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  rulesList: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  ruleCategory: {
    marginBottom: 20,
  },
  ruleCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  ruleInfo: {
    flex: 1,
  },
  ruleName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  rulePatterns: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  statusCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  modalInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 16,
  },
  contentInput: {
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flex: 0.4,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#333',
  },
  modalButtonConfirm: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  rulesModalContent: {
    maxHeight: 400,
  },
});

export default ContentModerationDashboard;
