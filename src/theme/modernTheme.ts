/**
 * Modern Theme System
 * Latest design trends: Glassmorphism, Gradients, Modern Typography
 */

import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const modernTheme = {
  // Color Palette - Modern & Vibrant
  colors: {
    // Primary (Purple/Indigo gradient)
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',
    primaryGradient: ['#6366F1', '#8B5CF6', '#A855F7'],
    
    // Accent (Cyan/Blue)
    accent: '#06B6D4',
    accentDark: '#0891B2',
    accentLight: '#22D3EE',
    accentGradient: ['#06B6D4', '#3B82F6', '#6366F1'],
    
    // Success
    success: '#10B981',
    successLight: '#34D399',
    
    // Warning
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    
    // Error
    error: '#EF4444',
    errorLight: '#F87171',
    
    // Neutrals - Modern grayscale
    white: '#FFFFFF',
    black: '#0F172A',
    gray: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
    
    // Glassmorphism
    glass: {
      background: 'rgba(255, 255, 255, 0.75)',
      border: 'rgba(255, 255, 255, 0.3)',
      shadow: 'rgba(31, 41, 55, 0.1)',
    },
    
    // Dark Mode
    dark: {
      background: '#0F172A',
      surface: '#1E293B',
      card: '#334155',
      text: '#F1F5F9',
      textSecondary: '#94A3B8',
      border: '#475569',
    },
  },

  // Modern Typography
  typography: {
    // Font Families
    fonts: {
      regular: Platform.select({
        ios: 'SF Pro Display',
        android: 'Roboto',
        default: 'System',
      }),
      medium: Platform.select({
        ios: 'SF Pro Display Medium',
        android: 'Roboto Medium',
        default: 'System',
      }),
      bold: Platform.select({
        ios: 'SF Pro Display Bold',
        android: 'Roboto Bold',
        default: 'System',
      }),
      mono: Platform.select({
        ios: 'SF Mono',
        android: 'Roboto Mono',
        default: 'Courier',
      }),
    },
    
    // Sizes
    sizes: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 17,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    
    // Line Heights
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing - Modern 4px grid
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
  },

  // Border Radius - Modern, smooth
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },

  // Shadows - Modern, subtle
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
    glow: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
  },

  // Glassmorphism Effect
  glassmorphism: {
    background: 'rgba(255, 255, 255, 0.75)',
    border: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    backdropFilter: 'blur(20px)', // For web
    // For React Native, use BlurView component
  },

  // Modern Gradients
  gradients: {
    primary: ['#6366F1', '#8B5CF6', '#A855F7'],
    accent: ['#06B6D4', '#3B82F6', '#6366F1'],
    warm: ['#F59E0B', '#F97316', '#EF4444'],
    cool: ['#10B981', '#06B6D4', '#3B82F6'],
    sunset: ['#F97316', '#F59E0B', '#EAB308'],
    ocean: ['#0EA5E9', '#06B6D4', '#14B8A6'],
    purple: ['#8B5CF6', '#A855F7', '#C084FC'],
  },

  // Layout
  layout: {
    screenWidth: width,
    screenHeight: height,
    isSmallDevice: width < 375,
    isMediumDevice: width >= 375 && width < 414,
    isLargeDevice: width >= 414,
  },

  // Animation Timing
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
};

export type Theme = typeof modernTheme;

export default modernTheme;
