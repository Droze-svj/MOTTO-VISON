import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useUserSettings } from '../hooks/useUserSettings';
import SkeletonLoader from '../components/common/SkeletonLoader';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
];

const LanguageSettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const { settings, updatePreferences, isLoading } = useUserSettings();

  const handleLanguageSelect = async (languageCode) => {
    try {
      await updatePreferences({ language: languageCode });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to update language');
    }
  };

  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        { borderBottomColor: theme.colors.border },
      ]}
      onPress={() => handleLanguageSelect(item.code)}
    >
      <Text style={[styles.languageName, { color: theme.colors.text }]}>
        {item.name}
      </Text>
      {settings.preferences.language === item.code && (
        <Ionicons
          name="checkmark"
          size={24}
          color={theme.colors.primary}
        />
      )}
    </TouchableOpacity>
  );

  if (isLoading && (!LANGUAGES || LANGUAGES.length === 0)) {
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
          Language
        </Text>
      </View>

      <FlatList
        data={LANGUAGES}
        renderItem={renderLanguageItem}
        keyExtractor={(item) => item.code}
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
  listContent: {
    paddingVertical: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  languageName: {
    fontSize: 16,
  },
});

export default LanguageSettingsScreen; 