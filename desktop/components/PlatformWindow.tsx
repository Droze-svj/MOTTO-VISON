import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import platformService from '../services/platformService';

interface PlatformWindowProps {
  title?: string;
  children?: React.ReactNode;
}

interface PlatformWindowState {
  platform: string;
  isMaximized: boolean;
  theme: 'light' | 'dark';
}

class PlatformWindow extends Component<PlatformWindowProps, PlatformWindowState> {
  constructor(props: PlatformWindowProps) {
    super(props);
    this.state = {
      platform: platformService.isMac ? 'darwin' : platformService.isWindows ? 'win32' : 'linux',
      isMaximized: false,
      theme: 'light'
    };
  }

  async componentDidMount(): Promise<void> {
    // Get initial theme
    try {
      const theme = await platformService.getSystemTheme();
      this.setState({ theme });
    } catch (error) {
      console.error('Failed to get system theme:', error);
    }

    // Listen for theme changes
    ipcRenderer.on('theme-changed', (event, theme: 'light' | 'dark') => {
      this.setState({ theme });
    });

    // Listen for window state changes
    ipcRenderer.on('window-state-changed', (event, isMaximized: boolean) => {
      this.setState({ isMaximized });
    });
  }

  componentWillUnmount(): void {
    ipcRenderer.removeAllListeners('theme-changed');
    ipcRenderer.removeAllListeners('window-state-changed');
  }

  handleMinimize = (): void => {
    platformService.minimizeWindow().catch(error => {
      console.error('Failed to minimize window:', error);
    });
  };

  handleMaximize = (): void => {
    platformService.maximizeWindow().catch(error => {
      console.error('Failed to maximize window:', error);
    });
  };

  handleClose = (): void => {
    platformService.closeWindow().catch(error => {
      console.error('Failed to close window:', error);
    });
  };

  renderTitleBar(): JSX.Element {
    const { platform, isMaximized } = this.state;
    const { title = 'MOTTO' } = this.props;

    if (platform === 'darwin') {
      // macOS title bar
      return (
        <div className="titlebar-mac">
          <div className="titlebar-buttons">
            <button className="close" onClick={this.handleClose} aria-label="Close" />
            <button className="minimize" onClick={this.handleMinimize} aria-label="Minimize" />
            <button className="maximize" onClick={this.handleMaximize} aria-label="Maximize" />
          </div>
          <div className="titlebar-title">{title}</div>
        </div>
      );
    } else if (platform === 'win32') {
      // Windows title bar
      return (
        <div className="titlebar-windows">
          <div className="titlebar-title">{title}</div>
          <div className="titlebar-buttons">
            <button className="minimize" onClick={this.handleMinimize} aria-label="Minimize">─</button>
            <button className="maximize" onClick={this.handleMaximize} aria-label="Maximize">
              {isMaximized ? '❐' : '□'}
            </button>
            <button className="close" onClick={this.handleClose} aria-label="Close">×</button>
          </div>
        </div>
      );
    } else {
      // Linux title bar
      return (
        <div className="titlebar-linux">
          <div className="titlebar-title">{title}</div>
          <div className="titlebar-buttons">
            <button className="minimize" onClick={this.handleMinimize} aria-label="Minimize">−</button>
            <button className="maximize" onClick={this.handleMaximize} aria-label="Maximize">
              {isMaximized ? '⧉' : '□'}
            </button>
            <button className="close" onClick={this.handleClose} aria-label="Close">×</button>
          </div>
        </div>
      );
    }
  }

  render(): JSX.Element {
    const { theme } = this.state;
    const { children } = this.props;

    return (
      <div className={`platform-window ${theme}`}>
        {this.renderTitleBar()}
        <div className="window-content">
          {children}
        </div>
      </div>
    );
  }
}

export default PlatformWindow;

