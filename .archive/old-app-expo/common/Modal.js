import React, { useEffect } from 'react';
import {
  View,
  Modal as RNModal,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { useAppTheme } from '../../providers/ThemeProvider';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Modal = ({
  visible,
  onClose,
  children,
  style,
  animationType = 'slide',
  transparent = true,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const { theme } = useAppTheme();
  const translateY = new Animated.Value(SCREEN_HEIGHT);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 5,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: theme.animation.duration.leavingScreen,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, theme.animation.duration.leavingScreen]);

  return (
    <RNModal
      visible={visible}
      transparent={transparent}
      animationType={animationType}
      onRequestClose={onClose}
      {...props}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.backdrop, { backgroundColor: theme.colors.grey[900] + '80' }]}
          accessible={true}
          accessibilityRole="dialog"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: theme.colors.background.paper,
                  borderTopLeftRadius: theme.borderRadius.xl,
                  borderTopRightRadius: theme.borderRadius.xl,
                  transform: [{ translateY }],
                },
                style,
              ]}
            >
              {children}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    padding: 16,
    minHeight: 200,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
});

export default Modal; 