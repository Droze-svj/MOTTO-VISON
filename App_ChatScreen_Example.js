/**
 * MOTTO App with ChatScreen
 * This is an example of how to integrate the ChatScreen
 */

import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import ChatScreen from './src/screens/ChatScreen';

function App() {
  const [userId] = useState('user_' + Date.now()); // Generate unique user ID

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.container}>
        <ChatScreen
          userId={userId}
          onOpenSettings={() => {
            // TODO: Navigate to settings screen
            console.log('Open settings');
          }}
          onOpenPersonalization={() => {
            // TODO: Navigate to personalization screen
            console.log('Open personalization');
          }}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
});

export default App;
