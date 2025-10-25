import { renderHook, act } from '@testing-library/react-native';
import { useVoiceCommand } from '../useVoiceCommand';

// Mock the required dependencies
jest.mock('@react-native-voice/voice', () => ({
  onSpeechStart: jest.fn(),
  onSpeechEnd: jest.fn(),
  onSpeechResults: jest.fn(),
  onSpeechError: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock('react-native-tts', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  getInitStatus: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({ sound: {} })),
    },
  },
}));

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

describe('useVoiceCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default settings', () => {
    const { result } = renderHook(() => useVoiceCommand());
    
    expect(result.current.isListening).toBe(false);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should start listening when startListening is called', async () => {
    const { result } = renderHook(() => useVoiceCommand());
    
    await act(async () => {
      await result.current.startListening();
    });
    
    expect(result.current.isListening).toBe(true);
  });

  it('should stop listening when stopListening is called', async () => {
    const { result } = renderHook(() => useVoiceCommand());
    
    await act(async () => {
      await result.current.startListening();
      await result.current.stopListening();
    });
    
    expect(result.current.isListening).toBe(false);
  });

  it('should process a valid command', async () => {
    const { result } = renderHook(() => useVoiceCommand());
    const mockCommand = 'go to home';
    
    await act(async () => {
      await result.current.processCommand(mockCommand);
    });
    
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle invalid commands', async () => {
    const { result } = renderHook(() => useVoiceCommand());
    const mockCommand = 'invalid command';
    
    await act(async () => {
      await result.current.processCommand(mockCommand);
    });
    
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.error).toBe('Invalid command: "invalid command" is not recognized');
  });
}); 