import { useRef, useCallback } from 'react';
import { Animated, Easing } from 'react-native';

const useAnimation = (initialValue = 0) => {
  const animation = useRef(new Animated.Value(initialValue)).current;

  const animate = useCallback(({
    toValue,
    duration = 300,
    easing = Easing.ease,
    useNativeDriver = true,
    delay = 0,
  }) => {
    return new Promise((resolve) => {
      Animated.timing(animation, {
        toValue,
        duration,
        easing,
        useNativeDriver,
        delay,
      }).start(resolve);
    });
  }, [animation]);

  const spring = useCallback(({
    toValue,
    friction = 7,
    tension = 40,
    useNativeDriver = true,
    delay = 0,
  }) => {
    return new Promise((resolve) => {
      Animated.spring(animation, {
        toValue,
        friction,
        tension,
        useNativeDriver,
        delay,
      }).start(resolve);
    });
  }, [animation]);

  const sequence = useCallback((animations) => {
    return new Promise((resolve) => {
      Animated.sequence(animations).start(resolve);
    });
  }, []);

  const parallel = useCallback((animations) => {
    return new Promise((resolve) => {
      Animated.parallel(animations).start(resolve);
    });
  }, []);

  const loop = useCallback((animation, iterations = -1) => {
    return new Promise((resolve) => {
      Animated.loop(animation, { iterations }).start(resolve);
    });
  }, []);

  const stop = useCallback(() => {
    animation.stopAnimation();
  }, [animation]);

  const reset = useCallback(() => {
    animation.setValue(initialValue);
  }, [animation, initialValue]);

  return {
    animation,
    animate,
    spring,
    sequence,
    parallel,
    loop,
    stop,
    reset,
  };
};

export default useAnimation; 