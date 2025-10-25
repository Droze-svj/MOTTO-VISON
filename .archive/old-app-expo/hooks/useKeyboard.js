import { useState, useEffect, useCallback } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useAnimatedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const useKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const animatedKeyboardHeight = useAnimatedValue(0);

  const handleKeyboardShow = useCallback((event) => {
    const height = event.endCoordinates.height;
    setKeyboardHeight(height);
    setIsKeyboardVisible(true);
    animatedKeyboardHeight.setValue(height);
  }, [animatedKeyboardHeight]);

  const handleKeyboardHide = useCallback(() => {
    setKeyboardHeight(0);
    setIsKeyboardVisible(false);
    animatedKeyboardHeight.setValue(0);
  }, [animatedKeyboardHeight]);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(-animatedKeyboardHeight.value, {
            duration: Platform.OS === 'ios' ? 250 : 150,
          }),
        },
      ],
    };
  });

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      handleKeyboardShow
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      handleKeyboardHide
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [handleKeyboardShow, handleKeyboardHide]);

  return {
    keyboardHeight,
    isKeyboardVisible,
    dismissKeyboard,
    animatedStyle,
  };
};

export default useKeyboard; 