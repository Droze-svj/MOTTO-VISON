describe('Notifications Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  it('should enable notifications', async () => {
    await element(by.id('tab-notifications')).tap();
    await element(by.id('enable-notifications')).tap();
    await expect(element(by.text('Notifications enabled'))).toBeVisible();
  });
}); 