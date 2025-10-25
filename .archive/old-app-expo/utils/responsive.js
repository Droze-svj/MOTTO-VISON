import { Dimensions, Platform, StatusBar, PixelRatio } from 'react-native';

// Screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Platform detection
const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';
const isWeb = Platform.OS === 'web';
const platformVersion = Platform.Version;

// Device type detection
const isTablet = SCREEN_WIDTH >= 768;
const isSmallDevice = SCREEN_WIDTH < 375;
const isLargeDevice = SCREEN_WIDTH > 1024;
const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT;
const isNotchDevice = isIOS ? StatusBar.currentHeight > 20 : false;
const isFoldable = SCREEN_WIDTH > 1024 && SCREEN_HEIGHT > 1024;

// Device categories
const DEVICE_CATEGORY = {
  phone: !isTablet && !isLargeDevice,
  tablet: isTablet && !isLargeDevice,
  desktop: isLargeDevice,
  foldable: isFoldable,
};

// Platform-specific values
const PLATFORM = {
  isIOS,
  isAndroid,
  isWeb,
  version: platformVersion,
  hasNotch: isNotchDevice,
  isTablet,
  isLandscape,
};

// Safe area insets
const SAFE_AREA = {
  top: isNotchDevice ? 44 : 20,
  bottom: isNotchDevice ? 34 : 20,
  left: 0,
  right: 0,
};

// Responsive scaling
const normalize = (size) => {
  const scale = SCREEN_WIDTH / 375;
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

// Font sizes
const FONT_SIZE = {
  tiny: normalize(10),
  small: normalize(12),
  medium: normalize(14),
  large: normalize(16),
  xlarge: normalize(18),
  xxlarge: normalize(20),
  xxxlarge: normalize(24),
  huge: normalize(32),
};

// Spacing
const SPACING = {
  tiny: normalize(4),
  small: normalize(8),
  medium: normalize(16),
  large: normalize(24),
  xlarge: normalize(32),
  xxlarge: normalize(48),
  xxxlarge: normalize(64),
};

// Border radius
const BORDER_RADIUS = {
  small: normalize(4),
  medium: normalize(8),
  large: normalize(12),
  xlarge: normalize(16),
  round: 9999,
};

// Device-specific adjustments
const getDeviceSpecificFontSize = (size) => {
  if (isFoldable) return size * 1.2;
  if (isTablet) return size * 1.1;
  if (isSmallDevice) return size * 0.9;
  return size;
};

const getDeviceSpecificSpacing = (spacing) => {
  if (isFoldable) return spacing * 1.2;
  if (isTablet) return spacing * 1.1;
  if (isSmallDevice) return spacing * 0.9;
  return spacing;
};

const getDeviceSpecificBorderRadius = (radius) => {
  if (isFoldable) return radius * 1.2;
  if (isTablet) return radius * 1.1;
  if (isSmallDevice) return radius * 0.9;
  return radius;
};

// Device-specific scaling factors
const SCALE_FACTORS = {
  button: {
    phone: 1,
    tablet: 1.2,
    desktop: 1.4,
    foldable: 1.3,
  },
  icon: {
    phone: 1,
    tablet: 1.2,
    desktop: 1.3,
    foldable: 1.25,
  },
  text: {
    phone: 1,
    tablet: 1.1,
    desktop: 1.2,
    foldable: 1.15,
  },
};

// Layout helpers
const getResponsiveWidth = (percentage) => {
  return (SCREEN_WIDTH * percentage) / 100;
};

const getResponsiveHeight = (percentage) => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

// Platform-specific styles
const platformStyles = {
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    android: {
      elevation: 5,
    },
    web: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    },
  }),
  button: Platform.select({
    ios: {
      borderRadius: BORDER_RADIUS.medium,
    },
    android: {
      borderRadius: BORDER_RADIUS.medium,
      elevation: 2,
    },
    web: {
      borderRadius: BORDER_RADIUS.medium,
      cursor: 'pointer',
    },
  }),
};

