import { chromium, firefox, webkit } from '@playwright/test';

export class BrowserManager {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.browserType = 'chromium';
  }

  async initializeBrowser(options = {}) {
    const defaultOptions = {
      headless: false,
      viewport: { width: 1280, height: 720 },
      args: [
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--disable-dev-shm-usage'
      ],
      ...options
    };

    switch (this.browserType.toLowerCase()) {
      case 'firefox':
        this.browser = await firefox.launch(defaultOptions);
        break;
      case 'webkit':
        this.browser = await webkit.launch(defaultOptions);
        break;
      default:
        this.browser = await chromium.launch(defaultOptions);
    }

    this.context = await this.browser.newContext({
      viewport: defaultOptions.viewport,
      ignoreHTTPSErrors: true,
      recordVideo: {
        dir: 'test-results/videos/',
        size: defaultOptions.viewport
      }
    });

    this.page = await this.context.newPage();
    
    await this.page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });

    return this.page;
  }

  async createNewPage() {
    if (!this.context) {
      await this.initializeBrowser();
    }
    return await this.context.newPage();
  }

  async closePage() {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
  }

  async closeContext() {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async clearBrowserData() {
    if (this.context) {
      await this.context.clearCookies();
      await this.context.clearPermissions();
    }
  }

  async takeFullPageScreenshot(filename) {
    if (this.page) {
      const screenshotPath = `test-results/screenshots/${filename}-${Date.now()}.png`;
      await this.page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      return screenshotPath;
    }
    return null;
  }

  async enableSlowMotion(delay = 100) {
    if (this.page) {
      await this.page.setDefaultTimeout(30000);
      await this.page.setDefaultNavigationTimeout(60000);
    }
  }

  setBrowserType(type) {
    this.browserType = type;
  }

  getBrowserType() {
    return this.browserType;
  }

  isInitialized() {
    return this.browser !== null && this.context !== null && this.page !== null;
  }

  async waitForNetworkIdle(timeout = 10000) {
    if (this.page) {
      await this.page.waitForLoadState('networkidle', { timeout });
    }
  }

  async setViewportSize(width, height) {
    if (this.page) {
      await this.page.setViewportSize({ width, height });
    }
  }

  async emulateDevice(device) {
    if (this.context && device) {
      await this.context.close();
      this.context = await this.browser.newContext({
        ...device,
        ignoreHTTPSErrors: true
      });
      this.page = await this.context.newPage();
    }
  }
}