import { useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import useApi from './useApi';
import useMediaAnalytics from './useMediaAnalytics';

const useSecurity = (options = {}) => {
  const {
    enableBiometrics = true,
    enableEncryption = true,
    sessionTimeout = 30 * 60 * 1000, // 30 minutes
  } = options;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [sessionToken, setSessionToken] = useState(null);

  const { request } = useApi({
    baseUrl: 'https://your-api.com',
    enableCache: false,
  });

  const { trackEngagement } = useMediaAnalytics({
    enableRealTime: true,
  });

  // Check biometric availability
  useEffect(() => {
    const checkBiometrics = async () => {
      if (enableBiometrics) {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricAvailable(compatible && enrolled);
      }
    };
    checkBiometrics();
  }, [enableBiometrics]);

  // Session timeout check
  useEffect(() => {
    const checkSessionTimeout = () => {
      const now = Date.now();
      if (now - lastActivity > sessionTimeout) {
        handleLogout();
      }
    };

    const interval = setInterval(checkSessionTimeout, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [lastActivity, sessionTimeout]);

  // Update last activity on user interaction
  const updateLastActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Generate encryption key
  const generateEncryptionKey = useCallback(async () => {
    const key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Date.now().toString() + Math.random().toString()
    );
    return key;
  }, []);

  // Encrypt data
  const encryptData = useCallback(async (data, key) => {
    if (!enableEncryption) return data;

    try {
      const jsonString = JSON.stringify(data);
      const encryptedData = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        jsonString + key
      );
      return encryptedData;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }, [enableEncryption]);

  // Decrypt data
  const decryptData = useCallback(async (encryptedData, key) => {
    if (!enableEncryption) return encryptedData;

    try {
      // Implement your decryption logic here
      // This is a placeholder for the actual decryption implementation
      return encryptedData;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }, [enableEncryption]);

  // Secure storage operations
  const secureStore = {
    setItem: async (key, value) => {
      try {
        const encryptedValue = await encryptData(value, await generateEncryptionKey());
        await SecureStore.setItemAsync(key, encryptedValue);
        await trackEngagement({
          type: 'secure_storage_write',
          key,
        });
      } catch (error) {
        console.error('Secure storage write error:', error);
        throw new Error('Failed to store data securely');
      }
    },

    getItem: async (key) => {
      try {
        const encryptedValue = await SecureStore.getItemAsync(key);
        if (!encryptedValue) return null;
        return await decryptData(encryptedValue, await generateEncryptionKey());
      } catch (error) {
        console.error('Secure storage read error:', error);
        throw new Error('Failed to retrieve data securely');
      }
    },

    removeItem: async (key) => {
      try {
        await SecureStore.deleteItemAsync(key);
        await trackEngagement({
          type: 'secure_storage_delete',
          key,
        });
      } catch (error) {
        console.error('Secure storage delete error:', error);
        throw new Error('Failed to delete data securely');
      }
    },
  };

  // Authentication methods
  const authenticate = useCallback(async (credentials) => {
    try {
      const response = await request({
        endpoint: '/auth/login',
        method: 'POST',
        data: credentials,
      });

      const { token, user } = response.data;
      setSessionToken(token);
      setIsAuthenticated(true);
      setLastActivity(Date.now());

      // Store session data securely
      await secureStore.setItem('sessionToken', token);
      await secureStore.setItem('userData', user);

      await trackEngagement({
        type: 'user_login',
        method: 'credentials',
      });

      return { token, user };
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('Authentication failed');
    }
  }, [request, secureStore, trackEngagement]);

  const authenticateWithBiometrics = useCallback(async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access the app',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        const token = await secureStore.getItem('sessionToken');
        if (token) {
          setSessionToken(token);
          setIsAuthenticated(true);
          setLastActivity(Date.now());

          await trackEngagement({
            type: 'user_login',
            method: 'biometrics',
          });

          return { token };
        }
      }
      throw new Error('Biometric authentication failed');
    } catch (error) {
      console.error('Biometric authentication error:', error);
      throw new Error('Biometric authentication failed');
    }
  }, [secureStore, trackEngagement]);

  const handleLogout = useCallback(async () => {
    try {
      if (sessionToken) {
        await request({
          endpoint: '/auth/logout',
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });
      }

      setSessionToken(null);
      setIsAuthenticated(false);

      // Clear secure storage
      await secureStore.removeItem('sessionToken');
      await secureStore.removeItem('userData');

      await trackEngagement({
        type: 'user_logout',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [sessionToken, request, secureStore, trackEngagement]);

  // Validate session
  const validateSession = useCallback(async () => {
    try {
      const token = await secureStore.getItem('sessionToken');
      if (!token) return false;

      const response = await request({
        endpoint: '/auth/validate',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.valid) {
        setSessionToken(token);
        setIsAuthenticated(true);
        setLastActivity(Date.now());
        return true;
      }

      await handleLogout();
      return false;
    } catch (error) {
      console.error('Session validation error:', error);
      await handleLogout();
      return false;
    }
  }, [request, secureStore, handleLogout]);

  return {
    isAuthenticated,
    isBiometricAvailable,
    sessionToken,
    authenticate,
    authenticateWithBiometrics,
    handleLogout,
    validateSession,
    secureStore,
    updateLastActivity,
  };
};

export default useSecurity; 