import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import MetricsService from '../services/MetricsService';
import { colors } from '../constants/colors';

const MetricsScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const ev = await MetricsService.getEvents(200);
      setEvents(ev.reverse());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const clear = async () => {
    await MetricsService.clearEvents();
    load();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.e}</Text>
      <Text style={styles.meta}>{new Date(item.t).toLocaleString()}</Text>
      <Text style={styles.payload}>{JSON.stringify(item.p)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Metrics</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.btn} onPress={load} disabled={loading}><Text style={styles.btnText}>Refresh</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline} onPress={clear} disabled={loading}><Text style={styles.btnOutlineText}>Clear</Text></TouchableOpacity>
        </View>
      </View>
      <FlatList data={events} keyExtractor={(it) => String(it.id)} renderItem={renderItem} contentContainerStyle={styles.list} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.BLACK, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  header: { color: colors.LIGHT_TEXT, fontSize: 18, fontWeight: 'bold' },
  list: { gap: 8 },
  card: { borderColor: colors.OCEAN_BLUE, borderWidth: 1, borderRadius: 10, padding: 10 },
  title: { color: colors.LIGHT_TEXT, fontWeight: '600' },
  meta: { color: colors.LIGHT_TEXT, opacity: 0.8, marginTop: 2 },
  payload: { color: colors.LIGHT_TEXT, marginTop: 6 },
  btn: { backgroundColor: colors.OCEAN_BLUE, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderColor: colors.DARKER_BLUE, borderWidth: 1 },
  btnText: { color: '#fff' },
  btnOutline: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderColor: colors.OCEAN_BLUE, borderWidth: 1 },
  btnOutlineText: { color: colors.LIGHT_TEXT },
});

export default MetricsScreen;


