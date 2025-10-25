describe('Profile Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  it('should update display name', async () => {
    await element(by.id('tab-profile')).tap();
    await element(by.id('edit-profile')).tap();
    await element(by.id('profile-display-name')).clearText();
    await element(by.id('profile-display-name')).typeText('New Name');
    await element(by.id('save-profile')).tap();
    await expect(element(by.text('Profile updated successfully'))).toBeVisible();
    await expect(element(by.id('profile-display-name'))).toHaveText('New Name');
  });
}); 