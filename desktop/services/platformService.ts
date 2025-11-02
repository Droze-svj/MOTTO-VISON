import { ipcRenderer } from 'electron';
import * as os from 'os';
import * as path from 'path';

interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
  memory: number;
  cpus: number;
}

class PlatformService {
  private platform: NodeJS.Platform;
  public readonly isMac: boolean;
  public readonly isWindows: boolean;
  public readonly isLinux: boolean;

  constructor() {
    this.platform = process.platform;
    this.isMac = this.platform === 'darwin';
    this.isWindows = this.platform === 'win32';
    this.isLinux = this.platform === 'linux';
  }

  // System information
  getSystemInfo(): SystemInfo {
    return {
      platform: this.platform,
      arch: os.arch(),
      version: os.version(),
      memory: os.totalmem(),
      cpus: os.cpus().length
    };
  }

  // File system paths
  getAppDataPath(): string {
    const homeDir = process.env.HOME || process.env.USERPROFILE || os.homedir() || './app_data';
    
    switch (this.platform) {
      case 'win32':
        return process.env.APPDATA || process.env.USERPROFILE || process.env.HOME || os.homedir() || './app_data';
      case 'darwin':
        return `${homeDir}/Library/Application Support`;
      case 'linux':
        return `${homeDir}/.config`;
      default:
        return homeDir;
    }
  }

  // Platform-specific features
  async getSystemTheme(): Promise<'light' | 'dark'> {
    return await ipcRenderer.invoke('get-system-theme');
  }

  async showNotification(title: string, message: string): Promise<void> {
    return await ipcRenderer.invoke('show-notification', { title, message });
  }

  // File handling
  getFileExtension(filePath: string): string {
    return path.extname(filePath).toLowerCase();
  }

  isImageFile(filePath: string): boolean {
    const ext = this.getFileExtension(filePath);
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext);
  }

  // Platform-specific shortcuts
  getShortcutKey(key: string): string {
    if (this.isMac) {
      return key.replace('Ctrl', '⌘').replace('Alt', '⌥');
    }
    return key;
  }

  // System integration
  async registerProtocolHandler(protocol: string): Promise<void> {
    if (this.isMac || this.isWindows || this.isLinux) {
      // Platform-agnostic protocol handler registration
      return await ipcRenderer.invoke('register-protocol-handler', protocol);
    }
  }

  // System tray integration
  async setupSystemTray(icon: string, menu: any): Promise<void> {
    if (this.isMac) {
      // macOS dock integration
      return await ipcRenderer.invoke('setup-dock', { icon, menu });
    } else {
      // Windows/Linux system tray
      return await ipcRenderer.invoke('setup-tray', { icon, menu });
    }
  }

  // Power management
  async preventSystemSleep(): Promise<void> {
    return await ipcRenderer.invoke('prevent-sleep');
  }

  async allowSystemSleep(): Promise<void> {
    return await ipcRenderer.invoke('allow-sleep');
  }

  // Clipboard handling
  async readClipboard(): Promise<string> {
    return await ipcRenderer.invoke('read-clipboard');
  }

  async writeClipboard(text: string): Promise<void> {
    return await ipcRenderer.invoke('write-clipboard', text);
  }

  // Window management
  async minimizeWindow(): Promise<void> {
    return await ipcRenderer.invoke('minimize-window');
  }

  async maximizeWindow(): Promise<void> {
    return await ipcRenderer.invoke('maximize-window');
  }

  async closeWindow(): Promise<void> {
    return await ipcRenderer.invoke('close-window');
  }
}

export default new PlatformService();

