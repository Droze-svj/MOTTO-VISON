import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import useSecurity from '../hooks/useSecurity';
import useMediaAnalytics from '../hooks/useMediaAnalytics';
import * as LocalAuthentication from 'expo-local-authentication';

const SecuritySettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    biometricEnabled: true,
    pinEnabled: false,
    deviceLockEnabled: true,
    secureStorageEnabled: true,
    autoLockEnabled: true,
    locationTrackingEnabled: false,
  });

  const {
    isBiometricAvailable,
    secureStore,
    validateSession,
  } = useSecurity({
    enableBiometrics: true,
    enableEncryption: true,
  });

  const { trackEngagement } = useMediaAnalytics({
    enableRealTime: true,
  });

  const handleSettingChange = useCallback(async (key, value) => {
    try {
      setIsLoading(true);
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await secureStore.setItem('securitySettings', newSettings);
      await trackEngagement({
        type: 'security_setting_changed',
        setting: key,
        value,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update security settings');
    } finally {
      setIsLoading(false);
    }
  }, [settings, secureStore, trackEngagement]);

  const handleTwoFactorSetup = useCallback(async () => {
    try {
      setIsLoading(true);
      // Implement 2FA setup logic here
      await trackEngagement({
        type: '2fa_setup_initiated',
      });
      navigation.navigate('TwoFactorSetup');
    } catch (error) {
      Alert.alert('Error', 'Failed to setup two-factor authentication');
    } finally {
      setIsLoading(false);
    }
  }, [navigation, trackEngagement]);

  const handlePinSetup = useCallback(async () => {
    try {
      setIsLoading(true);
      // Implement PIN setup logic here
      await trackEngagement({
        type: 'pin_setup_initiated',
      });
      navigation.navigate('PinSetup');
    } catch (error) {
      Alert.alert('Error', 'Failed to setup PIN');
    } finally {
      setIsLoading(false);
    }
  }, [navigation, trackEngagement]);

  const handleDeviceLock = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to change device lock settings',
      });

      if (result.success) {
        await handleSettingChange('deviceLockEnabled', !settings.deviceLockEnabled);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to change device lock settings');
    } finally {
      setIsLoading(false);
    }
  }, [settings.deviceLockEnabled, handleSettingChange]);

  const handleClearSecureData = useCallback(async () => {
    Alert.alert(
      'Clear Secure Data',
      'Are you sure you want to clear all secure data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              // Implement secure data clearing logic here
              await trackEngagement({
                type: 'secure_data_cleared',
              });
              Alert.alert('Success', 'Secure data cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear secure data');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }, [trackEngagement]);

  const renderSettingItem = (icon, title, description, value, onValueChange, onPress = null) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={isLoading}
    >
      <View style={styles.settingInfo}>
        <Ionicons
          name={icon}
          size={24}
          color={theme.colors.primary}
          style={styles.settingIcon}
        />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text
            style={[styles.settingDescription, { color: theme.colors.text + '80' }]}
          >
            {description}
          </Text>
        </View>
      </View>
      {onPress ? (
        <Ionicons
          name="chevron-forward"
          size={24}
          color={theme.colors.text + '40'}
        />
      ) : (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.primary + '80',
          }}
          thumbColor={value ? theme.colors.primary : theme.colors.text + '40'}
          disabled={isLoading}
        />
      )}
    </TouchableOpacity>
  );

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
          Security Settings
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Authentication
        </Text>
        {renderSettingItem(
          'shield-checkmark-outline',
          'Two-Factor Authentication',
          'Add an extra layer of security to your account',
          settings.twoFactorEnabled,
          (value) => handleSettingChange('twoFactorEnabled', value),
          handleTwoFactorSetup
        )}
        {isBiometricAvailable && renderSettingItem(
          'finger-print',
          'Biometric Authentication',
          'Use your fingerprint or face to unlock the app',
          settings.biometricEnabled,
          (value) => handleSettingChange('biometricEnabled', value)
        )}
        {renderSettingItem(
          'keypad-outline',
          'PIN Protection',
          'Set up a PIN code for additional security',
          settings.pinEnabled,
          (value) => handleSettingChange('pinEnabled', value),
          handlePinSetup
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Device Security
        </Text>
        {renderSettingItem(
          'lock-closed-outline',
          'Device Lock',
          'Lock the app when it's not in use',
          settings.deviceLockEnabled,
          handleDeviceLock
        )}
        {renderSettingItem(
          'time-outline',
          'Auto Lock',
          'Automatically lock the app after inactivity',
          settings.autoLockEnabled,
          (value) => handleSettingChange('autoLockEnabled', value)
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Data Security
        </Text>
        {renderSettingItem(
          'shield-outline',
          'Secure Storage',
          'Encrypt sensitive data on your device',
          settings.secureStorageEnabled,
          (value) => handleSettingChange('secureStorageEnabled', value)
        )}
        {renderSettingItem(
          'location-outline',
          'Location Tracking',
          'Allow location tracking for security features',
          settings.locationTrackingEnabled,
          (value) => handleSettingChange('locationTrackingEnabled', value)
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Data Management
        </Text>
        {renderSettingItem(
          'trash-outline',
          'Clear Secure Data',
          'Remove all securely stored data',
          false,
          null,
          handleClearSecureData
        )}
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SecuritySettingsScreen; 