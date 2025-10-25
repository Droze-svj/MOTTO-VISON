import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Slider,
  Switch,
  Alert,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import BritishVoiceSynthesisService from '../services/BritishVoiceSynthesisService';

const BritishVoiceSettingsScreen = () => {
  const [currentVoice, setCurrentVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState({});
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.5,
    pitch: 1.1,
    volume: 1.0
  });
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVoiceSettings();
  }, []);

  const loadVoiceSettings = async () => {
    try {
      setIsLoading(true);
      
      // Get current voice and settings
      const voice = BritishVoiceSynthesisService.getCurrentVoice();
      const voices = BritishVoiceSynthesisService.getAvailableVoices();
      const settings = BritishVoiceSynthesisService.getVoiceSettings();
      
      setCurrentVoice(voice);
      setAvailableVoices(voices);
      setVoiceSettings(settings);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading voice settings:', error);
      setIsLoading(false);
    }
  };

  const handleVoiceChange = async (voiceName) => {
    try {
      await BritishVoiceSynthesisService.setVoice(voiceName);
      const newVoice = BritishVoiceSynthesisService.getCurrentVoice();
      setCurrentVoice(newVoice);
      
      // Test the new voice
      await BritishVoiceSynthesisService.speak('Hello, this is your new British voice. How do I sound?');
    } catch (error) {
      console.error('Error changing voice:', error);
      Alert.alert('Error', 'Failed to change voice');
    }
  };

  const handleRateChange = async (rate) => {
    try {
      await BritishVoiceSynthesisService.setSpeechRate(rate);
      setVoiceSettings(prev => ({ ...prev, rate }));
    } catch (error) {
      console.error('Error changing rate:', error);
    }
  };

  const handlePitchChange = async (pitch) => {
    try {
      await BritishVoiceSynthesisService.setSpeechPitch(pitch);
      setVoiceSettings(prev => ({ ...prev, pitch }));
    } catch (error) {
      console.error('Error changing pitch:', error);
    }
  };

  const handleVolumeChange = async (volume) => {
    try {
      await BritishVoiceSynthesisService.setSpeechVolume(volume);
      setVoiceSettings(prev => ({ ...prev, volume }));
    } catch (error) {
      console.error('Error changing volume:', error);
    }
  };

  const testVoice = async () => {
    try {
      const testText = "Hello! I'm MOTTO, your British AI assistant. I can help you with various tasks using my refined British accent. How do I sound to you?";
      await BritishVoiceSynthesisService.speak(testText);
    } catch (error) {
      console.error('Error testing voice:', error);
      Alert.alert('Error', 'Failed to test voice');
    }
  };

  const testPronunciation = async () => {
    try {
      const testText = "I can pronounce British words correctly. For example: colour, favour, honour, centre, theatre, aluminium, and schedule. I also know that a lift is an elevator, a lorry is a truck, and a biscuit is a cookie.";
      await BritishVoiceSynthesisService.speak(testText);
    } catch (error) {
      console.error('Error testing pronunciation:', error);
      Alert.alert('Error', 'Failed to test pronunciation');
    }
  };

  const resetToDefaults = async () => {
    try {
      await BritishVoiceSynthesisService.setVoice('en-GB-Kate');
      await BritishVoiceSynthesisService.setSpeechRate(0.5);
      await BritishVoiceSynthesisService.setSpeechPitch(1.1);
      await BritishVoiceSynthesisService.setSpeechVolume(1.0);
      
      await loadVoiceSettings();
      Alert.alert('Success', 'Voice settings reset to defaults');
    } catch (error) {
      console.error('Error resetting settings:', error);
      Alert.alert('Error', 'Failed to reset settings');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading voice settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>British Voice Settings</Text>
        <Text style={styles.subtitle}>Customize MOTTO's British accent and voice</Text>
      </View>

      {/* Voice Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice Selection</Text>
        <View style={styles.voiceSelector}>
          <Picker
            selectedValue={currentVoice?.name || 'en-GB-Kate'}
            onValueChange={handleVoiceChange}
            style={styles.picker}
          >
            {Object.entries(availableVoices).map(([key, voice]) => (
              <Picker.Item
                key={key}
                label={voice.displayName}
                value={key}
              />
            ))}
          </Picker>
        </View>
        
        {currentVoice && (
          <View style={styles.voiceInfo}>
            <Text style={styles.voiceName}>{currentVoice.displayName}</Text>
            <Text style={styles.voiceDetails}>
              Gender: {currentVoice.gender} | Accent: {currentVoice.accent} | Quality: {currentVoice.quality}
            </Text>
          </View>
        )}
      </View>

      {/* Speech Rate */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Speech Rate</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Slow</Text>
          <Slider
            style={styles.slider}
            minimumValue={0.1}
            maximumValue={1.0}
            value={voiceSettings.rate}
            onValueChange={handleRateChange}
            minimumTrackTintColor="#8641f4"
            maximumTrackTintColor="#333"
            thumbStyle={styles.sliderThumb}
          />
          <Text style={styles.sliderLabel}>Fast</Text>
        </View>
        <Text style={styles.sliderValue}>{voiceSettings.rate.toFixed(1)}</Text>
      </View>

      {/* Speech Pitch */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice Pitch</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Low</Text>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={2.0}
            value={voiceSettings.pitch}
            onValueChange={handlePitchChange}
            minimumTrackTintColor="#8641f4"
            maximumTrackTintColor="#333"
            thumbStyle={styles.sliderThumb}
          />
          <Text style={styles.sliderLabel}>High</Text>
        </View>
        <Text style={styles.sliderValue}>{voiceSettings.pitch.toFixed(1)}</Text>
      </View>

      {/* Speech Volume */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Volume</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Quiet</Text>
          <Slider
            style={styles.slider}
            minimumValue={0.0}
            maximumValue={1.0}
            value={voiceSettings.volume}
            onValueChange={handleVolumeChange}
            minimumTrackTintColor="#8641f4"
            maximumTrackTintColor="#333"
            thumbStyle={styles.sliderThumb}
          />
          <Text style={styles.sliderLabel}>Loud</Text>
        </View>
        <Text style={styles.sliderValue}>{Math.round(voiceSettings.volume * 100)}%</Text>
      </View>

      {/* Voice Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice Features</Text>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureLabel}>British Pronunciation</Text>
          <Text style={styles.featureDescription}>
            Automatically converts American words to British equivalents
          </Text>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureLabel}>British Spelling</Text>
          <Text style={styles.featureDescription}>
            Uses British spelling (colour, favour, centre, etc.)
          </Text>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureLabel}>British Vocabulary</Text>
          <Text style={styles.featureDescription}>
            Uses British terms (lift, lorry, biscuit, etc.)
          </Text>
        </View>
      </View>

      {/* Test Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Voice</Text>
        
        <TouchableOpacity style={styles.testButton} onPress={testVoice}>
          <Text style={styles.testButtonText}>Test Voice</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.testButton} onPress={testPronunciation}>
          <Text style={styles.testButtonText}>Test British Pronunciation</Text>
        </TouchableOpacity>
      </View>

      {/* Reset Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </View>

      {/* Voice Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About British Voices</Text>
        <Text style={styles.infoText}>
          MOTTO now uses authentic British voices with proper pronunciation, spelling, and vocabulary. 
          The voice automatically converts American English to British English, ensuring a consistent 
          British experience throughout your interactions.
        </Text>
        
        <Text style={styles.infoText}>
          Available voices include Kate, Serena, and other British female voices, each with their 
          own unique characteristics while maintaining the authentic British accent.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  voiceSelector: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  picker: {
    color: '#ffffff',
    height: 50,
  },
  voiceInfo: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  voiceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8641f4',
    marginBottom: 4,
  },
  voiceDetails: {
    fontSize: 14,
    color: '#888',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 16,
  },
  sliderThumb: {
    backgroundColor: '#8641f4',
    width: 20,
    height: 20,
  },
  sliderLabel: {
    color: '#888',
    fontSize: 14,
    minWidth: 40,
    textAlign: 'center',
  },
  sliderValue: {
    color: '#8641f4',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  featureItem: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  featureLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: '#8641f4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    marginBottom: 12,
  },
});

export default BritishVoiceSettingsScreen;
