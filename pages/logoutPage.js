import { expect } from '@playwright/test';
import { gmailLocators } from '../locators/gmailLocators.js';
import logger from '../utils/logger.js';
import { URLS, TIMEOUTS, LOAD_STATES } from '../constants/appConstants.js';

class LogoutPage {
  constructor(page) {
    this.page = page;
    this.elements = gmailLocators.logout;
  }

  async logout() {
    logger.step('Starting logout process...');

    const iframeSuccess = await this.tryIframeLogout();
    if (iframeSuccess) {
      logger.success('Iframe logout successful');
      await this.waitForLogoutCompletion();
      return;
    }

    const directSuccess = await this.tryDirectLogout();
    if (directSuccess) {
      logger.success('Direct logout successful');
      await this.waitForLogoutCompletion();
      return;
    }

    logger.warning('All methods failed, using logout URL...');
    await this.page.goto(URLS.GOOGLE_LOGOUT);
    await this.waitForLogoutCompletion();
  }

  async tryIframeLogout() {
    logger.action('Trying iframe logout approach...');

    const accountButton = await this.page.$('.gb_B[aria-label*="Account"]');
    const hasAccountButton = accountButton;
    if (!hasAccountButton) {
      logger.warning('Account button not found');
      return false;
    }

    const isVisible = await accountButton.isVisible();
    if (!isVisible) {
      logger.warning('Account button not visible');
      return false;
    }

    logger.action('Clicking account button');
    await accountButton.click({ force: true });

    await this.page.waitForTimeout(TIMEOUTS.RETRY_DELAY_LONG);

    const accountIframe = await this.page.$('iframe[name="account"]');
    const hasIframe = accountIframe;
    if (!hasIframe) {
      logger.warning('Account iframe not found');
      return false;
    }

    logger.info('Found account iframe');

    const frame = await accountIframe.contentFrame();
    const hasFrameContent = frame;
    if (!hasFrameContent) {
      logger.error('Cannot access iframe content');
      return false;
    }

    const frameLoaded = await frame.waitForLoadState(LOAD_STATES.DOM_CONTENT_LOADED, { timeout: TIMEOUTS.ELEMENT_WAIT }).then(() => true).catch(() => false);
    if (!frameLoaded) {
      logger.warning('Iframe load timeout, trying anyway...');
    }

    const iframeSignOutSelectors = gmailLocators.logout.signOutSelectors;

    for (const selector of iframeSignOutSelectors) {
      try {
        const signOutElement = await frame.$(selector);
        const hasSignOutElement = signOutElement;
        if (hasSignOutElement) {
          const elementVisible = await signOutElement.isVisible();
          if (elementVisible) {
            logger.action(`Clicking sign out in iframe with: ${selector}`);

            const clickSucceeded = await signOutElement.click({ force: true, timeout: TIMEOUTS.CLICK_TIMEOUT }).then(() => true).catch(() => false);
            if (!clickSucceeded) {
              await frame.evaluate(el => el.click(), signOutElement);
            }

            await this.page.waitForTimeout(TIMEOUTS.RETRY_DELAY_LONG);
            const currentUrl = this.page.url();

            const logoutSuccessful = currentUrl.includes(URLS.GOOGLE_ACCOUNTS) ||
                                     currentUrl === URLS.BLANK_PAGE ||
                                     !currentUrl.includes(URLS.GMAIL_BASE);
            if (logoutSuccessful) {
              logger.success('Iframe logout successful');
              return true;
            }
          }
        }
      } catch (e) {
        if (e.message.includes('detached')) {
          logger.warning('Frame was detached, logout may have succeeded');
          await this.page.waitForTimeout(TIMEOUTS.RETRY_DELAY_LONG);
          const currentUrl = this.page.url();
          const logoutSuccessful = currentUrl.includes(URLS.GOOGLE_ACCOUNTS) ||
                                   currentUrl === URLS.BLANK_PAGE ||
                                   !currentUrl.includes(URLS.GMAIL_BASE);
          if (logoutSuccessful) {
            logger.success('Logout successful despite frame detachment');
            return true;
          }
          break;
        }
        logger.debug(`Iframe selector ${selector} failed: ${e.message}`);
      }
      logger.debug(`Iframe selector ${selector} failed`);
    }

    return false;
  }

