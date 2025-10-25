import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import TwoFactorSetupScreen from '../screens/TwoFactorSetupScreen';
import TwoFactorManagementScreen from '../screens/TwoFactorManagementScreen';
import UpdateRecoveryEmailScreen from '../screens/UpdateRecoveryEmailScreen';

const Stack = createStackNavigator();

const SecurityStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
        cardOverlayEnabled: true,
        cardStyleInterpolator: ({ current: { progress } }) => ({
          cardStyle: {
            opacity: progress,
          },
        }),
      }}
    >
      <Stack.Screen
        name="TwoFactorManagement"
        component={TwoFactorManagementScreen}
      />
      <Stack.Screen
        name="TwoFactorSetup"
        component={TwoFactorSetupScreen}
      />
      <Stack.Screen
        name="UpdateRecoveryEmail"
        component={UpdateRecoveryEmailScreen}
      />
    </Stack.Navigator>
  );
};

export default SecurityStack; 