// Device-specific styles
const deviceStyles = {
  container: {
    phone: {
      padding: SPACING.medium,
    },
    tablet: {
      padding: SPACING.large,
    },
    desktop: {
      padding: SPACING.xlarge,
    },
    foldable: {
      padding: SPACING.large,
    },
  },
  button: {
    phone: {
      padding: SPACING.medium,
    },
    tablet: {
      padding: SPACING.large,
    },
    desktop: {
      padding: SPACING.xlarge,
    },
    foldable: {
      padding: SPACING.large,
    },
  },
  input: {
    phone: {
      height: 40,
    },
    tablet: {
      height: 48,
    },
    desktop: {
      height: 56,
    },
    foldable: {
      height: 48,
    },
  },
  modal: {
    phone: {
      width: '90%',
      maxHeight: '80%',
    },
    tablet: {
      width: '70%',
      maxHeight: '70%',
    },
    desktop: {
      width: '50%',
      maxHeight: '60%',
    },
    foldable: {
      width: '60%',
      maxHeight: '65%',
    },
  },
};

// Accessibility features
const accessibility = {
  minimumTapArea: {
    phone: 44,
    tablet: 48,
    desktop: 56,
    foldable: 48,
  },
  minimumFontSize: {
    phone: 14,
    tablet: 16,
    desktop: 18,
    foldable: 16,
  },
  minimumContrastRatio: 4.5,
  minimumSpacing: {
    phone: 8,
    tablet: 12,
    desktop: 16,
    foldable: 12,
  },
};

// Gesture configuration
const gestureConfig = {
  velocityThreshold: {
    phone: 0.3,
    tablet: 0.4,
    desktop: 0.5,
    foldable: 0.4,
  },
  distanceThreshold: {
    phone: 50,
    tablet: 60,
    desktop: 70,
    foldable: 60,
  },
  longPressDuration: {
    phone: 500,
    tablet: 600,
    desktop: 700,
    foldable: 600,
  },
};

// Responsive utility functions
const getResponsiveFontSize = (size) => {
  const baseSize = normalize(size);
  return getDeviceSpecificFontSize(baseSize);
};

const getResponsivePadding = (padding) => {
  const basePadding = normalize(padding);
  return getDeviceSpecificSpacing(basePadding);
};

const getResponsiveMargin = (margin) => {
  const baseMargin = normalize(margin);
  return getDeviceSpecificSpacing(baseMargin);
};

const getResponsiveBorderRadius = (radius) => {
  const baseRadius = normalize(radius);
  return getDeviceSpecificBorderRadius(baseRadius);
};

const getResponsiveButtonSize = (size) => {
  const deviceType = isFoldable ? 'foldable' : isTablet ? 'tablet' : 'phone';
  return size * SCALE_FACTORS.button[deviceType];
};

const getResponsiveIconSize = (size) => {
  const deviceType = isFoldable ? 'foldable' : isTablet ? 'tablet' : 'phone';
  return size * SCALE_FACTORS.icon[deviceType];
};

// Orientation helpers
const orientationStyles = {
  landscape: {
    container: {
      flexDirection: 'row',
    },
    content: {
      flex: 1,
      marginLeft: SPACING.medium,
    },
  },
  portrait: {
    container: {
      flexDirection: 'column',
    },
    content: {
      flex: 1,
      marginTop: SPACING.medium,
    },
  },
};

export {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  PLATFORM,
  SAFE_AREA,
  FONT_SIZE,
  SPACING,
  BORDER_RADIUS,
  DEVICE_CATEGORY,
  isTablet,
  isLandscape,
  isNotchDevice,
  isFoldable,
  platformStyles,
  deviceStyles,
  orientationStyles,
  accessibility,
  gestureConfig,
  getResponsiveFontSize,
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveBorderRadius,
  getResponsiveButtonSize,
  getResponsiveIconSize,
  getResponsiveWidth,
  getResponsiveHeight,
}; 