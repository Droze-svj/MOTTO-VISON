import { useState, useCallback, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useMediaAnalytics } from './useMediaAnalytics';

export const useNotifications = () => {
  const [permissions, setPermissions] = useState(null);
  const [settings, setSettings] = useState({
    messages: true,
    mediaUpdates: true,
    securityAlerts: true,
    mentions: true,
    comments: true,
    likes: true,
    follows: true,
    marketing: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { trackEvent } = useMediaAnalytics();

  // Request notification permissions
  const requestPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!Device.isDevice) {
        throw new Error('Push notifications are not supported in the simulator');
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Permission to receive push notifications was denied');
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      setPermissions(finalStatus);
      trackEvent('notification_permissions_updated', { status: finalStatus });
    } catch (err) {
      setError(err.message);
      console.error('Error requesting notification permissions:', err);
    } finally {
      setLoading(false);
    }
  }, [trackEvent]);

  // Update notification settings
  const updateSettings = useCallback(async (newSettings) => {
    try {
      setLoading(true);
      setError(null);
      setSettings(newSettings);
      trackEvent('notification_settings_updated', { settings: newSettings });
    } catch (err) {
      setError('Failed to update notification settings');
      console.error('Error updating notification settings:', err);
    } finally {
      setLoading(false);
    }
  }, [trackEvent]);

  // Schedule a local notification
  const scheduleNotification = useCallback(async ({
    title,
    body,
    data = {},
    trigger = null,
  }) => {
    try {
      if (!permissions || permissions !== 'granted') {
        throw new Error('Notification permissions not granted');
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: trigger || null,
      });

      trackEvent('notification_scheduled', { title, notificationId });
      return notificationId;
    } catch (err) {
      console.error('Error scheduling notification:', err);
      throw err;
    }
  }, [permissions, trackEvent]);

  // Cancel a scheduled notification
  const cancelNotification = useCallback(async (notificationId) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      trackEvent('notification_cancelled', { notificationId });
    } catch (err) {
      console.error('Error cancelling notification:', err);
      throw err;
    }
  }, [trackEvent]);

  // Cancel all scheduled notifications
  const cancelAllNotifications = useCallback(async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      trackEvent('all_notifications_cancelled');
    } catch (err) {
      console.error('Error cancelling all notifications:', err);
      throw err;
    }
  }, [trackEvent]);

  // Get all scheduled notifications
  const getScheduledNotifications = useCallback(async () => {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (err) {
      console.error('Error getting scheduled notifications:', err);
      throw err;
    }
  }, []);

  // Set up notification handlers
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      trackEvent('notification_received', {
        title: notification.request.content.title,
        notificationId: notification.request.identifier,
      });
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      trackEvent('notification_response', {
        action: response.actionIdentifier,
        notificationId: response.notification.request.identifier,
      });
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, [trackEvent]);

  return {
    permissions,
    settings,
    loading,
    error,
    requestPermissions,
    updateSettings,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    getScheduledNotifications,
  };
}; 