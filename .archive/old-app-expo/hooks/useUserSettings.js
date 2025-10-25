import { useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useMediaAnalytics } from './useMediaAnalytics';

const USER_SETTINGS_KEY = 'user_settings';
const DEFAULT_SETTINGS = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatar: null,
  },
  preferences: {
    language: 'en',
    timeZone: 'UTC',
    darkMode: false,
    notifications: {
      messages: true,
      mediaUpdates: true,
      securityAlerts: true,
    },
  },
};

export const useUserSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { trackEvent } = useMediaAnalytics();

  // Load settings from secure storage
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const storedSettings = await SecureStore.getItemAsync(USER_SETTINGS_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (err) {
      setError('Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save settings to secure storage
  const saveSettings = useCallback(async (newSettings) => {
    try {
      setLoading(true);
      setError(null);
      await SecureStore.setItemAsync(USER_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      trackEvent('settings_updated', { settings: newSettings });
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setLoading(false);
    }
  }, [trackEvent]);

  // Update personal information
  const updatePersonalInfo = useCallback(async (personalInfo) => {
    try {
      setLoading(true);
      setError(null);
      const newSettings = {
        ...settings,
        personalInfo: {
          ...settings.personalInfo,
          ...personalInfo,
        },
      };
      await saveSettings(newSettings);
      trackEvent('personal_info_updated', { personalInfo });
    } catch (err) {
      setError('Failed to update personal information');
      console.error('Error updating personal info:', err);
    } finally {
      setLoading(false);
    }
  }, [settings, saveSettings, trackEvent]);

  // Update preferences
  const updatePreferences = useCallback(async (preferences) => {
    try {
      setLoading(true);
      setError(null);
      const newSettings = {
        ...settings,
        preferences: {
          ...settings.preferences,
          ...preferences,
        },
      };
      await saveSettings(newSettings);
      trackEvent('preferences_updated', { preferences });
    } catch (err) {
      setError('Failed to update preferences');
      console.error('Error updating preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [settings, saveSettings, trackEvent]);

  // Update notification settings
  const updateNotificationSettings = useCallback(async (notificationSettings) => {
    try {
      setLoading(true);
      setError(null);
      const newSettings = {
        ...settings,
        preferences: {
          ...settings.preferences,
          notifications: {
            ...settings.preferences.notifications,
            ...notificationSettings,
          },
        },
      };
      await saveSettings(newSettings);
      trackEvent('notification_settings_updated', { notificationSettings });
    } catch (err) {
      setError('Failed to update notification settings');
      console.error('Error updating notification settings:', err);
    } finally {
      setLoading(false);
    }
  }, [settings, saveSettings, trackEvent]);

  // Update avatar
  const updateAvatar = useCallback(async (avatarUri) => {
    try {
      setLoading(true);
      setError(null);
      const newSettings = {
        ...settings,
        personalInfo: {
          ...settings.personalInfo,
          avatar: avatarUri,
        },
      };
      await saveSettings(newSettings);
      trackEvent('avatar_updated');
    } catch (err) {
      setError('Failed to update avatar');
      console.error('Error updating avatar:', err);
    } finally {
      setLoading(false);
    }
  }, [settings, saveSettings, trackEvent]);

  return {
    settings,
    loading,
    error,
    loadSettings,
    updatePersonalInfo,
    updatePreferences,
    updateNotificationSettings,
    updateAvatar,
  };
}; 