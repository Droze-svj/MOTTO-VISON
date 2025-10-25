const { app, BrowserWindow, ipcMain, nativeTheme, systemPreferences } = require('electron');
const path = require('path');
const Store = require('electron-store');
const notifier = require('node-notifier');

// Initialize store
const store = new Store();

// Platform-specific configurations
const platform = process.platform;
const isMac = platform === 'darwin';
const isWindows = platform === 'win32';
const isLinux = platform === 'linux';

function createWindow() {
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

  // Platform-specific features
  if (isMac) {
    // Enable macOS features
    app.dock.setMenu(require('./menus/dock'));
    systemPreferences.setUserDefault('AppleShowScrollBars', 'string', 'Always');
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
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

// IPC handlers for platform-specific features
ipcMain.handle('get-platform', () => platform);

ipcMain.handle('get-system-theme', () => {
  if (isMac) {
    return systemPreferences.getUserDefault('AppleInterfaceStyle', 'string') === 'Dark' ? 'dark' : 'light';
  }
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
});

ipcMain.handle('show-notification', (event, { title, message }) => {
  notifier.notify({
    title,
    message,
    icon: path.join(__dirname, 'assets/icon.png'),
    sound: true,
    wait: true
  });
});

// Handle deep linking
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

function handleDeepLink(url) {
  // Handle deep linking logic here
  console.log('Deep link received:', url);
}

// Handle system theme changes
if (isMac) {
  systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', () => {
    const isDarkMode = systemPreferences.isDarkMode();
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('theme-changed', isDarkMode ? 'dark' : 'light');
    });
  });
} 