import { useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const CACHE_PREFIX = 'api_cache_';
const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

const useApi = ({
  baseUrl,
  defaultHeaders = {},
  enableCache = true,
  cacheDuration = 5 * 60 * 1000, // 5 minutes
  retryAttempts = DEFAULT_RETRY_ATTEMPTS,
  retryDelay = DEFAULT_RETRY_DELAY,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const abortControllerRef = useRef(null);

  const getCacheKey = useCallback((endpoint, params) => {
    return `${CACHE_PREFIX}${endpoint}_${JSON.stringify(params)}`;
  }, []);

  const getCachedData = useCallback(async (cacheKey) => {
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < cacheDuration) {
          return data;
        }
        // Remove expired cache
        await AsyncStorage.removeItem(cacheKey);
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }
    return null;
  }, [cacheDuration]);

  const setCachedData = useCallback(async (cacheKey, data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }, []);

  const delay = useCallback((ms) => new Promise(resolve => setTimeout(resolve, ms)), []);

  const request = useCallback(async ({
    endpoint,
    method = 'GET',
    params = {},
    body,
    headers = {},
    useCache = enableCache,
    retry = retryAttempts,
  }) => {
    setLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    const cacheKey = useCache ? getCacheKey(endpoint, params) : null;
    const cachedData = useCache ? await getCachedData(cacheKey) : null;

    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return cachedData;
    }

    const url = new URL(`${baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...defaultHeaders,
        ...headers,
      },
      signal: abortControllerRef.current.signal,
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    let attempts = 0;
    while (attempts <= retry) {
      try {
        const networkState = await NetInfo.fetch();
        if (!networkState.isConnected) {
          throw new Error('No internet connection');
        }

        const response = await fetch(url.toString(), requestOptions);
        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message || 'Request failed');
        }

        if (useCache) {
          await setCachedData(cacheKey, responseData);
        }

        setData(responseData);
        setLoading(false);
        return responseData;
      } catch (error) {
        attempts++;
        if (error.name === 'AbortError') {
          setError(new Error('Request cancelled'));
          break;
        }
        if (attempts > retry) {
          setError(error);
          break;
        }
        await delay(retryDelay * attempts);
      }
    }
    setLoading(false);
    throw error;
  }, [baseUrl, defaultHeaders, enableCache, getCacheKey, getCachedData, setCachedData, retryAttempts, retryDelay, delay]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }, []);

  return {
    loading,
    error,
    data,
    request,
    cancelRequest,
    clearCache,
  };
};

export default useApi; 