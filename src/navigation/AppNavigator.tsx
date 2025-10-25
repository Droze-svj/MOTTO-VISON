/**
 * App Navigator
 * Main navigation structure with bottom tabs
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import ChatScreen from '../screens/ChatScreen';
import PersonalizationScreen from '../screens/PersonalizationScreen';
import AnalyticsDashboard from '../screens/AnalyticsDashboard';
import SettingsScreen from '../screens/SettingsScreen';
import type { RootTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E5EA',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            tabBarLabel: 'Chat',
            tabBarIcon: ({color}) => <TabIcon icon="💬" color={color} />,
          }}
        />
        
        <Tab.Screen
          name="Personalization"
          component={PersonalizationScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({color}) => <TabIcon icon="🧠" color={color} />,
          }}
        />
        
        <Tab.Screen
          name="Analytics"
          component={AnalyticsDashboard}
          options={{
            tabBarLabel: 'Analytics',
            tabBarIcon: ({color}) => <TabIcon icon="📊" color={color} />,
          }}
        />
        
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({color}) => <TabIcon icon="⚙️" color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// Simple icon component  
const TabIcon: React.FC<{icon: string; color: string}> = ({icon}) => {
  const {Text} = require('react-native');
  return <Text style={{fontSize: 24}}>{icon}</Text>;
};

