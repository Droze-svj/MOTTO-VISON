import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStorage = () => {
  const [error, setError] = useState(null);

  const setItem = useCallback(async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error saving data:', err);
      return false;
    }
  }, []);

  const getItem = useCallback(async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      setError(null);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (err) {
      setError(err.message);
      console.error('Error reading data:', err);
      return null;
    }
  }, []);

  const removeItem = useCallback(async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error removing data:', err);
      return false;
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await AsyncStorage.clear();
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error clearing storage:', err);
      return false;
    }
  }, []);

  const getAllKeys = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      setError(null);
      return keys;
    } catch (err) {
      setError(err.message);
      console.error('Error getting all keys:', err);
      return [];
    }
  }, []);

  const multiGet = useCallback(async (keys) => {
    try {
      const values = await AsyncStorage.multiGet(keys);
      setError(null);
      return values.map(([key, value]) => [key, JSON.parse(value)]);
    } catch (err) {
      setError(err.message);
      console.error('Error getting multiple items:', err);
      return [];
    }
  }, []);

  const multiSet = useCallback(async (keyValuePairs) => {
    try {
      const pairs = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error setting multiple items:', err);
      return false;
    }
  }, []);

  const multiRemove = useCallback(async (keys) => {
    try {
      await AsyncStorage.multiRemove(keys);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error removing multiple items:', err);
      return false;
    }
  }, []);

  return {
    error,
    setItem,
    getItem,
    removeItem,
    clearAll,
    getAllKeys,
    multiGet,
    multiSet,
    multiRemove,
  };
};

export default useStorage; 