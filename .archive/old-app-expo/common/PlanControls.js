import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';

const PlanControls = ({ onRun, onSimulate, disabled }) => {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={[styles.btn, disabled && styles.disabled]} onPress={onRun} disabled={disabled}>
        <Text style={styles.btnText}>Run plan</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btnOutline, disabled && styles.disabled]} onPress={onSimulate} disabled={disabled}>
        <Text style={styles.btnOutlineText}>Simulate</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  btn: {
    backgroundColor: colors.OCEAN_BLUE,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.DARKER_BLUE,
  },
  btnText: {
    color: colors.white,
    fontWeight: '600',
  },
  btnOutline: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.OCEAN_BLUE,
  },
  btnOutlineText: {
    color: colors.LIGHT_TEXT,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  }
});

export default PlanControls;


