/**
 * Onboarding Navigator - Main onboarding flow
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from './WelcomeScreen';
import FeaturesScreen from './FeaturesScreen';
import PermissionsScreen from './PermissionsScreen';
import ProfileSetupScreen, { UserProfile } from './ProfileSetupScreen';

interface OnboardingNavigatorProps {
  onComplete: () => void;
}

export const OnboardingNavigator: React.FC<OnboardingNavigatorProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleSkip = async () => {
    // Mark onboarding as completed even if skipped
    await completeOnboarding();
  };

  const handleProfileComplete = async (profile: UserProfile) => {
    // Save profile and complete onboarding
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      await AsyncStorage.setItem('onboardingCompletedAt', new Date().toISOString());
      onComplete();
    } catch (error) {
      console.error('Onboarding completion error:', error);
      onComplete(); // Complete anyway
    }
  };

  const screens = [
    <WelcomeScreen key="welcome" onNext={handleNext} onSkip={handleSkip} />,
    <FeaturesScreen key="features" onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />,
    <PermissionsScreen key="permissions" onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />,
    <ProfileSetupScreen key="profile" onComplete={handleProfileComplete} onBack={handleBack} />,
  ];

  return <View style={styles.container}>{screens[currentStep]}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default OnboardingNavigator;
