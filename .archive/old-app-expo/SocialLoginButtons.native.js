import React, { useEffect, useState } from 'react';
import { View, Button, Alert, ActivityIndicator } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';

const BACKEND_URL = process.env.API_URL || 'http://localhost:8000';
const REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: 'myapp' });

export default function SocialLoginButtons() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleUrl = async (event) => {
      setLoading(false);
      const { queryParams } = Linking.parse(event.url);
      if (queryParams.access_token) {
        await SecureStore.setItemAsync('access_token', queryParams.access_token);
        await SecureStore.setItemAsync('refresh_token', queryParams.refresh_token);
        // Fetch user profile to check onboarding
        try {
          const resp = await fetch(`${BACKEND_URL}/me`, {
            headers: { 'Authorization': `Bearer ${queryParams.access_token}` },
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
      } else if (queryParams.error) {
        Alert.alert('Login Error', queryParams.error);
      }
    };
    const sub = Linking.addEventListener('url', handleUrl);
    return () => sub.remove();
  }, [navigation]);

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true);
      const authUrl = `${BACKEND_URL}/auth/${provider}?mobile_redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
      const result = await AuthSession.startAsync({ authUrl });
      setLoading(false);
      if (result.type === 'dismiss' || result.type === 'cancel') {
        Alert.alert('Login Cancelled', 'You cancelled the login process.');
      } else if (result.type === 'error') {
        Alert.alert('Login Error', result.params?.error_description || 'An error occurred during login.');
      }
    } catch (err) {
      setLoading(false);
      Alert.alert('Login Error', err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <View>
      {loading && <ActivityIndicator size="large" style={{ marginBottom: 16 }} />}
      <Button title="Sign in with Google" onPress={() => handleSocialLogin('google')} disabled={loading} />
      <Button title="Sign in with Microsoft" onPress={() => handleSocialLogin('microsoft')} disabled={loading} />
      <Button title="Sign in with Apple" onPress={() => handleSocialLogin('apple')} disabled={loading} />
      <Button title="Sign in with Facebook" onPress={() => handleSocialLogin('facebook')} disabled={loading} />
    </View>
  );
} 