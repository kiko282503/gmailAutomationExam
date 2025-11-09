/**
 * Application Constants
 * Centralized storage for all constant values used throughout the Gmail automation project
 * Organized by category for easy maintenance and consistency
 */

// ==================== URLs ==================== //
export const URLS = {
  // Gmail URLs
  GMAIL_BASE: 'https://mail.google.com',
  GMAIL_INBOX: 'https://mail.google.com/mail/u/0/#inbox',
  
  // Google Account URLs
  GOOGLE_ACCOUNTS: 'https://accounts.google.com',
  GOOGLE_LOGIN: 'https://accounts.google.com/signin',
  GOOGLE_LOGOUT: 'https://accounts.google.com/logout',
  
  // Special URLs
  BLANK_PAGE: 'about:blank'
};

// ==================== TIMEOUTS ==================== //
export const TIMEOUTS = {
  // Element Wait Timeouts (milliseconds)
  ELEMENT_WAIT: 5000,
  ELEMENT_WAIT_SHORT: 2000,
  ELEMENT_WAIT_MEDIUM: 10000,
  ELEMENT_WAIT_LONG: 15000,
  ELEMENT_WAIT_EXTRA_LONG: 20000,
  
  // Navigation Timeouts
  NAVIGATION: 30000,
  NAVIGATION_SHORT: 10000,
  PAGE_LOAD: 60000,
  
  // Network and Loading
  NETWORK_IDLE: 10000,
  NETWORK_IDLE_SHORT: 5000,
  LOAD_STATE: 15000,
  
  // Authentication Timeouts
  LOGIN_VERIFICATION: 15000,
  TWO_FA_VERIFICATION: 10000,
  TWO_FA_WAIT: 30000,
  
  // Action Timeouts
  ACTION_DEFAULT: 30000,
  ACTION_SHORT: 5000,
  CLICK_TIMEOUT: 5000,
  
  // Playwright Test Timeouts
  TEST_TIMEOUT: 120000,
  TEST_TIMEOUT_EXTENDED: 180000,
  
  // Retry Delays
  RETRY_DELAY: 1000,
  RETRY_DELAY_SHORT: 500,
  RETRY_DELAY_LONG: 2000,
  
  // Human-like Delays
  TYPING_DELAY_MIN: 1,
  TYPING_DELAY_MAX: 50,
  MOUSE_MOVE_DELAY: 100,
  FORM_FIELD_DELAY: 300,
  BUTTON_CLICK_DELAY: 200,
  
  // Page Transition Delays
  PAGE_TRANSITION: 1500,
  COMPOSE_WINDOW_WAIT: 2000,
  INBOX_REFRESH_WAIT: 3000,
  LOGOUT_COMPLETION: 3000
};

// ==================== BROWSER SETTINGS ==================== //
export const BROWSER = {
  // Viewport Settings
  VIEWPORT: {
    width: 1280,
    height: 720
  },
  
  // User Agent
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  
  // Browser Launch Options
  LAUNCH_OPTIONS: {
    headless: false,
    slowMo: 50,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  },
  
  // Headers
  HEADERS: {
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  }
};

// ==================== LOAD STATES ==================== //
export const LOAD_STATES = {
  NETWORK_IDLE: 'networkidle',
  DOM_CONTENT_LOADED: 'domcontentloaded',
  LOAD: 'load'
};

// ==================== KEYBOARD SHORTCUTS ==================== //
export const KEYBOARD = {
  CTRL_A: 'Control+A',
  CTRL_ENTER: 'Control+Enter',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  DELETE: 'Delete',
  TAB: 'Tab',
  BACKSPACE: 'Backspace'
};

// ==================== MOUSE ACTIONS ==================== //
export const MOUSE = {
  // Mouse movement ranges for human-like behavior
  MOVEMENT_RANGE_SMALL: {
    x: { min: 100, max: 200 },
    y: { min: 100, max: 200 }
  },
  MOVEMENT_RANGE_LARGE: {
    x: { min: 200, max: 400 },
    y: { min: 200, max: 400 }
  }
};

