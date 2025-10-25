describe('Collaboration Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  it('should invite a collaborator', async () => {
    await element(by.id('tab-collaboration')).tap();
    await element(by.id('invite-collaborator-input')).typeText('collab@example.com');
    await element(by.id('invite-collaborator-submit')).tap();
    await expect(element(by.text('Invitation sent'))).toBeVisible();
  });
}); 