/**
 * SettingsScreen
 * App settings and preferences
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useMultilingual } from '../hooks/useMultilingual';
import ContextMemoryService from '../services/core/ContextMemoryService';
import ResponseVarietyService from '../services/core/ResponseVarietyService';

const SettingsScreen: React.FC = () => {
  // Generate a consistent userId for this session
  const userId = React.useMemo(() => 'user_' + Date.now(), []);
  const {
    languageProfile,
    supportedLanguages,
    setUserLanguage
  } = useMultilingual(userId);

  const [autoDetectLanguage, setAutoDetectLanguage] = useState(
    languageProfile?.autoDetect ?? true
  );
  const [showSources, setShowSources] = useState(true);
  const [enableVoice, setEnableVoice] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Conversation History',
      'This will delete all conversation history. Your personalization profile will be kept. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await ContextMemoryService.clearHistory(userId);
            Alert.alert('Success', 'Conversation history cleared!');
          }
        }
      ]
    );
  };

  const handleResetProfile = () => {
    Alert.alert(
      'Reset Profile',
      'This will reset your personalization profile. All learning data will be lost. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await ResponseVarietyService.resetUser(userId);
            Alert.alert('Success', 'Profile reset! MOTTO will start learning from scratch.');
          }
        }
      ]
    );
  };

  const handleExportData = async () => {
    const stats = ContextMemoryService.getStats(userId);
    const varietyStats = ResponseVarietyService.getVarietyStats(userId);
    
    const exportData = {
      userId,
      timestamp: new Date().toISOString(),
      conversationStats: stats,
      varietyStats,
      languageProfile
    };

    // In a real app, this would trigger a file download or share
    console.log('Export data:', exportData);
    Alert.alert(
      'Export Ready',
      'Your data has been prepared for export. Check console for details.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌍 Language</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Current Language</Text>
              <Text style={styles.settingHint}>
                {supportedLanguages.find(l => l.code === languageProfile?.primaryLanguage)?.name || 'English'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.changeButton}
              onPress={() => {/* Open language selector */}}
            >
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Auto-Detect Language</Text>
              <Text style={styles.settingHint}>
                Automatically detect input language
              </Text>
            </View>
            <Switch
              value={autoDetectLanguage}
              onValueChange={setAutoDetectLanguage}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={autoDetectLanguage ? '#007AFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Display</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Show Sources</Text>
              <Text style={styles.settingHint}>
                Display knowledge sources in messages
              </Text>
            </View>
            <Switch
              value={showSources}
              onValueChange={setShowSources}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={showSources ? '#007AFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Voice Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎤 Voice</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Enable Voice Input</Text>
              <Text style={styles.settingHint}>
                Use speech-to-text for input
              </Text>
            </View>
            <Switch
              value={enableVoice}
              onValueChange={setEnableVoice}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={enableVoice ? '#007AFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Enable Notifications</Text>
              <Text style={styles.settingHint}>
                Get updates and reminders
              </Text>
            </View>
            <Switch
              value={enableNotifications}
              onValueChange={setEnableNotifications}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={enableNotifications ? '#007AFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 Data</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleExportData}
          >
            <Text style={styles.actionButtonText}>📤 Export My Data</Text>
            <Text style={styles.actionButtonHint}>
              Download your conversation history and profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleClearHistory}
          >
            <Text style={[styles.actionButtonText, styles.warningText]}>
              🗑️ Clear Conversation History
            </Text>
            <Text style={styles.actionButtonHint}>
              Removes messages, keeps your profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleResetProfile}
          >
            <Text style={[styles.actionButtonText, styles.dangerText]}>
              ⚠️ Reset Profile
            </Text>
            <Text style={styles.actionButtonHint}>
              MOTTO will forget everything (cannot be undone!)
            </Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>
          
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version:</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Services:</Text>
            <Text style={styles.aboutValue}>19 Active</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Languages:</Text>
            <Text style={styles.aboutValue}>100+</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Knowledge Sources:</Text>
            <Text style={styles.aboutValue}>85+</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Privacy:</Text>
            <Text style={styles.aboutValue}>100% Local</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            MOTTO - Your AI, Your Way 💙
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 24,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  settingHint: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  changeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  changeButtonText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  actionButtonHint: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  warningText: {
    color: '#F59E0B',
  },
  dangerText: {
    color: '#DC2626',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  aboutLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  aboutValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default SettingsScreen;