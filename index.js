import React from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Log uncaught errors to help pinpoint runtime failures in Hermes
if (global.ErrorUtils && typeof global.ErrorUtils.setGlobalHandler === 'function') {
  try {
    const prev = global.ErrorUtils.getGlobalHandler && global.ErrorUtils.getGlobalHandler();
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      // Ensure stack is printed to Metro
      // eslint-disable-next-line no-console
      console.error('[GlobalError]', isFatal ? '(FATAL)' : '', error?.message, error?.stack);
      if (typeof prev === 'function') {
        try { prev(error, isFatal); } catch (_) {}
      }
    });
  } catch (_) {}
}

class RootBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error?.message, error?.stack, info?.componentStack);
  }
  render() {
    if (this.state.error) {
      return null;
    }
    return <App />;
  }
}

AppRegistry.registerComponent(appName, () => RootBoundary);