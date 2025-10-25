import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import useSecurity from '../hooks/useSecurity';
import useMediaAnalytics from '../hooks/useMediaAnalytics';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.API_URL || 'http://localhost:8000';

async function handleLoginSuccess(access_token, navigation) {
  await SecureStore.setItemAsync('access_token', access_token);
  try {
    const resp = await fetch(`${API_URL}/me`, {
      headers: { 'Authorization': `Bearer ${access_token}` },
    });
    const profile = await resp.json();
    if (profile.onboarded === false || profile.onboarded === 0) {
      navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  } catch (err) {
    Alert.alert('Login Error', 'Could not fetch user profile.');
  }
}

const LoginScreen = ({ navigation }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const {
    isBiometricAvailable,
    authenticate,
    authenticateWithBiometrics,
    validateSession,
  } = useSecurity({
    enableBiometrics: true,
    enableEncryption: true,
  });

  const { trackEngagement } = useMediaAnalytics({
    enableRealTime: true,
  });

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const isValid = await validateSession();
        if (isValid) {
          navigation.replace('Home');
        }
      } catch (error) {
        console.error('Session validation error:', error);
      }
    };
    checkSession();
  }, [validateSession, navigation]);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const { access_token } = await authenticate({ email, password });
      await handleLoginSuccess(access_token, navigation);
      await trackEngagement({
        type: 'login_attempt',
        method: 'credentials',
        success: true,
      });
    } catch (error) {
      setError(error.message || 'Invalid credentials');
      await trackEngagement({
        type: 'login_attempt',
        method: 'credentials',
        success: false,
        error: error.message,
      });
      Alert.alert('Error', error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, authenticate, navigation, trackEngagement]);

  const handleBiometricLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      const { access_token } = await authenticateWithBiometrics();
      await handleLoginSuccess(access_token, navigation);
      await trackEngagement({
        type: 'login_attempt',
        method: 'biometrics',
        success: true,
      });
    } catch (error) {
      await trackEngagement({
        type: 'login_attempt',
        method: 'biometrics',
        success: false,
        error: error.message,
      });
      Alert.alert('Error', 'Biometric authentication failed');
    } finally {
      setIsLoading(false);
    }
  }, [authenticateWithBiometrics, navigation, trackEngagement]);

  const handleForgotPassword = useCallback(async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      // Implement password reset logic here
      await trackEngagement({
        type: 'password_reset_requested',
        email,
      });
      Alert.alert(
        'Success',
        'Password reset instructions have been sent to your email'
      );
    } catch (error) {
      await trackEngagement({
        type: 'password_reset_failed',
        email,
        error: error.message,
      });
      Alert.alert('Error', 'Failed to send reset instructions');
    } finally {
      setIsLoading(false);
    }
  }, [email, trackEngagement]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons
            name="camera"
            size={64}
            color={theme.colors.primary}
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Welcome Back
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.text + '80' }]}
          >
            Sign in to continue
          </Text>
        </View>

        <View style={styles.form}>
          {error && (
            <View style={{ backgroundColor: '#ffcccc', padding: 10, borderRadius: 8, marginBottom: 10 }}>
              <Text style={{ color: '#b00020', textAlign: 'center' }}>{error}</Text>
            </View>
          )}
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={24}
              color={theme.colors.text + '80'}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Email"
              placeholderTextColor={theme.colors.text + '80'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={24}
              color={theme.colors.text + '80'}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Password"
              placeholderTextColor={theme.colors.text + '80'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color={theme.colors.text + '80'}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPassword}
          >
            <Text
              style={[styles.forgotPasswordText, { color: theme.colors.primary }]}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {isBiometricAvailable && (
            <TouchableOpacity
              style={[
                styles.biometricButton,
                { borderColor: theme.colors.primary },
              ]}
              onPress={handleBiometricLogin}
              disabled={isLoading}
            >
              <Ionicons
                name="finger-print"
                size={24}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.biometricButtonText, { color: theme.colors.primary }]}
              >
                Sign in with Biometrics
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.text + '80' }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text
              style={[styles.footerLink, { color: theme.colors.primary }]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen; 