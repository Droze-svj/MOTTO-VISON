import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import useApi from './useApi';
import useOfflineStorage from './useOfflineStorage';

const useMediaNotifications = (options = {}) => {
  const {
    enablePushNotifications = true,
    enableRealTime = true,
    updateInterval = 30000, // 30 seconds
  } = options;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState(null);

  const { request } = useApi({
    baseUrl: 'https://your-api.com',
    enableCache: false,
  });

  const {
    isOnline,
    createOffline,
    updateOffline,
    getAllOfflineData,
  } = useOfflineStorage({
    entityName: 'notifications',
    syncEndpoint: '/notifications',
  });

  const registerForPushNotifications = useCallback(async () => {
    if (!enablePushNotifications) return;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted for notifications');
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token;
    } catch (err) {
      console.error('Error registering for push notifications:', err);
      throw err;
    }
  }, [enablePushNotifications]);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isOnline) {
        const offlineData = getAllOfflineData();
        setNotifications(offlineData);
        setUnreadCount(offlineData.filter((n) => !n.read).length);
        return;
      }

      const response = await request({
        endpoint: '/notifications',
        method: 'GET',
      });

      setNotifications(response.data);
      setUnreadCount(response.data.filter((n) => !n.read).length);

      if (enablePushNotifications) {
        await createOffline({
          data: response.data,
          timestamp: new Date().toISOString(),
        });
      }

      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, enablePushNotifications, request, createOffline, getAllOfflineData]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      if (!isOnline) {
        await createOffline({
          type: 'mark_read',
          notificationId,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await request({
        endpoint: `/notifications/${notificationId}/read`,
        method: 'PUT',
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [isOnline, request, createOffline]);

  const markAllAsRead = useCallback(async () => {
    try {
      if (!isOnline) {
        await createOffline({
          type: 'mark_all_read',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await request({
        endpoint: '/notifications/read-all',
        method: 'PUT',
      });

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [isOnline, request, createOffline]);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      if (!isOnline) {
        await createOffline({
          type: 'delete',
          notificationId,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await request({
        endpoint: `/notifications/${notificationId}`,
        method: 'DELETE',
      });

      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
      setUnreadCount((prev) =>
        Math.max(0, prev - (notifications.find((n) => n.id === notificationId)?.read ? 0 : 1))
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [isOnline, request, createOffline, notifications]);

  const handleNotification = useCallback(async (notification) => {
    const { data } = notification;
    
    if (data.type === 'new_media') {
      // Handle new media notification
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          type: 'new_media',
          title: 'New Media Uploaded',
          message: `${data.userName} uploaded new media`,
          data,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);
    } else if (data.type === 'new_comment') {
      // Handle new comment notification
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          type: 'new_comment',
          title: 'New Comment',
          message: `${data.userName} commented on your media`,
          data,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);
    } else if (data.type === 'new_like') {
      // Handle new like notification
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          type: 'new_like',
          title: 'New Like',
          message: `${data.userName} liked your media`,
          data,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  useEffect(() => {
    if (enablePushNotifications) {
      registerForPushNotifications();
    }
  }, [enablePushNotifications, registerForPushNotifications]);

  useEffect(() => {
    if (enableRealTime) {
      const subscription = Notifications.addNotificationReceivedListener(
        handleNotification
      );

      return () => {
        subscription.remove();
      };
    }
  }, [enableRealTime, handleNotification]);

  useEffect(() => {
    let interval;
    if (enableRealTime) {
      fetchNotifications();
      interval = setInterval(fetchNotifications, updateInterval);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [enableRealTime, updateInterval, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    expoPushToken,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications,
  };
};

export default useMediaNotifications; 