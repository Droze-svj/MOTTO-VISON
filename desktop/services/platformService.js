const { ipcRenderer } = require('electron');
const os = require('os');

class PlatformService {
  constructor() {
    this.platform = process.platform;
    this.isMac = this.platform === 'darwin';
    this.isWindows = this.platform === 'win32';
    this.isLinux = this.platform === 'linux';
  }

  // System information
  getSystemInfo() {
    return {
      platform: this.platform,
      arch: os.arch(),
      version: os.version(),
      memory: os.totalmem(),
      cpus: os.cpus().length
    };
  }

  // File system paths
  getAppDataPath() {
    switch (this.platform) {
      case 'win32':
        return process.env.APPDATA;
      case 'darwin':
        return process.env.HOME + '/Library/Application Support';
      case 'linux':
        return process.env.HOME + '/.config';
      default:
        return process.env.HOME;
    }
  }

  // Platform-specific features
  async getSystemTheme() {
    return await ipcRenderer.invoke('get-system-theme');
  }

  async showNotification(title, message) {
    return await ipcRenderer.invoke('show-notification', { title, message });
  }

  // File handling
  getFileExtension(filePath) {
    return path.extname(filePath).toLowerCase();
  }

  isImageFile(filePath) {
    const ext = this.getFileExtension(filePath);
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext);
  }

  // Platform-specific shortcuts
  getShortcutKey(key) {
    if (this.isMac) {
      return key.replace('Ctrl', '⌘').replace('Alt', '⌥');
    }
    return key;
  }

  // System integration
  async registerProtocolHandler(protocol) {
    if (this.isMac) {
      // macOS protocol handler registration
      return await ipcRenderer.invoke('register-protocol-handler', protocol);
    } else if (this.isWindows) {
      // Windows protocol handler registration
      return await ipcRenderer.invoke('register-protocol-handler', protocol);
    } else if (this.isLinux) {
      // Linux protocol handler registration
      return await ipcRenderer.invoke('register-protocol-handler', protocol);
    }
  }

  // System tray integration
  async setupSystemTray(icon, menu) {
    if (this.isMac) {
      // macOS dock integration
      return await ipcRenderer.invoke('setup-dock', { icon, menu });
    } else {
      // Windows/Linux system tray
      return await ipcRenderer.invoke('setup-tray', { icon, menu });
    }
  }

  // Power management
  async preventSystemSleep() {
    return await ipcRenderer.invoke('prevent-sleep');
  }

  async allowSystemSleep() {
    return await ipcRenderer.invoke('allow-sleep');
  }

  // Clipboard handling
  async readClipboard() {
    return await ipcRenderer.invoke('read-clipboard');
  }

  async writeClipboard(text) {
    return await ipcRenderer.invoke('write-clipboard', text);
  }

  // Window management
  async minimizeWindow() {
    return await ipcRenderer.invoke('minimize-window');
  }

  async maximizeWindow() {
    return await ipcRenderer.invoke('maximize-window');
  }

  async closeWindow() {
    return await ipcRenderer.invoke('close-window');
  }
}

module.exports = new PlatformService(); 