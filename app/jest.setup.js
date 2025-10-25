// Mock the native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock the AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock the Voice module
jest.mock('@react-native-voice/voice', () => ({
  onSpeechStart: jest.fn(),
  onSpeechEnd: jest.fn(),
  onSpeechResults: jest.fn(),
  onSpeechError: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  destroy: jest.fn(),
}));

// Mock the TTS module
jest.mock('react-native-tts', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  getInitStatus: jest.fn(() => Promise.resolve(true)),
}));

// Mock the Audio module
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({ sound: {} })),
    },
  },
}));

// Mock the Haptics module
jest.mock('expo-haptics', () => ({
  Haptics: {
    notificationAsync: jest.fn(),
    NotificationFeedbackType: {
      Success: 'success',
      Error: 'error',
      Warning: 'warning',
    },
  },
}));

// Mock the NetInfo module
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  getConnectionInfo: jest.fn(() => Promise.resolve({ type: 'wifi', effectiveType: 'unknown' })),
  useNetInfo: jest.fn(() => ({ isConnected: true })),
}));

// Set up global mocks
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
}; 