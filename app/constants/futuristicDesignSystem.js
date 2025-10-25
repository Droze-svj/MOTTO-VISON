/**
 * MOTTO Futuristic Blue Design System
 * Rich, modern, and futuristic design with blue color palette
 */

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Futuristic Blue Color Palette
export const futuristicColors = {
  // Primary Blues
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
  
  // Deep Space Blues
  space: {
    50: '#E8F4FD',
    100: '#C7E7FB',
    200: '#A3D8F9',
    300: '#7FC9F7',
    400: '#5BBAF5',
    500: '#37ABF3', // Deep space blue
    600: '#2E8FD1',
    700: '#2573AF',
    800: '#1C578D',
    900: '#133B6B',
  },
  
  // Electric Blues
  electric: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Electric blue
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  
  // Neon Accents
  neon: {
    blue: '#00BFFF',
    cyan: '#00FFFF',
    azure: '#007FFF',
    sky: '#87CEEB',
    ocean: '#0066CC',
  },
  
  // Dark Theme
  dark: {
    background: '#0A0E1A',
    surface: '#1A1F2E',
    card: '#2A2F3E',
    border: '#3A3F4E',
    text: '#FFFFFF',
    textSecondary: '#B0B8C8',
    textTertiary: '#808898',
  },
  
  // Light Theme
  light: {
    background: '#F8FAFF',
    surface: '#FFFFFF',
    card: '#F0F4FF',
    border: '#E0E8FF',
    text: '#1A1F2E',
    textSecondary: '#4A4F5E',
    textTertiary: '#7A7F8E',
  },
  
  // Gradients
  gradients: {
    primary: ['#2196F3', '#00BFFF'],
    space: ['#1A1F2E', '#2A2F3E'],
    electric: ['#00BFFF', '#0066CC'],
    ocean: ['#0066CC', '#003366'],
    sky: ['#87CEEB', '#4682B4'],
  },
  
  // Status Colors
  status: {
    success: '#00E676',
    warning: '#FFB300',
    error: '#FF5252',
    info: '#2196F3',
    online: '#00E676',
    offline: '#FF5252',
  },
};

