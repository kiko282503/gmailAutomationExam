import logger from './logger.js';

/**
 * TestHelpers - General test utility methods for Playwright tests
 * Not specific to recording, but essential for test functionality
 */
class TestHelpers {
  /**
   * Generate random string for test data
   */
  static generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Wait for element to appear - core Playwright functionality
   */
  static async waitForElement(page, selector, timeout = 10000) {
    const elementFound = await page.waitForSelector(selector, { timeout }).then(() => true).catch(() => false);
    if (!elementFound) {
      logger.warning(`Element not found: ${selector}`);
    }
    return elementFound;
  }

  /**
   * Wait for element to disappear - useful for loading states
   */
  static async waitForElementToDisappear(page, selector, timeout = 10000) {
    const elementHidden = await page.waitForSelector(selector, { state: 'hidden', timeout }).then(() => true).catch(() => false);
    if (!elementHidden) {
      logger.warning(`Element still visible: ${selector}`);
    }
    return elementHidden;
  }

  /**
   * Retry action with exponential backoff - essential for flaky tests
   */
  static async retryAction(action, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      const actionSucceeded = await action().then(() => true).catch((error) => {
        const isLastAttempt = i === maxRetries - 1;
        if (isLastAttempt) {
          throw error;
        }
        logger.warning(`Action failed, retrying... (${i + 1}/${maxRetries})`);
        return false;
      });

      if (actionSucceeded) {
        return;
      }

      await this.sleep(delay);
    }
  }

  /**
   * Get element text content safely
   */
  static async getElementText(page, selector) {
    const element = page.locator(selector).first();
    const text = await element.textContent().catch(() => {
      logger.warning(`Could not get text from element: ${selector}`);
      return null;
    });
    return text;
  }

  /**
   * Check if element is visible
   */
  static async isElementVisible(page, selector) {
    const element = page.locator(selector).first();
    const isVisible = await element.isVisible().catch(() => false);
    return isVisible;
  }

  /**
   * Scroll element into view if needed
   */
  static async scrollIntoView(page, selector) {
    const scrollSuccessful = await page.locator(selector).scrollIntoViewIfNeeded().then(() => true).catch(() => {
      logger.warning(`Could not scroll to element: ${selector}`);
      return false;
    });
    return scrollSuccessful;
  }

  /**
   * Click element safely with wait
   */
  static async clickElementSafely(page, selector, timeout = 10000) {
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
  }

  /**
   * Wait for page load to complete
   */
  static async waitForPageLoad(page, timeout = 30000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Sleep utility
   */
  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle browser dialogs
   */
  static async handleDialog(page, accept = true) {
    page.on('dialog', async dialog => {
      logger.info(`Dialog appeared: ${dialog.message()}`);
      const shouldAccept = accept;
      if (shouldAccept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Handle alerts specifically
   */
  static async handleAlert(page, action = 'accept') {
    page.on('dialog', async dialog => {
      if (action === 'accept') {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Log test steps - currently used methods need to stay
   */
  static async logTestStep(stepName, details = '') {
    const timestamp = new Date().toISOString();
    const hasDetails = details;
    const message = `[${timestamp}] ${stepName}${hasDetails ? ': ' + details : ''}`;
    logger.step(stepName, details);
  }

  /**
   * Format test duration - currently used method
   */
  static formatDuration(startTime, endTime) {
    const duration = endTime - startTime;
    return `${duration}ms`;
  }
}

export default TestHelpers;