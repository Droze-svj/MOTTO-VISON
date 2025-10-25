import React from 'react';
import { render } from '@testing-library/react-native';
import { axe } from 'jest-axe';
import SettingsScreen from '../../screens/SettingsScreen';

// Mock navigation prop
const navigation = { reset: jest.fn() };

describe('SettingsScreen Accessibility', () => {
  it('should have no basic accessibility violations', async () => {
    const { container, getAllByA11yRole, getAllByA11yLabel } = render(<SettingsScreen navigation={navigation} />);
    // Run axe accessibility checks
    const results = await axe(container);
    expect(results).toHaveNoViolations();

    // Check that all switches have accessibilityRole and accessibilityLabel
    const switches = getAllByA11yRole('switch');
    switches.forEach(sw => {
      expect(sw.props.accessibilityLabel).toBeTruthy();
    });

    // Check that all buttons have accessibilityRole and accessibilityLabel
    const buttons = getAllByA11yRole('button');
    buttons.forEach(btn => {
      expect(btn.props.accessibilityLabel).toBeTruthy();
    });
  });
}); 