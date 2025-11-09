import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestHelpers {
  static async takeScreenshot(page, testName, stepName) {
    const screenshotDir = path.join(process.cwd(), 'test-results', 'screenshots');

    const dirExists = fs.existsSync(screenshotDir);
    if (!dirExists) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${testName}_${stepName}_${timestamp}.png`;
    const filePath = path.join(screenshotDir, filename);

    await page.screenshot({ path: filename, fullPage: true });
    logger.info(`Screenshot saved: ${filename}`);

    return filePath;
  }

  static async clearBrowserCache(page) {
    logger.action('Clearing browser cache and session data...');

    const context = page.context();

    await context.clearCookies();
    logger.info('Cookies cleared');

    await page.evaluate(() => {
      const hasLocalStorage = window.localStorage;
      if (hasLocalStorage) {
        window.localStorage.clear();
      }

      const hasSessionStorage = window.sessionStorage;
      if (hasSessionStorage) {
        window.sessionStorage.clear();
      }

      const hasIndexedDB = window.indexedDB;
      if (hasIndexedDB) {
        window.indexedDB.databases().then(databases => {
          databases.forEach(db => {
            window.indexedDB.deleteDatabase(db.name);
          });
        }).catch(() => {});
      }

      const hasCaches = 'caches' in window;
      if (hasCaches) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        }).catch(() => {});
      }

      const hasServiceWorker = 'serviceWorker' in navigator;
      if (hasServiceWorker) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
          });
        }).catch(() => {});
      }
    });

    logger.info('Browser storage and cache cleared');

    await page.goto('about:blank');
    await page.waitForTimeout(500);

    logger.success('Browser cache clearing completed');
  }

  static async waitForElement(page, selector, timeout = 10000) {
    const elementFound = await page.waitForSelector(selector, { timeout }).then(() => true).catch(() => false);
    if (!elementFound) {
      logger.warning(`Element not found: ${selector}`);
    }
    return elementFound;
  }

  static async waitForElementToDisappear(page, selector, timeout = 10000) {
    const elementHidden = await page.waitForSelector(selector, { state: 'hidden', timeout }).then(() => true).catch(() => false);
    if (!elementHidden) {
      logger.warning(`Element still visible: ${selector}`);
    }
    return elementHidden;
  }

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

  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async clearBrowserData(context) {
    await context.clearCookies();
    await context.clearPermissions();
    logger.info('Browser data cleared');
  }

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

  static generateTestReport(testResults) {
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: testResults.length,
      passed: testResults.filter(r => r.status === 'passed').length,
      failed: testResults.filter(r => r.status === 'failed').length,
      results: testResults
    };

    const reportDir = path.join(process.cwd(), 'test-results', 'reports');
    const dirExists = fs.existsSync(reportDir);
    if (!dirExists) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportFile = path.join(reportDir, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    logger.success(`Test report generated: ${reportFile}`);
    return report;
  }

  static async logTestStep(stepName, details = '') {
    const timestamp = new Date().toISOString();
    const hasDetails = details;
    const message = `[${timestamp}] ${stepName}${hasDetails ? ': ' + details : ''}`;
    logger.step(stepName, details);
  }

  static async waitForNetworkIdle(page, timeout = 10000) {
    const networkIdleAchieved = await page.waitForLoadState('networkidle', { timeout }).then(() => true).catch(() => false);
    if (!networkIdleAchieved) {
      logger.warning('Network idle timeout reached');
    }
    return networkIdleAchieved;
  }

  static async getElementText(page, selector) {
    const element = page.locator(selector).first();
    const text = await element.textContent().catch(() => {
      logger.warning(`Could not get text from element: ${selector}`);
      return null;
    });
    return text;
  }

  static async isElementVisible(page, selector) {
    const element = page.locator(selector).first();
    const isVisible = await element.isVisible().catch(() => false);
    return isVisible;
  }

  static formatDuration(startTime, endTime) {
    const duration = endTime - startTime;
    return `${duration}ms`;
  }

  static async scrollIntoView(page, selector) {
    const scrollSuccessful = await page.locator(selector).scrollIntoViewIfNeeded().then(() => true).catch(() => {
      logger.warning(`Could not scroll to element: ${selector}`);
      return false;
    });
    return scrollSuccessful;
  }
}

export default TestHelpers;