import React, { useEffect, useRef } from 'react';
import {
  Platform,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import platformService from '../../services/platformService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const PlatformModal = ({
  visible,
  onClose,
  children,
  style,
  animationType = 'slide',
  presentationStyle = 'pageSheet',
  transparent = true,
  onShow,
  onDismiss,
}) => {
  const isIOS = Platform.OS === 'ios';
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SCREEN_HEIGHT * 0.3) {
          closeModal();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      showModal();
    } else {
      closeModal();
    }
  }, [visible]);

  const showModal = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: SCREEN_HEIGHT,
        useNativeDriver: true,
        bounciness: 0,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const renderContent = () => {
    if (isIOS && presentationStyle === 'pageSheet') {
      return (
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY }],
              paddingBottom: insets.bottom,
            },
            style,
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handle} />
          {children}
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }],
            paddingBottom: insets.bottom,
          },
          style,
        ]}
      >
        {children}
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={transparent}
      animationType={animationType}
      onShow={onShow}
      onDismiss={onDismiss}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={closeModal}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity,
              paddingTop: insets.top,
            },
          ]}
        >
          {isIOS && transparent ? (
            <BlurView
              intensity={50}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={styles.overlayBackground} />
          )}
          {renderContent()}
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: Platform.OS === 'ios' ? '#FFFFFF' : '#F5F5F5',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    minHeight: 200,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#CCCCCC',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 8,
  },
});

export default PlatformModal; 