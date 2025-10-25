/**
 * App Icon Component
 * Reusable MOTTO app icon
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface AppIconProps {
  size?: number;
  style?: ViewStyle;
}

export const AppIcon: React.FC<AppIconProps> = ({ size = 80, style }) => {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Text style={[styles.icon, { fontSize: size * 0.6 }]}>🤖</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    textAlign: 'center',
  },
});

export default AppIcon;
