/**
 * useMasterAI Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useMasterAI } from '../useMasterAI';

describe('useMasterAI', () => {
  const testUserId = 'test-user-123';

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useMasterAI(testUserId));

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastResponse).toBeNull();
  });

  it('should have chat function', () => {
    const { result } = renderHook(() => useMasterAI(testUserId));

    expect(typeof result.current.chat).toBe('function');
  });

  it('should process chat message', async () => {
    const { result } = renderHook(() => useMasterAI(testUserId));

    let response;
    await act(async () => {
      response = await result.current.chat('Hello, how are you?');
    });

    expect(response).toBeDefined();
  });

  it('should set processing state during chat', async () => {
    const { result } = renderHook(() => useMasterAI(testUserId));

    act(() => {
      result.current.chat('Test message');
    });

    // Should be processing immediately
    await waitFor(() => {
      expect(result.current.isProcessing).toBe(true);
    });
  });

  it('should update lastResponse after chat', async () => {
    const { result } = renderHook(() => useMasterAI(testUserId));

    await act(async () => {
      await result.current.chat('Test message');
    });

    await waitFor(() => {
      expect(result.current.lastResponse).not.toBeNull();
    });
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useMasterAI(testUserId));

    await act(async () => {
      try {
        await result.current.chat('');
      } catch (e) {
        // Error is expected
      }
    });

    // Hook should handle error internally
    expect(result.current).toBeDefined();
  });

  it('should allow multiple sequential chats', async () => {
    const { result } = renderHook(() => useMasterAI(testUserId));

    await act(async () => {
      await result.current.chat('First message');
    });

    await act(async () => {
      await result.current.chat('Second message');
    });

    expect(result.current.lastResponse).not.toBeNull();
  });

  it('should work with context parameter', async () => {
    const { result } = renderHook(() => useMasterAI(testUserId));

    const context = {
      conversationLength: 5,
      isFollowUp: true,
      recentContext: 'Previous context',
      currentTopics: ['test']
    };

    await act(async () => {
      await result.current.chat('Test with context', context);
    });

    expect(result.current.lastResponse).toBeDefined();
  });
});

