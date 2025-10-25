import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import useSecurity from '../hooks/useSecurity';
import useMediaAnalytics from '../hooks/useMediaAnalytics';

const TwoFactorManagementScreen = ({ navigation }) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [backupCodes, setBackupCodes] = useState([]);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const { secureStore } = useSecurity({
    enableBiometrics: true,
    enableEncryption: true,
  });

  const { trackEngagement } = useMediaAnalytics({
    enableRealTime: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const enabled = await secureStore.getItem('twoFactorEnabled');
      const devices = await secureStore.getItem('trustedDevices');
      const codes = await secureStore.getItem('backupCodes');
      const email = await secureStore.getItem('recoveryEmail');

      setIs2FAEnabled(enabled === 'true');
      setTrustedDevices(devices ? JSON.parse(devices) : []);
      setBackupCodes(codes ? JSON.parse(codes) : []);
      setRecoveryEmail(email || '');
    } catch (error) {
      Alert.alert('Error', 'Failed to load 2FA settings');
    } finally {
      setIsLoading(false);
    }
  }, [secureStore]);

  const handleToggle2FA = useCallback(async () => {
    if (is2FAEnabled) {
      Alert.alert(
        'Disable 2FA',
        'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsLoading(true);
                await secureStore.setItem('twoFactorEnabled', 'false');
                setIs2FAEnabled(false);
                await trackEngagement({
                  type: '2fa_disabled',
                });
              } catch (error) {
                Alert.alert('Error', 'Failed to disable 2FA');
              } finally {
                setIsLoading(false);
              }
            },
          },
        ],
      );
    } else {
      navigation.navigate('TwoFactorSetup');
    }
  }, [is2FAEnabled, secureStore, navigation, trackEngagement]);

  const handleRemoveDevice = useCallback(async (deviceId) => {
    Alert.alert(
      'Remove Device',
      'Are you sure you want to remove this device? You will need to verify it again to use it.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const updatedDevices = trustedDevices.filter(d => d.id !== deviceId);
              await secureStore.setItem('trustedDevices', JSON.stringify(updatedDevices));
              setTrustedDevices(updatedDevices);
              await trackEngagement({
                type: '2fa_device_removed',
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to remove device');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  }, [trustedDevices, secureStore, trackEngagement]);

  const handleRegenerateBackupCodes = useCallback(async () => {
    Alert.alert(
      'Regenerate Backup Codes',
      'Are you sure you want to regenerate backup codes? Your existing codes will no longer work.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const newCodes = Array.from({ length: 10 }, () => 
                Math.random().toString(36).substring(2, 8).toUpperCase()
              );
              await secureStore.setItem('backupCodes', JSON.stringify(newCodes));
              setBackupCodes(newCodes);
              setShowBackupCodes(true);
              await trackEngagement({
                type: '2fa_backup_codes_regenerated',
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to regenerate backup codes');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  }, [secureStore, trackEngagement]);

  const handleUpdateRecoveryEmail = useCallback(async () => {
    navigation.navigate('UpdateRecoveryEmail', {
      currentEmail: recoveryEmail,
      onUpdate: async (newEmail) => {
        try {
          setIsLoading(true);
          await secureStore.setItem('recoveryEmail', newEmail);
          setRecoveryEmail(newEmail);
          await trackEngagement({
            type: '2fa_recovery_email_updated',
          });
        } catch (error) {
          Alert.alert('Error', 'Failed to update recovery email');
        } finally {
          setIsLoading(false);
        }
      },
    });
  }, [recoveryEmail, secureStore, navigation, trackEngagement]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Two-Factor Settings
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
              Two-Factor Authentication
            </Text>
            <Text style={[styles.settingDescription, { color: theme.colors.text + '80' }]}>
              Add an extra layer of security to your account
            </Text>
          </View>
          <Switch
            value={is2FAEnabled}
            onValueChange={handleToggle2FA}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
          />
        </View>
      </View>

      {is2FAEnabled && (
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Trusted Devices
            </Text>
            {trustedDevices.map((device) => (
              <View key={device.id} style={styles.deviceRow}>
                <View style={styles.deviceInfo}>
                  <Ionicons
                    name={device.type === 'mobile' ? 'phone-portrait' : 'desktop'}
                    size={24}
                    color={theme.colors.text}
                  />
                  <View style={styles.deviceDetails}>
                    <Text style={[styles.deviceName, { color: theme.colors.text }]}>
                      {device.name}
                    </Text>
                    <Text style={[styles.deviceLastUsed, { color: theme.colors.text + '80' }]}>
                      Last used: {device.lastUsed}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveDevice(device.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Backup Codes
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.colors.text + '80' }]}>
              Use these codes to access your account if you lose your authenticator device
            </Text>
            {showBackupCodes ? (
              <View style={styles.backupCodesList}>
                {backupCodes.map((code, index) => (
                  <Text key={index} style={[styles.backupCode, { color: theme.colors.primary }]}>
                    {code}
                  </Text>
                ))}
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowBackupCodes(true)}
              >
                <Text style={styles.buttonText}>Show Backup Codes</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
              onPress={handleRegenerateBackupCodes}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
                Regenerate Codes
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recovery Email
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.colors.text + '80' }]}>
              Used to recover your account if you lose access
            </Text>
            <View style={styles.recoveryEmailRow}>
              <Text style={[styles.recoveryEmail, { color: theme.colors.text }]}>
                {recoveryEmail || 'Not set'}
              </Text>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
                onPress={handleUpdateRecoveryEmail}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
                  {recoveryEmail ? 'Change' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceDetails: {
    marginLeft: 12,
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  deviceLastUsed: {
    fontSize: 12,
  },
  removeButton: {
    padding: 8,
  },
  backupCodesList: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  backupCode: {
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recoveryEmailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recoveryEmail: {
    fontSize: 16,
    flex: 1,
    marginRight: 16,
  },
});

export default TwoFactorManagementScreen; 