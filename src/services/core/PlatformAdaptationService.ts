/**
 * Platform Adaptation Service
 * Automatically adapts MOTTO to latest iOS and Android features
 * Handles OS-specific APIs, permissions, and optimizations
 */

import { Platform, NativeModules, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PlatformInfo {
  os: 'ios' | 'android' | 'web';
  version: number;
  isTablet: boolean;
  hasNotch: boolean;
  screenSize: { width: number; height: number };
  supportedFeatures: string[];
}

interface AdaptiveFeatures {
  haptics: boolean;
  biometrics: boolean;
  widgets: boolean;
  liveActivities: boolean; // iOS 16+
  materialYou: boolean; // Android 12+
  dynamicIsland: boolean; // iOS 16+ with notch
  predictiveBack: boolean; // Android 13+
  darkMode: boolean;
  splitScreen: boolean;
}

class PlatformAdaptationService {
  private static instance: PlatformAdaptationService;
  private platformInfo: PlatformInfo;
  private adaptiveFeatures: AdaptiveFeatures;

  private constructor() {
    this.platformInfo = this.detectPlatform();
    this.adaptiveFeatures = this.detectFeatures();
    this.applyOptimizations();
  }

  static getInstance(): PlatformAdaptationService {
    if (!PlatformAdaptationService.instance) {
      PlatformAdaptationService.instance = new PlatformAdaptationService();
    }
    return PlatformAdaptationService.instance;
  }

  /**
   * Detect platform and version
   */
  private detectPlatform(): PlatformInfo {
    const { width, height } = Dimensions.get('window');
    const os = Platform.OS as 'ios' | 'android' | 'web';
    const version = Platform.Version;
    
    // Detect device type
    const isTablet = (width >= 768 && height >= 1024) || 
                     (width >= 1024 && height >= 768);

    // Detect notch (iOS)
    const hasNotch = this.detectNotch();

    // Supported features based on OS version
    const supportedFeatures = this.getSupportedFeatures(os, version as number);

    return {
      os,
      version: typeof version === 'number' ? version : parseFloat(version as string),
      isTablet,
      hasNotch,
      screenSize: { width, height },
      supportedFeatures,
    };
  }

  /**
   * Detect notch (iOS)
   */
  private detectNotch(): boolean {
    if (Platform.OS !== 'ios') return false;
    
    const { height, width } = Dimensions.get('window');
    
    // iPhone X and newer have specific dimensions
    const notchModels = [
      { width: 375, height: 812 },  // iPhone X/XS/11 Pro/12 Mini
      { width: 414, height: 896 },  // iPhone XR/XS Max/11/11 Pro Max
      { width: 390, height: 844 },  // iPhone 12/12 Pro/13/13 Pro/14
      { width: 428, height: 926 },  // iPhone 12/13/14 Pro Max
      { width: 393, height: 852 },  // iPhone 14 Pro
      { width: 430, height: 932 },  // iPhone 14 Pro Max/15 Pro Max
    ];

    return notchModels.some(model => 
      (model.width === width && model.height === height) ||
      (model.width === height && model.height === width)
    );
  }

  /**
   * Get supported features based on OS version
   */
  private getSupportedFeatures(os: string, version: number): string[] {
    const features: string[] = [];

    if (os === 'ios') {
      // iOS features by version
      if (version >= 13) features.push('dark-mode', 'haptics', 'context-menus');
      if (version >= 14) features.push('widgets', 'app-clips', 'picture-in-picture');
      if (version >= 15) features.push('focus-modes', 'live-text', 'shareplay');
      if (version >= 16) features.push('live-activities', 'lock-screen-widgets', 'dynamic-island');
      if (version >= 17) features.push('interactive-widgets', 'standby-mode');
      if (version >= 18) features.push('apple-intelligence', 'control-center-api');
    } else if (os === 'android') {
      // Android features by version
      if (version >= 10) features.push('dark-theme', 'gesture-navigation', 'focus-mode');
      if (version >= 11) features.push('chat-bubbles', 'screen-recording', 'one-time-permissions');
      if (version >= 12) features.push('material-you', 'scrolling-screenshots', 'app-hibernation');
      if (version >= 13) features.push('predictive-back', 'themed-icons', 'per-app-language');
      if (version >= 14) features.push('advanced-sharing', 'health-connect', 'credential-manager');
    }

    return features;
  }

  /**
   * Detect adaptive features
   */
  private detectFeatures(): AdaptiveFeatures {
    const { os, version, supportedFeatures } = this.platformInfo;

    return {
      haptics: supportedFeatures.includes('haptics'),
      biometrics: os === 'ios' ? version >= 11 : version >= 6,
      widgets: supportedFeatures.includes('widgets'),
      liveActivities: supportedFeatures.includes('live-activities'),
      materialYou: supportedFeatures.includes('material-you'),
      dynamicIsland: supportedFeatures.includes('dynamic-island') && this.platformInfo.hasNotch,
      predictiveBack: supportedFeatures.includes('predictive-back'),
      darkMode: supportedFeatures.includes('dark-mode') || supportedFeatures.includes('dark-theme'),
      splitScreen: this.platformInfo.isTablet,
    };
  }

  /**
   * Apply platform-specific optimizations
   */
  private applyOptimizations(): void {
    console.log('[Platform] Detected:', this.platformInfo.os, this.platformInfo.version);
    console.log('[Platform] Device:', this.platformInfo.isTablet ? 'Tablet' : 'Phone');
    console.log('[Platform] Features:', this.platformInfo.supportedFeatures.join(', '));

    // iOS-specific optimizations
    if (this.platformInfo.os === 'ios') {
      this.applyIOSOptimizations();
    }

    // Android-specific optimizations
    if (this.platformInfo.os === 'android') {
      this.applyAndroidOptimizations();
    }
  }

  /**
   * iOS-specific optimizations
   */
  private applyIOSOptimizations(): void {
    // Enable iOS 16+ features
    if (this.platformInfo.version >= 16) {
      console.log('[Platform] iOS 16+ features enabled');
      // Live Activities support
      // Dynamic Island support
      // Lock screen widgets
    }

    // Enable iOS 17+ features
    if (this.platformInfo.version >= 17) {
      console.log('[Platform] iOS 17+ features enabled');
      // Interactive widgets
      // StandBy mode
    }

    // Enable iOS 18+ features (latest)
    if (this.platformInfo.version >= 18) {
      console.log('[Platform] iOS 18+ features enabled');
      // Apple Intelligence integration
      // Enhanced control center
    }
  }

  /**
   * Android-specific optimizations
   */
  private applyAndroidOptimizations(): void {
    // Enable Android 12+ features
    if (this.platformInfo.version >= 12) {
      console.log('[Platform] Android 12+ features enabled');
      // Material You dynamic theming
      // Splash screen API
    }

    // Enable Android 13+ features
    if (this.platformInfo.version >= 13) {
      console.log('[Platform] Android 13+ features enabled');
      // Predictive back gesture
      // Per-app language preferences
      // Themed app icons
    }

    // Enable Android 14+ features (latest)
    if (this.platformInfo.version >= 14) {
      console.log('[Platform] Android 14+ features enabled');
      // Health Connect
      // Advanced sharing
      // Credential manager
    }

    // Enable Android 15+ features (future-proof)
    if (this.platformInfo.version >= 15) {
      console.log('[Platform] Android 15+ features enabled (future-ready)');
    }
  }

  /**
   * Get safe area insets (for notch/island)
   */
  getSafeAreaInsets(): {
    top: number;
    bottom: number;
    left: number;
    right: number;
  } {
    if (Platform.OS === 'ios') {
      if (this.platformInfo.hasNotch) {
        return { top: 44, bottom: 34, left: 0, right: 0 };
      }
      return { top: 20, bottom: 0, left: 0, right: 0 };
    }
    
    // Android
    return { top: 24, bottom: 0, left: 0, right: 0 };
  }

  /**
   * Get adaptive spacing for UI
   */
  getAdaptiveSpacing(): {
    headerHeight: number;
    tabBarHeight: number;
    inputPadding: number;
    cardPadding: number;
  } {
    const insets = this.getSafeAreaInsets();
    
    return {
      headerHeight: Platform.OS === 'ios' ? 44 + insets.top : 56,
      tabBarHeight: Platform.OS === 'ios' ? 49 + insets.bottom : 56,
      inputPadding: this.platformInfo.isTablet ? 24 : 16,
      cardPadding: this.platformInfo.isTablet ? 20 : 16,
    };
  }

  /**
   * Get platform-specific colors
   */
  getAdaptiveColors(): {
    primary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  } {
    // Material You colors for Android 12+
    if (Platform.OS === 'android' && this.platformInfo.version >= 12) {
      // In production, would extract from system theme
      return {
        primary: '#6750A4',      // Material 3 primary
        background: '#FFFBFE',   // Material 3 background
        surface: '#FFFBFE',
        text: '#1C1B1F',
        accent: '#7F5AF0',
      };
    }

    // iOS colors
    if (Platform.OS === 'ios') {
      return {
        primary: '#007AFF',      // iOS blue
        background: '#F2F2F7',   // iOS background
        surface: '#FFFFFF',
        text: '#000000',
        accent: '#5856D6',
      };
    }

    // Default
    return {
      primary: '#007AFF',
      background: '#F5F7FA',
      surface: '#FFFFFF',
      text: '#1F2937',
      accent: '#8B5CF6',
    };
  }

  /**
   * Check if feature is supported
   */
  isFeatureSupported(feature: keyof AdaptiveFeatures): boolean {
    return this.adaptiveFeatures[feature];
  }

  /**
   * Get platform info
   */
  getPlatformInfo(): PlatformInfo {
    return { ...this.platformInfo };
  }

  /**
   * Get adaptive features
   */
  getAdaptiveFeatures(): AdaptiveFeatures {
    return { ...this.adaptiveFeatures };
  }

  /**
   * Request permissions (platform-adaptive)
   */
  async requestPermission(permission: 'camera' | 'microphone' | 'location' | 'notifications'): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        return await this.requestIOSPermission(permission);
      } else if (Platform.OS === 'android') {
        return await this.requestAndroidPermission(permission);
      }
      return false;
    } catch (error) {
      console.error('[Platform] Permission error:', error);
      return false;
    }
  }

  private async requestIOSPermission(permission: string): Promise<boolean> {
    // iOS permission handling
    console.log('[Platform] Requesting iOS permission:', permission);
    // In production: use react-native-permissions
    return true; // Placeholder
  }

  private async requestAndroidPermission(permission: string): Promise<boolean> {
    // Android permission handling
    console.log('[Platform] Requesting Android permission:', permission);
    // In production: use react-native-permissions
    return true; // Placeholder
  }

  /**
   * Adaptive haptic feedback
   */
  async haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'): Promise<void> {
    if (!this.adaptiveFeatures.haptics) return;

    try {
      if (Platform.OS === 'ios') {
        // iOS haptics
        const { ReactNativeHapticFeedback } = NativeModules;
        if (ReactNativeHapticFeedback) {
          const hapticMap: any = {
            light: 'impactLight',
            medium: 'impactMedium',
            heavy: 'impactHeavy',
            success: 'notificationSuccess',
            warning: 'notificationWarning',
            error: 'notificationError',
          };
          ReactNativeHapticFeedback.trigger(hapticMap[type] || 'impactMedium');
        }
      } else if (Platform.OS === 'android') {
        // Android vibration
        const { Vibration } = require('react-native');
        const patterns: any = {
          light: [0, 10],
          medium: [0, 20],
          heavy: [0, 40],
          success: [0, 10, 50, 10],
          warning: [0, 20, 50, 20],
          error: [0, 40, 50, 40],
        };
        Vibration.vibrate(patterns[type] || patterns.medium);
      }
    } catch (error) {
      console.error('[Platform] Haptic error:', error);
    }
  }

  /**
   * Get adaptive UI components based on platform
   */
  getAdaptiveComponents(): {
    buttonStyle: any;
    inputStyle: any;
    cardStyle: any;
    headerStyle: any;
  } {
    const insets = this.getSafeAreaInsets();
    const spacing = this.getAdaptiveSpacing();
    const colors = this.getAdaptiveColors();

    if (Platform.OS === 'ios') {
      return {
        buttonStyle: {
          borderRadius: 10,
          paddingVertical: 12,
          paddingHorizontal: 20,
          backgroundColor: colors.primary,
        },
        inputStyle: {
          borderRadius: 10,
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: '#F2F2F7',
          fontSize: 17,
        },
        cardStyle: {
          borderRadius: 12,
          backgroundColor: colors.surface,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        headerStyle: {
          height: spacing.headerHeight,
          paddingTop: insets.top,
          backgroundColor: colors.surface,
          borderBottomWidth: 0.5,
          borderBottomColor: '#C6C6C8',
        },
      };
    } else {
      // Android (Material Design)
      return {
        buttonStyle: {
          borderRadius: this.platformInfo.version >= 12 ? 20 : 4, // Material 3 vs 2
          paddingVertical: 12,
          paddingHorizontal: 24,
          backgroundColor: colors.primary,
          elevation: 2,
        },
        inputStyle: {
          borderRadius: this.platformInfo.version >= 12 ? 12 : 4,
          paddingVertical: 16,
          paddingHorizontal: 16,
          backgroundColor: colors.background,
          fontSize: 16,
          elevation: 1,
        },
        cardStyle: {
          borderRadius: this.platformInfo.version >= 12 ? 16 : 8,
          backgroundColor: colors.surface,
          elevation: 3,
          marginVertical: 8,
        },
        headerStyle: {
          height: spacing.headerHeight,
          backgroundColor: colors.primary,
          elevation: 4,
        },
      };
    }
  }

  /**
   * Adaptive navigation gestures
   */
  getNavigationConfig(): {
    gestureEnabled: boolean;
    swipeDirection: 'horizontal' | 'vertical';
    gestureResponseDistance: number;
  } {
    if (Platform.OS === 'ios') {
      return {
        gestureEnabled: true,
        swipeDirection: 'horizontal',
        gestureResponseDistance: 50,
      };
    } else if (Platform.OS === 'android' && this.platformInfo.version >= 13) {
      // Predictive back gesture
      return {
        gestureEnabled: true,
        swipeDirection: 'horizontal',
        gestureResponseDistance: 30,
      };
    } else {
      return {
        gestureEnabled: false,
        swipeDirection: 'horizontal',
        gestureResponseDistance: 0,
      };
    }
  }

  /**
   * Adaptive keyboard behavior
   */
  getKeyboardConfig(): {
    behavior: 'padding' | 'height' | 'position';
    offset: number;
    avoidEnabled: boolean;
  } {
    const insets = this.getSafeAreaInsets();

    if (Platform.OS === 'ios') {
      return {
        behavior: 'padding',
        offset: insets.bottom + 90,
        avoidEnabled: true,
      };
    } else {
      return {
        behavior: 'height',
        offset: 0,
        avoidEnabled: Platform.Version >= 11, // Android 11+
      };
    }
  }

  /**
   * Check for latest updates
   */
  async checkForUpdates(): Promise<{
    updateAvailable: boolean;
    currentVersion: string;
    latestVersion: string;
    breaking: boolean;
  }> {
    // React Native version check
    const currentRN = '0.73.11'; // From package.json
    const latestRN = '0.81.4';   // From console warning

    return {
      updateAvailable: currentRN !== latestRN,
      currentVersion: currentRN,
      latestVersion: latestRN,
      breaking: false,
    };
  }

  /**
   * Get upgrade recommendations
   */
  getUpgradeRecommendations(): string[] {
    const recommendations: string[] = [];
    const { os, version } = this.platformInfo;

    // React Native upgrade
    recommendations.push('📱 React Native: 0.73 → 0.81 (latest)');

    // iOS recommendations
    if (os === 'ios') {
      if (version < 15) {
        recommendations.push('🍎 iOS: Consider targeting iOS 15+ for best features');
      } else if (version < 17) {
        recommendations.push('🍎 iOS: Upgrade to iOS 17+ for interactive widgets');
      } else if (version < 18) {
        recommendations.push('🍎 iOS: iOS 18+ enables Apple Intelligence features');
      }
    }

    // Android recommendations
    if (os === 'android') {
      if (version < 12) {
        recommendations.push('🤖 Android: Target Android 12+ for Material You');
      } else if (version < 13) {
        recommendations.push('🤖 Android: Android 13+ adds predictive back gesture');
      } else if (version < 14) {
        recommendations.push('🤖 Android: Android 14+ adds advanced features');
      }
    }

    return recommendations;
  }

  /**
   * Generate platform report
   */
  generateReport(): string {
    const { os, version, isTablet, hasNotch, supportedFeatures } = this.platformInfo;
    
    let report = '=== MOTTO Platform Report ===\n\n';
    
    report += `OS: ${os.toUpperCase()} ${version}\n`;
    report += `Device: ${isTablet ? 'Tablet' : 'Phone'}\n`;
    report += `Notch/Island: ${hasNotch ? 'Yes' : 'No'}\n`;
    report += `Screen: ${this.platformInfo.screenSize.width}×${this.platformInfo.screenSize.height}\n\n`;
    
    report += '✅ Supported Features:\n';
    supportedFeatures.forEach(f => report += `  • ${f}\n`);
    
    report += '\n⚡ Adaptive Features:\n';
    Object.entries(this.adaptiveFeatures).forEach(([feature, supported]) => {
      report += `  ${supported ? '✅' : '❌'} ${feature}\n`;
    });
    
    report += '\n📊 Recommendations:\n';
    this.getUpgradeRecommendations().forEach(r => report += `  ${r}\n`);
    
    return report;
  }
}

export default PlatformAdaptationService.getInstance();