// Typography
export const futuristicTypography = {
  fontFamily: {
    primary: 'System',
    secondary: 'System',
    mono: 'Courier',
  },
  
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 36,
  },
  
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing
export const futuristicSpacing = {
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
export const futuristicBorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadows
export const futuristicShadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: {
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
};

// Layout
export const futuristicLayout = {
  container: {
    flex: 1,
    backgroundColor: futuristicColors.dark.background,
  },
  
  header: {
    height: 80,
    backgroundColor: futuristicColors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: futuristicColors.dark.border,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: futuristicSpacing.md,
  },
  
  footer: {
    height: 100,
    backgroundColor: futuristicColors.dark.surface,
    borderTopWidth: 1,
    borderTopColor: futuristicColors.dark.border,
  },
};

// Animation
export const futuristicAnimation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Z-Index
export const futuristicZIndex = {
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
export const futuristicBreakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

// Component Styles
export const futuristicComponents = {
  // Futuristic Card
  card: {
    backgroundColor: futuristicColors.dark.card,
    borderRadius: futuristicBorderRadius.lg,
    padding: futuristicSpacing.md,
    borderWidth: 1,
    borderColor: futuristicColors.dark.border,
    ...futuristicShadows.md,
  },
  
  // Futuristic Button
  button: {
    primary: {
      backgroundColor: futuristicColors.primary[500],
      borderRadius: futuristicBorderRadius.md,
      paddingVertical: futuristicSpacing.sm,
      paddingHorizontal: futuristicSpacing.lg,
      ...futuristicShadows.sm,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderRadius: futuristicBorderRadius.md,
      paddingVertical: futuristicSpacing.sm,
      paddingHorizontal: futuristicSpacing.lg,
      borderWidth: 1,
      borderColor: futuristicColors.primary[500],
    },
    ghost: {
      backgroundColor: 'transparent',
      borderRadius: futuristicBorderRadius.md,
      paddingVertical: futuristicSpacing.sm,
      paddingHorizontal: futuristicSpacing.lg,
    },
  },
  
  // Futuristic Input
  input: {
    backgroundColor: futuristicColors.dark.surface,
    borderRadius: futuristicBorderRadius.md,
    padding: futuristicSpacing.sm,
    borderWidth: 1,
    borderColor: futuristicColors.dark.border,
    color: futuristicColors.dark.text,
  },
  
  // Futuristic Message Container
  messageContainer: {
    backgroundColor: 'transparent',
    marginVertical: futuristicSpacing.xs,
  },
  
  // Futuristic Message Card
  messageCard: {
    backgroundColor: futuristicColors.dark.card,
    borderRadius: futuristicBorderRadius.lg,
    padding: futuristicSpacing.md,
    marginVertical: futuristicSpacing.xs,
    borderWidth: 1,
    borderColor: futuristicColors.dark.border,
    ...futuristicShadows.sm,
  },
  
  // User Message
  userMessage: {
    backgroundColor: futuristicColors.primary[500],
    borderRadius: futuristicBorderRadius.lg,
    padding: futuristicSpacing.md,
    marginVertical: futuristicSpacing.xs,
    alignSelf: 'flex-end',
    maxWidth: '80%',
    ...futuristicShadows.md,
  },
  
  // Assistant Message
  assistantMessage: {
    backgroundColor: futuristicColors.dark.card,
    borderRadius: futuristicBorderRadius.lg,
    padding: futuristicSpacing.md,
    marginVertical: futuristicSpacing.xs,
    alignSelf: 'flex-start',
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: futuristicColors.dark.border,
    ...futuristicShadows.sm,
  },
  
  // Futuristic Header
  header: {
    backgroundColor: futuristicColors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: futuristicColors.dark.border,
    paddingTop: futuristicSpacing.lg,
    paddingBottom: futuristicSpacing.md,
    paddingHorizontal: futuristicSpacing.md,
  },
  
  // Futuristic Footer
  footer: {
    backgroundColor: futuristicColors.dark.surface,
    borderTopWidth: 1,
    borderTopColor: futuristicColors.dark.border,
    padding: futuristicSpacing.md,
  },
  
  // Futuristic Logo
  logo: {
    fontSize: futuristicTypography.fontSize['4xl'],
    fontWeight: futuristicTypography.fontWeight.bold,
    color: futuristicColors.primary[500],
    textAlign: 'center',
  },
};

// Helper Functions
export const futuristicUtils = {
  // Get gradient colors
  getGradient: (type = 'primary') => {
    return futuristicColors.gradients[type] || futuristicColors.gradients.primary;
  },
  
  // Get shadow
  getShadow: (type = 'md') => {
    return futuristicShadows[type] || futuristicShadows.md;
  },
  
  // Get spacing
  getSpacing: (size = 'md') => {
    return futuristicSpacing[size] || futuristicSpacing.md;
  },
  
  // Get border radius
  getBorderRadius: (size = 'md') => {
    return futuristicBorderRadius[size] || futuristicBorderRadius.md;
  },
  
  // Get typography
  getTypography: (size = 'base', weight = 'normal') => {
    return {
      fontSize: futuristicTypography.fontSize[size] || futuristicTypography.fontSize.base,
      fontWeight: futuristicTypography.fontWeight[weight] || futuristicTypography.fontWeight.normal,
      fontFamily: futuristicTypography.fontFamily.primary,
    };
  },
};

export default {
  colors: futuristicColors,
  typography: futuristicTypography,
  spacing: futuristicSpacing,
  borderRadius: futuristicBorderRadius,
  shadows: futuristicShadows,
  layout: futuristicLayout,
  animation: futuristicAnimation,
  zIndex: futuristicZIndex,
  breakpoints: futuristicBreakpoints,
  components: futuristicComponents,
  utils: futuristicUtils,
};
