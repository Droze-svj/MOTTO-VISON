/**
 * MOTTO App - Modern Complete Version
 * Features: Splash, Onboarding, Modern Design, Error Boundaries, Dark Mode
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import ErrorBoundary from './src/components/ErrorBoundary';
import SplashScreen from './src/components/SplashScreen';
import OnboardingNavigator from './src/screens/onboarding/OnboardingNavigator';
import ModernChatScreen from './src/screens/ModernChatScreen';
import { PersonalizationProfileScreen } from './src/screens/PersonalizationProfileScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { hasCompletedOnboarding, getUserId } from './src/utils/onboarding';
import LoadingSpinner from './src/components/LoadingSpinner';
import modernTheme from './src/theme/modernTheme';

const Tab = createBottomTabNavigator();

function MainApp({ userId }) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: modernTheme.colors.primary,
          tabBarInactiveTintColor: modernTheme.colors.gray[400],
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: modernTheme.colors.gray[100],
            paddingTop: 8,
            paddingBottom: 8,
            height: 65,
            ...modernTheme.shadows.lg,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Chat"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.tabIcon,
                focused && styles.tabIconActive,
              ]}>
                <Text style={{ fontSize: 24 }}>💬</Text>
              </View>
            ),
          }}
        >
          {() => <ModernChatScreen userId={userId} />}
        </Tab.Screen>
        <Tab.Screen
          name="Profile"
          component={PersonalizationProfileScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.tabIcon,
                focused && styles.tabIconActive,
              ]}>
                <Text style={{ fontSize: 24 }}>👤</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.tabIcon,
                focused && styles.tabIconActive,
              ]}>
                <Text style={{ fontSize: 24 }}>⚙️</Text>
              </View>
            ),
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
      // Small delay for splash screen
      await new Promise(resolve => setTimeout(resolve, 1000));

      const id = await getUserId();
      setUserId(id);

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

  // Splash Screen
  if (showSplash) {
    return (
      <ErrorBoundary>
        <SplashScreen onFinish={handleSplashFinish} />
      </ErrorBoundary>
    );
  }

  // Initializing
  if (isInitializing) {
    return (
      <ErrorBoundary>
        <LinearGradient
          colors={modernTheme.gradients.primary}
          style={styles.loadingContainer}
        >
          <LoadingSpinner 
            variant="pulse" 
            message="Preparing MOTTO..." 
          />
        </LinearGradient>
      </ErrorBoundary>
    );
  }

  // Main App
  return (
    <ErrorBoundary>
      <StatusBar barStyle="light-content" backgroundColor={modernTheme.colors.primary} />
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
  },
  tabIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconActive: {
    backgroundColor: modernTheme.colors.gray[100],
  },
});
