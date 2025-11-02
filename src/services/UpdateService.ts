/**
 * Update Service
 * Checks for app updates and notifies users
 */

import { API_CONFIG, buildApiUrl } from '../config/api';
import { Platform, Linking, Alert } from 'react-native';

export interface AppVersion {
  version: string;
  build: string;
  minRequiredVersion?: string;
  updateAvailable: boolean;
  forceUpdate: boolean;
  updateUrl?: string;
  releaseNotes?: string;
}

class UpdateService {
  private updateCheckEndpoint = '/api/updates/check';
  private currentVersion: string;
  private currentBuild: string;

  constructor() {
    // Get version from package.json
    const packageJson = require('../../../package.json');
    this.currentVersion = packageJson.version || '1.0.0';
    
    // For iOS, build number comes from Info.plist (we'll set it manually for now)
    // For production builds, this should come from native code
    this.currentBuild = process.env.BUILD_NUMBER || '1';
  }

  /**
   * Check for available updates
   */
  async checkForUpdates(): Promise<AppVersion | null> {
    try {
      const response = await fetch(
        buildApiUrl(`${this.updateCheckEndpoint}?platform=${Platform.OS}&version=${this.currentVersion}&build=${this.currentBuild}`),
        {
          method: 'GET',
          headers: API_CONFIG.headers,
        }
      );

      if (!response.ok) {
        return null;
      }

      const updateInfo: AppVersion = await response.json();
      return updateInfo;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return null;
    }
  }

  /**
   * Check and notify user if update is available
   */
  async checkAndNotify(): Promise<void> {
    const updateInfo = await this.checkForUpdates();
    
    if (!updateInfo || !updateInfo.updateAvailable) {
      return;
    }

    if (updateInfo.forceUpdate) {
      // Force update - user must update
      Alert.alert(
        'Update Required',
        `A new version of MOTTO is required. Please update to continue.\n\n${updateInfo.releaseNotes || ''}`,
        [
          {
            text: 'Update Now',
            onPress: () => this.openUpdateUrl(updateInfo.updateUrl),
          },
        ],
        { cancelable: false }
      );
    } else {
      // Optional update
      Alert.alert(
        'Update Available',
        `A new version of MOTTO is available!\n\n${updateInfo.releaseNotes || 'Bug fixes and improvements'}`,
        [
          {
            text: 'Later',
            style: 'cancel',
          },
          {
            text: 'Update',
            onPress: () => this.openUpdateUrl(updateInfo.updateUrl),
          },
        ]
      );
    }
  }

  /**
   * Open update URL (TestFlight or App Store)
   */
  private openUpdateUrl(url?: string): void {
    if (url) {
      Linking.openURL(url);
    } else {
      // Default TestFlight URL (will be set when TestFlight is set up)
      if (Platform.OS === 'ios') {
        // TestFlight deep link
        Linking.openURL('https://testflight.apple.com/');
      } else {
        // Play Store
        Linking.openURL('market://details?id=com.yourcompany.motto');
      }
    }
  }

  /**
   * Get current version info
   */
  getCurrentVersion(): { version: string; build: string } {
    return {
      version: this.currentVersion,
      build: this.currentBuild,
    };
  }
}

export const updateService = new UpdateService();
export default updateService;

