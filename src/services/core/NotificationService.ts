/**
 * Notification Service
 * Consolidates: Push notifications, alerts, in-app messaging
 */

import * as Notifications from 'expo-notifications';
import {Platform} from 'react-native';

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {
    this.configure();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private configure(): void {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  async requestPermissions(): Promise<boolean> {
    const {status} = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  async showLocal(title: string, body: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {title, body},
      trigger: null, // Show immediately
    });
  }

  async scheduleLocal(
    title: string,
    body: string,
    seconds: number
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {title, body},
      trigger: {seconds},
    });
  }

  async cancel(id: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export default NotificationService.getInstance();

