import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import ChatScreen from '../screens/ChatScreen';
import EnhancedChatScreen from '../screens/EnhancedChatScreen';
import LoginScreen from '../screens/LoginScreen';
import IntegrationsScreen from '../screens/IntegrationsScreen';
import DataDisplayScreen from '../screens/DataDisplayScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VoiceCommandSettingsScreen from '../screens/VoiceCommandSettingsScreen';
import AnalyticsDashboardScreen from '../screens/AnalyticsDashboardScreen';
import TasksScreen from '../screens/TasksScreen';
import CalendarScreen from '../screens/CalendarScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MediaGalleryScreen from '../screens/MediaGalleryScreen';
import MediaFeedScreen from '../screens/MediaFeedScreen';
import MediaCollectionsScreen from '../screens/MediaCollectionsScreen';
import MediaSharingScreen from '../screens/MediaSharingScreen';
import MediaEditorScreen from '../screens/MediaEditorScreen';
import PhotoEditorScreen from '../screens/PhotoEditorScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import FileUploadScreen from '../screens/FileUploadScreen';
import DocumentManagementScreen from '../screens/DocumentManagementScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import SecuritySettingsScreen from '../screens/SecuritySettingsScreen';
import TwoFactorSetupScreen from '../screens/TwoFactorSetupScreen';
import TwoFactorManagementScreen from '../screens/TwoFactorManagementScreen';
import UpdateRecoveryEmailScreen from '../screens/UpdateRecoveryEmailScreen';
import VoiceCommandHelpScreen from '../screens/VoiceCommandHelpScreen';
import VoiceCommandTutorialScreen from '../screens/VoiceCommandTutorialScreen';
import LanguageSettingsScreen from '../screens/LanguageSettingsScreen';
import TimeZoneSettingsScreen from '../screens/TimeZoneSettingsScreen';
import PeakMottoScreen from '../screens/PeakMottoScreen';
import FuturisticLogo from '../components/FuturisticLogo';
import MetricsScreen from '../screens/MetricsScreen';
import FeedbackAnalyticsDashboard from '../screens/FeedbackAnalyticsDashboard';
import BritishVoiceSettingsScreen from '../screens/BritishVoiceSettingsScreen';
import AdvancedVoiceToTextSettingsScreen from '../screens/AdvancedVoiceToTextSettingsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f8f9fa',
          },
          headerTintColor: '#333',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShadowVisible: false,
        }}
      >
        {/* Onboarding and Authentication */}
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />

                        {/* Main App Screens */}
                <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{
                    title: '',
                    headerShown: true,
                    headerTitle: () => <FuturisticLogo size={40} variant="minimal" />,
                  }}
                />
                <Stack.Screen
                  name="PeakMotto"
                  component={PeakMottoScreen}
                  options={{
                    title: 'Peak MOTTO',
                    headerShown: false,
                  }}
                />

        {/* Chat Screens */}
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen} 
          options={{ 
            title: 'Chat',
            headerShown: true,
          }}
        />
        <Stack.Screen 
          name="EnhancedChat" 
          component={EnhancedChatScreen} 
          options={{ 
            title: 'Enhanced Chat',
            headerShown: false,
          }}
        />

        {/* Media Management */}
        <Stack.Screen 
          name="MediaGallery" 
          component={MediaGalleryScreen}
          options={{ title: 'Media Gallery' }}
        />
        <Stack.Screen 
          name="MediaFeed" 
          component={MediaFeedScreen}
          options={{ title: 'Media Feed' }}
        />
        <Stack.Screen 
          name="MediaCollections" 
          component={MediaCollectionsScreen}
          options={{ title: 'Collections' }}
        />
        <Stack.Screen 
          name="MediaSharing" 
          component={MediaSharingScreen}
          options={{ title: 'Share Media' }}
        />
        <Stack.Screen 
          name="MediaEditor" 
          component={MediaEditorScreen}
          options={{ title: 'Edit Media' }}
        />
        <Stack.Screen 
          name="PhotoEditor" 
          component={PhotoEditorScreen}
          options={{ title: 'Edit Photo' }}
        />
        <Stack.Screen 
          name="VideoPlayer" 
          component={VideoPlayerScreen}
          options={{ title: 'Video Player' }}
        />
        <Stack.Screen 
          name="FileUpload" 
          component={FileUploadScreen}
          options={{ title: 'Upload Files' }}
        />
        <Stack.Screen 
          name="DocumentManagement" 
          component={DocumentManagementScreen}
          options={{ title: 'Documents' }}
        />

        {/* Task and Calendar Management */}
        <Stack.Screen 
          name="Tasks" 
          component={TasksScreen}
          options={{ title: 'Tasks' }}
        />
        <Stack.Screen 
          name="Calendar" 
          component={CalendarScreen}
          options={{ title: 'Calendar' }}
        />

        {/* Analytics and Data */}
        <Stack.Screen 
          name="Analytics" 
          component={AnalyticsDashboardScreen}
          options={{ title: 'Analytics' }}
        />
        <Stack.Screen 
          name="Metrics" 
          component={MetricsScreen}
          options={{ title: 'Metrics' }}
        />
        <Stack.Screen 
          name="FeedbackAnalytics" 
          component={FeedbackAnalyticsDashboard}
          options={{ title: 'Feedback & Analytics' }}
        />
        <Stack.Screen 
          name="Data" 
          component={DataDisplayScreen}
          options={{ title: 'Data' }}
        />

        {/* Integrations */}
        <Stack.Screen 
          name="Integrations" 
          component={IntegrationsScreen}
          options={{ title: 'Integrations' }}
        />

        {/* User Profile and Settings */}
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
        <Stack.Screen 
          name="UserProfile" 
          component={UserProfileScreen}
          options={{ title: 'User Profile' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
        <Stack.Screen 
          name="Preferences" 
          component={PreferencesScreen}
          options={{ title: 'Preferences' }}
        />
        <Stack.Screen 
          name="AccountSettings" 
          component={AccountSettingsScreen}
          options={{ title: 'Account Settings' }}
        />
        <Stack.Screen 
          name="SecuritySettings" 
          component={SecuritySettingsScreen}
          options={{ title: 'Security' }}
        />
        <Stack.Screen 
          name="TwoFactorSetup" 
          component={TwoFactorSetupScreen}
          options={{ title: 'Two-Factor Setup' }}
        />
        <Stack.Screen 
          name="TwoFactorManagement" 
          component={TwoFactorManagementScreen}
          options={{ title: 'Two-Factor Management' }}
        />
        <Stack.Screen 
          name="UpdateRecoveryEmail" 
          component={UpdateRecoveryEmailScreen}
          options={{ title: 'Update Recovery Email' }}
        />

        {/* Voice Command Settings */}
        <Stack.Screen 
          name="VoiceCommandSettings" 
          component={VoiceCommandSettingsScreen}
          options={{ title: 'Voice Commands' }}
        />
        <Stack.Screen 
          name="BritishVoiceSettings" 
          component={BritishVoiceSettingsScreen}
          options={{ title: 'British Voice Settings' }}
        />
        <Stack.Screen 
          name="AdvancedVoiceToTextSettings" 
          component={AdvancedVoiceToTextSettingsScreen}
          options={{ title: 'Advanced Voice-to-Text Settings' }}
        />
        <Stack.Screen 
          name="VoiceCommandHelp" 
          component={VoiceCommandHelpScreen}
          options={{ title: 'Voice Help' }}
        />
        <Stack.Screen 
          name="VoiceCommandTutorial" 
          component={VoiceCommandTutorialScreen}
          options={{ title: 'Voice Tutorial' }}
        />

        {/* Language and Regional Settings */}
        <Stack.Screen 
          name="LanguageSettings" 
          component={LanguageSettingsScreen}
          options={{ title: 'Language' }}
        />
        <Stack.Screen 
          name="TimeZoneSettings" 
          component={TimeZoneSettingsScreen}
          options={{ title: 'Time Zone' }}
        />

        {/* Notifications */}
        <Stack.Screen 
          name="Notifications" 
          component={NotificationsScreen}
          options={{ title: 'Notifications' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 