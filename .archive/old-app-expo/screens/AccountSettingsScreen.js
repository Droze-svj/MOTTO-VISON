import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useUserSettings } from '../hooks/useUserSettings';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { Image as ExpoImage } from 'expo-image';

const AccountSettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const {
    settings,
    loading,
    error,
    loadSettings,
    updatePersonalInfo,
    updatePreferences,
    updateAvatar,
  } = useUserSettings();

  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleEditField = (field, value) => {
    setEditingField(field);
    setEditValue(value);
  };

  const handleSaveField = async () => {
    if (!editingField) return;

    try {
      await updatePersonalInfo({
        [editingField]: editValue,
      });
      setEditingField(null);
      setEditValue('');
    } catch (err) {
      Alert.alert('Error', 'Failed to update information');
    }
  };

  const handleAvatarPick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        await updateAvatar(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update avatar');
    }
  };

  const handlePreferenceChange = async (key, value) => {
    try {
      await updatePreferences({
        [key]: value,
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to update preference');
    }
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText} accessibilityRole="alert">
        {error || 'Unable to load account info. Please check your connection.'}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={loadSettings}
        accessibilityRole="button"
        accessibilityLabel="Retry loading account info"
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !settings.personalInfo.name) {
    return (
      <View style={styles.container}>
        <SkeletonLoader rows={3} height={60} style={{ marginBottom: 24 }} />
        <SkeletonLoader rows={2} height={40} style={{ marginBottom: 12 }} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={loadSettings}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
          Account Settings
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Profile Picture
          </Text>
          <TouchableOpacity
            style={[styles.avatarContainer, { backgroundColor: theme.colors.primary + '20' }]}
            onPress={handleAvatarPick}
          >
            {settings.personalInfo.avatar ? (
              <ExpoImage
                source={{ uri: settings.personalInfo.avatar }}
                style={styles.avatar}
                contentFit='cover'
                transition={300}
                cachePolicy='memory-disk'
              />
            ) : (
              <Ionicons name="person" size={40} color={theme.colors.primary} />
            )}
            <View style={[styles.editOverlay, { backgroundColor: theme.colors.primary + '80' }]}>
              <Ionicons name="camera" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Personal Information
          </Text>
          {['name', 'email', 'phone'].map((field) => (
            <View
              key={field}
              style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
            >
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </Text>
              {editingField === field ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={editValue}
                    onChangeText={setEditValue}
                    autoFocus
                    onSubmitEditing={handleSaveField}
                  />
                  <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleSaveField}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.valueContainer}
                  onPress={() => handleEditField(field, settings.personalInfo[field])}
                >
                  <Text style={[styles.settingValue, { color: theme.colors.text + '80' }]}>
                    {settings.personalInfo[field] || 'Not set'}
                  </Text>
                  <Ionicons
                    name="pencil"
                    size={20}
                    color={theme.colors.text + '80'}
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Preferences
          </Text>
          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Dark Mode</Text>
            <Switch
              value={settings.preferences.darkMode}
              onValueChange={(value) => handlePreferenceChange('darkMode', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>
          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Language</Text>
            <TouchableOpacity
              style={styles.valueContainer}
              onPress={() => navigation.navigate('LanguageSettings')}
            >
              <Text style={[styles.settingValue, { color: theme.colors.text + '80' }]}>
                {settings.preferences.language.toUpperCase()}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.text + '80'}
              />
            </TouchableOpacity>
          </View>
          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Time Zone</Text>
            <TouchableOpacity
              style={styles.valueContainer}
              onPress={() => navigation.navigate('TimeZoneSettings')}
            >
              <Text style={[styles.settingValue, { color: theme.colors.text + '80' }]}>
                {settings.preferences.timeZone}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.text + '80'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
    minWidth: 150,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
});

export default AccountSettingsScreen; 