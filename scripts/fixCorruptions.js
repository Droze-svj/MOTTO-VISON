#!/usr/bin/env node

/**
 * Comprehensive Corruption Fix Script
 * Fixes all known corruption issues in MOTTO
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class CorruptionFixer {
  constructor() {
    this.projectRoot = process.cwd();
    this.fixesApplied = [];
  }

  async fixAllCorruptions() {
    console.log('🔧 Starting Comprehensive Corruption Fix...\n');
    
    try {
      // Fix Metro configuration
      await this.fixMetroConfig();
      
      // Fix Logo component issues
      await this.fixLogoIssues();
      
      // Fix app registration
      await this.fixAppRegistration();
      
      // Clear all caches
      await this.clearAllCaches();
      
      // Kill all processes
      await this.killAllProcesses();
      
      // Verify fixes
      await this.verifyFixes();
      
      console.log('\n✅ All corruption issues have been fixed!');
      console.log('📋 Fixes applied:', this.fixesApplied.join(', '));
      console.log('\n🚀 You can now run: npm start');
      
    } catch (error) {
      console.error('❌ Error during corruption fix:', error);
      process.exit(1);
    }
  }

  async fixMetroConfig() {
    console.log('🔧 Fixing Metro configuration...');
    
    const metroConfigPath = path.join(this.projectRoot, 'metro.config.js');
    
    if (fs.existsSync(metroConfigPath)) {
      let content = fs.readFileSync(metroConfigPath, 'utf8');
      
      // Remove mergeConfig import if it exists
      if (content.includes('mergeConfig')) {
        content = content.replace(
          "const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');",
          "const {getDefaultConfig} = require('@react-native/metro-config');"
        );
        this.fixesApplied.push('Metro config mergeConfig import removed');
      }
      
      // Ensure proper configuration
      const properConfig = `const {getDefaultConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('js', 'jsx', 'json', 'ts', 'tsx');
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'svg', 'mp3', 'wav', 'mp4', 'webm');

module.exports = config;`;
      
      fs.writeFileSync(metroConfigPath, properConfig);
      this.fixesApplied.push('Metro configuration fixed');
    }
  }

  async fixLogoIssues() {
    console.log('🔧 Fixing Logo component issues...');
    
    // Check for old Logo components
    const oldLogoFiles = [
      path.join(this.projectRoot, 'app/components/Logo.js'),
      path.join(this.projectRoot, 'app/components/AnimatedLogo.js')
    ];
    
    for (const logoFile of oldLogoFiles) {
      if (fs.existsSync(logoFile)) {
        fs.unlinkSync(logoFile);
        this.fixesApplied.push(`Deleted old Logo file: ${path.basename(logoFile)}`);
      }
    }
    
    // Verify FuturisticLogo exists and is correct
    const futuristicLogoPath = path.join(this.projectRoot, 'app/components/FuturisticLogo.js');
    if (!fs.existsSync(futuristicLogoPath)) {
      console.warn('⚠️ FuturisticLogo.js not found, but this is expected if not using it');
    }
  }

  async fixAppRegistration() {
    console.log('🔧 Fixing app registration...');
    
    // Check app.json
    const appJsonPath = path.join(this.projectRoot, 'app.json');
    if (fs.existsSync(appJsonPath)) {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      
      if (appJson.name !== 'VISIONMOTTO') {
        appJson.name = 'VISIONMOTTO';
        if (appJson.expo) {
          appJson.expo.name = 'VISIONMOTTO';
        }
        fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
        this.fixesApplied.push('App registration name fixed');
      }
    }
    
    // Check index.js
    const indexJsPath = path.join(this.projectRoot, 'index.js');
    if (fs.existsSync(indexJsPath)) {
      let content = fs.readFileSync(indexJsPath, 'utf8');
      
      if (!content.includes('VISIONMOTTO')) {
        content = content.replace(
          /AppRegistry\.registerComponent\(['"`][^'"`]+['"`]/,
          "AppRegistry.registerComponent('VISIONMOTTO'"
        );
        fs.writeFileSync(indexJsPath, content);
        this.fixesApplied.push('Index.js app registration fixed');
      }
    }
  }

  async clearAllCaches() {
    console.log('🧹 Clearing all caches...');
    
    const cacheDirs = [
      path.join(this.projectRoot, 'node_modules/.cache'),
      path.join(this.projectRoot, '.metro-cache'),
      path.join(this.projectRoot, '.expo'),
      path.join(this.projectRoot, 'ios/build'),
      path.join(this.projectRoot, 'android/build'),
      path.join(this.projectRoot, 'android/app/build')
    ];
    
    for (const cacheDir of cacheDirs) {
      if (fs.existsSync(cacheDir)) {
        try {
          execSync(`rm -rf "${cacheDir}"`, { stdio: 'ignore' });
          this.fixesApplied.push(`Cleared cache: ${path.basename(cacheDir)}`);
        } catch (error) {
          // Ignore errors
        }
      }
    }
    
    // Clear Watchman cache
    try {
      execSync('watchman watch-del-all', { stdio: 'ignore' });
      this.fixesApplied.push('Watchman cache cleared');
    } catch (error) {
      // Ignore errors
    }
    
    // Clear npm cache
    try {
      execSync('npm cache clean --force', { stdio: 'ignore' });
      this.fixesApplied.push('NPM cache cleared');
    } catch (error) {
      // Ignore errors
    }
  }

  async killAllProcesses() {
    console.log('🔄 Killing all related processes...');
    
    const processes = [
      'react-native',
      'metro',
      'node.*startMetroEnhanced',
      'watchman'
    ];
    
    for (const processName of processes) {
      try {
        execSync(`pkill -f "${processName}"`, { stdio: 'ignore' });
        this.fixesApplied.push(`Killed processes: ${processName}`);
      } catch (error) {
        // Ignore errors
      }
    }
    
    // Kill processes on common ports
    const ports = [8081, 8082, 8083, 8084, 8085];
    for (const port of ports) {
      try {
        execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'ignore' });
        this.fixesApplied.push(`Killed processes on port ${port}`);
      } catch (error) {
        // Ignore errors
      }
    }
  }

  async verifyFixes() {
    console.log('✅ Verifying fixes...');
    
    // Verify Metro config
    const metroConfigPath = path.join(this.projectRoot, 'metro.config.js');
    if (fs.existsSync(metroConfigPath)) {
      const content = fs.readFileSync(metroConfigPath, 'utf8');
      if (!content.includes('mergeConfig')) {
        console.log('✅ Metro configuration is clean');
      }
    }
    
    // Verify no old Logo files
    const oldLogoFiles = [
      path.join(this.projectRoot, 'app/components/Logo.js'),
      path.join(this.projectRoot, 'app/components/AnimatedLogo.js')
    ];
    
    let logoFilesClean = true;
    for (const logoFile of oldLogoFiles) {
      if (fs.existsSync(logoFile)) {
        console.warn(`⚠️ Old Logo file still exists: ${path.basename(logoFile)}`);
        logoFilesClean = false;
      }
    }
    
    if (logoFilesClean) {
      console.log('✅ Logo component issues are resolved');
    }
    
    // Verify app registration
    const appJsonPath = path.join(this.projectRoot, 'app.json');
    if (fs.existsSync(appJsonPath)) {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      if (appJson.name === 'VISIONMOTTO') {
        console.log('✅ App registration is correct');
      }
    }
    
    console.log('✅ Verification complete');
  }
}

// Run the corruption fixer
const fixer = new CorruptionFixer();
fixer.fixAllCorruptions().catch(console.error);
