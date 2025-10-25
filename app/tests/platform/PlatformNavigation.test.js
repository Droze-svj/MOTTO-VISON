import React from 'react';
import { Platform, Animated } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import PlatformNavigation from '../../components/platform/PlatformNavigation';

describe('PlatformNavigation', () => {
  const mockOnLeftPress = jest.fn();
  const mockOnRightPress = jest.fn();
  const animatedValue = new Animated.Value(0);

  beforeEach(() => {
    mockOnLeftPress.mockClear();
    mockOnRightPress.mockClear();
  });

  it('renders correctly on iOS', () => {
    Platform.OS = 'ios';
    const { getByText } = render(
      <PlatformNavigation
        title="Test Title"
        leftIcon="menu"
        rightIcon="settings"
        onLeftPress={mockOnLeftPress}
        onRightPress={mockOnRightPress}
      />
    );

    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Title').props.style).toMatchObject({
      fontSize: 17,
      fontWeight: '600',
    });
  });

  it('renders correctly on Android', () => {
    Platform.OS = 'android';
    const { getByText } = render(
      <PlatformNavigation
        title="Test Title"
        leftIcon="menu"
        rightIcon="settings"
        onLeftPress={mockOnLeftPress}
        onRightPress={mockOnRightPress}
      />
    );

    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Title').props.style).toMatchObject({
      fontSize: 20,
      fontWeight: '500',
    });
  });

  it('handles left button press', () => {
    const { getByTestId } = render(
      <PlatformNavigation
        title="Test Title"
        leftIcon="menu"
        onLeftPress={mockOnLeftPress}
      />
    );

    fireEvent.press(getByTestId('left-button'));
    expect(mockOnLeftPress).toHaveBeenCalledTimes(1);
  });

  it('handles right button press', () => {
    const { getByTestId } = render(
      <PlatformNavigation
        title="Test Title"
        rightIcon="settings"
        onRightPress={mockOnRightPress}
      />
    );

    fireEvent.press(getByTestId('right-button'));
    expect(mockOnRightPress).toHaveBeenCalledTimes(1);
  });

  it('applies elevation on Android', () => {
    Platform.OS = 'android';
    const { container } = render(
      <PlatformNavigation
        title="Test Title"
        elevation={4}
      />
    );

    expect(container.props.style).toMatchObject({
      elevation: 4,
    });
  });

  it('handles animated value changes', () => {
    const { container } = render(
      <PlatformNavigation
        title="Test Title"
        animatedValue={animatedValue}
      />
    );

    Animated.timing(animatedValue, {
      toValue: 100,
      duration: 100,
      useNativeDriver: true,
    }).start();

    expect(container.props.style.transform[0].translateY).toBeDefined();
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { container } = render(
      <PlatformNavigation
        title="Test Title"
        style={customStyle}
      />
    );

    expect(container.props.style).toMatchObject(customStyle);
  });

  it('handles safe area insets', () => {
    const { container } = render(
      <PlatformNavigation
        title="Test Title"
      />
    );

    expect(container.props.style.paddingTop).toBeDefined();
  });

  it('renders without icons', () => {
    const { getByText, queryByTestId } = render(
      <PlatformNavigation
        title="Test Title"
      />
    );

    expect(getByText('Test Title')).toBeTruthy();
    expect(queryByTestId('left-button')).toBeNull();
    expect(queryByTestId('right-button')).toBeNull();
  });

  it('handles theme changes', () => {
    const { getByText, rerender } = render(
      <PlatformNavigation
        title="Test Title"
        backgroundColor="#000000"
      />
    );

    expect(getByText('Test Title').props.style.color).toBe('#FFFFFF');

    rerender(
      <PlatformNavigation
        title="Test Title"
        backgroundColor="#FFFFFF"
      />
    );

    expect(getByText('Test Title').props.style.color).toBe('#000000');
  });
}); 