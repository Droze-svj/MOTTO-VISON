import '@testing-library/jest-native/extend-expect';
import { Platform } from 'react-native';

// Mock platform-specific modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///document-directory/',
  cacheDirectory: 'file:///cache-directory/',
  getInfoAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

// Mock platform-specific APIs
const mockPlatform = {
  OS: 'ios',
  Version: '15.0',
  select: jest.fn(obj => obj.ios),
};

// Mock native modules
const mockNativeModules = {
  UIManager: {
    RCTView: () => ({}),
  },
  StatusBarManager: {
    getHeight: jest.fn(),
  },
  DeviceInfo: {
    Dimensions: {
      window: {
        width: 375,
        height: 812,
      },
      screen: {
        width: 375,
        height: 812,
      },
    },
  },
};

// Mock platform-specific permissions
const mockPermissions = {
  check: jest.fn(),
  request: jest.fn(),
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
  },
};

// Mock platform-specific notifications
const mockNotifications = {
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
};

// Mock platform-specific biometrics
const mockBiometrics = {
  authenticateAsync: jest.fn(),
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedTypesAsync: jest.fn(),
};

// Setup global mocks
global.Platform = mockPlatform;
global.NativeModules = mockNativeModules;
global.PermissionsAndroid = mockPermissions;
global.Notifications = mockNotifications;
global.Biometrics = mockBiometrics;

// Mock platform-specific styles
jest.mock('react-native/Libraries/StyleSheet/PlatformColorValueTypes', () => ({
  get: jest.fn(),
}));

// Mock platform-specific animations
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({
  addListener: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  startOperationBatch: jest.fn(),
  finishOperationBatch: jest.fn(),
  createAnimatedNode: jest.fn(),
  connectAnimatedNodes: jest.fn(),
  disconnectAnimatedNodes: jest.fn(),
  startAnimatingNode: jest.fn(),
  stopAnimation: jest.fn(),
  setAnimatedNodeValue: jest.fn(),
  connectAnimatedNodeToView: jest.fn(),
  disconnectAnimatedNodeFromView: jest.fn(),
  restoreDefaultValues: jest.fn(),
  addAnimatedEventToView: jest.fn(),
  removeAnimatedEventFromView: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
}));

// Mock platform-specific gestures
jest.mock('react-native-gesture-handler', () => ({
  PanGestureHandler: 'PanGestureHandler',
  State: {},
  PanGestureHandlerGestureEvent: jest.fn(),
  PanGestureHandlerStateChangeEvent: jest.fn(),
}));

// Mock platform-specific safe area
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }),
}));

// Mock platform-specific dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({
    width: 375,
    height: 812,
    scale: 2,
    fontScale: 1,
  }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock platform-specific appearance
jest.mock('react-native/Libraries/Utilities/Appearance', () => ({
  getColorScheme: jest.fn().mockReturnValue('light'),
  addChangeListener: jest.fn(),
  removeChangeListener: jest.fn(),
}));

// Mock platform-specific accessibility
jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo', () => ({
  isScreenReaderEnabled: jest.fn().mockResolvedValue(false),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock platform-specific keyboard
jest.mock('react-native/Libraries/Components/Keyboard/Keyboard', () => ({
  addListener: jest.fn(),
  removeListener: jest.fn(),
  dismiss: jest.fn(),
}));

// Mock platform-specific clipboard
jest.mock('react-native/Libraries/Components/Clipboard/Clipboard', () => ({
  getString: jest.fn(),
  setString: jest.fn(),
}));

// Mock platform-specific linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
  canOpenURL: jest.fn(),
  getInitialURL: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock platform-specific share
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(),
}));

// Mock platform-specific permissions
jest.mock('react-native/Libraries/PermissionsAndroid/PermissionsAndroid', () => ({
  check: jest.fn(),
  request: jest.fn(),
  PERMISSIONS: {
    CAMERA: 'android.permission.CAMERA',
    READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
  },
})); 