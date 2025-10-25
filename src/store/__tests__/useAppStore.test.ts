import {renderHook, act} from '@testing-library/react-hooks';
import {useAppStore} from '../useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    const {result} = renderHook(() => useAppStore());
    act(() => {
      result.current.resetApp();
    });
  });

  it('should initialize with default state', () => {
    const {result} = renderHook(() => useAppStore());
    expect(result.current.messages).toEqual([]);
    expect(result.current.input).toBe('');
    expect(result.current.isSending).toBe(false);
  });

  it('should update input', () => {
    const {result} = renderHook(() => useAppStore());
    act(() => {
      result.current.setInput('Hello');
    });
    expect(result.current.input).toBe('Hello');
  });

  it('should add message', () => {
    const {result} = renderHook(() => useAppStore());
    const message = {id: '1', role: 'user' as const, text: 'Test'};
    act(() => {
      result.current.addMessage(message);
    });
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toEqual(message);
  });

  it('should clear messages', () => {
    const {result} = renderHook(() => useAppStore());
    act(() => {
      result.current.addMessage({id: '1', role: 'user', text: 'Test'});
      result.current.clearMessages();
    });
    expect(result.current.messages).toEqual([]);
  });
});

