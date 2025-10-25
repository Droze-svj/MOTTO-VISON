import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import AdvancedVoiceToTextService from '../services/AdvancedVoiceToTextService';
import RealTimeTranscriptionService from '../services/RealTimeTranscriptionService';
import IntelligentVoiceCommandProcessor from '../services/IntelligentVoiceCommandProcessor';

const AdvancedVoiceToTextSettingsScreen = () => {
  const [transcriptionSettings, setTranscriptionSettings] = useState({
    language: 'en-GB',
    confidence: 0.8,
    timeout: 10000,
    continuous: true,
    interimResults: true,
    enableNoiseSuppression: true,
    enableEchoCancellation: true,
    enableVoiceActivityDetection: true,
    enableAutomaticGainControl: true,
    enablePunctuation: true,
    enableCapitalization: true,
    enableProfanityFilter: false,
    enableWordTimeOffsets: true,
    enableWordConfidence: true,
    enableSpeakerDiarization: false,
    enableAutomaticPunctuation: true,
    enableSpellCorrection: true,
    enableGrammarCorrection: true,
    enableContextCorrection: true,
    enableRealTimeCorrection: true,
    enableLearningMode: true
  });
  
  const [realTimeSettings, setRealTimeSettings] = useState({
    isEnabled: true,
    processingInterval: 100,
    confidenceThreshold: 0.7,
    correctionDelay: 500,
    learningDelay: 1000
  });
  
  const [advancedFeatures, setAdvancedFeatures] = useState({
    contextAwareness: true,
    intentRecognition: true,
    entityExtraction: true,
    sentimentAnalysis: true,
    emotionDetection: true,
    speakerIdentification: true,
    noiseAdaptation: true,
    accentAdaptation: true,
    realTimeCorrection: true,
    predictiveText: true,
    grammarCorrection: true,
    spellCorrection: true,
    punctuationCorrection: true,
    capitalizationCorrection: true,
    contextCorrection: true,
    domainAdaptation: true,
    userAdaptation: true,
    learningMode: true
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Get current settings from services
      const transcriptionHealth = await AdvancedVoiceToTextService.getHealthStatus();
      const realTimeHealth = await RealTimeTranscriptionService.getHealthStatus();
      const processorHealth = await IntelligentVoiceCommandProcessor.getHealthStatus();
      
      // Update state with current settings
      if (transcriptionHealth.recognitionSettings) {
        setTranscriptionSettings(transcriptionHealth.recognitionSettings);
      }
      
      if (realTimeHealth.realTimeProcessing) {
        setRealTimeSettings(realTimeHealth.realTimeProcessing);
      }
      
      if (processorHealth.advancedFeatures) {
        setAdvancedFeatures(processorHealth.advancedFeatures);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setIsLoading(false);
    }
  };

  const handleTranscriptionSettingChange = (key, value) => {
    setTranscriptionSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRealTimeSettingChange = (key, value) => {
    setRealTimeSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAdvancedFeatureChange = (key, value) => {
    setAdvancedFeatures(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    try {
      // Save transcription settings
      await AdvancedVoiceToTextService.updateSettings(transcriptionSettings);
      
      // Save real-time settings
      await RealTimeTranscriptionService.updateSettings(realTimeSettings);
      
      // Save advanced features
      await IntelligentVoiceCommandProcessor.updateSettings(advancedFeatures);
      
      Alert.alert('Success', 'Voice-to-text settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const resetToDefaults = async () => {
    try {
      // Reset to default settings
      const defaultTranscriptionSettings = {
        language: 'en-GB',
        confidence: 0.8,
        timeout: 10000,
        continuous: true,
        interimResults: true,
        enableNoiseSuppression: true,
        enableEchoCancellation: true,
        enableVoiceActivityDetection: true,
        enableAutomaticGainControl: true,
        enablePunctuation: true,
        enableCapitalization: true,
        enableProfanityFilter: false,
        enableWordTimeOffsets: true,
        enableWordConfidence: true,
        enableSpeakerDiarization: false,
        enableAutomaticPunctuation: true,
        enableSpellCorrection: true,
        enableGrammarCorrection: true,
        enableContextCorrection: true,
        enableRealTimeCorrection: true,
        enableLearningMode: true
      };
      
      const defaultRealTimeSettings = {
        isEnabled: true,
        processingInterval: 100,
        confidenceThreshold: 0.7,
        correctionDelay: 500,
        learningDelay: 1000
      };
      
      const defaultAdvancedFeatures = {
        contextAwareness: true,
        intentRecognition: true,
        entityExtraction: true,
        sentimentAnalysis: true,
        emotionDetection: true,
        speakerIdentification: true,
        noiseAdaptation: true,
        accentAdaptation: true,
        realTimeCorrection: true,
        predictiveText: true,
        grammarCorrection: true,
        spellCorrection: true,
        punctuationCorrection: true,
        capitalizationCorrection: true,
        contextCorrection: true,
        domainAdaptation: true,
        userAdaptation: true,
        learningMode: true
      };
      
      setTranscriptionSettings(defaultTranscriptionSettings);
      setRealTimeSettings(defaultRealTimeSettings);
      setAdvancedFeatures(defaultAdvancedFeatures);
      
      await saveSettings();
      Alert.alert('Success', 'Settings reset to defaults');
    } catch (error) {
      console.error('Error resetting settings:', error);
      Alert.alert('Error', 'Failed to reset settings');
    }
  };

  const testVoiceToText = async () => {
    try {
      setIsTesting(true);
      
      // Start transcription test
      const sessionId = await AdvancedVoiceToTextService.startListening();
      
      // Wait for user to speak
      setTimeout(async () => {
        await AdvancedVoiceToTextService.stopListening();
        setIsTesting(false);
        Alert.alert('Test Complete', 'Voice-to-text test completed. Check the results.');
      }, 5000);
      
    } catch (error) {
      console.error('Error testing voice-to-text:', error);
      setIsTesting(false);
      Alert.alert('Error', 'Failed to test voice-to-text');
    }
  };

  const testRealTimeTranscription = async () => {
    try {
      setIsTesting(true);
      
      // Start real-time transcription test
      const sessionId = await RealTimeTranscriptionService.startTranscription();
      
      // Wait for user to speak
      setTimeout(async () => {
        await RealTimeTranscriptionService.stopTranscription();
        setIsTesting(false);
        Alert.alert('Test Complete', 'Real-time transcription test completed. Check the results.');
      }, 5000);
      
    } catch (error) {
      console.error('Error testing real-time transcription:', error);
      setIsTesting(false);
      Alert.alert('Error', 'Failed to test real-time transcription');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading voice-to-text settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Advanced Voice-to-Text Settings</Text>
        <Text style={styles.subtitle}>Customize MOTTO's voice recognition capabilities</Text>
      </View>

      {/* Basic Transcription Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Transcription Settings</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Language</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={transcriptionSettings.language}
              onValueChange={(value) => handleTranscriptionSettingChange('language', value)}
              style={styles.picker}
            >
              <Picker.Item label="British English (en-GB)" value="en-GB" />
              <Picker.Item label="American English (en-US)" value="en-US" />
              <Picker.Item label="Australian English (en-AU)" value="en-AU" />
              <Picker.Item label="Canadian English (en-CA)" value="en-CA" />
            </Picker>
          </View>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Confidence Threshold</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Low</Text>
            <Slider
              style={styles.slider}
              minimumValue={0.1}
              maximumValue={1.0}
              value={transcriptionSettings.confidence}
              onValueChange={(value) => handleTranscriptionSettingChange('confidence', value)}
              minimumTrackTintColor="#8641f4"
              maximumTrackTintColor="#333"
              thumbStyle={styles.sliderThumb}
            />
            <Text style={styles.sliderLabel}>High</Text>
          </View>
          <Text style={styles.sliderValue}>{transcriptionSettings.confidence.toFixed(1)}</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Timeout (seconds)</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>5s</Text>
            <Slider
              style={styles.slider}
              minimumValue={5000}
              maximumValue={30000}
              value={transcriptionSettings.timeout}
              onValueChange={(value) => handleTranscriptionSettingChange('timeout', value)}
              minimumTrackTintColor="#8641f4"
              maximumTrackTintColor="#333"
              thumbStyle={styles.sliderThumb}
            />
            <Text style={styles.sliderLabel}>30s</Text>
          </View>
          <Text style={styles.sliderValue}>{Math.round(transcriptionSettings.timeout / 1000)}s</Text>
        </View>
      </View>

      {/* Audio Processing Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio Processing</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Noise Suppression</Text>
          <Switch
            value={transcriptionSettings.enableNoiseSuppression}
            onValueChange={(value) => handleTranscriptionSettingChange('enableNoiseSuppression', value)}
            trackColor={{ false: '#333', true: '#8641f4' }}
            thumbColor={transcriptionSettings.enableNoiseSuppression ? '#ffffff' : '#888'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Echo Cancellation</Text>
          <Switch
            value={transcriptionSettings.enableEchoCancellation}
            onValueChange={(value) => handleTranscriptionSettingChange('enableEchoCancellation', value)}
            trackColor={{ false: '#333', true: '#8641f4' }}
            thumbColor={transcriptionSettings.enableEchoCancellation ? '#ffffff' : '#888'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Voice Activity Detection</Text>
          <Switch
            value={transcriptionSettings.enableVoiceActivityDetection}
            onValueChange={(value) => handleTranscriptionSettingChange('enableVoiceActivityDetection', value)}
            trackColor={{ false: '#333', true: '#8641f4' }}
            thumbColor={transcriptionSettings.enableVoiceActivityDetection ? '#ffffff' : '#888'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Automatic Gain Control</Text>
          <Switch
            value={transcriptionSettings.enableAutomaticGainControl}
            onValueChange={(value) => handleTranscriptionSettingChange('enableAutomaticGainControl', value)}
            trackColor={{ false: '#333', true: '#8641f4' }}
            thumbColor={transcriptionSettings.enableAutomaticGainControl ? '#ffffff' : '#888'}
          />
        </View>
      </View>

      {/* Text Processing Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Text Processing</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Automatic Punctuation</Text>
          <Switch
            value={transcriptionSettings.enablePunctuation}
            onValueChange={(value) => handleTranscriptionSettingChange('enablePunctuation', value)}
            trackColor={{ false: '#333', true: '#8641f4' }}
            thumbColor={transcriptionSettings.enablePunctuation ? '#ffffff' : '#888'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Automatic Capitalization</Text>
          <Switch
            value={transcriptionSettings.enableCapitalization}
            onValueChange={(value) => handleTranscriptionSettingChange('enableCapitalization', value)}
            trackColor={{ false: '#333', true: '#8641f4' }}
            thumbColor={transcriptionSettings.enableCapitalization ? '#ffffff' : '#888'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Spell Correction</Text>
          <Switch
            value={transcriptionSettings.enableSpellCorrection}
            onValueChange={(value) => handleTranscriptionSettingChange('enableSpellCorrection', value)}
            trackColor={{ false: '#333', true: '#8641f4' }}
            thumbColor={transcriptionSettings.enableSpellCorrection ? '#ffffff' : '#888'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Grammar Correction</Text>
          <Switch
            value={transcriptionSettings.enableGrammarCorrection}
            onValueChange={(value) => handleTranscriptionSettingChange('enableGrammarCorrection', value)}
            trackColor={{ false: '#333', true: '#8641f4' }}
            thumbColor={transcriptionSettings.enableGrammarCorrection ? '#ffffff' : '#888'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Context Correction</Text>
          <Switch
            value={transcriptionSettings.enableContextCorrection}
            onValueChange={(value) => handleTranscriptionSettingChange('enableContextCorrection', value)}
            trackColor={{ false: '#333', true: '#8641f4' }}
            thumbColor={transcriptionSettings.enableContextCorrection ? '#ffffff' : '#888'}
          />
        </View>
      </View>

      {/* Real-Time Processing Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Real-Time Processing</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Enable Real-Time Processing</Text>
          <Switch
            value={realTimeSettings.isEnabled}
            onValueChange={(value) => handleRealTimeSettingChange('isEnabled', value)}
            trackColor={{ false: '#333', true: '#8641f4' }}
            thumbColor={realTimeSettings.isEnabled ? '#ffffff' : '#888'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Processing Interval (ms)</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>50ms</Text>
            <Slider
              style={styles.slider}
              minimumValue={50}
              maximumValue={500}
              value={realTimeSettings.processingInterval}
              onValueChange={(value) => handleRealTimeSettingChange('processingInterval', value)}
              minimumTrackTintColor="#8641f4"
              maximumTrackTintColor="#333"
              thumbStyle={styles.sliderThumb}
            />
            <Text style={styles.sliderLabel}>500ms</Text>
          </View>
          <Text style={styles.sliderValue}>{realTimeSettings.processingInterval}ms</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Confidence Threshold</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Low</Text>
            <Slider
              style={styles.slider}
              minimumValue={0.1}
              maximumValue={1.0}
              value={realTimeSettings.confidenceThreshold}
              onValueChange={(value) => handleRealTimeSettingChange('confidenceThreshold', value)}
              minimumTrackTintColor="#8641f4"
              maximumTrackTintColor="#333"
              thumbStyle={styles.sliderThumb}
            />
            <Text style={styles.sliderLabel}>High</Text>
          </View>
          <Text style={styles.sliderValue}>{realTimeSettings.confidenceThreshold.toFixed(1)}</Text>
        </View>
      </View>

      {/* Advanced Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advanced Features</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Context Awareness</Text>
          <Switch
            value={advancedFeatures.contextAwareness}
            onValueChange={(value) => handleAdvancedFeatureChange('contextAwareness', value)}
            trackColor={{ false: '#333', true: '#8641f4' }}
            thumbColor={advancedFeatures.contextAwareness ? '#ffffff' : '#888'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Intent Recognition</Text>
          <Switch
            value={advancedFeatures.intentRecognition}
            onValueChange={(value) => handleAdvancedFeatureChange('intentRecognition', value)}
            trackColor={{ false: '#333', true: '#8641f4' }}
            thumbColor={advancedFeatures.intentRecognition ? '#ffffff' : '#888'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Entity Extraction</Text>
          <Switch
            value={advancedFeatures.entityExtraction}
            onValueChange={(value) => handleAdvancedFeatureChange('entityExtraction', value)}
            trackColor={{ false: '#333', true: '#8641f4' }}
            thumbColor={advancedFeatures.entityExtraction ? '#ffffff' : '#888'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Sentiment Analysis</Text>
          <Switch
            value={advancedFeatures.sentimentAnalysis}
            onValueChange={(value) => handleAdvancedFeatureChange('sentimentAnalysis', value)}
            trackColor={{ false: '#333', true: '#8641f4' }}
            thumbColor={advancedFeatures.sentimentAnalysis ? '#ffffff' : '#888'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Emotion Detection</Text>
          <Switch
            value={advancedFeatures.emotionDetection}
            onValueChange={(value) => handleAdvancedFeatureChange('emotionDetection', value)}
            trackColor={{ false: '#333', true: '#8641f4' }}
            thumbColor={advancedFeatures.emotionDetection ? '#ffffff' : '#888'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Speaker Identification</Text>
          <Switch
            value={advancedFeatures.speakerIdentification}
            onValueChange={(value) => handleAdvancedFeatureChange('speakerIdentification', value)}
            trackColor={{ false: '#333', true: '#8641f4' }}
            thumbColor={advancedFeatures.speakerIdentification ? '#ffffff' : '#888'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Learning Mode</Text>
          <Switch
            value={advancedFeatures.learningMode}
            onValueChange={(value) => handleAdvancedFeatureChange('learningMode', value)}
            trackColor={{ false: '#333', true: '#8641f4' }}
            thumbColor={advancedFeatures.learningMode ? '#ffffff' : '#888'}
          />
        </View>
      </View>

      {/* Test Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Voice-to-Text</Text>
        
        <TouchableOpacity
          style={[styles.testButton, isTesting && styles.disabledButton]}
          onPress={testVoiceToText}
          disabled={isTesting}
        >
          <Text style={styles.testButtonText}>
            {isTesting ? 'Testing...' : 'Test Basic Voice-to-Text'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.testButton, isTesting && styles.disabledButton]}
          onPress={testRealTimeTranscription}
          disabled={isTesting}
        >
          <Text style={styles.testButtonText}>
            {isTesting ? 'Testing...' : 'Test Real-Time Transcription'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </View>

      {/* Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Advanced Voice-to-Text</Text>
        <Text style={styles.infoText}>
          MOTTO's advanced voice-to-text system provides high-accuracy speech recognition with 
          real-time processing, intelligent error correction, and context-aware understanding. 
          The system learns from your usage patterns to improve accuracy over time.
        </Text>
        
        <Text style={styles.infoText}>
          Features include noise suppression, echo cancellation, automatic punctuation, 
          spell correction, grammar correction, intent recognition, entity extraction, 
          sentiment analysis, and emotion detection.
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingLabel: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 200,
  },
  picker: {
    color: '#ffffff',
    height: 50,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
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
    fontSize: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  sliderValue: {
    color: '#8641f4',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  testButton: {
    backgroundColor: '#8641f4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#444',
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  saveButtonText: {
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

export default AdvancedVoiceToTextSettingsScreen;