  async tryDirectLogout() {
    logger.action('Trying direct logout approach...');

    const directLogout = await this.page.$('a[href*="SignOutOptions"]');
    const hasDirectLogout = directLogout;
    if (!hasDirectLogout) {
      logger.warning('Direct logout link not found');
      return false;
    }

    const isVisible = await directLogout.isVisible();
    if (!isVisible) {
      logger.warning('Direct logout link not visible');
      return false;
    }

    logger.action('Clicking direct logout link...');
    
    const clickSucceeded = await directLogout.click({ force: true, timeout: TIMEOUTS.CLICK_TIMEOUT }).then(() => true).catch(() => false);
    if (!clickSucceeded) {
      logger.warning('Force click failed, trying JavaScript click...');
      await this.page.evaluate(element => element.click(), directLogout);
    }

    await this.page.waitForTimeout(TIMEOUTS.RETRY_DELAY_LONG);
    const currentUrl = this.page.url();

    const logoutSuccessful = currentUrl.includes(URLS.GOOGLE_ACCOUNTS) ||
                             currentUrl === URLS.BLANK_PAGE ||
                             !currentUrl.includes(URLS.GMAIL_BASE);
    if (logoutSuccessful) {
      logger.success('Direct logout successful');
      return true;
    }

    return false;
  }

  async waitForLogoutCompletion() {
    logger.step('Waiting for logout to complete...');
    await this.page.waitForTimeout(TIMEOUTS.LOGOUT_COMPLETION);

    const networkIdleAchieved = await this.page.waitForLoadState(LOAD_STATES.NETWORK_IDLE, { timeout: TIMEOUTS.LOGIN_VERIFICATION }).then(() => true).catch(() => false);
    if (networkIdleAchieved) {
      logger.info('Network idle achieved');
    } else {
      logger.warning('Network idle timeout, but continuing with logout...');
    }

    await this.clearSessionCache();
  }

  async clearSessionCache() {
    logger.action('Clearing session cache and cookies...');

    const context = this.page.context();

    await context.clearCookies();
    logger.info('Cookies cleared');

    await this.page.evaluate(() => {
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
        });
      }

      const hasCaches = 'caches' in window;
      if (hasCaches) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        });
      }
    });

    logger.info('Browser storage cleared');

    await this.page.goto(URLS.BLANK_PAGE);
    await this.page.waitForTimeout(TIMEOUTS.RETRY_DELAY);

    logger.success('Session cache cleared successfully');
  }

  async isLogoutSuccessful() {
    const currentURL = this.page.url();

    const isOnLogoutPage = currentURL.includes(URLS.GOOGLE_ACCOUNTS) || 
                          currentURL.includes('accounts.google.com/signin') ||
                          currentURL.includes('accounts.google.com/logout');
    if (isOnLogoutPage) {
      return true;
    }

    const loginElementVisible = await this.page.isVisible('input[type="email"]', { timeout: TIMEOUTS.ELEMENT_WAIT });
    return loginElementVisible;
  }

  async confirmLogout() {
    await this.page.waitForTimeout(TIMEOUTS.RETRY_DELAY_LONG);

    const currentURL = this.page.url();

    const isBlankPage = currentURL === URLS.BLANK_PAGE;
    if (isBlankPage) {
      logger.verification('Logout confirmed - on blank page after cache clearing');
      return true;
    }

    const isLoggedOut = await this.isLogoutSuccessful();

    const needsVerification = !isLoggedOut;
    if (needsVerification) {
      await this.page.goto(URLS.GMAIL_BASE);
      await this.page.waitForLoadState(LOAD_STATES.NETWORK_IDLE);

      const loginFormVisible = await this.page.isVisible('input[type="email"]', { timeout: TIMEOUTS.ELEMENT_WAIT });
      if (loginFormVisible) {
        logger.verification('Logout confirmed - redirected to login page');
        return true;
      }

      const gmailInterfaceVisible = await this.page.isVisible('.nH', { timeout: TIMEOUTS.INBOX_REFRESH_WAIT });
      if (gmailInterfaceVisible) {
        logger.error('Still logged in - found Gmail interface');
        return false;
      }

      logger.verification('Logout confirmed - no Gmail interface found');
      return true;
    }

    return isLoggedOut;
  }
}

export default LogoutPage;