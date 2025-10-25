import { useRef, useCallback } from 'react';
import { Animated, PanResponder } from 'react-native';

const useGesture = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onLongPress,
  swipeThreshold = 50,
  longPressDuration = 500,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const longPressTimer = useRef(null);

  const resetPosition = useCallback(() => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  }, [pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
        scale.setValue(0.95);

        if (onLongPress) {
          longPressTimer.current = setTimeout(() => {
            onLongPress();
          }, longPressDuration);
        }
      },

      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),

      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        scale.setValue(1);

        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
        }

        const { dx, dy } = gestureState;

        // Determine if the gesture was a tap
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
          if (onTap) {
            onTap();
          }
          return;
        }

        // Determine swipe direction
        if (Math.abs(dx) > Math.abs(dy)) {
          if (Math.abs(dx) > swipeThreshold) {
            if (dx > 0) {
              onSwipeRight?.();
            } else {
              onSwipeLeft?.();
            }
          }
        } else {
          if (Math.abs(dy) > swipeThreshold) {
            if (dy > 0) {
              onSwipeDown?.();
            } else {
              onSwipeUp?.();
            }
          }
        }

        resetPosition();
      },

      onPanResponderTerminate: () => {
        pan.flattenOffset();
        scale.setValue(1);
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
        }
        resetPosition();
      },
    })
  ).current;

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { scale },
    ],
  };

  return {
    panResponder,
    animatedStyle,
    resetPosition,
  };
};

export default useGesture; 