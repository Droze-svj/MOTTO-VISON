import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:8000'; // Change to your backend URL

export default function PreferencesScreen() {
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;
      try {
        const res = await fetch(`${API_URL}/user/${userId}/preferences`);
        const data = await res.json();
        setPreferences(data.preferences || '');
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const savePreferences = async () => {
    setLoading(true);
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;
    try {
      await fetch(`${API_URL}/user/${userId}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences }),
      });
      Alert.alert('Saved', 'Your preferences have been updated!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save preferences.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Your Preferences</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. I like morning meetings, prefer email summaries, love productivity tips..."
        value={preferences}
        onChangeText={setPreferences}
        multiline
      />
      <Button title={loading ? 'Saving...' : 'Save Preferences'} onPress={savePreferences} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0A2342' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 16, minHeight: 80, marginBottom: 16 },
}); 