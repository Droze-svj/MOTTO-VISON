/**
 * MOTTO Design System
 * Comprehensive design tokens for consistent, modern UI
 */

import { Dimensions, Platform } from 'react-native';

// Safe dimensions function to prevent NaN issues
const getSafeDimensions = () => {
  try {
    const { width, height } = Dimensions.get('window');
    return {
      width: width && !isNaN(width) ? width : 375,
      height: height && !isNaN(height) ? height : 667,
    };
  } catch (error) {
    return { width: 375, height: 667 };
  }
};

// Color Palette
export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main primary
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  
  // Secondary Brand Colors
  secondary: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#9C27B0', // Main secondary
    600: '#8E24AA',
    700: '#7B1FA2',
    800: '#6A1B9A',
    900: '#4A148C',
  },
  
  // Accent Colors
  accent: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    purple: '#9C27B0',
    teal: '#009688',
    orange: '#FF5722',
    pink: '#E91E63',
  },
  
  // Neutral Colors
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#F1F3F4',
    dark: '#121212',
    darkSecondary: '#1E1E1E',
    darkTertiary: '#2D2D2D',
  },
  
  // Text Colors
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    tertiary: '#999999',
    disabled: '#CCCCCC',
    inverse: '#FFFFFF',
    inverseSecondary: '#E0E0E0',
  },
  
  // Status Colors
  status: {
    online: '#4CAF50',
    offline: '#F44336',
    idle: '#FF9800',
    busy: '#9C27B0',
  },
  
  // Gradient Colors
  gradients: {
    primary: ['#2196F3', '#9C27B0'],
    secondary: ['#FF9800', '#F44336'],
    success: ['#4CAF50', '#8BC34A'],
    sunset: ['#FF6B6B', '#FFE66D'],
    ocean: ['#667eea', '#764ba2'],
    forest: ['#11998e', '#38ef7d'],
    fire: ['#f093fb', '#f5576c'],
  },
};

// Typography System
export const typography = {
  // Font Families
  fontFamily: {
    regular: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
    medium: Platform.select({
      ios: 'SF Pro Display-Medium',
      android: 'Roboto-Medium',
    }),
    bold: Platform.select({
      ios: 'SF Pro Display-Bold',
      android: 'Roboto-Bold',
    }),
    light: Platform.select({
      ios: 'SF Pro Display-Light',
      android: 'Roboto-Light',
    }),
  },
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Text Styles
  textStyles: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 28,
      fontWeight: '600',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: 20,
      fontWeight: '500',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 1.5,
    },
    h6: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.6,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.4,
    },
    button: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 1.4,
    },
  },
};

// Spacing System
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

// Border Radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

// Layout Constants
export const layout = {
  screenWidth: width,
  screenHeight: height,
  headerHeight: 60,
  tabBarHeight: 80,
  cardPadding: 16,
  sectionSpacing: 24,
  containerPadding: 20,
};

// Animation Durations
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

// Z-Index Scale
export const zIndex = {
  base: 0,
  card: 1,
  modal: 10,
  overlay: 20,
  tooltip: 30,
  dropdown: 40,
  header: 50,
  modalOverlay: 100,
};

// Breakpoints
export const breakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

// Theme Modes
export const themeModes = {
  light: {
    background: colors.background.primary,
    surface: colors.background.secondary,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    border: colors.neutral[200],
  },
  dark: {
    background: colors.background.dark,
    surface: colors.background.darkSecondary,
    text: colors.text.inverse,
    textSecondary: colors.text.inverseSecondary,
    border: colors.neutral[700],
  },
};

// Component Specific Styles
export const components = {
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  button: {
    primary: {
      backgroundColor: colors.primary[500],
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    secondary: {
      backgroundColor: colors.neutral[100],
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
};

// Helper function to validate numeric values
export const validateNumber = (value, defaultValue = 0, min = 0, max = 1000) => {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  animation,
  zIndex,
  breakpoints,
  themeModes,
  components,
  validateNumber,
};
