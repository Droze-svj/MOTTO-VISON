import React from 'react';
import { Platform } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import PlatformButton from '../../components/platform/PlatformButton';

describe('PlatformButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders correctly on iOS', () => {
    Platform.OS = 'ios';
    const { getByText } = render(
      <PlatformButton
        title="Test Button"
        onPress={mockOnPress}
        variant="primary"
      />
    );

    const button = getByText('Test Button');
    expect(button).toBeTruthy();
    expect(button.props.style).toMatchObject({
      color: '#FFFFFF',
      fontWeight: '600',
    });
  });

  it('renders correctly on Android', () => {
    Platform.OS = 'android';
    const { getByText } = render(
      <PlatformButton
        title="Test Button"
        onPress={mockOnPress}
        variant="primary"
      />
    );

    const button = getByText('Test Button');
    expect(button).toBeTruthy();
    expect(button.props.style).toMatchObject({
      color: '#FFFFFF',
      fontWeight: '500',
    });
  });

  it('handles press events', () => {
    const { getByText } = render(
      <PlatformButton
        title="Test Button"
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('applies different variants correctly', () => {
    const { getByText, rerender } = render(
      <PlatformButton
        title="Test Button"
        onPress={mockOnPress}
        variant="primary"
      />
    );

    let button = getByText('Test Button');
    expect(button.parent.props.style).toMatchObject({
      backgroundColor: Platform.OS === 'ios' ? '#007AFF' : '#2196F3',
    });

    rerender(
      <PlatformButton
        title="Test Button"
        onPress={mockOnPress}
        variant="secondary"
      />
    );

    button = getByText('Test Button');
    expect(button.parent.props.style).toMatchObject({
      backgroundColor: Platform.OS === 'ios' ? '#E9E9EB' : '#E0E0E0',
    });
  });

  it('handles disabled state', () => {
    const { getByText } = render(
      <PlatformButton
        title="Test Button"
        onPress={mockOnPress}
        disabled
      />
    );

    const button = getByText('Test Button');
    expect(button.parent.props.style).toMatchObject({
      opacity: 0.5,
    });

    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('renders with icon', () => {
    const { getByText, UNSAFE_getByType } = render(
      <PlatformButton
        title="Test Button"
        onPress={mockOnPress}
        icon="add"
      />
    );

    const icon = UNSAFE_getByType('MaterialIcons');
    expect(icon).toBeTruthy();
    expect(icon.props.name).toBe('add');
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByText } = render(
      <PlatformButton
        title="Test Button"
        onPress={mockOnPress}
        style={customStyle}
      />
    );

    const button = getByText('Test Button');
    expect(button.parent.props.style).toMatchObject(customStyle);
  });
}); 