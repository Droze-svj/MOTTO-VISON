// Voice Command Test Utility
import { PermissionsAndroid, Platform } from 'react-native';
import Voice from '@react-native-voice/voice';

export const testVoicePermissions = async () => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'MOTTO needs access to your microphone for voice commands',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('✅ Microphone permission granted');
        return true;
      } else {
        console.log('❌ Microphone permission denied');
        return false;
      }
    } else {
      // iOS permissions are handled automatically by the system
      console.log('✅ iOS permissions will be requested automatically');
      return true;
    }
  } catch (error) {
    console.error('❌ Error requesting microphone permission:', error);
    return false;
  }
};

export const testVoiceAvailability = async () => {
  try {
    const isAvailable = await Voice.isAvailable();
    console.log('Voice recognition available:', isAvailable);
    return isAvailable;
  } catch (error) {
    console.error('❌ Voice recognition not available:', error);
    return false;
  }
};

export const testVoiceInitialization = async () => {
  try {
    await Voice.setSpeechRecognizer(Platform.OS === 'ios' ? 'SFSpeechRecognizer' : 'GoogleSpeechRecognizer');
    console.log('✅ Voice recognizer initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize voice recognizer:', error);
    return false;
  }
};

export const runVoiceCommandTests = async () => {
  console.log('🧪 Running Voice Command Tests...');
  
  const results = {
    permissions: await testVoicePermissions(),
    availability: await testVoiceAvailability(),
    initialization: await testVoiceInitialization()
  };
  
  console.log('📊 Test Results:', results);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('✅ All voice command tests passed!');
  } else {
    console.log('❌ Some voice command tests failed');
  }
  
  return results;
};
