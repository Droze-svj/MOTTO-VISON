import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, Modal, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Tts from 'react-native-tts';

const API_URL = 'http://localhost:8000'; // Change to your backend URL

function formatDateTime(dt) {
  if (!dt) return '';
  const date = new Date(dt);
  return date.toLocaleString();
}

function AddEventModal({ visible, onClose, onAdd, pendingEvent }) {
  const [summary, setSummary] = useState(pendingEvent?.summary || '');
  const [start, setStart] = useState(pendingEvent?.start || '');
  const [end, setEnd] = useState(pendingEvent?.end || '');

  useEffect(() => {
    if (pendingEvent) {
      setSummary(pendingEvent.summary || '');
      setStart(pendingEvent.start || '');
      setEnd(pendingEvent.end || '');
    }
  }, [pendingEvent, visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: '#000a', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, width: 300 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Add Google Calendar Event</Text>
          <TextInput placeholder="Title" value={summary} onChangeText={setSummary} style={{ borderBottomWidth: 1, marginBottom: 8 }} />
          <TextInput placeholder="Start (YYYY-MM-DDTHH:MM:SS)" value={start} onChangeText={setStart} style={{ borderBottomWidth: 1, marginBottom: 8 }} />
          <TextInput placeholder="End (YYYY-MM-DDTHH:MM:SS)" value={end} onChangeText={setEnd} style={{ borderBottomWidth: 1, marginBottom: 8 }} />
          <Button title="Add" onPress={() => { onAdd({ summary, start, end }); setSummary(''); setStart(''); setEnd(''); }} />
          <Button title="Cancel" onPress={onClose} color="#888" />
        </View>
      </View>
    </Modal>
  );
}

export default function DataDisplayScreen({ navigation, route }) {
  const [events, setEvents] = useState([]);
  const [emails, setEmails] = useState([]);
  const [notionPages, setNotionPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(null);
  const eventListRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;
    try {
      const [calRes, mailRes, notionRes] = await Promise.all([
        fetch(`${API_URL}/user/${userId}/google/calendar`).then(r => r.json()),
        fetch(`${API_URL}/user/${userId}/google/gmail`).then(r => r.json()),
        fetch(`${API_URL}/user/${userId}/notion/pages`).then(r => r.json()),
      ]);
      setEvents(calRes.events || []);
      setEmails(mailRes.messages || []);
      setNotionPages(notionRes.pages || []);
    } catch (e) {
      alert('Failed to fetch data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle advanced voice command actions from navigation params
  useEffect(() => {
    if (!route?.params) return;
    if (route.params.showAddEventFromVoice) {
      setShowAddEvent(true);
      setPendingEvent(route.params.pendingEvent || null);
    }
    if (route.params.scrollToNextEvent && events.length > 0) {
      // Scroll to the next event (assume first event is next)
      setTimeout(() => {
        eventListRef.current?.scrollToIndex({ index: 0, animated: true });
      }, 500);
    }
    if (route.params.readLatestEmail && emails.length > 0) {
      // Read aloud the latest email
      const latest = emails[0];
      fetchGmailMessageDetail(latest.id).then(detail => {
        Tts.speak(`From: ${detail.from}. Subject: ${detail.subject}. Snippet: ${detail.snippet}`);
      });
    }
    if (route.params.openNotionPageName && notionPages.length > 0) {
      // Try to find and open the Notion page by name
      const page = notionPages.find(p => (p.title || '').toLowerCase().includes(route.params.openNotionPageName.toLowerCase()));
      if (page) {
        openNotionPage(page.id);
        Tts.speak(`Opening Notion page ${page.title}`);
      } else {
        Tts.speak('Notion page not found.');
      }
    }
  }, [route?.params, events, emails, notionPages]);

  const addEvent = async ({ summary, start, end }) => {
    const userId = await AsyncStorage.getItem('userId');
    await fetch(`${API_URL}/user/${userId}/google/calendar/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary, start, end }),
    });
    setShowAddEvent(false);
    setPendingEvent(null);
    fetchData();
  };

  // Helper to fetch Gmail message details (subject, sender, snippet)
  const fetchGmailMessageDetail = async (id) => {
    const userId = await AsyncStorage.getItem('userId');
    const res = await fetch(`${API_URL}/user/${userId}/google/gmail/message/${id}`);
    return res.json();
  };

  // Helper to open Notion page in browser
  const openNotionPage = (id) => {
    Linking.openURL(`https://www.notion.so/${id.replace(/-/g, '')}`);
  };

  // Helper to open Gmail message in browser
  const openGmailMessage = (id) => {
    Linking.openURL(`https://mail.google.com/mail/u/0/#inbox/${id}`);
  };

  return (
    <View style={styles.container}>
      <Button title="Refresh" onPress={fetchData} />
      <Button title="Add Event" onPress={() => setShowAddEvent(true)} />
      <AddEventModal visible={showAddEvent} onClose={() => { setShowAddEvent(false); setPendingEvent(null); }} onAdd={addEvent} pendingEvent={pendingEvent} />
      {loading && <ActivityIndicator size="large" color="#0A2342" />}
      <Text style={styles.header}>Google Calendar Events</Text>
      <FlatList
        ref={eventListRef}
        data={events}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.itemTitle}>{item.summary || 'No Title'}</Text>
            <Text style={styles.itemDetail}>Start: {formatDateTime(item.start?.dateTime || item.start?.date)}</Text>
            <Text style={styles.itemDetail}>End: {formatDateTime(item.end?.dateTime || item.end?.date)}</Text>
            {item.location && <Text style={styles.itemDetail}>Location: {item.location}</Text>}
          </View>
        )}
      />
      <Text style={styles.header}>Gmail Messages</Text>
      <FlatList
        data={emails}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <GmailMessageItem id={item.id} fetchDetail={fetchGmailMessageDetail} openGmailMessage={openGmailMessage} />
        )}
      />
      <Text style={styles.header}>Notion Pages/Databases</Text>
      <FlatList
        data={notionPages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openNotionPage(item.id)}>
            <View style={styles.card}>
              <Text style={styles.itemTitle}>{item.title || item.id}</Text>
              <Text style={styles.itemDetail}>Type: {item.object}</Text>
              {item.last_edited_time && (
                <Text style={styles.itemDetail}>Last edited: {formatDateTime(item.last_edited_time)}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// Helper component for Gmail message details
function GmailMessageItem({ id, fetchDetail, openGmailMessage }) {
  const [detail, setDetail] = useState(null);
  useEffect(() => {
    let mounted = true;
    fetchDetail(id).then(data => { if (mounted) setDetail(data); });
    return () => { mounted = false; };
  }, [id]);
  if (!detail) return <ActivityIndicator size="small" color="#B0C4DE" />;
  return (
    <View style={styles.card}>
      <Text style={styles.itemTitle}>{detail.subject || 'No Subject'}</Text>
      <Text style={styles.itemDetail}>From: {detail.from}</Text>
      <Text style={styles.itemDetail}>Snippet: {detail.snippet}</Text>
      <Button title="Open in Gmail" onPress={() => openGmailMessage(id)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0A2342' },
  header: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 16 },
  card: { backgroundColor: '#071629', borderRadius: 8, padding: 12, marginVertical: 6 },
  itemTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  itemDetail: { color: '#B0C4DE', fontSize: 14, marginTop: 2 },
}); 