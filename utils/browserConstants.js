/**
 * Browser Constants for Stealth Configuration
 * Contains all the constants used for anti-detection and browser stealth
 */

class BrowserConstants {
  static URLS = {
    GMAIL: 'https://mail.google.com',
    GMAIL_INBOX: 'https://mail.google.com/mail/u/0/#inbox'
  };

  static CHROME_OBJECT = {
    runtime: {
      onConnect: undefined,
      onMessage: undefined
    },
    app: {
      isInstalled: false
    },
    webstore: {
      onInstallStageChanged: undefined,
      onDownloadProgress: undefined
    }
  };

  static PLUGINS = [
    {
      0: {
        type: "application/x-google-chrome-pdf",
        suffixes: "pdf",
        description: "Portable Document Format"
      },
      description: "Portable Document Format",
      filename: "internal-pdf-viewer",
      length: 1,
      name: "Chrome PDF Plugin"
    },
    {
      0: {
        type: "application/pdf",
        suffixes: "pdf",
        description: "Portable Document Format"
      },
      description: "Portable Document Format",
      filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
      length: 1,
      name: "Chrome PDF Viewer"
    }
  ];

  static LANGUAGES = ['en-US', 'en', 'en-GB'];

  static SCREEN = {
    colorDepth: 24
  };

  static BATTERY = {
    charging: true,
    chargingTime: 0,
    dischargingTime: Infinity,
    level: 1
  };

  static USER_AGENT_DATA = {
    brands: [
      { brand: "Google Chrome", version: "120" },
      { brand: "Not:A-Brand", version: "99" },
      { brand: "Chromium", version: "120" }
    ],
    mobile: false,
    platform: "Windows"
  };

  static AUTOMATION_INDICATORS = [
    '__driver_evaluate',
    '__webdriver_evaluate',
    '__selenium_evaluate',
    '__fxdriver_evaluate',
    '__driver_unwrapped',
    '__webdriver_unwrapped',
    '__selenium_unwrapped',
    '__fxdriver_unwrapped',
    '_Selenium_IDE_Recorder',
    '_selenium',
    'calledSelenium',
    '_WEBDRIVER_ELEM_CACHE',
    'ChromeDriverw',
    'driver-evaluate',
    'webdriver-evaluate',
    'selenium-evaluate',
    'webdriverCommand',
    'webdriver-evaluate-response'
  ];

  static HTTP_HEADERS = {
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document'
  };

  static TYPING_DELAYS = {
    EMAIL: { min: 0, max: 1 },
    PASSWORD: { min: 0, max: 1 },
    TOTP: { min: 0, max: 1 }
  };

  static TIMEOUTS = {
    NAVIGATION: 30000,
    ELEMENT_WAIT: 5000,
    NETWORK_IDLE: 10000,
    LOGIN_VERIFICATION: 15000,
    TWO_FA_VERIFICATION: 10000
  };
}

export default BrowserConstants;