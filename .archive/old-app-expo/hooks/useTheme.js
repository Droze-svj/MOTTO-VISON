import { useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTheme } from '../constants/theme';

const THEME_PREFERENCE_KEY = '@theme_preference';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState('system');
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (savedPreference) {
          setThemePreference(savedPreference);
          setIsDark(savedPreference === 'dark' || (savedPreference === 'system' && systemColorScheme === 'dark'));
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, [systemColorScheme]);

  // Update theme when system color scheme changes
  useEffect(() => {
    if (themePreference === 'system') {
      setIsDark(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, themePreference]);

  // Save theme preference
  const saveThemePreference = async (preference) => {
    try {
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Toggle between light and dark theme
  const toggleTheme = useCallback(() => {
    const newPreference = themePreference === 'dark' ? 'light' : 'dark';
    setThemePreference(newPreference);
    setIsDark(newPreference === 'dark');
    saveThemePreference(newPreference);
  }, [themePreference]);

  // Set specific theme
  const setTheme = useCallback((preference) => {
    setThemePreference(preference);
    setIsDark(preference === 'dark' || (preference === 'system' && systemColorScheme === 'dark'));
    saveThemePreference(preference);
  }, [systemColorScheme]);

  // Create theme object
  const theme = createTheme(isDark);

  return {
    theme,
    isDark,
    themePreference,
    toggleTheme,
    setTheme,
  };
}; 