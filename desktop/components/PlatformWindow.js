const React = require('react');
const { ipcRenderer } = require('electron');
const platformService = require('../services/platformService');

class PlatformWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      platform: platformService.platform,
      isMaximized: false,
      theme: 'light'
    };
  }

  async componentDidMount() {
    // Get initial theme
    const theme = await platformService.getSystemTheme();
    this.setState({ theme });

    // Listen for theme changes
    ipcRenderer.on('theme-changed', (event, theme) => {
      this.setState({ theme });
    });

    // Listen for window state changes
    ipcRenderer.on('window-state-changed', (event, isMaximized) => {
      this.setState({ isMaximized });
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('theme-changed');
    ipcRenderer.removeAllListeners('window-state-changed');
  }

  handleMinimize = () => {
    platformService.minimizeWindow();
  };

  handleMaximize = () => {
    platformService.maximizeWindow();
  };

  handleClose = () => {
    platformService.closeWindow();
  };

  renderTitleBar() {
    const { platform, isMaximized } = this.state;

    if (platform === 'darwin') {
      // macOS title bar
      return (
        <div className="titlebar-mac">
          <div className="titlebar-buttons">
            <button className="close" onClick={this.handleClose} />
            <button className="minimize" onClick={this.handleMinimize} />
            <button className="maximize" onClick={this.handleMaximize} />
          </div>
          <div className="titlebar-title">{this.props.title}</div>
        </div>
      );
    } else if (platform === 'win32') {
      // Windows title bar
      return (
        <div className="titlebar-windows">
          <div className="titlebar-title">{this.props.title}</div>
          <div className="titlebar-buttons">
            <button className="minimize" onClick={this.handleMinimize}>─</button>
            <button className="maximize" onClick={this.handleMaximize}>
              {isMaximized ? '❐' : '□'}
            </button>
            <button className="close" onClick={this.handleClose}>×</button>
          </div>
        </div>
      );
    } else {
      // Linux title bar
      return (
        <div className="titlebar-linux">
          <div className="titlebar-title">{this.props.title}</div>
          <div className="titlebar-buttons">
            <button className="minimize" onClick={this.handleMinimize}>−</button>
            <button className="maximize" onClick={this.handleMaximize}>
              {isMaximized ? '⧉' : '□'}
            </button>
            <button className="close" onClick={this.handleClose}>×</button>
          </div>
        </div>
      );
    }
  }

  render() {
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

module.exports = PlatformWindow; 