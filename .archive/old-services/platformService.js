import { Platform, NativeModules, PermissionsAndroid } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Application from 'expo-application';

class PlatformService {
  constructor() {
    this.platform = Platform.OS;
    this.isIOS = this.platform === 'ios';
    this.isAndroid = this.platform === 'android';
  }

  // Device information
  async getDeviceInfo() {
    return {
      platform: this.platform,
      version: Platform.Version,
      deviceName: await Device.getDeviceNameAsync(),
      deviceType: Device.deviceType,
      isDevice: Device.isDevice,
      brand: Device.brand,
      modelName: Device.modelName,
      osVersion: Device.osVersion,
      appVersion: Application.nativeApplicationVersion,
      buildNumber: Application.nativeBuildVersion
    };
  }

  // Permissions
  async requestPermissions() {
    if (this.isAndroid) {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      ];

      const results = await Promise.all(
        permissions.map(permission =>
          PermissionsAndroid.request(permission)
        )
      );

      return results.every(result => result === PermissionsAndroid.RESULTS.GRANTED);
    }

    return true; // iOS handles permissions through Info.plist
  }

  // Notifications
  async setupNotifications() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      if (this.isAndroid) {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    }

    return false;
  }

  // File system
  async getAppDirectory() {
    if (this.isIOS) {
      return FileSystem.documentDirectory;
    } else {
      return FileSystem.documentDirectory;
    }
  }

  async saveFile(uri, filename) {
    const directory = await this.getAppDirectory();
    const fileUri = `${directory}${filename}`;
    
    try {
      await FileSystem.copyAsync({
        from: uri,
        to: fileUri
      });
      return fileUri;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  // Platform-specific UI adjustments
  getPlatformSpecificStyles() {
    return {
      shadow: this.isIOS ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      } : {
        elevation: 5,
      },
      headerHeight: this.isIOS ? 44 : 56,
      statusBarHeight: this.isIOS ? 20 : 0,
    };
  }

  // Deep linking
  async setupDeepLinking() {
    if (this.isIOS) {
      // iOS deep linking setup
      return await Application.getInstallReferrerAsync();
    } else {
      // Android deep linking setup
      return await Application.getInstallReferrerAsync();
    }
  }

  // App lifecycle
  async handleAppStateChange(nextAppState) {
    if (nextAppState === 'active') {
      // App came to foreground
      await this.setupNotifications();
    } else if (nextAppState === 'background') {
      // App went to background
      // Handle background tasks
    }
  }

  // Platform-specific features
  async shareContent(content) {
    if (this.isIOS) {
      // iOS sharing
      return await NativeModules.ShareModule.share(content);
    } else {
      // Android sharing
      return await NativeModules.ShareModule.share(content);
    }
  }

  // Biometric authentication
  async authenticateWithBiometrics() {
    if (this.isIOS) {
      // iOS Face ID/Touch ID
      return await NativeModules.BiometricModule.authenticate();
    } else {
      // Android fingerprint
      return await NativeModules.BiometricModule.authenticate();
    }
  }
}

export default new PlatformService(); 