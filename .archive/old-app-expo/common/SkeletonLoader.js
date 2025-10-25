import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export default function SkeletonLoader({ rows = 1, height = 20, style }) {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: rows }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.skeleton,
            { height, marginBottom: 12 },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  skeleton: {
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    opacity: 0.6,
  },
}); 