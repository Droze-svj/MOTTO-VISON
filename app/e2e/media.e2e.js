describe('Media Feed Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  it('should upload and display a photo', async () => {
    await element(by.id('tab-media')).tap();
    await element(by.id('upload-photo')).tap();
    // Simulate photo picker (may require mocking in CI)
    await element(by.text('Choose Photo')).tap();
    await element(by.text('SamplePhoto.jpg')).tap();
    await expect(element(by.id('media-photo-SamplePhoto.jpg'))).toBeVisible();
  });
}); 