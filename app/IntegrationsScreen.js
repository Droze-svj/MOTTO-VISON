import React, { useState } from 'react';
import { View, Text, Button, Switch, StyleSheet, Alert, Platform } from 'react-native';
import { authorize } from 'react-native-app-auth';
import { request, PERMISSIONS, check, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const configGoogle = {
  issuer: 'https://accounts.google.com',
  clientId: 'YOUR_GOOGLE_CLIENT_ID',
  redirectUrl: 'YOUR_GOOGLE_REDIRECT_URI',
  scopes: [
    'openid', 'profile', 'email',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/contacts.readonly',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send'
  ],
};

const configMicrosoft = {
  issuer: 'https://login.microsoftonline.com/common/v2.0',
  clientId: 'YOUR_MS_CLIENT_ID',
  redirectUrl: 'YOUR_MS_REDIRECT_URI',
  scopes: [
    'openid', 'profile', 'offline_access',
    'Calendars.ReadWrite', 'Contacts.Read', 'Mail.ReadWrite'
  ],
};

const configNotion = {
  issuer: 'https://api.notion.com/v1/oauth/authorize',
  clientId: 'YOUR_NOTION_CLIENT_ID',
  redirectUrl: 'YOUR_NOTION_REDIRECT_URI',
  scopes: [], // Notion uses a custom flow, see Notion docs
};

const API_URL = 'http://localhost:8000'; // Change to your backend URL

export default function IntegrationsScreen() {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [msConnected, setMsConnected] = useState(false);
  const [notionConnected, setNotionConnected] = useState(false);
  const [calendarPerm, setCalendarPerm] = useState(false);
  const [contactsPerm, setContactsPerm] = useState(false);

  // Google OAuth2
  const connectGoogle = async () => {
    try {
      const result = await authorize(configGoogle);
      // Send result.accessToken/refreshToken to your backend for storage
      setGoogleConnected(true);
      Alert.alert('Google Connected!');
    } catch (e) {
      Alert.alert('Google Auth Error', e.message);
    }
  };

  // Microsoft OAuth2
  const connectMicrosoft = async () => {
    try {
      const result = await authorize(configMicrosoft);
      // Send result.accessToken/refreshToken to your backend for storage
      setMsConnected(true);
      Alert.alert('Microsoft Connected!');
    } catch (e) {
      Alert.alert('Microsoft Auth Error', e.message);
    }
  };

  // Notion OAuth2 (custom, may need to open a browser)
  const connectNotion = async () => {
    // You may need to use WebView or Linking.openURL for Notion
    Alert.alert('Notion', 'Open Notion OAuth in browser or WebView.');
    setNotionConnected(true);
  };

  // Device permissions
  const requestCalendar = async () => {
    const perm = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CALENDARS
      : PERMISSIONS.ANDROID.READ_CALENDAR;
    const result = await request(perm);
    setCalendarPerm(result === RESULTS.GRANTED);
  };

  const requestContacts = async () => {
    const perm = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CONTACTS
      : PERMISSIONS.ANDROID.READ_CONTACTS;
    const result = await request(perm);
    setContactsPerm(result === RESULTS.GRANTED);
  };

  const disconnectIntegration = async (integration, setConnected) => {
    // Get userId from storage or context
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;
    try {
      await fetch(`${API_URL}/disconnect_integration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, integration }),
      });
      setConnected(false);
      Alert.alert(`${integration.charAt(0).toUpperCase() + integration.slice(1)} disconnected!`);
    } catch (e) {
      Alert.alert('Error', 'Failed to disconnect.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Integrations & Permissions</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Google</Text>
        <Switch value={googleConnected} onValueChange={googleConnected ? () => disconnectIntegration('google', setGoogleConnected) : connectGoogle} />
        {googleConnected && <Button title="Disconnect" onPress={() => disconnectIntegration('google', setGoogleConnected)} />}
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Microsoft</Text>
        <Switch value={msConnected} onValueChange={msConnected ? () => disconnectIntegration('microsoft', setMsConnected) : connectMicrosoft} />
        {msConnected && <Button title="Disconnect" onPress={() => disconnectIntegration('microsoft', setMsConnected)} />}
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Notion</Text>
        <Switch value={notionConnected} onValueChange={notionConnected ? () => disconnectIntegration('notion', setNotionConnected) : connectNotion} />
        {notionConnected && <Button title="Disconnect" onPress={() => disconnectIntegration('notion', setNotionConnected)} />}
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Calendar Permission</Text>
        <Button title={calendarPerm ? 'Granted' : 'Request'} onPress={requestCalendar} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Contacts Permission</Text>
        <Button title={contactsPerm ? 'Granted' : 'Request'} onPress={requestContacts} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0A2342' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'space-between' },
  label: { color: '#B0C4DE', fontSize: 18 },
}); 