/**
 * Onboarding Utilities
 * Helper functions for onboarding state management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Check if user has completed onboarding
 */
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem('onboardingCompleted');
    return completed === 'true';
  } catch (error) {
    console.error('Onboarding check error:', error);
    return false;
  }
};

/**
 * Mark onboarding as completed
 */
export const completeOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    await AsyncStorage.setItem('onboardingCompletedAt', new Date().toISOString());
  } catch (error) {
    console.error('Onboarding completion error:', error);
  }
};

/**
 * Reset onboarding (for testing)
 */
export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('onboardingCompleted');
    await AsyncStorage.removeItem('onboardingCompletedAt');
    await AsyncStorage.removeItem('userProfile');
  } catch (error) {
    console.error('Onboarding reset error:', error);
  }
};

/**
 * Get user profile from onboarding
 */
export const getUserProfile = async (): Promise<any | null> => {
  try {
    const profile = await AsyncStorage.getItem('userProfile');
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Profile fetch error:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profile: any): Promise<void> => {
  try {
    await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
  } catch (error) {
    console.error('Profile update error:', error);
  }
};

/**
 * Get or create user ID
 */
export const getUserId = async (): Promise<string> => {
  try {
    let userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      await AsyncStorage.setItem('userId', userId);
    }
    return userId;
  } catch (error) {
    console.error('User ID error:', error);
    return 'user-' + Date.now();
  }
};
