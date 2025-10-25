import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  FlatList,
  Modal
} from 'react-native';
import AdvancedSecurityService from '../../services/AdvancedSecurityService';
import MetricsService from '../../services/MetricsService';

const SecurityDashboard = ({ onClose }) => {
  const [securityLevel, setSecurityLevel] = useState('medium');
  const [privacySettings, setPrivacySettings] = useState({});
  const [accessControl, setAccessControl] = useState({});
  const [auditLog, setAuditLog] = useState([]);
  const [threatDetection, setThreatDetection] = useState({});
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      const [level, privacy, access, log, threats] = await Promise.all([
        AdvancedSecurityService.getSecurityLevel(),
        AdvancedSecurityService.getPrivacySettings(),
        AdvancedSecurityService.getAccessControl(),
        AdvancedSecurityService.getAuditLog({ limit: 50 }),
        AdvancedSecurityService.getHealthStatus()
      ]);

      setSecurityLevel(level.level);
      setPrivacySettings(privacy);
      setAccessControl(access);
      setAuditLog(log);
      setThreatDetection(threats);
    } catch (error) {
      console.error('Error loading security data:', error);
      Alert.alert('Error', 'Failed to load security data');
    }
  };

  const handleSecurityLevelChange = async (level) => {
    try {
      await AdvancedSecurityService.setSecurityLevel(level);
      setSecurityLevel(level);
      Alert.alert('Success', `Security level changed to ${level}`);
    } catch (error) {
      console.error('Error changing security level:', error);
      Alert.alert('Error', 'Failed to change security level');
    }
  };

  const handlePrivacySettingChange = async (setting, value) => {
    try {
      const updatedSettings = { ...privacySettings, [setting]: value };
      await AdvancedSecurityService.updatePrivacySettings({ [setting]: value });
      setPrivacySettings(updatedSettings);
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      Alert.alert('Error', 'Failed to update privacy setting');
    }
  };

  const handleAccessControlChange = async (setting, value) => {
    try {
      const updatedAccess = { ...accessControl, [setting]: value };
      await AdvancedSecurityService.updateAccessControl({ [setting]: value });
      setAccessControl(updatedAccess);
    } catch (error) {
      console.error('Error updating access control:', error);
      Alert.alert('Error', 'Failed to update access control');
    }
  };

  const renderSecurityLevel = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Security Level</Text>
      <View style={styles.levelContainer}>
        {['low', 'medium', 'high', 'maximum'].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.levelButton,
              securityLevel === level && styles.levelButtonActive
            ]}
            onPress={() => handleSecurityLevelChange(level)}
          >
            <Text style={[
              styles.levelButtonText,
              securityLevel === level && styles.levelButtonTextActive
            ]}>
              {level.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.levelDescription}>
        Current level: {securityLevel} - {getSecurityLevelDescription(securityLevel)}
      </Text>
    </View>
  );

  const renderPrivacySettings = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setShowPrivacySettings(!showPrivacySettings)}
        >
          <Text style={styles.expandButtonText}>
            {showPrivacySettings ? '−' : '+'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {showPrivacySettings && (
        <View style={styles.settingsContainer}>
          {Object.entries(privacySettings).map(([key, value]) => (
            <View key={key} style={styles.settingRow}>
              <Text style={styles.settingLabel}>{formatSettingName(key)}</Text>
              <Switch
                value={value}
                onValueChange={(newValue) => handlePrivacySettingChange(key, newValue)}
                trackColor={{ false: '#333', true: '#4CAF50' }}
                thumbColor={value ? '#ffffff' : '#888'}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderAccessControl = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Access Control</Text>
      <View style={styles.settingsContainer}>
        {Object.entries(accessControl).map(([key, value]) => (
          <View key={key} style={styles.settingRow}>
            <Text style={styles.settingLabel}>{formatSettingName(key)}</Text>
            {typeof value === 'boolean' ? (
              <Switch
                value={value}
                onValueChange={(newValue) => handleAccessControlChange(key, newValue)}
                trackColor={{ false: '#333', true: '#4CAF50' }}
                thumbColor={value ? '#ffffff' : '#888'}
              />
            ) : (
              <Text style={styles.settingValue}>{String(value)}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderThreatDetection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Threat Detection</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{threatDetection.blockedIPs || 0}</Text>
          <Text style={styles.statLabel}>Blocked IPs</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{threatDetection.auditLogSize || 0}</Text>
          <Text style={styles.statLabel}>Security Events</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {threatDetection.threatDetectionEnabled ? 'ON' : 'OFF'}
          </Text>
          <Text style={styles.statLabel}>Threat Detection</Text>
        </View>
      </View>
    </View>
  );

  const renderAuditLog = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Security Events</Text>
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setShowAuditLog(!showAuditLog)}
        >
          <Text style={styles.expandButtonText}>
            {showAuditLog ? '−' : '+'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {showAuditLog && (
        <View style={styles.auditLogContainer}>
          <FlatList
            data={auditLog.slice(0, 10)}
            renderItem={({ item }) => (
              <View style={styles.auditLogItem}>
                <View style={styles.auditLogHeader}>
                  <Text style={styles.auditLogEvent}>{item.event}</Text>
                  <Text style={[
                    styles.auditLogSeverity,
                    { color: getSeverityColor(item.severity) }
                  ]}>
                    {item.severity.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.auditLogTime}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
            style={styles.auditLogList}
          />
        </View>
      )}
    </View>
  );

  const getSecurityLevelDescription = (level) => {
    const descriptions = {
      low: 'Basic security with minimal encryption',
      medium: 'Standard security with encryption and logging',
      high: 'Enhanced security with comprehensive monitoring',
      maximum: 'Maximum security with full encryption and audit'
    };
    return descriptions[level] || 'Unknown security level';
  };

  const formatSettingName = (key) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336'
    };
    return colors[severity] || '#888';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Security Dashboard</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {renderSecurityLevel()}
        {renderPrivacySettings()}
        {renderAccessControl()}
        {renderThreatDetection()}
        {renderAuditLog()}
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  expandButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  levelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  levelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 8,
    marginBottom: 8,
  },
  levelButtonActive: {
    backgroundColor: '#4CAF50',
  },
  levelButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
  },
  levelButtonTextActive: {
    color: '#ffffff',
  },
  levelDescription: {
    fontSize: 12,
    color: '#888',
    lineHeight: 16,
  },
  settingsContainer: {
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingLabel: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
  },
  settingValue: {
    fontSize: 12,
    color: '#888',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  auditLogContainer: {
    marginTop: 8,
  },
  auditLogList: {
    maxHeight: 200,
  },
  auditLogItem: {
    padding: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 8,
  },
  auditLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  auditLogEvent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  auditLogSeverity: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  auditLogTime: {
    fontSize: 10,
    color: '#888',
  },
});

export default SecurityDashboard;
