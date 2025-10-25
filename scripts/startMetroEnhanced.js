#!/usr/bin/env node

/**
 * Enhanced Metro Bundler Startup Script
 * Provides maximum stability and error recovery
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class EnhancedMetroManager {
  constructor() {
    this.metroProcess = null;
    this.restartCount = 0;
    this.maxRestarts = 10;
    this.isRunning = false;
    this.healthCheckInterval = null;
    this.port = 8081;
    this.fallbackPorts = [8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089];
    this.startTime = Date.now();
  }

  async start() {
    console.log('🚀 Starting Enhanced Metro Bundler with Maximum Stability...');
    
    try {
      // Comprehensive cleanup
      await this.comprehensiveCleanup();
      
      // Find available port
      this.port = await this.findAvailablePort();
      
      // Start Metro with enhanced configuration
      await this.startMetro();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      console.log(`✅ Enhanced Metro bundler started successfully on port ${this.port}`);
      console.log('🔧 Features: Auto-restart, Health monitoring, Port management, Cache optimization');
    } catch (error) {
      console.error('❌ Failed to start Enhanced Metro bundler:', error);
      process.exit(1);
    }
  }

  async comprehensiveCleanup() {
    console.log('🧹 Performing comprehensive cleanup...');
    
    // Kill all related processes
    const processes = [
      'react-native',
      'metro',
      'node',
      'watchman'
    ];
    
    for (const processName of processes) {
      try {
        await this.killProcesses(processName);
      } catch (error) {
        // Ignore errors
      }
    }
    
    // Clear all ports
    for (const port of [this.port, ...this.fallbackPorts]) {
      try {
        await this.killPort(port);
      } catch (error) {
        // Ignore errors
      }
    }
    
    // Clear caches
    await this.clearCaches();
    
    console.log('✅ Comprehensive cleanup completed');
  }

  async killProcesses(processName) {
    return new Promise((resolve) => {
      const killProcess = spawn('pkill', ['-f', processName]);
      
      killProcess.on('close', () => {
        setTimeout(resolve, 1000);
      });
    });
  }

  async killPort(port) {
    return new Promise((resolve) => {
      const killProcess = spawn('lsof', ['-ti', port.toString()]);
      
      killProcess.stdout.on('data', async (data) => {
        const pids = data.toString().trim().split('\n').filter(pid => pid);
        
        for (const pid of pids) {
          try {
            process.kill(pid, 'SIGKILL');
            console.log(`🔪 Killed process ${pid} on port ${port}`);
          } catch (error) {
            // Process might already be dead
          }
        }
      });
      
      killProcess.on('close', () => {
        setTimeout(resolve, 500);
      });
    });
  }

  async clearCaches() {
    const cachePaths = [
      'node_modules/.cache',
      '/tmp/metro-*',
      '/tmp/react-native-*',
      '.metro-cache',
      'metro-cache'
    ];
    
    for (const cachePath of cachePaths) {
      try {
        if (cachePath.includes('*')) {
          // Handle glob patterns
          const { execSync } = require('child_process');
          execSync(`rm -rf ${cachePath}`, { stdio: 'ignore' });
        } else {
          if (fs.existsSync(cachePath)) {
            fs.rmSync(cachePath, { recursive: true, force: true });
          }
        }
      } catch (error) {
        // Ignore cache clearing errors
      }
    }
    
    // Clear watchman
    try {
      const { execSync } = require('child_process');
      execSync('watchman watch-del-all', { stdio: 'ignore' });
    } catch (error) {
      // Ignore watchman errors
    }
  }

  async findAvailablePort() {
    for (const port of [this.port, ...this.fallbackPorts]) {
      try {
        const net = require('net');
        const server = net.createServer();
        
        await new Promise((resolve, reject) => {
          server.listen(port, () => {
            server.close();
            resolve();
          });
          
          server.on('error', reject);
        });
        
        console.log(`✅ Found available port: ${port}`);
        return port;
      } catch (error) {
        console.log(`⚠️ Port ${port} is in use, trying next...`);
      }
    }
    
    throw new Error('No available ports found');
  }

  async startMetro() {
    return new Promise((resolve, reject) => {
      const args = [
        'start',
        '--reset-cache',
        '--port', this.port.toString(),
        '--max-workers', '4',
      ];

      console.log(`🚀 Starting Metro with args: ${args.join(' ')}`);

      this.metroProcess = spawn('npx', ['react-native', ...args], {
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=4096',
          REACT_NATIVE_DISABLE_VERSION_CHECK: '1',
        },
      });

      this.metroProcess.on('error', (error) => {
        console.error('❌ Metro process error:', error);
        reject(error);
      });

      this.metroProcess.on('exit', (code) => {
        console.log(`📝 Metro process exited with code ${code}`);
        this.isRunning = false;
        
        if (code !== 0 && this.restartCount < this.maxRestarts) {
          console.log(`🔄 Restarting Metro (attempt ${this.restartCount + 1}/${this.maxRestarts})...`);
          this.restartCount++;
          setTimeout(() => this.startMetro(), 3000);
        } else if (this.restartCount >= this.maxRestarts) {
          console.error('❌ Max restart attempts reached');
          process.exit(1);
        }
      });

      // Wait for Metro to be ready
      setTimeout(() => {
        this.isRunning = true;
        resolve();
      }, 8000); // Increased wait time for stability
    });
  }

  startHealthMonitoring() {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:${this.port}/status`);
        
        if (!response.ok) {
          console.warn('⚠️ Metro health check failed');
          await this.restartMetro();
        } else {
          const uptime = Math.floor((Date.now() - this.startTime) / 1000);
          console.log(`✅ Metro health check passed (uptime: ${uptime}s)`);
        }
      } catch (error) {
        console.warn('⚠️ Metro health check error:', error.message);
        await this.restartMetro();
      }
    }, 60000); // Check every minute
  }

  async restartMetro() {
    if (this.metroProcess && this.isRunning) {
      console.log('🔄 Restarting Metro bundler...');
      
      this.metroProcess.kill('SIGTERM');
      this.isRunning = false;
      
      setTimeout(async () => {
        try {
          await this.startMetro();
        } catch (error) {
          console.error('❌ Failed to restart Metro:', error);
        }
      }, 3000);
    }
  }

  stop() {
    console.log('🛑 Stopping Enhanced Metro bundler...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    if (this.metroProcess) {
      this.metroProcess.kill('SIGTERM');
    }
    
    process.exit(0);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  metroManager.stop();
});

process.on('SIGTERM', () => {
  metroManager.stop();
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  metroManager.stop();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  metroManager.stop();
});

// Start Enhanced Metro manager
const metroManager = new EnhancedMetroManager();
metroManager.start().catch((error) => {
  console.error('❌ Enhanced Metro manager failed:', error);
  process.exit(1);
});
