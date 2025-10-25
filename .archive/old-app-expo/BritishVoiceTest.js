import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import BritishVoiceSynthesisService from '../services/BritishVoiceSynthesisService';

const BritishVoiceTest = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const testBasicVoice = async () => {
    try {
      setIsSpeaking(true);
      await BritishVoiceSynthesisService.speak(
        "Hello! I'm MOTTO, your British AI assistant. I can help you with various tasks using my refined British accent."
      );
      setIsSpeaking(false);
    } catch (error) {
      console.error('Error testing voice:', error);
      setIsSpeaking(false);
      Alert.alert('Error', 'Failed to test voice');
    }
  };

  const testBritishPronunciation = async () => {
    try {
      setIsSpeaking(true);
      await BritishVoiceSynthesisService.speak(
        "I can pronounce British words correctly. For example: colour, favour, honour, centre, theatre, aluminium, and schedule. I also know that a lift is an elevator, a lorry is a truck, and a biscuit is a cookie."
      );
      setIsSpeaking(false);
    } catch (error) {
      console.error('Error testing pronunciation:', error);
      setIsSpeaking(false);
      Alert.alert('Error', 'Failed to test pronunciation');
    }
  };

  const testBritishVocabulary = async () => {
    try {
      setIsSpeaking(true);
      await BritishVoiceSynthesisService.speak(
        "Here are some British terms: I take the lift to my flat, drive my lorry to the petrol station, eat biscuits with my tea, and put rubbish in the bin. I also queue up at the loo and wear trainers instead of sneakers."
      );
      setIsSpeaking(false);
    } catch (error) {
      console.error('Error testing vocabulary:', error);
      setIsSpeaking(false);
      Alert.alert('Error', 'Failed to test vocabulary');
    }
  };

  const testDifferentVoices = async () => {
    try {
      setIsSpeaking(true);
      
      // Test Kate voice
      await BritishVoiceSynthesisService.setVoice('en-GB-Kate');
      await BritishVoiceSynthesisService.speak("This is Kate, a British female voice.");
      
      // Test Serena voice if available
      try {
        await BritishVoiceSynthesisService.setVoice('en-GB-Serena');
        await BritishVoiceSynthesisService.speak("This is Serena, another British female voice.");
      } catch (e) {
        console.log('Serena voice not available');
      }
      
      setIsSpeaking(false);
    } catch (error) {
      console.error('Error testing different voices:', error);
      setIsSpeaking(false);
      Alert.alert('Error', 'Failed to test different voices');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>British Voice Test</Text>
      <Text style={styles.subtitle}>Test MOTTO's British voice capabilities</Text>
      
      <TouchableOpacity
        style={[styles.testButton, isSpeaking && styles.disabledButton]}
        onPress={testBasicVoice}
        disabled={isSpeaking}
      >
        <Text style={styles.testButtonText}>
          {isSpeaking ? 'Speaking...' : 'Test Basic Voice'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.testButton, isSpeaking && styles.disabledButton]}
        onPress={testBritishPronunciation}
        disabled={isSpeaking}
      >
        <Text style={styles.testButtonText}>
          {isSpeaking ? 'Speaking...' : 'Test British Pronunciation'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.testButton, isSpeaking && styles.disabledButton]}
        onPress={testBritishVocabulary}
        disabled={isSpeaking}
      >
        <Text style={styles.testButtonText}>
          {isSpeaking ? 'Speaking...' : 'Test British Vocabulary'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.testButton, isSpeaking && styles.disabledButton]}
        onPress={testDifferentVoices}
        disabled={isSpeaking}
      >
        <Text style={styles.testButtonText}>
          {isSpeaking ? 'Speaking...' : 'Test Different Voices'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>British Voice Features:</Text>
        <Text style={styles.infoText}>• Authentic British accent</Text>
        <Text style={styles.infoText}>• British pronunciation (schedule → shed-yool)</Text>
        <Text style={styles.infoText}>• British spelling (colour, favour, centre)</Text>
        <Text style={styles.infoText}>• British vocabulary (lift, lorry, biscuit)</Text>
        <Text style={styles.infoText}>• Multiple British female voices</Text>
        <Text style={styles.infoText}>• Customizable rate, pitch, and volume</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
    textAlign: 'center',
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
  infoContainer: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8641f4',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
  },
});

export default BritishVoiceTest;
