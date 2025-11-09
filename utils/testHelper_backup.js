export class TestHelper {
  static async waitForPageLoad(page, timeout = 30000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static async takeScreenshot(page, filename) {
    const screenshotPath = `test-results/screenshots/${filename}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  }

  static generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static getCurrentTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  static async handleAlert(page, action = 'accept') {
    page.on('dialog', async dialog => {
      if (action === 'accept') {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  static async waitForElement(page, selector, timeout = 10000) {
    await page.waitForSelector(selector, { timeout, state: 'visible' });
  }

  static async isElementVisible(page, selector) {
    const element = page.locator(selector);
    return await element.isVisible();
  }

  static async clickElementSafely(page, selector, timeout = 10000) {
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
  }
}