# Motto

![CI](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/test.yml/badge.svg)
![Coverage](https://img.shields.io/codecov/c/github/YOUR_ORG/YOUR_REPO)
![License](https://img.shields.io/github/license/YOUR_ORG/YOUR_REPO)

# MOTTO App (React Native)

This folder will contain the React Native code for the cross-platform Personal AI assistant.

## Setup

Initialize the app with:

```
npx react-native init MottoApp
```

Then follow the main README for further instructions. 

# Accessibility Guidelines

## Why Accessibility Matters
Accessibility ensures Motto is usable by everyone, including people with disabilities. It improves usability, compliance, and user satisfaction.

## Best Practices
- **All interactive elements** (Button, Touchable, Input, Switch, Modal, etc.) must have:
  - `accessible={true}`
  - `accessibilityRole` (e.g., "button", "switch", "dialog", "header", "alert")
  - `accessibilityLabel` (clear, descriptive)
  - `accessibilityHint` (explains what happens if not obvious)
- **Error messages and alerts:** Use `accessibilityRole="alert"` so screen readers announce them.
- **Section headers:** Use `accessibilityRole="header"` for section titles.
- **Decorative icons:** Use `accessibilityElementsHidden` or `importantForAccessibility="no"`.
- **Color contrast:** All text and UI elements should meet WCAG AA contrast ratios (4.5:1 for normal text). Use theme variables for all colors.
- **Font size:** Allow users to adjust font size (see onboarding step).
- **Keyboard navigation (web/desktop):** Ensure all interactive elements are reachable and usable via keyboard.
- **Focus management:** When opening modals/dialogs, set focus to the first interactive element. Return focus to the triggering element when closing.

## Accessibility Checklist for New Features/Components
- [ ] All interactive elements have `accessibilityRole`, `accessibilityLabel`, and (if needed) `accessibilityHint`.
- [ ] Section headers use `accessibilityRole="header"`.
- [ ] Error messages/alerts use `accessibilityRole="alert"`.
- [ ] All colors use theme variables and meet contrast requirements.
- [ ] Decorative icons/images are hidden from screen readers.
- [ ] Tested with a screen reader (VoiceOver, TalkBack, NVDA, etc.).
- [ ] Automated accessibility test (jest-axe or similar) passes.
- [ ] Keyboard navigation works (if web/desktop).
- [ ] Focus is managed for modals/dialogs.

## Testing Accessibility
- Use `@testing-library/react-native` and `jest-axe` for automated accessibility tests.
- Run `npm test` or `yarn test` to check for accessibility violations.
- Manually test with screen readers and keyboard navigation.

## Code Examples
```jsx
<Button
  title="Save"
  onPress={handleSave}
  accessibilityLabel="Save changes"
  accessibilityHint="Saves your profile changes"
/>

<TouchableOpacity
  onPress={openSettings}
  accessibilityRole="button"
  accessibilityLabel="Open settings"
  accessibilityHint="Opens the settings screen"
>
  <Ionicons name="settings" ... />
</TouchableOpacity>

<Text accessibilityRole="alert">
  {errorMessage}
</Text>

<Modal
  visible={showModal}
  accessibilityRole="dialog"
  accessibilityLabel="Profile settings dialog"
  accessibilityHint="Edit your profile information"
  ...
/>
```

## Review Process
- All PRs must be reviewed for accessibility as part of code review.
- Use the checklist above for every new feature or component.
- If in doubt, ask for an accessibility review from another team member. 