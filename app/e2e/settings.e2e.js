describe('Settings Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  it('should toggle dark mode in settings', async () => {
    await element(by.id('tab-settings')).tap();
    await element(by.id('toggle-dark-mode')).tap();
    await expect(element(by.id('app-theme'))).toHaveLabel('dark');
    await element(by.id('toggle-dark-mode')).tap();
    await expect(element(by.id('app-theme'))).toHaveLabel('light');
  });
}); 