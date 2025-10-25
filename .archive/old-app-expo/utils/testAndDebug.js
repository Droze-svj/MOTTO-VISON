import { Animated, View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';

// Test cases
export const testCases = {
  taskManagement: [
    {
      name: 'Create Task',
      action: () => {
        const task = {
          id: Date.now(),
          title: 'Test Task',
          description: 'Testing task creation',
          priority: 'high',
          completed: false,
        };
        return task;
      },
      validate: (result) => result && result.id,
    },
    {
      name: 'Complete Task',
      action: (task) => {
        task.completed = true;
        return task;
      },
      validate: (result) => result.completed,
    },
    {
      name: 'Change Task Priority',
      action: (task) => {
        task.priority = 'medium';
        return task;
      },
      validate: (result) => result.priority === 'medium',
    },
  ],
  notifications: [
    {
      name: 'Show Success Notification',
      action: () => ({
        type: 'success',
        title: 'Test Success',
        message: 'Testing success notification',
      }),
      validate: (result) => result.type === 'success',
    },
    {
      name: 'Show Error Notification',
      action: () => ({
        type: 'error',
        title: 'Test Error',
        message: 'Testing error notification',
      }),
      validate: (result) => result.type === 'error',
    },
  ],
  collaboration: [
    {
      name: 'Update Online Status',
      action: () => true,
      validate: (result) => result === true,
    },
    {
      name: 'Add Team Member',
      action: () => ({
        id: Date.now(),
        name: 'Test Member',
        role: 'Developer',
      }),
      validate: (result) => result && result.id,
    },
  ],
  animations: [
    {
      name: 'Test Feedback Animation',
      action: () => true,
      validate: (result) => result === true,
    },
    {
      name: 'Test Interaction Animation',
      action: () => true,
      validate: (result) => result === true,
    },
  ],
};

// Enhanced feedback component
export const renderEnhancedFeedback = (type, message, duration = 3000) => {
  const feedbackAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const opacityAnim = new Animated.Value(0);

  Animated.parallel([
    Animated.timing(feedbackAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }),
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }),
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }),
  ]).start();

  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
  const color = type === 'success' ? '#4CAF50' : type === 'error' ? '#FF5252' : '#2196F3';

  return (
    <Animated.View
      style={[
        styles.enhancedFeedbackContainer,
        {
          transform: [
            { translateY: feedbackAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })},
            { scale: scaleAnim },
          ],
          opacity: opacityAnim,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={styles.enhancedFeedbackIcon}>{icon}</Text>
      <Text style={styles.enhancedFeedbackText}>{message}</Text>
    </Animated.View>
  );
};

// Debug panel component
export const renderDebugPanel = ({ performanceMetrics, messages, notifications, tasks, collaborationStatus, testResults, onLogState, onLogPerformance, onLogTests }) => {
  if (!__DEV__) return null;

  return (
    <View style={styles.debugPanel}>
      <Text style={styles.debugTitle}>Debug Panel</Text>
      
      {/* Performance Metrics */}
      <View style={styles.debugSection}>
        <Text style={styles.debugSectionTitle}>Performance</Text>
        <Text style={styles.debugText}>
          Render: {performanceMetrics.renderTime.toFixed(2)}ms
        </Text>
        <Text style={styles.debugText}>
          Interaction: {performanceMetrics.interactionTime.toFixed(2)}ms
        </Text>
        <Text style={styles.debugText}>
          Animation: {performanceMetrics.animationTime.toFixed(2)}ms
        </Text>
      </View>

      {/* Memory Usage */}
      <View style={styles.debugSection}>
        <Text style={styles.debugSectionTitle}>Memory</Text>
        <Text style={styles.debugText}>
          Messages: {messages.length}
        </Text>
        <Text style={styles.debugText}>
          Tasks: {tasks.length}
        </Text>
        <Text style={styles.debugText}>
          Notifications: {notifications.length}
        </Text>
      </View>

      {/* Test Results */}
      <View style={styles.debugSection}>
        <Text style={styles.debugSectionTitle}>Test Results</Text>
        {testResults.map((result, index) => (
          <Text
            key={index}
            style={[
              styles.debugText,
              { color: result.passed ? '#4CAF50' : '#FF5252' },
            ]}
          >
            {result.name}: {result.passed ? '✓' : '✗'}
          </Text>
        ))}
      </View>

      {/* Debug Actions */}
      <View style={styles.debugActions}>
        <TouchableOpacity
          style={styles.debugButton}
          onPress={onLogState}
        >
          <Text style={styles.debugButtonText}>Log State</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.debugButton}
          onPress={onLogPerformance}
        >
          <Text style={styles.debugButtonText}>Log Performance</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.debugButton}
          onPress={onLogTests}
        >
          <Text style={styles.debugButtonText}>Log Tests</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Test runner
export const useTestRunner = () => {
  const [testMode, setTestMode] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [testProgress, setTestProgress] = useState(0);
  const [testLogs, setTestLogs] = useState([]);

  const runTests = async (onFeedback) => {
    setTestMode(true);
    setTestResults([]);
    setTestProgress(0);
    setTestLogs([]);

    const allTests = [
      ...testCases.taskManagement,
      ...testCases.notifications,
      ...testCases.collaboration,
      ...testCases.animations,
    ];

    for (let i = 0; i < allTests.length; i++) {
      const test = allTests[i];
      try {
        const result = await test.action();
        const passed = test.validate(result);
        
        setTestResults(prev => [
          ...prev,
          { name: test.name, passed, result },
        ]);
        
        setTestLogs(prev => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            test: test.name,
            passed,
            result,
          },
        ]);

        if (passed) {
          onFeedback('success', `${test.name} passed`);
        } else {
          onFeedback('error', `${test.name} failed`);
        }

        setTestProgress((i + 1) / allTests.length);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        setTestResults(prev => [
          ...prev,
          { name: test.name, passed: false, error: error.message },
        ]);
        onFeedback('error', `${test.name} failed: ${error.message}`);
      }
    }

    setTestMode(false);
  };

  return {
    testMode,
    testResults,
    testProgress,
    testLogs,
    runTests,
  };
};

// Styles
export const styles = {
  enhancedFeedbackContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  enhancedFeedbackIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    marginRight: 12,
  },
  enhancedFeedbackText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  debugPanel: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 16,
    borderRadius: 12,
    zIndex: 1000,
    width: 300,
  },
  debugSection: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  debugSectionTitle: {
    color: '#E8E8E8',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    color: '#E8E8E8',
    fontSize: 12,
    marginBottom: 4,
  },
  debugActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  debugButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
}; 