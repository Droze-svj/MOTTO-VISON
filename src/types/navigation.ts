/**
 * Navigation Types
 * TypeScript definitions for React Navigation
 */

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Define the parameter list for the bottom tab navigator
export type RootTabParamList = {
  Chat: undefined;
  Personalization: undefined;
  Analytics: undefined;
  Settings: undefined;
};

// Define screen props for each tab
export type ChatScreenProps = BottomTabScreenProps<RootTabParamList, 'Chat'>;
export type PersonalizationScreenProps = BottomTabScreenProps<RootTabParamList, 'Personalization'>;
export type AnalyticsScreenProps = BottomTabScreenProps<RootTabParamList, 'Analytics'>;
export type SettingsScreenProps = BottomTabScreenProps<RootTabParamList, 'Settings'>;

// Helper to get navigation prop type
export type RootTabNavigationProp = ChatScreenProps['navigation'];

// Declare global navigation types for use with useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}

