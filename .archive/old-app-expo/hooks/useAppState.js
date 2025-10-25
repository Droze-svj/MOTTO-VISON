import { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';

const useAppState = () => {
  const [appState, setAppState] = useState(AppState.currentState);
  const [lastActive, setLastActive] = useState(Date.now());

  const handleAppStateChange = useCallback((nextAppState) => {
    const now = Date.now();
    
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground
      const timeInBackground = now - lastActive;
      setAppState(nextAppState);
      return { type: 'foreground', timeInBackground };
    }
    
    if (nextAppState.match(/inactive|background/)) {
      // App went to background
      setLastActive(now);
      setAppState(nextAppState);
      return { type: 'background' };
    }
    
    setAppState(nextAppState);
    return { type: 'state_change', newState: nextAppState };
  }, [appState, lastActive]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);

  const isActive = appState === 'active';
  const isBackground = appState === 'background';
  const isInactive = appState === 'inactive';

  return {
    appState,
    isActive,
    isBackground,
    isInactive,
    lastActive,
  };
};

export default useAppState; 