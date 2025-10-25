import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFERENCES_KEY = '@user_preferences';

export const savePreferences = async (preferences) => {
  try {
    const jsonValue = JSON.stringify(preferences);
    await AsyncStorage.setItem(PREFERENCES_KEY, jsonValue);
    return true;
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw new Error('Failed to save preferences');
  }
};

export const loadPreferences = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(PREFERENCES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error loading preferences:', error);
    throw new Error('Failed to load preferences');
  }
};

export const clearPreferences = async () => {
  try {
    await AsyncStorage.removeItem(PREFERENCES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing preferences:', error);
    throw new Error('Failed to clear preferences');
  }
}; 