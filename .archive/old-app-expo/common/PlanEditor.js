import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { colors } from '../../constants/colors';

const PlanEditor = ({ plan = [], onChange, onClose }) => {
  const updateStep = (index, key, value) => {
    const next = [...plan];
    next[index] = { ...next[index], [key]: value };
    onChange && onChange(next);
  };

  const addStep = () => {
    const next = [...plan, { action: 'create_note', params: { content: '' }, label: '' }];
    onChange && onChange(next);
  };

  const removeStep = (index) => {
    const next = plan.filter((_, i) => i !== index);
    onChange && onChange(next);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.stepCard}>
      <Text style={styles.stepTitle}>Step {index + 1}</Text>
      <TextInput
        style={styles.input}
        placeholder="Action (e.g., create_note, set_reminder, navigate)"
        placeholderTextColor={colors.textSecondary}
        value={item.action}
        onChangeText={(v) => updateStep(index, 'action', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Label (short description)"
        placeholderTextColor={colors.textSecondary}
        value={item.label || ''}
        onChangeText={(v) => updateStep(index, 'label', v)}
      />
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        placeholder="Params as JSON (e.g., {\"content\":\"Call John\"})"
        placeholderTextColor={colors.textSecondary}
        value={JSON.stringify(item.params || {})}
        multiline
        onChangeText={(v) => {
          try {
            const parsed = JSON.parse(v || '{}');
            updateStep(index, 'params', parsed);
          } catch {}
        }}
      />
      <TouchableOpacity style={styles.removeBtn} onPress={() => removeStep(index)}>
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Plan</Text>
        <TouchableOpacity onPress={onClose}><Text style={styles.close}>Close</Text></TouchableOpacity>
      </View>
      <FlatList data={plan} keyExtractor={(_, i) => String(i)} renderItem={renderItem} contentContainerStyle={styles.list} />
      <TouchableOpacity style={styles.addBtn} onPress={addStep}>
        <Text style={styles.addText}>Add Step</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.BLACK,
    borderColor: colors.OCEAN_BLUE,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: { color: colors.LIGHT_TEXT, fontWeight: 'bold' },
  close: { color: colors.LIGHT_TEXT },
  list: { gap: 8 },
  stepCard: {
    borderColor: colors.OCEAN_BLUE,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  stepTitle: { color: colors.LIGHT_TEXT, marginBottom: 6 },
  input: {
    borderColor: colors.OCEAN_BLUE,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.LIGHT_TEXT,
    marginBottom: 8,
  },
  inputMultiline: { minHeight: 64, textAlignVertical: 'top' },
  removeBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderColor: colors.OCEAN_BLUE,
    borderWidth: 1,
    borderRadius: 8,
  },
  removeText: { color: colors.LIGHT_TEXT },
  addBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.OCEAN_BLUE,
    borderRadius: 10,
    borderColor: colors.DARKER_BLUE,
    borderWidth: 1,
  },
  addText: { color: '#fff', fontWeight: '600' },
});

export default PlanEditor;


