/**
 * Dark Mode Hook
 * Manages dark mode state and provides theme values
 */

import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorScheme = 'light' | 'dark' | 'auto';

export const useDarkMode = () => {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorScheme>('auto');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadColorScheme();
  }, []);

  useEffect(() => {
    // Update isDark based on colorScheme
    if (colorScheme === 'auto') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(colorScheme === 'dark');
    }
  }, [colorScheme, systemColorScheme]);

  const loadColorScheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('colorScheme');
      if (saved) {
        setColorScheme(saved as ColorScheme);
      }
    } catch (error) {
      console.error('Load color scheme error:', error);
    }
  };

  const setTheme = async (scheme: ColorScheme) => {
    try {
      await AsyncStorage.setItem('colorScheme', scheme);
      setColorScheme(scheme);
    } catch (error) {
      console.error('Save color scheme error:', error);
    }
  };

  const toggleDarkMode = async () => {
    const newScheme = isDark ? 'light' : 'dark';
    await setTheme(newScheme);
  };

  return {
    isDark,
    colorScheme,
    setTheme,
    toggleDarkMode,
  };
};

export default useDarkMode;
