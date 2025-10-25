import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAppTheme } from '../../providers/ThemeProvider';

const Input = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  multiline,
  numberOfLines,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? theme.colors.error.main
              : theme.colors.grey[300],
            backgroundColor: disabled
              ? theme.colors.grey[100]
              : theme.colors.background.paper,
          },
          error && styles.errorInput,
          disabled && styles.disabledInput,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.hint}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[
            styles.input,
            {
              color: theme.colors.text.primary,
            },
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          editable={!disabled}
          accessible={true}
          accessibilityLabel={accessibilityLabel || label || placeholder}
          accessibilityHint={accessibilityHint}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={typeof rightIcon === 'string' ? rightIcon : undefined}
            accessibilityHint="Activate right icon action"
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error.main }]} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  multilineInput: {
    height: 'auto',
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  errorInput: {
    borderWidth: 2,
  },
  disabledInput: {
    opacity: 0.7,
  },
  rightIconContainer: {
    padding: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input; 