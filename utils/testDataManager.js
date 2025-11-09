import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestDataManager {
  constructor() {
    this.configPath = path.join(__dirname, '../data/config.json');
    this.testData = null;
    this.loadTestData();
  }

  loadTestData() {
    const rawData = fs.readFileSync(this.configPath, 'utf8');
    this.testData = JSON.parse(rawData);
  }

  getValidCredentials() {
    return {
      email: this.testData.credentials.valid.email,
      password: this.testData.credentials.valid.password,
      totpKey: this.testData.credentials.valid.totpKey
    };
  }

  getTotpKey() {
    const credentials = this.getValidCredentials();
    return credentials.totpKey;
  }

  getInvalidCredentials() {
    return {
      email: this.testData.credentials.invalid.email,
      password: this.testData.credentials.invalid.password
    };
  }

  getEmailData(emailKey) {
    const emailExists = this.testData.emails[emailKey];
    if (!emailExists) {
      throw new Error(`Email data not found for key: ${emailKey}`);
    }
    return this.testData.emails[emailKey];
  }

  getAllEmailData() {
    return this.testData.emails;
  }

  getGmailUrl() {
    return this.testData.urls.gmail;
  }

  getTimeouts() {
    return this.testData.timeouts;
  }

  generateRandomEmail() {
    const timestamp = Date.now();
    return {
      recipient: `test${timestamp}@example.com`,
      subject: `Test Email - ${timestamp}`,
      body: `This is a test email generated at ${new Date().toISOString()}`
    };
  }

  validateCredentials(credentials) {
    const hasEmailAndPassword = credentials.email && credentials.password;
    if (!hasEmailAndPassword) {
      throw new Error('Email and password are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailFormatValid = emailRegex.test(credentials.email);
    if (!emailFormatValid) {
      throw new Error('Invalid email format');
    }

    return true;
  }

  getTestEnvironment() {
    return {
      headless: process.env.HEADLESS === 'true',
      slowMo: parseInt(process.env.SLOW_MO) || 0,
      timeout: parseInt(process.env.TEST_TIMEOUT) || this.testData.timeouts.long || 30000,
      navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT) || 30000,
      elementTimeout: parseInt(process.env.ELEMENT_TIMEOUT) || 15000,
      debugMode: process.env.DEBUG_MODE === 'true',
      captureScreenshots: process.env.CAPTURE_SCREENSHOTS !== 'false',
      captureVideos: process.env.CAPTURE_VIDEOS !== 'false',
      parallelWorkers: parseInt(process.env.PARALLEL_WORKERS) || 1,
      retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 1,
      browserType: process.env.BROWSER_TYPE || 'chromium',
      viewportWidth: parseInt(process.env.VIEWPORT_WIDTH) || 1280,
      viewportHeight: parseInt(process.env.VIEWPORT_HEIGHT) || 720,
      networkTimeout: parseInt(process.env.NETWORK_TIMEOUT) || 30000,
      ignoreHttpsErrors: process.env.IGNORE_HTTPS_ERRORS === 'true'
    };
  }

  printConfigSummary() {
    const credentials = this.getValidCredentials();

    logger.info('Test Configuration Summary:');
    logger.info('==============================');
    logger.info(`Email: ${credentials.email}`);
    logger.info(`Password: ${'*'.repeat(credentials.password.length)}`);
    logger.info(`TOTP Key: ${credentials.totpKey ? 'Configured' : 'Missing'}`);
    logger.info(`Gmail URL: ${this.getGmailUrl()}`);
    logger.info('==============================');
  }
}

export default TestDataManager;