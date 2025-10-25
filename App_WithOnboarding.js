/**
 * MOTTO App with Onboarding
 * Complete app entry point with onboarding flow
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import OnboardingNavigator from './src/screens/onboarding/OnboardingNavigator';
import { ChatScreen } from './src/screens/ChatScreen';
import { PersonalizationProfileScreen } from './src/screens/PersonalizationProfileScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { hasCompletedOnboarding, getUserId } from './src/utils/onboarding';

const Tab = createBottomTabNavigator();

function MainApp({ userId }) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#4F46E5',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingTop: 8,
            paddingBottom: 8,
            height: 60,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Chat"
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>💬</Text>,
          }}
        >
          {() => <ChatScreen userId={userId} />}
        </Tab.Screen>
        <Tab.Screen
          name="Profile"
          component={PersonalizationProfileScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>⚙️</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // Get user ID
      const id = await getUserId();
      setUserId(id);

      // Check if onboarding completed
      const completed = await hasCompletedOnboarding();
      setShowOnboarding(!completed);
    } catch (error) {
      console.error('Onboarding check error:', error);
      setShowOnboarding(true); // Show onboarding on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Loading screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.logo}>🤖</Text>
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 20 }} />
      </View>
    );
  }

  // Show onboarding or main app
  return showOnboarding ? (
    <OnboardingNavigator onComplete={handleOnboardingComplete} />
  ) : (
    <MainApp userId={userId} />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    fontSize: 80,
  },
});
