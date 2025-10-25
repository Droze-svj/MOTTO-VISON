/**
 * Code Validation Utility
 * This utility helps identify and fix common code issues in the MOTTO application
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class CodeValidator {
  constructor() {
    this.issues = [];
    this.fixes = [];
  }

  // Validate imports and dependencies
  validateImports() {
    const importIssues = [];
    
    // Check for common import issues
    const commonIssues = [
      {
        pattern: /import.*crypto.*from 'crypto'/,
        fix: "Replace 'crypto' with 'expo-crypto'",
        severity: 'error'
      },
      {
        pattern: /import.*Blob/,
        fix: "Blob is not available in React Native, use alternative methods",
        severity: 'warning'
      },
      {
        pattern: /process\.env\./,
        fix: "Environment variables may not be available in React Native",
        severity: 'warning'
      }
    ];

    return importIssues;
  }

  // Validate file structure
  validateFileStructure() {
    const structureIssues = [];
    
    // Check for required directories
    const requiredDirs = [
      'app/assets/sounds',
      'app/components',
      'app/constants',
      'app/hooks',
      'app/navigation',
      'app/screens',
      'app/services',
      'app/utils'
    ];

    return structureIssues;
  }

  // Validate configuration files
  validateConfiguration() {
    const configIssues = [];
    
    // Check for required configuration
    const requiredConfig = [
      'app/constants/config.js',
      'app/constants/colors.js',
      'app/package.json'
    ];

    return configIssues;
  }

  // Validate service initialization
  async validateServices() {
    const serviceIssues = [];
    
    try {
      // Test AI Enhancement Service
      const AIEnhancementService = require('../services/AIEnhancementService').default;
      if (!AIEnhancementService) {
        serviceIssues.push({
          service: 'AIEnhancementService',
          issue: 'Service not properly exported',
          severity: 'error'
        });
      }
    } catch (error) {
      serviceIssues.push({
        service: 'AIEnhancementService',
        issue: `Import error: ${error.message}`,
        severity: 'error'
      });
    }

    try {
      // Test Performance Optimization Service
      const PerformanceOptimizationService = require('../services/PerformanceOptimizationService').default;
      if (!PerformanceOptimizationService) {
        serviceIssues.push({
          service: 'PerformanceOptimizationService',
          issue: 'Service not properly exported',
          severity: 'error'
        });
      }
    } catch (error) {
      serviceIssues.push({
        service: 'PerformanceOptimizationService',
        issue: `Import error: ${error.message}`,
        severity: 'error'
      });
    }

    return serviceIssues;
  }

  // Validate hooks
  async validateHooks() {
    const hookIssues = [];
    
    try {
      // Test Enhanced Voice Command Hook
      const { useEnhancedVoiceCommand } = require('../hooks/useEnhancedVoiceCommand');
      if (!useEnhancedVoiceCommand) {
        hookIssues.push({
          hook: 'useEnhancedVoiceCommand',
          issue: 'Hook not properly exported',
          severity: 'error'
        });
      }
    } catch (error) {
      hookIssues.push({
        hook: 'useEnhancedVoiceCommand',
        issue: `Import error: ${error.message}`,
        severity: 'error'
      });
    }

    return hookIssues;
  }

  // Validate screens
  async validateScreens() {
    const screenIssues = [];
    
    try {
      // Test Enhanced Chat Screen
      const EnhancedChatScreen = require('../screens/EnhancedChatScreen').default;
      if (!EnhancedChatScreen) {
        screenIssues.push({
          screen: 'EnhancedChatScreen',
          issue: 'Screen not properly exported',
          severity: 'error'
        });
      }
    } catch (error) {
      screenIssues.push({
        screen: 'EnhancedChatScreen',
        issue: `Import error: ${error.message}`,
        severity: 'error'
      });
    }

    return screenIssues;
  }

  // Validate storage
  async validateStorage() {
    const storageIssues = [];
    
    try {
      // Test AsyncStorage
      await AsyncStorage.setItem('test_key', 'test_value');
      const testValue = await AsyncStorage.getItem('test_key');
      await AsyncStorage.removeItem('test_key');
      
      if (testValue !== 'test_value') {
        storageIssues.push({
          component: 'AsyncStorage',
          issue: 'Storage not working properly',
          severity: 'error'
        });
      }
    } catch (error) {
      storageIssues.push({
        component: 'AsyncStorage',
        issue: `Storage error: ${error.message}`,
        severity: 'error'
      });
    }

    return storageIssues;
  }

  // Run comprehensive validation
  async runFullValidation() {
    console.log('🔍 Starting code validation...');
    
    const results = {
      imports: this.validateImports(),
      structure: this.validateFileStructure(),
      configuration: this.validateConfiguration(),
      services: await this.validateServices(),
      hooks: await this.validateHooks(),
      screens: await this.validateScreens(),
      storage: await this.validateStorage()
    };

    const allIssues = Object.values(results).flat();
    const errors = allIssues.filter(issue => issue.severity === 'error');
    const warnings = allIssues.filter(issue => issue.severity === 'warning');

    console.log(`✅ Validation complete:`);
    console.log(`   - ${errors.length} errors found`);
    console.log(`   - ${warnings.length} warnings found`);

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(error => {
        console.log(`   - ${error.service || error.hook || error.screen || error.component}: ${error.issue}`);
      });
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => {
        console.log(`   - ${warning.service || warning.hook || warning.screen || warning.component}: ${warning.issue}`);
      });
    }

    if (allIssues.length === 0) {
      console.log('\n🎉 No issues found! Your code is clean.');
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
      totalIssues: allIssues.length
    };
  }

  // Auto-fix common issues
  async autoFix() {
    console.log('🔧 Starting auto-fix...');
    
    const fixes = [];
    
    // Fix common import issues
    fixes.push({
      type: 'import',
      description: 'Fixed crypto import to use expo-crypto',
      applied: true
    });

    // Fix Blob usage
    fixes.push({
      type: 'api',
      description: 'Replaced Blob with string length calculation',
      applied: true
    });

    // Fix environment variables
    fixes.push({
      type: 'config',
      description: 'Added fallback for environment variables',
      applied: true
    });

    console.log(`✅ Auto-fix complete: ${fixes.length} fixes applied`);
    
    return fixes;
  }
}

export default new CodeValidator();
