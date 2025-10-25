/**
 * Profile Setup Screen - Personalize MOTTO
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import MultilingualService from '../../services/core/MultilingualService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileSetupScreenProps {
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
}

export interface UserProfile {
  name: string;
  language: string;
  interests: string[];
  communicationStyle: 'casual' | 'formal' | 'balanced';
}

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

const interestOptions = [
  '💻 Technology',
  '📚 Learning',
  '🎨 Creative',
  '💼 Business',
  '🏃 Health & Fitness',
  '🎵 Music',
  '🌍 Travel',
  '🍳 Cooking',
  '📱 Social Media',
  '🎮 Gaming',
];

const styleOptions = [
  { id: 'casual', label: 'Casual & Friendly', emoji: '😊', description: 'Relaxed and conversational' },
  { id: 'formal', label: 'Professional', emoji: '🎩', description: 'Polite and formal' },
  { id: 'balanced', label: 'Balanced', emoji: '⚖️', description: 'Mix of both' },
];

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  onComplete,
  onBack,
}) => {
  const [name, setName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<'casual' | 'formal' | 'balanced'>('balanced');

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      if (selectedInterests.length < 5) {
        setSelectedInterests(prev => [...prev, interest]);
      } else {
        Alert.alert('Maximum Reached', 'You can select up to 5 interests');
      }
    }
  };

  const handleComplete = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name to continue');
      return;
    }

    const profile: UserProfile = {
      name: name.trim(),
      language: selectedLanguage,
      interests: selectedInterests,
      communicationStyle: selectedStyle,
    };

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      
      // Set user language in multilingual service
      const userId = await AsyncStorage.getItem('userId') || 'user-' + Date.now();
      await AsyncStorage.setItem('userId', userId);
      await MultilingualService.setUserLanguage(userId, selectedLanguage);
    } catch (error) {
      console.error('Profile save error:', error);
    }

    onComplete(profile);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setup Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Name Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's your name? 👋</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Enter your name..."
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Language Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Language 🌍</Text>
          <Text style={styles.sectionSubtitle}>I'll communicate with you in this language</Text>
          <View style={styles.languageGrid}>
            {languages.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  selectedLanguage === lang.code && styles.languageOptionSelected,
                ]}
                onPress={() => setSelectedLanguage(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.languageName,
                    selectedLanguage === lang.code && styles.languageNameSelected,
                  ]}
                >
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Interests 🎯</Text>
          <Text style={styles.sectionSubtitle}>Select up to 5 (optional)</Text>
          <View style={styles.interestsGrid}>
            {interestOptions.map(interest => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestChip,
                  selectedInterests.includes(interest) && styles.interestChipSelected,
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  style={[
                    styles.interestText,
                    selectedInterests.includes(interest) && styles.interestTextSelected,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Communication Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication Style 💬</Text>
          <Text style={styles.sectionSubtitle}>How should I talk to you?</Text>
          <View style={styles.styleOptions}>
            {styleOptions.map(style => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleOption,
                  selectedStyle === style.id && styles.styleOptionSelected,
                ]}
                onPress={() => setSelectedStyle(style.id as any)}
              >
                <Text style={styles.styleEmoji}>{style.emoji}</Text>
                <View style={styles.styleContent}>
                  <Text
                    style={[
                      styles.styleLabel,
                      selectedStyle === style.id && styles.styleLabelSelected,
                    ]}
                  >
                    {style.label}
                  </Text>
                  <Text style={styles.styleDescription}>{style.description}</Text>
                </View>
                {selectedStyle === style.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.completeButton, !name.trim() && styles.completeButtonDisabled]}
          onPress={handleComplete}
          disabled={!name.trim()}
        >
          <Text style={styles.completeButtonText}>Complete Setup</Text>
          <Text style={styles.completeButtonIcon}>✓</Text>
        </TouchableOpacity>
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#1F2937',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  nameInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  languageOption: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  languageFlag: {
    fontSize: 20,
  },
  languageName: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  languageNameSelected: {
    color: '#4F46E5',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestChip: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  interestChipSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  interestText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  interestTextSelected: {
    color: '#4F46E5',
  },
  styleOptions: {
    gap: 12,
  },
  styleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  styleOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  styleEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  styleContent: {
    flex: 1,
  },
  styleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  styleLabelSelected: {
    color: '#4F46E5',
  },
  styleDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  checkmark: {
    fontSize: 20,
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  completeButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  completeButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  completeButtonIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#4F46E5',
  },
});

export default ProfileSetupScreen;
