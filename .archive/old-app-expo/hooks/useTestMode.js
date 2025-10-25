import { useState, useCallback } from 'react';
import { testCases } from '../utils/testAndDebug';

export const useTestMode = () => {
  const [testMode, setTestMode] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [testProgress, setTestProgress] = useState(0);
  const [testLogs, setTestLogs] = useState([]);

  const runTests = useCallback(async () => {
    setTestMode(true);
    setTestResults([]);
    setTestProgress(0);
    setTestLogs([]);

    try {
      const results = [];
      const totalTests = Object.values(testCases).flat().length;
      let completedTests = 0;

      for (const category of Object.values(testCases)) {
        for (const test of category) {
          try {
            const result = await test.action();
            const passed = test.validate(result);
            results.push({
              name: test.name,
              passed,
              result,
            });
            setTestLogs(prev => [...prev, `Test ${test.name}: ${passed ? 'PASSED' : 'FAILED'}`]);
          } catch (error) {
            results.push({
              name: test.name,
              passed: false,
              error: error.message,
            });
            setTestLogs(prev => [...prev, `Test ${test.name}: ERROR - ${error.message}`]);
          }
          completedTests++;
          setTestProgress(completedTests / totalTests);
        }
      }

      setTestResults(results);
    } catch (error) {
      setTestLogs(prev => [...prev, `Test suite error: ${error.message}`]);
    } finally {
      setTestMode(false);
    }
  }, []);

  return {
    testMode,
    testResults,
    testProgress,
    testLogs,
    runTests,
  };
}; 