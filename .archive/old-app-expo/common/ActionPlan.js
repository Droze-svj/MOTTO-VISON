import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

const ActionPlan = ({ steps = [] }) => {
  if (!steps || steps.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Action Plan</Text>
      {steps.map((s, i) => (
        <View key={`${i}-${s.slice(0, 10)}`} style={styles.stepRow}>
          <View style={styles.bullet} />
          <Text style={styles.stepText}>{s}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    backgroundColor: colors.BLACK,
    borderWidth: 1,
    borderColor: colors.OCEAN_BLUE,
    borderRadius: 12,
    padding: 12,
  },
  title: {
    color: colors.LIGHT_TEXT,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.OCEAN_BLUE,
    marginTop: 6,
    marginRight: 8,
  },
  stepText: {
    color: colors.LIGHT_TEXT,
    flex: 1,
    lineHeight: 18,
  }
});

export default ActionPlan;