// ==================== RETRY SETTINGS ==================== //
export const RETRY = {
  MAX_ATTEMPTS: 3,
  MAX_ATTEMPTS_EXTENDED: 5,
  TWO_FA_MAX_ATTEMPTS: 3,
  TOTP_GENERATION_ATTEMPTS: 1,
  
  // Retry intervals
  INTERVAL_SHORT: 500,
  INTERVAL_MEDIUM: 1000,
  INTERVAL_LONG: 2000,
  INTERVAL_TWO_FA: 30000
};

// ==================== FILE PATHS ==================== //
export const PATHS = {
  // Screenshot paths
  SCREENSHOTS_DIR: 'test-results/screenshots',
  REPORTS_DIR: 'test-results/reports',
  VIDEOS_DIR: 'test-results/videos',
  
  // Config files
  CONFIG_FILE: 'data/config.json',
  ENV_FILE: '.env',
  
  // Test data
  TEST_DATA_DIR: 'data',
  LOCATORS_DIR: 'locators',
  PAGES_DIR: 'pages',
  UTILS_DIR: 'utils',
  TESTS_DIR: 'tests'
};

// ==================== VALIDATION PATTERNS ==================== //
export const PATTERNS = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TOTP_TOKEN_REGEX: /^\d{6}$/,
  
  // Character sets
  ALPHANUMERIC_CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  NUMERIC_CHARS: '0123456789',
  ALPHA_CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
};

// ==================== ERROR MESSAGES ==================== //
export const ERROR_MESSAGES = {
  // Login errors
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PASSWORD: 'Wrong password',
  ACCOUNT_DISABLED: 'Account disabled',
  TWO_FA_REQUIRED: '2FA verification required',
  WRONG_CODE: 'Wrong code. Try again.',
  
  // Compose errors
  RECIPIENT_REQUIRED: 'Please specify at least one recipient.',
  INVALID_EMAIL_FORMAT: 'Invalid email format',
  NETWORK_ERROR: 'Network error',
  
  // General errors
  ELEMENT_NOT_FOUND: 'Element not found',
  TIMEOUT_ERROR: 'Operation timed out',
  PAGE_LOAD_ERROR: 'Page failed to load',
  NAVIGATION_ERROR: 'Navigation failed'
};

// ==================== SUCCESS MESSAGES ==================== //
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout completed',
  EMAIL_SENT: 'Email sent successfully',
  INBOX_LOADED: 'Inbox loaded successfully',
  COMPOSE_OPENED: 'Compose window opened',
  NAVIGATION_SUCCESS: 'Navigation completed'
};

// ==================== TEST DATA ==================== //
export const TEST_DATA = {
  // Default TOTP secret key
  DEFAULT_TOTP_SECRET: "oqjz aair jfkr lgi2 j6rb st56 trgy lwvv",
  
  // Test email domains
  VALID_EMAIL_DOMAINS: ['gmail.com', 'yahoo.com', 'outlook.com'],
  INVALID_EMAIL_DOMAINS: ['invalidemaildomain.xyz', 'nonexistent.fake'],
  
  // Test subjects and bodies
  DEFAULT_SUBJECT: 'Test Email Subject',
  DEFAULT_BODY: 'Hello! This is a test email sent via Playwright automation.',
  NO_SUBJECT_INDICATOR: '(no subject)',
  
  // Common test strings
  DELIVERY_FAILURE_INDICATORS: [
    'Address not found',
    'delivery failed',
    'undelivered',
    'couldn\'t be delivered',
    'Mail Delivery Subsystem'
  ]
};

