describe('Tasks Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  it('should add and complete a task', async () => {
    await element(by.id('tab-tasks')).tap();
    await element(by.id('add-task-input')).typeText('Buy milk');
    await element(by.id('add-task-submit')).tap();
    await expect(element(by.text('Buy milk'))).toBeVisible();
    await element(by.id('task-checkbox-Buy milk')).tap();
    await expect(element(by.id('task-checkbox-Buy milk'))).toHaveLabel('completed');
  });
}); 