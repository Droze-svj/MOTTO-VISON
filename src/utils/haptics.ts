import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

/**
 * Haptic Feedback Utility
 * Provides consistent haptic feedback across the app
 */

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const Haptics = {
  /**
   * Light impact - For subtle interactions like sending a message
   */
  light: () => {
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
  },

  /**
   * Medium impact - For more significant actions like button presses
   */
  medium: () => {
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
  },

  /**
   * Heavy impact - For important actions like deleting or confirming
   */
  heavy: () => {
    ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
  },

  /**
   * Selection - For picker/selector changes
   */
  selection: () => {
    ReactNativeHapticFeedback.trigger('selection', hapticOptions);
  },

  /**
   * Success - For successful completions
   */
  success: () => {
    ReactNativeHapticFeedback.trigger('notificationSuccess', hapticOptions);
  },

  /**
   * Warning - For warnings
   */
  warning: () => {
    ReactNativeHapticFeedback.trigger('notificationWarning', hapticOptions);
  },

  /**
   * Error - For errors
   */
  error: () => {
    ReactNativeHapticFeedback.trigger('notificationError', hapticOptions);
  },
};

export default Haptics;

