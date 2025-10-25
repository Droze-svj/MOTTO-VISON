import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, TouchableOpacity, StyleSheet, Switch, TextInput } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../providers/ThemeProvider';
import { Appearance } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FuturisticLogo from '../components/FuturisticLogo';

const API_URL = process.env.API_URL || 'http://localhost:8000';

const interestsList = [
  { key: 'productivity', label: 'Productivity', icon: 'checkmark-done-outline' },
  { key: 'wellness', label: 'Wellness', icon: 'heart-outline' },
  { key: 'learning', label: 'Learning', icon: 'book-outline' },
  { key: 'collaboration', label: 'Collaboration', icon: 'people-outline' },
  { key: 'automation', label: 'Automation', icon: 'flash-outline' },
];

const steps = [
  'Welcome',
  'Theme',
  'Accessibility',
  'Notifications',
  'Interests',
  'Profile',
  'Finish',
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { theme, setTheme, isDark, setIsDark } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [themeChoice, setThemeChoice] = useState(Appearance.getColorScheme() || 'light');
  const [fontSize, setFontSize] = useState(16);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [interests, setInterests] = useState([]);

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));
  const skipStep = () => nextStep();

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      const access_token = await SecureStore.getItemAsync('access_token');
      const user_id = await getUserIdFromToken(access_token);
      const resp = await fetch(`${API_URL}/user/${user_id}/onboarded`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${access_token}` },
      });
      if (resp.ok) {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else {
        Alert.alert('Error', 'Failed to complete onboarding.');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Unexpected error.');
    }
    setLoading(false);
  };

  const toggleInterest = (key) => {
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
    );
  };

  // Helper to decode JWT and get user_id
  async function getUserIdFromToken(token) {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.sub;
    } catch {
      return null;
    }
  }

  const renderProgressBar = () => (
    <View style={styles.progressBarContainer} accessible accessibilityRole="progressbar" accessibilityLabel={`Step ${step + 1} of ${steps.length}`}>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${((step + 1) / steps.length) * 100}%` }]} />
      </View>
      <Text style={{ color: theme.colors.text.secondary }}>{`Step ${step + 1} of ${steps.length}`}</Text>
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.centered} accessible accessibilityRole="header" accessibilityLabel="Welcome to Onboarding">
            <FuturisticLogo size={120} variant="default" />
            <Text style={[styles.text, { color: theme.colors.text.secondary }]}>Let's get you set up.</Text>
            <Button title="Get Started" onPress={nextStep} accessibilityLabel="Get Started" />
          </View>
        );
      case 1:
        return (
          <View style={styles.centered} accessible accessibilityRole="form" accessibilityLabel="Theme selection">
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Choose your theme</Text>
            <TouchableOpacity
              style={[styles.option, themeChoice === 'light' && styles.selectedOption]}
              onPress={() => { setThemeChoice('light'); setIsDark(false); }}
              accessible accessibilityRole="button" accessibilityLabel="Light theme"
            >
              <Text style={{ color: theme.colors.text.primary }}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, themeChoice === 'dark' && styles.selectedOption]}
              onPress={() => { setThemeChoice('dark'); setIsDark(true); }}
              accessible accessibilityRole="button" accessibilityLabel="Dark theme"
            >
              <Text style={{ color: theme.colors.text.primary }}>Dark</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, themeChoice === 'auto' && styles.selectedOption]}
              onPress={() => { setThemeChoice('auto'); setIsDark(Appearance.getColorScheme() === 'dark'); }}
              accessible accessibilityRole="button" accessibilityLabel="Auto theme"
            >
              <Text style={{ color: theme.colors.text.primary }}>Auto (System)</Text>
            </TouchableOpacity>
            <Button title="Next" onPress={nextStep} accessibilityLabel="Next" />
          </View>
        );
      case 2:
        return (
          <View style={styles.centered} accessible accessibilityRole="form" accessibilityLabel="Accessibility preferences">
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Accessibility Preferences</Text>
            <View style={styles.row}>
              <Text style={{ color: theme.colors.text.primary }}>Font Size</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text.primary }]}
                keyboardType="numeric"
                value={String(fontSize)}
                onChangeText={v => setFontSize(Number(v) || 16)}
                accessible accessibilityLabel="Font size input"
              />
            </View>
            <View style={styles.row}>
              <Text style={{ color: theme.colors.text.primary }}>Reduce Motion</Text>
              <Switch
                value={reducedMotion}
                onValueChange={setReducedMotion}
                accessibilityLabel="Reduce motion toggle"
              />
            </View>
            <Button title="Next" onPress={nextStep} accessibilityLabel="Next" />
          </View>
        );
      case 3:
        return (
          <View style={styles.centered} accessible accessibilityRole="form" accessibilityLabel="Notification preferences">
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Enable Notifications?</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              accessibilityLabel="Enable notifications toggle"
            />
            <Button title="Next" onPress={nextStep} accessibilityLabel="Next" />
          </View>
        );
      case 4:
        return (
          <View style={styles.centered} accessible accessibilityRole="form" accessibilityLabel="Select your interests">
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>What are you interested in?</Text>
            <Text style={[styles.text, { color: theme.colors.text.secondary }]}>Select one or more to personalize your experience.</Text>
            <View style={styles.interestsContainer}>
              {interestsList.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.interestOption, interests.includes(item.key) && styles.selectedInterest]}
                  onPress={() => toggleInterest(item.key)}
                  accessible accessibilityRole="checkbox"
                  accessibilityLabel={item.label}
                  accessibilityState={{ checked: interests.includes(item.key) }}
                >
                  <Ionicons name={item.icon} size={28} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.text.primary, marginTop: 8 }}>{item.label}</Text>
                  {interests.includes(item.key) && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.success || theme.colors.primary} style={{ position: 'absolute', top: 4, right: 4 }} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.infoIcon}
              accessible accessibilityRole="button"
              accessibilityLabel="Why do we ask for your interests?"
              accessibilityHint="Shows more information about personalization"
              onPress={() => Alert.alert('Personalization', 'Your interests help us tailor your experience, but you can skip this step or change preferences later.')}
            >
              <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <Button title="Next" onPress={nextStep} accessibilityLabel="Next" />
          </View>
        );
      case 5:
        return (
          <View style={styles.centered} accessible accessibilityRole="form" accessibilityLabel="Profile setup">
            <Ionicons name="person-circle-outline" size={48} color={theme.colors.primary} style={{ marginBottom: 8 }} />
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Set up your profile (optional)</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text.primary }]}
              placeholder="Name"
              value={profile.name}
              onChangeText={v => setProfile({ ...profile, name: v })}
              accessibilityLabel="Name input"
            />
            <TextInput
              style={[styles.input, { color: theme.colors.text.primary }]}
              placeholder="Email"
              value={profile.email}
              onChangeText={v => setProfile({ ...profile, email: v })}
              keyboardType="email-address"
              accessibilityLabel="Email input"
            />
            <Button title="Next" onPress={nextStep} accessibilityLabel="Next" />
          </View>
        );
      case 6:
        return (
          <View style={styles.centered} accessible accessibilityRole="header" accessibilityLabel="Finish onboarding">
            <Ionicons name="rocket-outline" size={48} color={theme.colors.primary} style={{ marginBottom: 8 }} />
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>You're all set!</Text>
            <Text style={[styles.text, { color: theme.colors.text.secondary }]}>Here's a summary of your choices:</Text>
            <View style={styles.summaryBox}>
              <Text style={{ color: theme.colors.text.primary }}>Theme: {themeChoice.charAt(0).toUpperCase() + themeChoice.slice(1)}</Text>
              <Text style={{ color: theme.colors.text.primary }}>Font Size: {fontSize}</Text>
              <Text style={{ color: theme.colors.text.primary }}>Reduce Motion: {reducedMotion ? 'Yes' : 'No'}</Text>
              <Text style={{ color: theme.colors.text.primary }}>Notifications: {notifications ? 'Enabled' : 'Disabled'}</Text>
              <Text style={{ color: theme.colors.text.primary }}>Interests: {interests.map(i => interestsList.find(x => x.key === i)?.label).join(', ') || 'None'}</Text>
              <Text style={{ color: theme.colors.text.primary }}>Name: {profile.name || 'Not set'}</Text>
              <Text style={{ color: theme.colors.text.primary }}>Email: {profile.email || 'Not set'}</Text>
            </View>
            {loading ? <ActivityIndicator size="large" /> : (
              <Button title="Finish" onPress={completeOnboarding} accessibilityLabel="Finish onboarding" />
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.default }]} accessible accessibilityRole="form" accessibilityLabel="Onboarding flow">
      {renderProgressBar()}
      {renderStep()}
      {step > 0 && step < steps.length - 1 && (
        <TouchableOpacity onPress={skipStep} style={styles.skipButton} accessibilityRole="button" accessibilityLabel="Skip step">
          <Text style={{ color: theme.colors.primary }}>Skip</Text>
        </TouchableOpacity>
      )}
      {step > 0 && (
        <TouchableOpacity onPress={prevStep} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={{ color: theme.colors.primary }}>Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  centered: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  option: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 8,
    width: 200,
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#e6f0ff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
    justifyContent: 'space-between',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
    width: 200,
  },
  progressContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  skipButton: {
    position: 'absolute',
    bottom: 40,
    right: 40,
  },
  backButton: {
    position: 'absolute',
    bottom: 40,
    left: 40,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 24,
  },
  progressBarBg: {
    width: '80%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 16,
  },
  interestOption: {
    width: 100,
    height: 100,
    margin: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafbfc',
    position: 'relative',
  },
  selectedInterest: {
    borderColor: '#007AFF',
    backgroundColor: '#e6f0ff',
  },
  infoIcon: {
    marginVertical: 8,
  },
  summaryBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    width: 260,
    alignItems: 'flex-start',
  },
}); 