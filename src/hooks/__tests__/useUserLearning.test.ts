/**
 * useUserLearning Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUserLearning } from '../useUserLearning';

describe('useUserLearning', () => {
  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useUserLearning());

    expect(result.current.loading).toBe(true);
    expect(result.current.insights).toBeNull();
  });

  it('should load insights after initialization', async () => {
    const { result } = renderHook(() => useUserLearning());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.insights).toBeDefined();
  });

  it('should provide suggested topics', async () => {
    const { result } = renderHook(() => useUserLearning());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(Array.isArray(result.current.suggestedTopics)).toBe(true);
  });

  it('should have recordFeedback function', () => {
    const { result } = renderHook(() => useUserLearning());

    expect(typeof result.current.recordFeedback).toBe('function');
  });

  it('should record feedback', async () => {
    const { result } = renderHook(() => useUserLearning());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.recordFeedback(
        'Test input',
        'Test response',
        'positive'
      );
    });

    // Should complete without error
    expect(result.current).toBeDefined();
  });

  it('should have resetLearning function', () => {
    const { result } = renderHook(() => useUserLearning());

    expect(typeof result.current.resetLearning).toBe('function');
  });

  it('should have exportData function', () => {
    const { result } = renderHook(() => useUserLearning());

    expect(typeof result.current.exportData).toBe('function');
  });

  it('should have getSuggestions function', () => {
    const { result } = renderHook(() => useUserLearning());

    expect(typeof result.current.getSuggestions).toBe('function');
  });

  it('should getSuggestions return array', () => {
    const { result } = renderHook(() => useUserLearning());

    const suggestions = result.current.getSuggestions();
    expect(Array.isArray(suggestions)).toBe(true);
  });

  it('should have refresh function', () => {
    const { result } = renderHook(() => useUserLearning());

    expect(typeof result.current.refresh).toBe('function');
  });

  it('should refresh data', async () => {
    const { result } = renderHook(() => useUserLearning());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current).toBeDefined();
  });
});

