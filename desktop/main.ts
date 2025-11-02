import { app, BrowserWindow, ipcMain, nativeTheme, systemPreferences } from 'electron';
import * as path from 'path';
import Store from 'electron-store';
import * as notifier from 'node-notifier';

// Initialize store
const store = new Store();

// Platform-specific configurations
const platform: NodeJS.Platform = process.platform;
const isMac = platform === 'darwin';
const isWindows = platform === 'win32';
const isLinux = platform === 'linux';

// Error monitoring setup
interface ErrorReport {
  timestamp: number;
  error: string;
  stack?: string;
  context?: Record<string, any>;
}

class ErrorMonitor {
  private errors: ErrorReport[] = [];
  private maxErrors = 100;

  logError(error: Error, context?: Record<string, any>): void {
    const report: ErrorReport = {
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack,
      context
    };

    this.errors.push(report);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error logged:', report);
    }

    // Could send to error tracking service in production
    // this.sendToTrackingService(report);
  }

  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }
}

const errorMonitor = new ErrorMonitor();

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    // Platform-specific window settings
    ...(isMac ? {
      titleBarStyle: 'hiddenInset',
      vibrancy: 'under-window',
      visualEffectState: 'active'
    } : {}),
    ...(isWindows ? {
      frame: false,
      transparent: true
    } : {}),
    ...(isLinux ? {
      icon: path.join(__dirname, 'assets/icon.png')
    } : {})
  });

  // Load the app
  mainWindow.loadFile('index.html');

  // Error handling for renderer process
  mainWindow.webContents.on('crashed', () => {
    errorMonitor.logError(new Error('Renderer process crashed'), {
      windowId: mainWindow.id
    });
    app.relaunch();
    app.exit(1);
  });

  // Platform-specific features
  if (isMac) {
    // Enable macOS features
    try {
      app.dock.setMenu(require('./menus/dock'));
      systemPreferences.setUserDefault('AppleShowScrollBars', 'string', 'Always');
    } catch (error) {
      errorMonitor.logError(error as Error, { feature: 'macOS dock menu' });
    }
  }

  if (isWindows) {
    // Enable Windows features
    mainWindow.setMenuBarVisibility(false);
  }

  if (isLinux) {
    // Enable Linux features
    mainWindow.setMenuBarVisibility(false);
  }
}

// App lifecycle events
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch((error) => {
  errorMonitor.logError(error, { event: 'app.whenReady' });
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

// Global error handlers
process.on('uncaughtException', (error: Error) => {
  errorMonitor.logError(error, { type: 'uncaughtException' });
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason: any) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  errorMonitor.logError(error, { type: 'unhandledRejection' });
  console.error('Unhandled Rejection:', reason);
});

// IPC handlers for platform-specific features
ipcMain.handle('get-platform', () => platform);

ipcMain.handle('get-system-theme', () => {
  if (isMac) {
    return systemPreferences.getUserDefault('AppleInterfaceStyle', 'string') === 'Dark' ? 'dark' : 'light';
  }
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
});

ipcMain.handle('show-notification', (event, { title, message }: { title: string; message: string }) => {
  try {
    notifier.notify({
      title,
      message,
      icon: path.join(__dirname, 'assets/icon.png'),
      sound: true,
      wait: true
    });
  } catch (error) {
    errorMonitor.logError(error as Error, { feature: 'notification', title, message });
  }
});

// Error monitoring IPC handlers
ipcMain.handle('get-errors', () => {
  return errorMonitor.getErrors();
});

ipcMain.handle('clear-errors', () => {
  errorMonitor.clearErrors();
});

// Handle deep linking
function handleDeepLink(url: string): void {
  try {
    // Handle deep linking logic here
    console.log('Deep link received:', url);
  } catch (error) {
    errorMonitor.logError(error as Error, { feature: 'deep-link', url });
  }
}

if (isMac) {
  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleDeepLink(url);
  });
} else {
  app.on('second-instance', (event, commandLine) => {
    const url = commandLine.find(arg => arg.startsWith('motto://'));
    if (url) handleDeepLink(url);
  });
}

// Handle system theme changes
if (isMac) {
  systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', () => {
    try {
      const isDarkMode = systemPreferences.isDarkMode();
      BrowserWindow.getAllWindows().forEach(window => {
        window.webContents.send('theme-changed', isDarkMode ? 'dark' : 'light');
      });
    } catch (error) {
      errorMonitor.logError(error as Error, { feature: 'theme-change' });
    }
  });
}

// IPC handlers for window management
ipcMain.handle('minimize-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.minimize();
});

ipcMain.handle('maximize-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window?.isMaximized()) {
    window.unmaximize();
  } else {
    window?.maximize();
  }
});

ipcMain.handle('close-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.close();
});

// IPC handlers for clipboard
ipcMain.handle('read-clipboard', () => {
  const { clipboard } = require('electron');
  return clipboard.readText();
});

ipcMain.handle('write-clipboard', (event, text: string) => {
  const { clipboard } = require('electron');
  clipboard.writeText(text);
});

// IPC handlers for protocol handler
ipcMain.handle('register-protocol-handler', (event, protocol: string) => {
  try {
    app.setAsDefaultProtocolClient(protocol);
  } catch (error) {
    errorMonitor.logError(error as Error, { feature: 'protocol-handler', protocol });
  }
});

// IPC handlers for power management
ipcMain.handle('prevent-sleep', () => {
  // Implementation depends on platform-specific modules
  // This is a placeholder
});

ipcMain.handle('allow-sleep', () => {
  // Implementation depends on platform-specific modules
  // This is a placeholder
});

