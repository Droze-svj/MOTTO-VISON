describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp({delete: true});
  });
  it('should login with valid credentials', async () => {
    await element(by.id('login-email')).typeText('testuser@example.com');
    await element(by.id('login-password')).typeText('password123');
    await element(by.id('login-submit')).tap();
    await expect(element(by.text('Home'))).toBeVisible();
  });
  it('should show error with invalid credentials', async () => {
    await device.reloadReactNative();
    await element(by.id('login-email')).typeText('wrong@example.com');
    await element(by.id('login-password')).typeText('wrongpass');
    await element(by.id('login-submit')).tap();
    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });
}); 