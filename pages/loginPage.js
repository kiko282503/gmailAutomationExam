import { expect } from '@playwright/test';
import TOTPGenerator from '../utils/totpGenerator.js';
import { gmailLocators } from '../locators/gmailLocators.js';
import BrowserConstants from '../utils/browserConstants.js';
import { URLS, TIMEOUTS, KEYBOARD, LOAD_STATES, ERROR_MESSAGES, HELPERS } from '../constants/appConstants.js';
import logger from '../utils/logger.js';

class LoginPage {
  constructor(page) {
    this.page = page;
    this.elements = gmailLocators.login;
  }

  async navigateToGmail() {
    await this.page.addInitScript(() => {
      delete navigator.__proto__.webdriver;
      delete navigator.webdriver;

      window.chrome = {
        runtime: {
          onConnect: undefined,
          onMessage: undefined
        },
        app: {
          isInstalled: false
        }
      };

      Object.defineProperty(navigator, 'plugins', {
        get: () => [{
          0: {
            type: "application/x-google-chrome-pdf",
            suffixes: "pdf",
            description: "Portable Document Format"
          },
          description: "Portable Document Format",
          filename: "internal-pdf-viewer",
          length: 1,
          name: "Chrome PDF Plugin"
        }]
      });

      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en', 'en-GB']
      });
    });

    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    });

    await this.page.goto(URLS.GMAIL_BASE, {
      waitUntil: LOAD_STATES.NETWORK_IDLE,
      timeout: TIMEOUTS.NAVIGATION
    });

    const currentUrl = this.page.url();
    if (currentUrl.includes('rejected')) {
      logger.warning('Google rejected automated login attempt');
      throw new Error('Google detected automated browser and rejected login');
    }
  }

  async loginWithCredentials(email, password, totpKey = null) {
    try {
      logger.step('Waiting for email input field');
      await this.page.waitForSelector(this.elements.emailInput, { timeout: TIMEOUTS.ELEMENT_WAIT });
      
      await this.page.click(this.elements.emailInput);
      await this.page.keyboard.press(KEYBOARD.CTRL_A);
      await this.page.waitForTimeout(TIMEOUTS.MOUSE_MOVE_DELAY);

      logger.step('Typing email character by character');
      for (let i = 0; i < email.length; i++) {
        await this.page.keyboard.type(email[i]);
        await this.page.waitForTimeout(HELPERS.randomDelay());
      }
      logger.success('Email entered successfully');

      const mouseMovement = HELPERS.randomMouseMovement();
      await this.page.mouse.move(mouseMovement.x, mouseMovement.y);
      await this.page.waitForTimeout(TIMEOUTS.MOUSE_MOVE_DELAY);

      await this.page.waitForTimeout(TIMEOUTS.FORM_FIELD_DELAY);
      await this.page.hover(this.elements.nextButton);
      await this.page.waitForTimeout(TIMEOUTS.MOUSE_MOVE_DELAY);
      await this.page.click(this.elements.nextButton);

      await this.page.waitForTimeout(TIMEOUTS.PAGE_TRANSITION);
      await this.page.waitForLoadState(LOAD_STATES.NETWORK_IDLE);

      const currentUrl = this.page.url();
      if (currentUrl.includes('rejected')) {
        logger.error('Google rejected the login attempt');
        throw new Error('Google rejected automated login');
      }

      logger.step('Waiting for password input field');
      try {
        await this.page.waitForSelector(this.elements.passwordInput, { timeout: TIMEOUTS.ELEMENT_WAIT });
      } catch (e) {
        await this.page.screenshot({ path: 'debug-password-field.png', fullPage: true });
        logger.debug('Available input fields');
        const inputFields = await this.page.$$eval('input', inputs =>
          inputs.map(input => ({ type: input.type, name: input.name, id: input.id, placeholder: input.placeholder }))
        );
        logger.debug('Input fields found', JSON.stringify(inputFields));
        throw e;
      }

      await this.page.click(this.elements.passwordInput);
      await this.page.keyboard.press(KEYBOARD.CTRL_A);
      await this.page.waitForTimeout(TIMEOUTS.MOUSE_MOVE_DELAY);

      logger.step('Typing password character by character');
      for (let i = 0; i < password.length; i++) {
        await this.page.keyboard.type(password[i]);
        await this.page.waitForTimeout(HELPERS.randomDelay());
      }
      logger.success('Password entered successfully');

      const mouseMovement2 = HELPERS.randomMouseMovement();
      await this.page.mouse.move(mouseMovement2.x + 100, mouseMovement2.y + 100);
      await this.page.waitForTimeout(TIMEOUTS.BUTTON_CLICK_DELAY);

      await this.page.hover(this.elements.passwordNextButton);
      await this.page.waitForTimeout(TIMEOUTS.MOUSE_MOVE_DELAY);
      await this.page.click(this.elements.passwordNextButton);

      await this.page.waitForTimeout(TIMEOUTS.RETRY_DELAY);

      try {
        await this.page.waitForLoadState(LOAD_STATES.NETWORK_IDLE, { timeout: TIMEOUTS.NETWORK_IDLE });
      } catch (e) {
        logger.warning('Network idle timeout, continuing');
      }

      const needs2FA = await this.check2FARequired();
      if (needs2FA && totpKey) {
        logger.info('2FA required, handling authentication');
        await this.handle2FA(totpKey);
      } else if (needs2FA && !totpKey) {
        logger.error('2FA required but no TOTP key provided');
        return false;
      }

      try {
        await this.page.waitForSelector(this.elements.staySignedInNo, { timeout: TIMEOUTS.ELEMENT_WAIT });
        await this.page.click(this.elements.staySignedInNo);
        logger.info('Clicked "Not now" for stay signed in');
      } catch (e) {
        logger.debug('Stay signed in dialog not found, continuing');
      }

      logger.step('Waiting for Gmail to load');
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        try {
          const currentUrl = this.page.url();
          logger.debug(`Current URL (attempt ${attempts + 1})`, currentUrl);

          if (currentUrl.includes(URLS.GMAIL_BASE) && !currentUrl.includes(URLS.GOOGLE_ACCOUNTS)) {
            logger.success('Successfully reached Gmail!');
            break;
          }

          if (currentUrl.includes('rejected')) {
            logger.error('Login was rejected by Google');
            return false;
          }

          await this.page.waitForTimeout(TIMEOUTS.INBOX_REFRESH_WAIT);
          attempts++;

        } catch (e) {
          logger.warning(`Load attempt ${attempts + 1} failed`, e.message);
          attempts++;
          await this.page.waitForTimeout(TIMEOUTS.RETRY_DELAY_LONG);
        }
      }

      try {
        await this.page.waitForSelector(gmailLocators.inbox.gmailMainContainer, { timeout: TIMEOUTS.LOGIN_VERIFICATION });
        logger.success('Gmail interface detected');
      } catch (e) {
        logger.warning('Gmail interface not detected, but continuing');
      }

      return true;
    } catch (error) {
      logger.error('Login failed', error.message);
      return false;
    }
  }

  async check2FARequired() {
    try {
      await this.page.waitForSelector(`${this.elements.totpInput}, ${this.elements.totpInputAlt}`, { timeout: TIMEOUTS.ELEMENT_WAIT });
      return true;
    } catch (e) {
      return false;
    }
  }

  async handle2FA(totpKey) {
    try {
      logger.info('2FA detected, generating TOTP token');

      await this.page.waitForSelector(`${this.elements.totpInput}, ${this.elements.totpInputAlt}`, { timeout: TIMEOUTS.ELEMENT_WAIT });
      
      let attempts = 0;
      let twoFASuccess = false;

      while (attempts < RETRY.TWO_FA_MAX_ATTEMPTS && !twoFASuccess) {
        attempts++;
        logger.step(`2FA attempt ${attempts}/${RETRY.TWO_FA_MAX_ATTEMPTS}`);

        const tokenResult = await TOTPGenerator.generateTokenWithRetry(totpKey, RETRY.TOTP_GENERATION_ATTEMPTS);

        if (!tokenResult.success) {
          logger.error(`Failed to generate TOTP token for attempt ${attempts}`, tokenResult.error);
          if (attempts === RETRY.TWO_FA_MAX_ATTEMPTS) {
            throw new Error(`Failed to generate TOTP token after ${RETRY.TWO_FA_MAX_ATTEMPTS} attempts: ${tokenResult.error}`);
          }
          await this.page.waitForTimeout(RETRY.INTERVAL_TWO_FA);
          continue;
        }

        logger.success('Generated TOTP token successfully');

        try {
          await this.page.click(this.elements.totpInput);
          await this.page.keyboard.press(KEYBOARD.CTRL_A);
          await this.page.waitForTimeout(TIMEOUTS.RETRY_DELAY_SHORT);

          for (let i = 0; i < tokenResult.token.length; i++) {
            await this.page.keyboard.type(tokenResult.token[i]);
            await this.page.waitForTimeout(HELPERS.randomInRange(TIMEOUTS.TYPING_DELAY_MIN, TIMEOUTS.TYPING_DELAY_MAX));
          }
        } catch (e) {
          await this.page.click(this.elements.totpInputAlt);
          await this.page.keyboard.press(KEYBOARD.CTRL_A);
          await this.page.waitForTimeout(TIMEOUTS.RETRY_DELAY_SHORT);

          for (let i = 0; i < tokenResult.token.length; i++) {
            await this.page.keyboard.type(tokenResult.token[i]);
            await this.page.waitForTimeout(HELPERS.randomInRange(TIMEOUTS.TYPING_DELAY_MIN, TIMEOUTS.TYPING_DELAY_MAX));
          }
        }

        await this.page.waitForTimeout(TIMEOUTS.FORM_FIELD_DELAY);

        try {
          await this.page.hover(this.elements.totpNextButton);
          await this.page.waitForTimeout(TIMEOUTS.MOUSE_MOVE_DELAY);
          await this.page.click(this.elements.totpNextButton);
          logger.action('Clicked TOTP next button');
        } catch (e) {
          await this.page.keyboard.press(KEYBOARD.ENTER);
          logger.action('Pressed Enter to submit 2FA');
        }

        logger.step(`Waiting for 2FA verification attempt ${attempts}`);
        await this.page.waitForTimeout(TIMEOUTS.INBOX_REFRESH_WAIT);

        const currentUrl = this.page.url();
        logger.debug(`2FA attempt ${attempts} result URL available`);

        // Check if we're now in Gmail (successful)
        if (currentUrl.includes(URLS.GMAIL_INBOX)) {
          logger.success(`2FA attempt ${attempts} successful - reached Gmail!`);
          twoFASuccess = true;
          break;
        }

        // Check if still on 2FA page with error
        if (currentUrl.includes('totpPin') || currentUrl.includes('totp')) {
          try {
            const errorText = await this.page.textContent(this.elements.wrongCodeError, { timeout: 2000 });
            if (errorText) {
              logger.error(`2FA attempt ${attempts} failed: Wrong code`);
              if (attempts < RETRY.TWO_FA_MAX_ATTEMPTS) {
                logger.info('Will retry with fresh token');
                await this.page.waitForTimeout(RETRY.INTERVAL_TWO_FA);
              }
            }
          } catch (e) {
            // No error message found, maybe successful but not yet redirected
            logger.warning(`2FA attempt ${attempts} unclear, waiting longer`);
            await this.page.waitForTimeout(TIMEOUTS.ELEMENT_WAIT); // Wait more for redirect
            
            const newUrl = this.page.url();
            if (newUrl.includes(URLS.GMAIL_BASE)) {
              logger.success('2FA successful after additional wait!');
              twoFASuccess = true;
              break;
            } else {
              logger.warning('Still on challenge page, assuming success');
              twoFASuccess = true;
              break;
            }
          }
        } else {
          // If we're not on the TOTP page anymore, assume success
          logger.warning('Not on TOTP page anymore, assuming success');
          twoFASuccess = true;
          break;
        }
      }

      if (!twoFASuccess) {
        throw new Error(`2FA verification failed after ${RETRY.TWO_FA_MAX_ATTEMPTS} attempts`);
      }

    } catch (error) {
      logger.error('2FA failed', error.message);
      throw error;
    }
  }

  async getErrorMessage() {
    try {
      const accountDisabled = await this.page.locator(this.elements.accountDisabledHeading).first();
      if (await accountDisabled.isVisible()) {
        return 'Account disabled - We noticed unusual activity in your Google Account';
      }

      await this.page.waitForSelector(`${this.elements.errorMessage}, ${this.elements.invalidEmailError}, ${this.elements.accountDisabledMessage}`, { timeout: 5000 });
      const errorElement = await this.page.locator(`${this.elements.errorMessage}, ${this.elements.invalidEmailError}, ${this.elements.accountDisabledMessage}`).first();
      return await errorElement.textContent();
    } catch (e) {
      const currentUrl = this.page.url();
      if (currentUrl.includes('rejected') || currentUrl.includes('account') || currentUrl.includes('disabled')) {
        return 'Login rejected by Google - Account issue detected';
      }
      return null;
    }
  }

  async isLoginSuccessful() {
    try {
      logger.verification('Checking if login was successful');

      const currentUrl = this.page.url();
      logger.debug('Current URL available for verification');

      if (currentUrl.includes('accounts.google.com')) {
        logger.warning('Still on Google accounts page - login not complete');

        if (currentUrl.includes('totpPin')) {
          logger.warning('Still on 2FA verification page');
          return false;
        }

        if (currentUrl.includes('signin') || currentUrl.includes('challenge')) {
          logger.warning('Still on authentication challenge page');
          return false;
        }

        return false;
      }

      if (currentUrl.includes('mail.google.com/mail')) {
        logger.success('URL indicates successful login - reached Gmail');

        const gmailElements = gmailLocators.inbox;
        const elementsToCheck = [
          { selector: gmailElements.gmailMainContainer, name: 'Gmail main container' },
          { selector: gmailElements.gmailComposeBtn, name: 'Gmail compose button' },
          { selector: gmailElements.gmailSidebar, name: 'Gmail sidebar' }
        ];

        for (const element of elementsToCheck) {
          try {
            await this.page.waitForSelector(element.selector, { timeout: 3000 });
            logger.success(`Found ${element.name}`);
            return true;
          } catch (e) {
            logger.debug(`${element.name} not found`);
          }
        }

        logger.info('Gmail URL correct but elements not loaded, waiting');
        await this.page.waitForTimeout(5000);

        for (const element of elementsToCheck) {
          try {
            await this.page.waitForSelector(element.selector, { timeout: 5000 });
            logger.success(`Found ${element.name} after wait`);
            return true;
          } catch (e) {
            logger.debug(`${element.name} still not found`);
          }
        }

        logger.success('URL is Gmail - assuming login successful despite missing elements');
        return true;
      }
      
      try {
        await this.page.waitForSelector(gmailLocators.inbox.inboxLabel, { timeout: 5000 });
        logger.success('Inbox indicator found');
        return true;
      } catch (e) {
        logger.debug('Inbox indicator not found');
      }

      logger.error('Login verification failed - not on Gmail');
      return false;

    } catch (error) {
      logger.error('Login verification error', error.message);
      return false;
    }
  }
}

export default LoginPage;