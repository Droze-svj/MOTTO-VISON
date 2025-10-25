import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useMediaAnalytics from '../hooks/useMediaAnalytics';

const SettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    darkMode: false,
    highQuality: true,
    autoPlay: true,
    notifications: true,
    dataSaver: false,
    locationServices: false,
    analytics: true,
  });

  const { trackEngagement } = useMediaAnalytics({
    enableRealTime: true,
  });

  const handleSettingChange = useCallback(async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      await trackEngagement({
        type: 'setting_changed',
        setting: key,
        value,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  }, [settings, trackEngagement]);

  const handleClearCache = useCallback(async () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached media?',
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
              // Implement cache clearing logic here
              await trackEngagement({
                type: 'cache_cleared',
              });
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  }, [trackEngagement]);

  const handleLogout = useCallback(async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Implement logout logic here
              await trackEngagement({
                type: 'user_logout',
              });
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  }, [navigation, trackEngagement]);

  const renderSettingItem = (icon, title, description, value, onValueChange) => (
    <View style={styles.settingItem} accessible accessibilityRole="switch" accessibilityLabel={`${title} setting`} accessibilityHint={description}>
      <View style={styles.settingInfo}>
        <Ionicons
          name={icon}
          size={24}
          color={theme.colors.primary}
          style={styles.settingIcon}
          accessibilityElementsHidden // decorative
        />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]} accessibilityRole="header">
            {title}
          </Text>
          <Text
            style={[styles.settingDescription, { color: theme.colors.text + '80' }]}
          >
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.colors.border,
          true: theme.colors.primary + '80',
        }}
        thumbColor={value ? theme.colors.primary : theme.colors.text + '40'}
        accessibilityLabel={`Toggle ${title}`}
        accessibilityHint={description}
        accessibilityRole="switch"
      />
    </View>
  );

  const renderActionItem = (icon, title, onPress, destructive = false) => (
    <TouchableOpacity
      style={styles.actionItem}
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={`Tap to ${title.toLowerCase()}`}
    >
      <Ionicons
        name={icon}
        size={24}
        color={destructive ? theme.colors.error : theme.colors.primary}
        style={styles.actionIcon}
        accessibilityElementsHidden // decorative
      />
      <Text
        style={[
          styles.actionText,
          { color: destructive ? theme.colors.error : theme.colors.text },
        ]}
      >
        {title}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={24}
        color={theme.colors.text + '40'}
        accessibilityElementsHidden // decorative
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Appearance
        </Text>
        {renderSettingItem(
          'moon-outline',
          'Dark Mode',
          'Enable dark theme',
          settings.darkMode,
          (value) => handleSettingChange('darkMode', value)
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Media
        </Text>
        {renderSettingItem(
          'image-outline',
          'High Quality',
          'Download and stream media in high quality',
          settings.highQuality,
          (value) => handleSettingChange('highQuality', value)
        )}
        {renderSettingItem(
          'play-outline',
          'Auto Play',
          'Automatically play videos in feed',
          settings.autoPlay,
          (value) => handleSettingChange('autoPlay', value)
        )}
        {renderSettingItem(
          'cellular-outline',
          'Data Saver',
          'Reduce data usage when on mobile network',
          settings.dataSaver,
          (value) => handleSettingChange('dataSaver', value)
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Notifications
        </Text>
        {renderSettingItem(
          'notifications-outline',
          'Push Notifications',
          'Receive notifications for new content and interactions',
          settings.notifications,
          (value) => handleSettingChange('notifications', value)
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Privacy
        </Text>
        {renderSettingItem(
          'location-outline',
          'Location Services',
          'Allow app to access your location',
          settings.locationServices,
          (value) => handleSettingChange('locationServices', value)
        )}
        {renderSettingItem(
          'analytics-outline',
          'Analytics',
          'Help improve the app by sharing usage data',
          settings.analytics,
          (value) => handleSettingChange('analytics', value)
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Storage
        </Text>
        {renderActionItem(
          'trash-outline',
          'Clear Cache',
          handleClearCache
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Account
        </Text>
        {renderActionItem(
          'log-out-outline',
          'Logout',
          handleLogout,
          true
        )}
      </View>

      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: theme.colors.text + '40' }]}>
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  versionContainer: {
    padding: 16,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
  },
});

export default SettingsScreen; 