import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice from '@react-native-voice/voice';
import { useMediaAnalytics } from '../hooks/useMediaAnalytics';

const VoiceCommandSettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const { trackEvent } = useMediaAnalytics();
  const [settings, setSettings] = useState({
    enabled: true,
    voiceFeedback: true,
    autoStart: false,
    sensitivity: 'medium',
    language: 'en-US',
    timeout: 5000,
    showConfirmation: true,
  });
  const [loading, setLoading] = useState(true);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  useEffect(() => {
    loadSettings();
    loadAvailableLanguages();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('voiceCommandSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableLanguages = async () => {
    try {
      const languages = await Voice.getAvailableLanguages();
      setAvailableLanguages(languages);
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('voiceCommandSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      trackEvent('voice_settings_updated', { settings: newSettings });
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const handleSensitivityChange = (value) => {
    const newSettings = { ...settings, sensitivity: value };
    saveSettings(newSettings);
  };

  const handleLanguageChange = (language) => {
    const newSettings = { ...settings, language };
    saveSettings(newSettings);
  };

  const handleTimeoutChange = (value) => {
    const newSettings = { ...settings, timeout: value };
    saveSettings(newSettings);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
          Voice Command Settings
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            General Settings
          </Text>
          <SettingItem
            title="Enable Voice Commands"
            description="Turn voice commands on or off"
            icon="mic"
            value={settings.enabled}
            onToggle={() => handleToggle('enabled')}
          />
          <SettingItem
            title="Voice Feedback"
            description="Get voice confirmation for commands"
            icon="volume-high"
            value={settings.voiceFeedback}
            onToggle={() => handleToggle('voiceFeedback')}
          />
          <SettingItem
            title="Auto Start"
            description="Start listening automatically"
            icon="play"
            value={settings.autoStart}
            onToggle={() => handleToggle('autoStart')}
          />
          <SettingItem
            title="Show Confirmation"
            description="Display command confirmation"
            icon="checkmark-circle"
            value={settings.showConfirmation}
            onToggle={() => handleToggle('showConfirmation')}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recognition Settings
          </Text>
          <SensitivitySelector
            value={settings.sensitivity}
            onChange={handleSensitivityChange}
          />
          <LanguageSelector
            value={settings.language}
            options={availableLanguages}
            onChange={handleLanguageChange}
          />
          <TimeoutSelector
            value={settings.timeout}
            onChange={handleTimeoutChange}
          />
        </View>

        <TouchableOpacity
          style={[styles.helpButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('VoiceCommandHelp')}
        >
          <Ionicons name="help-circle" size={24} color="white" />
          <Text style={styles.helpButtonText}>View Voice Command Help</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const SettingItem = ({ title, description, icon, value, onToggle }) => {
  const theme = useTheme();

  return (
    <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.settingInfo}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
          <Ionicons name={icon} size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.settingDescription, { color: theme.colors.text + '80' }]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
      />
    </View>
  );
};

const SensitivitySelector = ({ value, onChange }) => {
  const theme = useTheme();
  const options = ['low', 'medium', 'high'];

  return (
    <View style={styles.selector}>
      <Text style={[styles.selectorTitle, { color: theme.colors.text }]}>
        Recognition Sensitivity
      </Text>
      <View style={styles.selectorOptions}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.selectorOption,
              {
                backgroundColor: value === option ? theme.colors.primary : theme.colors.card,
              },
            ]}
            onPress={() => onChange(option)}
          >
            <Text
              style={[
                styles.selectorOptionText,
                { color: value === option ? 'white' : theme.colors.text },
              ]}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const LanguageSelector = ({ value, options, onChange }) => {
  const theme = useTheme();

  return (
    <View style={styles.selector}>
      <Text style={[styles.selectorTitle, { color: theme.colors.text }]}>
        Recognition Language
      </Text>
      <View style={styles.languageOptions}>
        {options.map((language) => (
          <TouchableOpacity
            key={language}
            style={[
              styles.languageOption,
              {
                backgroundColor: value === language ? theme.colors.primary : theme.colors.card,
              },
            ]}
            onPress={() => onChange(language)}
          >
            <Text
              style={[
                styles.languageOptionText,
                { color: value === language ? 'white' : theme.colors.text },
              ]}
            >
              {language}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const TimeoutSelector = ({ value, onChange }) => {
  const theme = useTheme();
  const options = [3000, 5000, 10000];

  return (
    <View style={styles.selector}>
      <Text style={[styles.selectorTitle, { color: theme.colors.text }]}>
        Listening Timeout
      </Text>
      <View style={styles.selectorOptions}>
        {options.map((timeout) => (
          <TouchableOpacity
            key={timeout}
            style={[
              styles.selectorOption,
              {
                backgroundColor: value === timeout ? theme.colors.primary : theme.colors.card,
              },
            ]}
            onPress={() => onChange(timeout)}
          >
            <Text
              style={[
                styles.selectorOptionText,
                { color: value === timeout ? 'white' : theme.colors.text },
              ]}
            >
              {timeout / 1000}s
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  selector: {
    marginBottom: 24,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  selectorOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectorOption: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectorOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  languageOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  languageOption: {
    margin: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  languageOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  helpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default VoiceCommandSettingsScreen; 