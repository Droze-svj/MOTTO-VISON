/**
 * MOTTO App - Complete with Splash Screen & Error Boundaries
 * Production-ready entry point
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ErrorBoundary from './src/components/ErrorBoundary';
import SplashScreen from './src/components/SplashScreen';
import OnboardingNavigator from './src/screens/onboarding/OnboardingNavigator';
import { ChatScreen } from './src/screens/ChatScreen';
import { PersonalizationProfileScreen } from './src/screens/PersonalizationProfileScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { hasCompletedOnboarding, getUserId } from './src/utils/onboarding';
import LoadingSpinner from './src/components/LoadingSpinner';

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
  const [showSplash, setShowSplash] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Simulate initialization time (remove in production)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get user ID
      const id = await getUserId();
      setUserId(id);

      // Check if onboarding completed
      const completed = await hasCompletedOnboarding();
      setShowOnboarding(!completed);
      
      setIsInitializing(false);
    } catch (error) {
      console.error('Initialization error:', error);
      setShowOnboarding(true);
      setIsInitializing(false);
    }
  };

  const handleSplashFinish = () => {
    if (!isInitializing) {
      setShowSplash(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Show splash screen
  if (showSplash) {
    return (
      <ErrorBoundary>
        <SplashScreen onFinish={handleSplashFinish} />
      </ErrorBoundary>
    );
  }

  // Still initializing (after splash)
  if (isInitializing) {
    return (
      <ErrorBoundary>
        <View style={styles.loadingContainer}>
          <LoadingSpinner 
            variant="pulse" 
            message="Preparing MOTTO..." 
          />
        </View>
      </ErrorBoundary>
    );
  }

  // Show onboarding or main app
  return (
    <ErrorBoundary>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {showOnboarding ? (
        <OnboardingNavigator onComplete={handleOnboardingComplete} />
      ) : (
        <MainApp userId={userId} />
      )}
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
