import fs from 'fs';
import path from 'path';
import logger from './logger.js';

/**
 * TestRecordingHelpers - Methods specifically for Playwright test recording,
 * screenshots, traces, and test execution documentation
 */
class TestRecordingHelpers {
  /**
   * Take screenshot for test recording and debugging
   * Integrates with Playwright's screenshot recording functionality
   */
  static async takeScreenshot(page, testName, stepName) {
    const screenshotDir = path.join(process.cwd(), 'test-results', 'screenshots');

    const dirExists = fs.existsSync(screenshotDir);
    if (!dirExists) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${testName}_${stepName}_${timestamp}.png`;
    const filePath = path.join(screenshotDir, filename);

    await page.screenshot({ path: filePath, fullPage: true });
    logger.info(`Screenshot saved: ${filename}`);

    return filePath;
  }

  /**
   * Simple screenshot with filename for quick debugging
   * Compatible with Playwright test recording
   */
  static async takeQuickScreenshot(page, filename) {
    const screenshotPath = `test-results/screenshots/${filename}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  }

  /**
   * Log test steps with timestamps for trace recording
   * Integrates with Playwright's trace viewer and HTML reports
   */
  static async logTestStep(stepName, details = '') {
    const timestamp = new Date().toISOString();
    const hasDetails = details;
    const message = `[${timestamp}] ${stepName}${hasDetails ? ': ' + details : ''}`;
    logger.step(stepName, details);
  }

  /**
   * Generate test execution report
   * Creates JSON reports for test recording analysis
   */
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

  /**
   * Wait for network idle - essential for recording accurate test timing
   * Ensures page loads are complete before recording next steps
   */
  static async waitForNetworkIdle(page, timeout = 10000) {
    const networkIdleAchieved = await page.waitForLoadState('networkidle', { timeout }).then(() => true).catch(() => false);
    if (!networkIdleAchieved) {
      logger.warning('Network idle timeout reached');
    }
    return networkIdleAchieved;
  }

  /**
   * Format test duration for recording reports
   */
  static formatDuration(startTime, endTime) {
    const duration = endTime - startTime;
    return `${duration}ms`;
  }

  /**
   * Get current timestamp for recording file naming
   */
  static getCurrentTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * Clear browser cache for test isolation and recording consistency
   */
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
}

export default TestRecordingHelpers;