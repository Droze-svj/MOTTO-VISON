/**
 * Peak Debugger - Comprehensive debugging utility for MOTTO peak potential features
 * This utility helps identify, diagnose, and fix issues in the advanced features
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class PeakDebugger {
  constructor() {
    this.debugLog = [];
    this.errorLog = [];
    this.performanceLog = [];
    this.isEnabled = __DEV__; // Only enable in development
  }

  // Log debug information
  log(component, message, data = null) {
    if (!this.isEnabled) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      component,
      message,
      data,
      platform: Platform.OS,
      version: Platform.Version
    };
    
    this.debugLog.push(logEntry);
    console.log(`[PeakDebugger] ${component}: ${message}`, data || '');
    
    // Keep only last 100 entries
    if (this.debugLog.length > 100) {
      this.debugLog = this.debugLog.slice(-100);
    }
  }

  // Log errors
  error(component, error, context = {}) {
    if (!this.isEnabled) return;
    
    const errorEntry = {
      timestamp: new Date().toISOString(),
      component,
      error: error.message || error,
      stack: error.stack,
      context,
      platform: Platform.OS,
      version: Platform.Version
    };
    
    this.errorLog.push(errorEntry);
    console.error(`[PeakDebugger] ERROR in ${component}:`, error, context);
    
    // Keep only last 50 errors
    if (this.errorLog.length > 50) {
      this.errorLog = this.errorLog.slice(-50);
    }
  }

  // Log performance metrics
  performance(component, operation, duration, metadata = {}) {
    if (!this.isEnabled) return;
    
    const perfEntry = {
      timestamp: new Date().toISOString(),
      component,
      operation,
      duration,
      metadata,
      platform: Platform.OS
    };
    
    this.performanceLog.push(perfEntry);
    console.log(`[PeakDebugger] PERFORMANCE ${component}.${operation}: ${duration}ms`, metadata);
    
    // Keep only last 200 entries
    if (this.performanceLog.length > 200) {
      this.performanceLog = this.performanceLog.slice(-200);
    }
  }

  // Validate service initialization
  async validateServiceInitialization() {
    const results = {
      advancedAI: false,
      performanceOptimization: false,
      voiceCommand: false,
      storage: false,
      overall: false
    };

    try {
      // Test Advanced AI Service
      try {
        const AdvancedAIService = require('../services/AdvancedAIService').default;
        if (AdvancedAIService && typeof AdvancedAIService.initialize === 'function') {
          await AdvancedAIService.initialize();
          results.advancedAI = true;
          this.log('PeakDebugger', 'Advanced AI Service initialized successfully');
        }
      } catch (error) {
        this.error('PeakDebugger', error, { service: 'AdvancedAIService' });
      }

      // Test Performance Optimization Service
      try {
        const PerformanceOptimizationService = require('../services/PerformanceOptimizationService').default;
        if (PerformanceOptimizationService && typeof PerformanceOptimizationService.initialize === 'function') {
          await PerformanceOptimizationService.initialize();
          results.performanceOptimization = true;
          this.log('PeakDebugger', 'Performance Optimization Service initialized successfully');
        }
      } catch (error) {
        this.error('PeakDebugger', error, { service: 'PerformanceOptimizationService' });
      }

      // Test Voice Command Hook
      try {
        const { useAdvancedVoiceCommand } = require('../hooks/useAdvancedVoiceCommand');
        if (useAdvancedVoiceCommand) {
          results.voiceCommand = true;
          this.log('PeakDebugger', 'Advanced Voice Command Hook available');
        }
      } catch (error) {
        this.error('PeakDebugger', error, { hook: 'useAdvancedVoiceCommand' });
      }

      // Test Storage
      try {
        await AsyncStorage.setItem('peak_debug_test', 'test_value');
        const testValue = await AsyncStorage.getItem('peak_debug_test');
        await AsyncStorage.removeItem('peak_debug_test');
        
        if (testValue === 'test_value') {
          results.storage = true;
          this.log('PeakDebugger', 'Storage system working correctly');
        }
      } catch (error) {
        this.error('PeakDebugger', error, { component: 'Storage' });
      }

      // Overall result
      results.overall = results.advancedAI && results.performanceOptimization && results.voiceCommand && results.storage;
      
      this.log('PeakDebugger', 'Service validation complete', results);
      return results;
    } catch (error) {
      this.error('PeakDebugger', error, { operation: 'validateServiceInitialization' });
      return results;
    }
  }

  // Validate screen components
  validateScreenComponents() {
    const results = {
      peakMottoScreen: false,
      homeScreen: false,
      enhancedChatScreen: false,
      navigation: false
    };

    try {
      // Test Peak MOTTO Screen
      try {
        const PeakMottoScreen = require('../screens/PeakMottoScreen').default;
        if (PeakMottoScreen) {
          results.peakMottoScreen = true;
          this.log('PeakDebugger', 'Peak MOTTO Screen component available');
        }
      } catch (error) {
        this.error('PeakDebugger', error, { component: 'PeakMottoScreen' });
      }

      // Test Home Screen
      try {
        const HomeScreen = require('../screens/HomeScreen').default;
        if (HomeScreen) {
          results.homeScreen = true;
          this.log('PeakDebugger', 'Home Screen component available');
        }
      } catch (error) {
        this.error('PeakDebugger', error, { component: 'HomeScreen' });
      }

      // Test Enhanced Chat Screen
      try {
        const EnhancedChatScreen = require('../screens/EnhancedChatScreen').default;
        if (EnhancedChatScreen) {
          results.enhancedChatScreen = true;
          this.log('PeakDebugger', 'Enhanced Chat Screen component available');
        }
      } catch (error) {
        this.error('PeakDebugger', error, { component: 'EnhancedChatScreen' });
      }

      // Test Navigation
      try {
        const AppNavigator = require('../navigation/AppNavigator').default;
        if (AppNavigator) {
          results.navigation = true;
          this.log('PeakDebugger', 'App Navigator component available');
        }
      } catch (error) {
        this.error('PeakDebugger', error, { component: 'AppNavigator' });
      }

      this.log('PeakDebugger', 'Screen component validation complete', results);
      return results;
    } catch (error) {
      this.error('PeakDebugger', error, { operation: 'validateScreenComponents' });
      return results;
    }
  }

  // Check for common issues
  async checkCommonIssues() {
    const issues = [];

    try {
      // Check for missing dependencies
      const missingDeps = await this.checkMissingDependencies();
      if (missingDeps.length > 0) {
        issues.push({
          type: 'missing_dependencies',
          severity: 'high',
          message: 'Missing required dependencies',
          details: missingDeps
        });
      }

      // Check for configuration issues
      const configIssues = await this.checkConfigurationIssues();
      if (configIssues.length > 0) {
        issues.push({
          type: 'configuration',
          severity: 'medium',
          message: 'Configuration issues detected',
          details: configIssues
        });
      }

      // Check for performance issues
      const perfIssues = await this.checkPerformanceIssues();
      if (perfIssues.length > 0) {
        issues.push({
          type: 'performance',
          severity: 'low',
          message: 'Performance issues detected',
          details: perfIssues
        });
      }

      this.log('PeakDebugger', 'Common issues check complete', { issuesCount: issues.length });
      return issues;
    } catch (error) {
      this.error('PeakDebugger', error, { operation: 'checkCommonIssues' });
      return issues;
    }
  }

  // Check for missing dependencies
  async checkMissingDependencies() {
    const missing = [];

    try {
      // Check for required Expo modules
      const requiredModules = [
        'expo-haptics',
        'expo-av',
        'expo-sensors',
        'expo-crypto',
        'expo-linear-gradient'
      ];

      for (const module of requiredModules) {
        try {
          require(module);
        } catch (error) {
          missing.push(module);
        }
      }

      // Check for required React Native modules
      const requiredRNModules = [
        '@react-native-voice/voice',
        'react-native-tts'
      ];

      for (const module of requiredRNModules) {
        try {
          require(module);
        } catch (error) {
          missing.push(module);
        }
      }

      return missing;
    } catch (error) {
      this.error('PeakDebugger', error, { operation: 'checkMissingDependencies' });
      return missing;
    }
  }

  // Check configuration issues
  async checkConfigurationIssues() {
    const issues = [];

    try {
      // Check for required configuration files
      const requiredConfigs = [
        '../constants/config.js',
        '../constants/colors.js'
      ];

      for (const config of requiredConfigs) {
        try {
          require(config);
        } catch (error) {
          issues.push(`Missing configuration file: ${config}`);
        }
      }

      // Check for required environment variables
      const requiredEnvVars = [
        'OPENROUTER_API_KEY'
      ];

      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          issues.push(`Missing environment variable: ${envVar}`);
        }
      }

      return issues;
    } catch (error) {
      this.error('PeakDebugger', error, { operation: 'checkConfigurationIssues' });
      return issues;
    }
  }

  // Check performance issues
  async checkPerformanceIssues() {
    const issues = [];

    try {
      // Check for memory leaks
      if (this.debugLog.length > 1000) {
        issues.push('Large debug log detected - potential memory leak');
      }

      // Check for slow operations
      const slowOperations = this.performanceLog.filter(entry => entry.duration > 1000);
      if (slowOperations.length > 10) {
        issues.push('Multiple slow operations detected');
      }

      // Check for frequent errors
      if (this.errorLog.length > 20) {
        issues.push('High error rate detected');
      }

      return issues;
    } catch (error) {
      this.error('PeakDebugger', error, { operation: 'checkPerformanceIssues' });
      return issues;
    }
  }

  // Generate comprehensive report
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      version: Platform.Version,
      services: await this.validateServiceInitialization(),
      components: this.validateScreenComponents(),
      issues: await this.checkCommonIssues(),
      statistics: {
        debugLogs: this.debugLog.length,
        errors: this.errorLog.length,
        performanceLogs: this.performanceLog.length
      },
      recommendations: []
    };

    // Generate recommendations based on issues
    if (report.issues.length > 0) {
      report.recommendations.push('Review and fix detected issues');
    }

    if (!report.services.overall) {
      report.recommendations.push('Ensure all services are properly initialized');
    }

    if (report.statistics.errors > 10) {
      report.recommendations.push('High error rate - review error logs');
    }

    this.log('PeakDebugger', 'Comprehensive report generated', report);
    return report;
  }

  // Clear all logs
  clearLogs() {
    this.debugLog = [];
    this.errorLog = [];
    this.performanceLog = [];
    this.log('PeakDebugger', 'All logs cleared');
  }

  // Export logs for debugging
  exportLogs() {
    return {
      debug: this.debugLog,
      errors: this.errorLog,
      performance: this.performanceLog
    };
  }

  // Enable/disable debugging
  setEnabled(enabled) {
    this.isEnabled = enabled;
    this.log('PeakDebugger', `Debugging ${enabled ? 'enabled' : 'disabled'}`);
  }
}

export default new PeakDebugger();
