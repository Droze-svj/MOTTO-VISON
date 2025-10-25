import React from 'react';
import { I18nManager } from 'react-native';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources } from './constants/translations';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './providers/ThemeProvider';
import ErrorBoundary from '../src/components/ErrorBoundary';

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Force RTL/LTR layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(false);

const App = () => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to error tracking service in production
        console.error('App Error:', error);
        console.error('Error Info:', errorInfo);
        // TODO: Send to Sentry or similar service
      }}
    >
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App; 