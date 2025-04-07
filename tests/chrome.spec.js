// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Chrome Extension Tests', () => {
  test('should load the extension popup', async ({ page, context }) => {
    // Get the extension background page
    const backgroundPages = context.backgroundPages();
    expect(backgroundPages.length).toBeGreaterThan(0);
    
    // Get the extension ID
    const extensionId = backgroundPages[0].url().split('/')[2];
    
    // Navigate to the extension popup
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // Take a screenshot
    await page.screenshot({ path: 'artifacts/screenshots/popup.png' });
    
    // Verify the popup loaded correctly
    await expect(page.locator('h1')).toContainText('Browser History Tracker');
  });
  
  test('should load the options page', async ({ page, context }) => {
    // Get the extension background page
    const backgroundPages = context.backgroundPages();
    expect(backgroundPages.length).toBeGreaterThan(0);
    
    // Get the extension ID
    const extensionId = backgroundPages[0].url().split('/')[2];
    
    // Navigate to the options page
    await page.goto(`chrome-extension://${extensionId}/options.html`);
    
    // Take a screenshot
    await page.screenshot({ path: 'artifacts/screenshots/options.png' });
    
    // Verify the options page loaded correctly
    await expect(page.locator('h1')).toContainText('Browser History Tracker Settings');
    
    // Test device ID regeneration
    const deviceIdBefore = await page.inputValue('#device-id');
    await page.click('#regenerate-device-id');
    const deviceIdAfter = await page.inputValue('#device-id');
    expect(deviceIdBefore).not.toEqual(deviceIdAfter);
    
    // Test key generation
    await page.click('#generate-new-keys');
    const publicKey = await page.inputValue('#public-key');
    const privateKey = await page.inputValue('#private-key');
    expect(publicKey).not.toBe('');
    expect(privateKey).not.toBe('');
    
    // Test saving settings
    await page.fill('#expiration-days', '60');
    await page.click('#save-settings');
    
    // Verify status message
    await expect(page.locator('#status-message')).toContainText('Settings saved successfully');
  });
  
  test('should track browser history', async ({ page, context }) => {
    // Navigate to a test page
    await page.goto('https://example.com');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Get the extension background page
    const backgroundPages = context.backgroundPages();
    expect(backgroundPages.length).toBeGreaterThan(0);
    
    // Get the extension ID
    const extensionId = backgroundPages[0].url().split('/')[2];
    
    // Navigate to the extension popup
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // Take a screenshot
    await page.screenshot({ path: 'artifacts/screenshots/history.png' });
    
    // Wait for history to load
    await page.waitForTimeout(1000);
  });
  
  test('should test multiple extensions simultaneously', async ({ browser }) => {
    // Create two contexts with the extension loaded
    const context1 = await browser.newContext({
      permissions: ['history', 'storage', 'tabs']
    });
    const context2 = await browser.newContext({
      permissions: ['history', 'storage', 'tabs']
    });
    
    // Create pages in each context
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Get the extension background pages
    const backgroundPages1 = context1.backgroundPages();
    const backgroundPages2 = context2.backgroundPages();
    
    expect(backgroundPages1.length).toBeGreaterThan(0);
    expect(backgroundPages2.length).toBeGreaterThan(0);
    
    // Get the extension IDs
    const extensionId1 = backgroundPages1[0].url().split('/')[2];
    const extensionId2 = backgroundPages2[0].url().split('/')[2];
    
    // Navigate to different sites in each context
    await page1.goto('https://example.com');
    await page2.goto('https://mozilla.org');
    
    // Wait for pages to load
    await page1.waitForLoadState('networkidle');
    await page2.waitForLoadState('networkidle');
    
    // Navigate to the extension popups
    await page1.goto(`chrome-extension://${extensionId1}/popup.html`);
    await page2.goto(`chrome-extension://${extensionId2}/popup.html`);
    
    // Take screenshots
    await page1.screenshot({ path: 'artifacts/screenshots/multi-extension-1.png' });
    await page2.screenshot({ path: 'artifacts/screenshots/multi-extension-2.png' });
    
    // Close contexts
    await context1.close();
    await context2.close();
  });
});