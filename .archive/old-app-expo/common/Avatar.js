import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAppTheme } from '../../providers/ThemeProvider';
import { Image as ExpoImage } from 'expo-image';
import { validateNumber } from '../../constants/designSystem';

const Avatar = ({
  source,
  size = 40,
  name,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const { theme } = useAppTheme();

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderContent = () => {
    if (source) {
      return (
        <ExpoImage
          source={source}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
          contentFit='cover'
          transition={300}
          cachePolicy='memory-disk'
          {...props}
        />
      );
    }

    return (
      <View
        style={[
          styles.initialsContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.colors.primary.main,
          },
        ]}
      >
        <Text
          style={[
            styles.initials,
            {
              fontSize: validateNumber(size * 0.4, 16, 8, 40),
              color: theme.colors.primary.contrast,
            },
            textStyle,
          ]}
        >
          {getInitials(name)}
        </Text>
      </View>
    );
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      style={[styles.container, style]}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityLabel={accessibilityLabel || name || 'Avatar'}
      accessibilityHint={accessibilityHint}
    >
      {renderContent()}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '600',
  },
});

export default Avatar; 