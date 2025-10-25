import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useUserSettings } from '../hooks/useUserSettings';
import SkeletonLoader from '../components/common/SkeletonLoader';

// Common time zones with their offsets
const TIME_ZONES = [
  { id: 'UTC', name: 'UTC', offset: '+00:00' },
  { id: 'EST', name: 'Eastern Time', offset: '-05:00' },
  { id: 'CST', name: 'Central Time', offset: '-06:00' },
  { id: 'MST', name: 'Mountain Time', offset: '-07:00' },
  { id: 'PST', name: 'Pacific Time', offset: '-08:00' },
  { id: 'GMT', name: 'Greenwich Mean Time', offset: '+00:00' },
  { id: 'CET', name: 'Central European Time', offset: '+01:00' },
  { id: 'EET', name: 'Eastern European Time', offset: '+02:00' },
  { id: 'IST', name: 'Indian Standard Time', offset: '+05:30' },
  { id: 'JST', name: 'Japan Standard Time', offset: '+09:00' },
  { id: 'AEST', name: 'Australian Eastern Time', offset: '+10:00' },
];

const TimeZoneSettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const { settings, updatePreferences, isLoading } = useUserSettings();
  const [searchQuery, setSearchQuery] = useState('');

  const handleTimeZoneSelect = async (timeZone) => {
    try {
      await updatePreferences({ timeZone });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to update time zone');
    }
  };

  const filteredTimeZones = TIME_ZONES.filter(
    (tz) =>
      tz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tz.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTimeZoneItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.timeZoneItem,
        { borderBottomColor: theme.colors.border },
      ]}
      onPress={() => handleTimeZoneSelect(item.id)}
    >
      <View>
        <Text style={[styles.timeZoneName, { color: theme.colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.timeZoneId, { color: theme.colors.text + '80' }]}>
          {item.id} ({item.offset})
        </Text>
      </View>
      {settings.preferences.timeZone === item.id && (
        <Ionicons
          name="checkmark"
          size={24}
          color={theme.colors.primary}
        />
      )}
    </TouchableOpacity>
  );

  // In the render, before time zones are loaded
  if (isLoading && (!filteredTimeZones || filteredTimeZones.length === 0)) {
    return (
      <View style={styles.container}>
        <SkeletonLoader rows={8} height={40} style={{ marginBottom: 12 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Time Zone
        </Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <Ionicons name="search" size={20} color={theme.colors.text + '80'} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search time zones..."
          placeholderTextColor={theme.colors.text + '80'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredTimeZones}
        renderItem={renderTimeZoneItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  listContent: {
    paddingVertical: 8,
  },
  timeZoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  timeZoneName: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeZoneId: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default TimeZoneSettingsScreen; 