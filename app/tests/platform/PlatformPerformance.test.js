import React from 'react';
import { Platform, Animated } from 'react-native';
import { render, act } from '@testing-library/react-native';
import PlatformButton from '../../components/platform/PlatformButton';
import PlatformNavigation from '../../components/platform/PlatformNavigation';
import PlatformModal from '../../components/platform/PlatformModal';

describe('Platform Performance Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('PlatformButton Performance', () => {
    it('renders within performance budget', () => {
      const startTime = performance.now();
      
      render(
        <PlatformButton
          title="Test Button"
          onPress={() => {}}
          variant="primary"
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(16); // 60fps = 16ms per frame
    });

    it('handles rapid state changes efficiently', () => {
      const { rerender } = render(
        <PlatformButton
          title="Test Button"
          onPress={() => {}}
          variant="primary"
        />
      );

      const iterations = 100;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        act(() => {
          rerender(
            <PlatformButton
              title={`Test Button ${i}`}
              onPress={() => {}}
              variant={i % 2 === 0 ? 'primary' : 'secondary'}
            />
          );
        });
      }

      const endTime = performance.now();
      const averageTime = (endTime - startTime) / iterations;
      
      expect(averageTime).toBeLessThan(1); // Less than 1ms per update
    });
  });

  describe('PlatformNavigation Performance', () => {
    it('handles scroll performance', () => {
      const animatedValue = new Animated.Value(0);
      const { getByTestId } = render(
        <PlatformNavigation
          title="Test Title"
          animatedValue={animatedValue}
        />
      );

      const startTime = performance.now();
      
      act(() => {
        Animated.timing(animatedValue, {
          toValue: 100,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      });

      const endTime = performance.now();
      const animationTime = endTime - startTime;
      
      expect(animationTime).toBeLessThan(50); // Should start animation within 50ms
    });

    it('handles theme changes efficiently', () => {
      const { rerender } = render(
        <PlatformNavigation
          title="Test Title"
          backgroundColor="#FFFFFF"
        />
      );

      const iterations = 50;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        act(() => {
          rerender(
            <PlatformNavigation
              title="Test Title"
              backgroundColor={i % 2 === 0 ? '#FFFFFF' : '#000000'}
            />
          );
        });
      }

      const endTime = performance.now();
      const averageTime = (endTime - startTime) / iterations;
      
      expect(averageTime).toBeLessThan(1); // Less than 1ms per theme change
    });
  });

  describe('PlatformModal Performance', () => {
    it('handles modal transitions efficiently', () => {
      const { rerender } = render(
        <PlatformModal
          visible={false}
          onClose={() => {}}
        >
          <TestContent />
        </PlatformModal>
      );

      const startTime = performance.now();

      act(() => {
        rerender(
          <PlatformModal
            visible={true}
            onClose={() => {}}
          >
            <TestContent />
          </PlatformModal>
        );
      });

      const endTime = performance.now();
      const transitionTime = endTime - startTime;
      
      expect(transitionTime).toBeLessThan(100); // Should start transition within 100ms
    });

    it('handles gesture performance', () => {
      const { getByTestId } = render(
        <PlatformModal
          visible={true}
          onClose={() => {}}
          presentationStyle="pageSheet"
        >
          <TestContent />
        </PlatformModal>
      );

      const container = getByTestId('modal-container');
      const gestureEvents = Array.from({ length: 50 }, (_, i) => ({
        nativeEvent: { pageY: i * 2 }
      }));

      const startTime = performance.now();

      gestureEvents.forEach(event => {
        act(() => {
          fireEvent(container, 'onPanResponderMove', event);
        });
      });

      const endTime = performance.now();
      const averageTime = (endTime - startTime) / gestureEvents.length;
      
      expect(averageTime).toBeLessThan(1); // Less than 1ms per gesture event
    });
  });

  describe('Memory Usage', () => {
    it('maintains stable memory usage during component lifecycle', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      const { unmount } = render(
        <PlatformButton
          title="Test Button"
          onPress={() => {}}
        />
      );

      const afterRenderMemory = process.memoryUsage().heapUsed;
      expect(afterRenderMemory - initialMemory).toBeLessThan(1024 * 1024); // Less than 1MB increase

      unmount();
      
      const afterUnmountMemory = process.memoryUsage().heapUsed;
      expect(afterUnmountMemory - initialMemory).toBeLessThan(1024 * 512); // Less than 512KB difference
    });
  });
});

// Test content component
const TestContent = () => (
  <div data-testid="test-content">Test Content</div>
); 