// ==================== UI TEXT CONSTANTS ==================== //
export const UI_TEXT = {
  // Button texts
  COMPOSE: 'Compose',
  SEND: 'Send',
  BACK: 'Back',
  NEXT: 'Next',
  OK: 'OK',
  CANCEL: 'Cancel',
  SIGN_OUT: 'Sign out',
  NOT_NOW: 'Not now',
  YES: 'Yes',
  
  // Dialog texts
  SUBJECT_WARNING: 'Send this message without a subject',
  STAY_SIGNED_IN: 'Stay signed in',
  ADD_ACCOUNT: 'Add account',
  MANAGE_ACCOUNT: 'Manage your Google Account',
  
  // Page indicators
  INBOX: 'Inbox',
  GMAIL_TITLE: 'Gmail',
  NEW_MESSAGE: 'New Message'
};

// ==================== CSS CLASSES AND ATTRIBUTES ==================== //
export const CSS = {
  // Common classes
  LOADING_CLASS: 'loading',
  ERROR_CLASS: 'error',
  SUCCESS_CLASS: 'success',
  HIDDEN_CLASS: 'hidden',
  VISIBLE_CLASS: 'visible',
  
  // Gmail-specific classes
  GMAIL_MAIN_CONTAINER: '.nH',
  GMAIL_COMPOSE_BUTTON: '.T-I.T-I-KE.L3',
  GMAIL_EMAIL_ROW: '.zA',
  GMAIL_SIDEBAR: '.ako',
  
  // Form classes
  INPUT_FIELD: 'input',
  BUTTON: 'button',
  TEXTAREA: 'textarea',
  
  // State attributes
  ARIA_LABEL: 'aria-label',
  DATA_TOOLTIP: 'data-tooltip',
  ROLE: 'role'
};

// ==================== PLAYWRIGHT SPECIFIC ==================== //
export const PLAYWRIGHT = {
  // Test configuration
  WORKERS: 1,
  RETRIES: 2,
  
  // Browser types
  CHROMIUM: 'chromium',
  FIREFOX: 'firefox',
  WEBKIT: 'webkit',
  
  // Report formats
  HTML_REPORT: 'html',
  JSON_REPORT: 'json',
  
  // Video settings
  VIDEO_MODE: 'retain-on-failure',
  VIDEO_SIZE: { width: 1280, height: 720 }
};

// ==================== HELPER FUNCTIONS ==================== //
export const HELPERS = {
  // Generate random number within range
  randomInRange: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  
  // Generate random delay for human-like behavior
  randomDelay: () => Math.random() * TIMEOUTS.TYPING_DELAY_MAX + TIMEOUTS.TYPING_DELAY_MIN,
  
  // Generate random mouse movement
  randomMouseMovement: () => ({
    x: HELPERS.randomInRange(MOUSE.MOVEMENT_RANGE_SMALL.x.min, MOUSE.MOVEMENT_RANGE_SMALL.x.max),
    y: HELPERS.randomInRange(MOUSE.MOVEMENT_RANGE_SMALL.y.min, MOUSE.MOVEMENT_RANGE_SMALL.y.max)
  }),
  
  // Format timestamp for filenames
  formatTimestamp: () => new Date().toISOString().replace(/[:.]/g, '-'),
  
  // Validate email format
  isValidEmail: (email) => PATTERNS.EMAIL_REGEX.test(email),
  
  // Validate TOTP token format
  isValidTotpToken: (token) => PATTERNS.TOTP_TOKEN_REGEX.test(token)
};

// ==================== ENVIRONMENT VARIABLES ==================== //
export const ENV_VARS = {
  GMAIL_USERNAME: 'GMAIL_USERNAME',
  GMAIL_PASSWORD: 'GMAIL_PASSWORD',
  GMAIL_TOTP_SECRET: 'GMAIL_TOTP_SECRET',
  NODE_ENV: 'NODE_ENV',
  DEBUG: 'DEBUG'
};

// Export all constants as default object for convenience
export default {
  URLS,
  TIMEOUTS,
  BROWSER,
  LOAD_STATES,
  KEYBOARD,
  MOUSE,
  RETRY,
  PATHS,
  PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TEST_DATA,
  UI_TEXT,
  CSS,
  PLAYWRIGHT,
  HELPERS,
  ENV_VARS
};