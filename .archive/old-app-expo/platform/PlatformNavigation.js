import React from 'react';
import { Platform, Animated, TouchableOpacity, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import platformService from '../../services/platformService';

const PlatformNavigation = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  style,
  titleStyle,
  iconStyle,
  elevation = 4,
  backgroundColor,
  animatedValue
}) => {
  const isIOS = Platform.OS === 'ios';
  const insets = useSafeAreaInsets();
  const { shadow } = platformService.getPlatformSpecificStyles();

  const headerHeight = isIOS ? 44 : 56;
  const statusBarHeight = insets.top;

  const translateY = animatedValue?.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -headerHeight],
    extrapolate: 'clamp'
  }) || 0;

  const opacity = animatedValue?.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  }) || 1;

  const styles = StyleSheet.create({
    container: {
      height: headerHeight + statusBarHeight,
      paddingTop: statusBarHeight,
      backgroundColor: backgroundColor || (isIOS ? '#FFFFFF' : '#2196F3'),
      ...(isIOS ? {} : { elevation }),
      ...shadow,
      zIndex: 1000,
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
    },
    title: {
      fontSize: isIOS ? 17 : 20,
      fontWeight: isIOS ? '600' : '500',
      color: isIOS ? '#000000' : '#FFFFFF',
      textAlign: 'center',
      flex: 1,
    },
    button: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: 24,
      color: isIOS ? '#007AFF' : '#FFFFFF',
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        {leftIcon && (
          <TouchableOpacity
            style={styles.button}
            onPress={onLeftPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons
              name={leftIcon}
              style={[styles.icon, iconStyle]}
            />
          </TouchableOpacity>
        )}
        <Animated.Text style={[styles.title, titleStyle]}>
          {title}
        </Animated.Text>
        {rightIcon && (
          <TouchableOpacity
            style={styles.button}
            onPress={onRightPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons
              name={rightIcon}
              style={[styles.icon, iconStyle]}
            />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

export default PlatformNavigation; 