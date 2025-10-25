import React from 'react';
import { Platform, Animated } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import PlatformModal from '../../components/platform/PlatformModal';

describe('PlatformModal', () => {
  const mockOnClose = jest.fn();
  const mockOnShow = jest.fn();
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnShow.mockClear();
    mockOnDismiss.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly on iOS', () => {
    Platform.OS = 'ios';
    const { getByTestId } = render(
      <PlatformModal
        visible={true}
        onClose={mockOnClose}
        presentationStyle="pageSheet"
      >
        <TestContent />
      </PlatformModal>
    );

    expect(getByTestId('modal-container')).toBeTruthy();
    expect(getByTestId('modal-handle')).toBeTruthy();
  });

  it('renders correctly on Android', () => {
    Platform.OS = 'android';
    const { getByTestId } = render(
      <PlatformModal
        visible={true}
        onClose={mockOnClose}
      >
        <TestContent />
      </PlatformModal>
    );

    expect(getByTestId('modal-container')).toBeTruthy();
  });

  it('handles visibility changes', () => {
    const { rerender, getByTestId } = render(
      <PlatformModal
        visible={false}
        onClose={mockOnClose}
      >
        <TestContent />
      </PlatformModal>
    );

    expect(getByTestId('modal-container').props.style.opacity).toBe(0);

    rerender(
      <PlatformModal
        visible={true}
        onClose={mockOnClose}
      >
        <TestContent />
      </PlatformModal>
    );

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(getByTestId('modal-container').props.style.opacity).toBe(1);
  });

  it('handles close event', () => {
    const { getByTestId } = render(
      <PlatformModal
        visible={true}
        onClose={mockOnClose}
      >
        <TestContent />
      </PlatformModal>
    );

    fireEvent.press(getByTestId('modal-overlay'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles show and dismiss events', () => {
    const { rerender } = render(
      <PlatformModal
        visible={false}
        onClose={mockOnClose}
        onShow={mockOnShow}
        onDismiss={mockOnDismiss}
      >
        <TestContent />
      </PlatformModal>
    );

    rerender(
      <PlatformModal
        visible={true}
        onClose={mockOnClose}
        onShow={mockOnShow}
        onDismiss={mockOnDismiss}
      >
        <TestContent />
      </PlatformModal>
    );

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnShow).toHaveBeenCalledTimes(1);

    rerender(
      <PlatformModal
        visible={false}
        onClose={mockOnClose}
        onShow={mockOnShow}
        onDismiss={mockOnDismiss}
      >
        <TestContent />
      </PlatformModal>
    );

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('handles pan gesture on iOS', () => {
    Platform.OS = 'ios';
    const { getByTestId } = render(
      <PlatformModal
        visible={true}
        onClose={mockOnClose}
        presentationStyle="pageSheet"
      >
        <TestContent />
      </PlatformModal>
    );

    const container = getByTestId('modal-container');
    fireEvent(container, 'onPanResponderMove', {
      nativeEvent: { pageY: 100 },
    });

    expect(container.props.style.transform[0].translateY).toBeDefined();
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <PlatformModal
        visible={true}
        onClose={mockOnClose}
        style={customStyle}
      >
        <TestContent />
      </PlatformModal>
    );

    expect(getByTestId('modal-container').props.style).toMatchObject(customStyle);
  });

  it('handles safe area insets', () => {
    const { getByTestId } = render(
      <PlatformModal
        visible={true}
        onClose={mockOnClose}
      >
        <TestContent />
      </PlatformModal>
    );

    expect(getByTestId('modal-container').props.style.paddingBottom).toBeDefined();
  });

  it('renders with different presentation styles', () => {
    const { rerender, getByTestId } = render(
      <PlatformModal
        visible={true}
        onClose={mockOnClose}
        presentationStyle="fullScreen"
      >
        <TestContent />
      </PlatformModal>
    );

    expect(getByTestId('modal-container').props.style.borderTopLeftRadius).toBe(0);

    rerender(
      <PlatformModal
        visible={true}
        onClose={mockOnClose}
        presentationStyle="pageSheet"
      >
        <TestContent />
      </PlatformModal>
    );

    expect(getByTestId('modal-container').props.style.borderTopLeftRadius).toBe(12);
  });
});

// Test content component
const TestContent = () => (
  <div data-testid="test-content">Test Content</div>
); 