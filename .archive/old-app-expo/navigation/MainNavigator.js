import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import HomeStack from './HomeStack';
import ProfileStack from './ProfileStack';
import SecurityStack from './SecurityStack';
import VoiceCommandButton from '../components/VoiceCommandButton';
// Import your other stacks/screens here

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainNavigator = () => {
  const theme = useTheme();

  const handleVoiceCommand = (command) => {
    // Handle voice commands here
    switch (command.type) {
      case 'navigate':
        // Navigate to the specified screen
        navigation.navigate(command.screen);
        break;
      case 'play':
        // Handle play command
        break;
      case 'pause':
        // Handle pause command
        break;
      case 'next':
        // Handle next command
        break;
      case 'previous':
        // Handle previous command
        break;
      case 'search':
        // Handle search command
        break;
      case 'help':
        // Show help dialog
        break;
      default:
        // Handle unknown command
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Security') {
              iconName = focused ? 'shield' : 'shield-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.text,
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Security"
          component={SecurityStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
      <View style={styles.voiceButtonContainer}>
        <VoiceCommandButton onCommand={handleVoiceCommand} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  voiceButtonContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
  },
});

export default MainNavigator; 