import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useAppTheme } from '../../providers/ThemeProvider';

const Card = ({ children, style, elevation = 2, ...props }) => {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.background.paper,
          borderRadius: theme.borderRadius.lg,
          ...theme.shadows[`md`],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
});

export default Card; 