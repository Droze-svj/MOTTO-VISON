/**
 * Permissions Screen - Request necessary permissions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import VoiceIntegrationService from '../../services/core/VoiceIntegrationService';

interface PermissionsScreenProps {
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
}

interface Permission {
  id: string;
  icon: string;
  title: string;
  description: string;
  required: boolean;
  granted: boolean;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({
  onNext,
  onBack,
  onSkip,
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'microphone',
      icon: '🎤',
      title: 'Microphone Access',
      description: 'For voice conversations and hands-free interaction',
      required: false,
      granted: false,
    },
    {
      id: 'notifications',
      icon: '🔔',
      title: 'Notifications',
      description: 'Get reminders and updates from MOTTO',
      required: false,
      granted: false,
    },
  ]);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Check if permissions already granted
    checkExistingPermissions();
  }, []);

  const checkExistingPermissions = async () => {
    // Check voice permission
    const voiceAvailable = VoiceIntegrationService.isAvailable();
    if (voiceAvailable.speechToText) {
      updatePermission('microphone', true);
    }
  };

  const updatePermission = (id: string, granted: boolean) => {
    setPermissions(prev =>
      prev.map(p => (p.id === id ? { ...p, granted } : p))
    );
  };

  const requestPermission = async (permission: Permission) => {
    if (permission.granted) {
      Alert.alert('Already Granted', `${permission.title} is already enabled!`);
      return;
    }

    try {
      if (permission.id === 'microphone') {
        // Request microphone permission
        const voiceAvailable = VoiceIntegrationService.isAvailable();
        if (!voiceAvailable.speechToText) {
          Alert.alert(
            'Voice Not Available',
            'Voice recognition is not installed. Install @react-native-voice/voice to enable voice features.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Try to start listening (will trigger permission request)
        await VoiceIntegrationService.initialize();
        updatePermission('microphone', true);
        Alert.alert('Success', 'Microphone access granted!');
      } else if (permission.id === 'notifications') {
        // In production, use react-native-permissions
        // For now, simulate
        updatePermission('notifications', true);
        Alert.alert('Success', 'Notifications enabled!');
      }
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Permission Denied', 'You can enable this later in Settings.');
    }
  };

  const allGranted = permissions.every(p => p.granted || !p.required);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        {onSkip && (
          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.mainIcon}>🔐</Text>
        </View>

        <Text style={styles.title}>Grant Permissions</Text>
        <Text style={styles.subtitle}>
          Enable these features for the best experience. You can change these later in Settings.
        </Text>

        {/* Permission Cards */}
        <View style={styles.permissionsContainer}>
          {permissions.map((permission, index) => (
            <View key={permission.id} style={styles.permissionCard}>
              <View style={styles.permissionIconContainer}>
                <Text style={styles.permissionIcon}>{permission.icon}</Text>
              </View>
              <View style={styles.permissionContent}>
                <View style={styles.permissionHeader}>
                  <Text style={styles.permissionTitle}>{permission.title}</Text>
                  {permission.required && (
                    <View style={styles.requiredBadge}>
                      <Text style={styles.requiredText}>Required</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.permissionDescription}>
                  {permission.description}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.grantButton,
                    permission.granted && styles.grantButtonGranted,
                  ]}
                  onPress={() => requestPermission(permission)}
                  disabled={permission.granted}
                >
                  <Text
                    style={[
                      styles.grantButtonText,
                      permission.granted && styles.grantButtonTextGranted,
                    ]}
                  >
                    {permission.granted ? '✓ Granted' : 'Grant Access'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.privacyNote}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyText}>
            Your privacy is important. These permissions are only used to provide you with better features.
            You can revoke them anytime in Settings.
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !allGranted && styles.nextButtonDisabled]}
          onPress={onNext}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <Text style={styles.nextButtonIcon}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext} style={styles.skipLaterButton}>
          <Text style={styles.skipLaterText}>I'll do this later</Text>
        </TouchableOpacity>
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#1F2937',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 30,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  mainIcon: {
    fontSize: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 30,
    lineHeight: 24,
    textAlign: 'center',
  },
  permissionsContainer: {
    gap: 16,
  },
  permissionCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  permissionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  permissionIcon: {
    fontSize: 24,
  },
  permissionContent: {
    flex: 1,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  permissionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  requiredText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  grantButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  grantButtonGranted: {
    backgroundColor: '#10B981',
  },
  grantButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  grantButtonTextGranted: {
    color: '#FFFFFF',
  },
  privacyNote: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  privacyIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  nextButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  nextButtonIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  skipLaterButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  skipLaterText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#4F46E5',
  },
});

export default PermissionsScreen;
