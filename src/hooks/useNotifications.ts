/**
 * Push Notifications Hook
 * Phase 5: Advanced notification system
 */

import {useState, useEffect, useCallback} from 'react';
import NotificationService from '../services/core/NotificationService';

export function useNotifications() {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const granted = await NotificationService.requestPermissions();
      setHasPermission(granted);
    } catch (error) {
      console.error('Permission check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = useCallback(async (
    title: string,
    body: string,
    delay?: number
  ) => {
    if (!hasPermission) {
      console.warn('Notifications not permitted');
      return;
    }

    try {
      if (delay) {
        await NotificationService.scheduleLocal(title, body, delay);
      } else {
        await NotificationService.showLocal(title, body);
      }
    } catch (error) {
      console.error('Notification failed:', error);
    }
  }, [hasPermission]);

  const requestPermission = useCallback(async () => {
    const granted = await NotificationService.requestPermissions();
    setHasPermission(granted);
    return granted;
  }, []);

  return {
    hasPermission,
    loading,
    sendNotification,
    requestPermission
  };
}

