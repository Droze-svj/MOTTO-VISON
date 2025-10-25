import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTestMode } from '../hooks/useTestMode';
import { useAppTheme } from '../providers/ThemeProvider';
import {
  getResponsiveFontSize,
  getResponsivePadding,
  getResponsiveMargin,
} from '../utils/responsive';

const TestMode = () => {
  const { theme } = useAppTheme();
  const { testMode, testResults, testProgress, testLogs, runTests } = useTestMode();

  const styles = StyleSheet.create({
    testModeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: getResponsivePadding(theme.spacing.sm),
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.lg,
      marginBottom: getResponsiveMargin(theme.spacing.md),
    },
    testButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: getResponsivePadding(theme.spacing.sm),
      paddingHorizontal: getResponsivePadding(theme.spacing.md),
      borderRadius: theme.borderRadius.md,
    },
    testButtonText: {
      color: theme.colors.onPrimary,
      fontSize: getResponsiveFontSize(theme.typography.bodyMedium),
      fontWeight: '600',
    },
    testProgressContainer: {
      padding: getResponsivePadding(theme.spacing.sm),
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.md,
    },
    testProgressText: {
      color: theme.colors.onSurfaceVariant,
      fontSize: getResponsiveFontSize(theme.typography.bodySmall),
      fontWeight: '600',
    },
    testResultsContainer: {
      marginTop: getResponsiveMargin(theme.spacing.sm),
      padding: getResponsivePadding(theme.spacing.sm),
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.md,
    },
    testResultText: {
      fontSize: getResponsiveFontSize(theme.typography.bodySmall),
      marginVertical: getResponsiveMargin(theme.spacing.xs),
    },
  });

  return (
    <View style={styles.testModeContainer}>
      <TouchableOpacity
        style={styles.testButton}
        onPress={runTests}
      >
        <Text style={styles.testButtonText}>
          {testMode ? 'Running Tests...' : 'Run Tests'}
        </Text>
      </TouchableOpacity>
      {testProgress > 0 && (
        <View style={styles.testProgressContainer}>
          <Text style={styles.testProgressText}>
            Progress: {Math.round(testProgress * 100)}%
          </Text>
        </View>
      )}
      {testResults.length > 0 && (
        <View style={styles.testResultsContainer}>
          {testResults.map((result, index) => (
            <Text
              key={index}
              style={[
                styles.testResultText,
                { color: result.passed ? theme.colors.success : theme.colors.error },
              ]}
            >
              {result.name}: {result.passed ? '✓' : '✗'}
              {result.error && ` (${result.error})`}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

export default TestMode; 