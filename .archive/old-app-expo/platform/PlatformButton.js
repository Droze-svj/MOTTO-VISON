import React from 'react';
import { Platform, TouchableOpacity, TouchableNativeFeedback, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import platformService from '../../services/platformService';

const PlatformButton = ({ 
  title, 
  onPress, 
  icon, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  iconStyle
}) => {
  const isIOS = Platform.OS === 'ios';
  const { shadow } = platformService.getPlatformSpecificStyles();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isIOS ? '#007AFF' : '#2196F3',
          textColor: '#FFFFFF'
        };
      case 'secondary':
        return {
          backgroundColor: isIOS ? '#E9E9EB' : '#E0E0E0',
          textColor: isIOS ? '#000000' : '#212121'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: isIOS ? '#007AFF' : '#2196F3',
          textColor: isIOS ? '#007AFF' : '#2196F3'
        };
      default:
        return {
          backgroundColor: isIOS ? '#007AFF' : '#2196F3',
          textColor: '#FFFFFF'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: isIOS ? 8 : 6,
          fontSize: 14,
          iconSize: 16
        };
      case 'large':
        return {
          padding: isIOS ? 16 : 14,
          fontSize: 18,
          iconSize: 24
        };
      default:
        return {
          padding: isIOS ? 12 : 10,
          fontSize: 16,
          iconSize: 20
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const buttonStyles = [
    styles.button,
    {
      backgroundColor: variantStyles.backgroundColor,
      padding: sizeStyles.padding,
      ...(variant === 'outline' && {
        borderWidth: 1,
        borderColor: variantStyles.borderColor
      }),
      ...shadow,
      opacity: disabled ? 0.5 : 1
    },
    style
  ];

  const textStyles = [
    styles.text,
    {
      color: variantStyles.textColor,
      fontSize: sizeStyles.fontSize
    },
    textStyle
  ];

  const iconStyles = [
    styles.icon,
    {
      fontSize: sizeStyles.iconSize,
      color: variantStyles.textColor
    },
    iconStyle
  ];

  const ButtonComponent = isIOS ? TouchableOpacity : TouchableNativeFeedback;
  const buttonProps = isIOS ? {} : { background: TouchableNativeFeedback.Ripple(variantStyles.textColor, false) };

  return (
    <ButtonComponent
      onPress={onPress}
      disabled={disabled}
      {...buttonProps}
    >
      <View style={buttonStyles}>
        {icon && <MaterialIcons name={icon} style={iconStyles} />}
        <Text style={textStyles}>{title}</Text>
      </View>
    </ButtonComponent>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Platform.OS === 'ios' ? 8 : 4,
    marginVertical: 4,
  },
  text: {
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  },
});

export default PlatformButton; 