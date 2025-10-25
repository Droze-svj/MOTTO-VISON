/**
 * MOTTO - Complete App
 * Includes ChatScreen, PersonalizationScreen, and SettingsScreen
 * With simple tab navigation
 */

import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import ChatScreen from './src/screens/ChatScreen';
import PersonalizationProfileScreen from './src/screens/PersonalizationProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('chat'); // 'chat', 'profile', 'settings'
  const [userId] = useState('user_' + Date.now()); // Generate unique user ID

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'chat':
        return (
          <ChatScreen
            userId={userId}
            onOpenSettings={() => setCurrentScreen('settings')}
            onOpenPersonalization={() => setCurrentScreen('profile')}
          />
        );
      case 'profile':
        return (
          <PersonalizationProfileScreen
            userId={userId}
            onBack={() => setCurrentScreen('chat')}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            userId={userId}
            onBack={() => setCurrentScreen('chat')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.container}>
        {renderScreen()}
        
        {/* Bottom Tab Navigation */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setCurrentScreen('chat')}
          >
            <Text style={[
              styles.tabIcon,
              currentScreen === 'chat' && styles.tabIconActive
            ]}>
              💬
            </Text>
            <Text style={[
              styles.tabLabel,
              currentScreen === 'chat' && styles.tabLabelActive
            ]}>
              Chat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => setCurrentScreen('profile')}
          >
            <Text style={[
              styles.tabIcon,
              currentScreen === 'profile' && styles.tabIconActive
            ]}>
              👤
            </Text>
            <Text style={[
              styles.tabLabel,
              currentScreen === 'profile' && styles.tabLabelActive
            ]}>
              Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => setCurrentScreen('settings')}
          >
            <Text style={[
              styles.tabIcon,
              currentScreen === 'settings' && styles.tabIconActive
            ]}>
              ⚙️
            </Text>
            <Text style={[
              styles.tabLabel,
              currentScreen === 'settings' && styles.tabLabelActive
            ]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default App;
