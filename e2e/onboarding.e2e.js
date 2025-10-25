describe('Onboarding Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  it('should complete onboarding', async () => {
    await element(by.text('Get Started')).tap();
    for (let i = 0; i < 5; i++) {
      await element(by.text('Next')).tap();
    }
    await expect(element(by.text("You're all set!"))).toBeVisible();
  });
  it('should allow skipping all steps', async () => {
    await device.reloadReactNative();
    await element(by.text('Get Started')).tap();
    for (let i = 0; i < 5; i++) {
      await element(by.label('Skip step')).tap();
    }
    await expect(element(by.text("You're all set!"))).toBeVisible();
  });
}); 