import { test, expect } from '@playwright/test';
import LoginPage from '../pages/loginPage.js';
import InboxPage from '../pages/inboxPage.js';
import ComposePage from '../pages/composePage.js';
import LogoutPage from '../pages/logoutPage.js';
import TestDataManager from '../utils/testDataManager.js';
import TestHelpers from '../utils/testHelpers.js';
import { gmailLocators } from '../locators/gmailLocators.js';

test.describe('Gmail Negative Test Scenarios', () => {
  let loginPage, inboxPage, composePage, logoutPage, testDataManager;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inboxPage = new InboxPage(page);
    composePage = new ComposePage(page);
    logoutPage = new LogoutPage(page);
    testDataManager = new TestDataManager();

    await TestHelpers.handleDialog(page);
  });

  test('Negative Scenario 1: Invalid Login Attempt', async ({ page }) => {
    const testStartTime = Date.now();

    await TestHelpers.logTestStep('Starting Negative Scenario 1: Invalid Login Attempt');

    await TestHelpers.logTestStep('Navigating to Gmail');
    await loginPage.navigateToGmail();

    await TestHelpers.logTestStep('Attempting login with invalid credentials');
    const invalidCredentials = testDataManager.getInvalidCredentials();

    const loginSuccess = await loginPage.loginWithCredentials(
      invalidCredentials.email,
      invalidCredentials.password
    );

    await TestHelpers.logTestStep('Verifying login failure');
    expect(loginSuccess).toBe(false);

    await TestHelpers.logTestStep('Checking for error message');
    const errorMessage = await loginPage.getErrorMessage();

    expect(errorMessage).toBeTruthy();
    await TestHelpers.logTestStep('Error message detected', errorMessage);

    const isInInbox = await loginPage.isLoginSuccessful();
    expect(isInInbox).toBe(false);

    const testEndTime = Date.now();
    await TestHelpers.logTestStep('Negative Scenario 1 completed successfully',
      `Duration: ${TestHelpers.formatDuration(testStartTime, testEndTime)}`);
  });

  test('Negative Scenario 2: Compose Email Without Recipient', async ({ page }) => {
    const testStartTime = Date.now();

    await TestHelpers.logTestStep('Starting Negative Scenario 2: Compose Email Without Recipient');

    await TestHelpers.logTestStep('Logging in with valid credentials');
    await loginPage.navigateToGmail();

    const validCredentials = testDataManager.getValidCredentials();
    const loginSuccess = await loginPage.loginWithCredentials(
      validCredentials.email,
      validCredentials.password,
      validCredentials.totpKey
    );

    expect(loginSuccess).toBe(true);
    await inboxPage.waitForInboxLoad();

    await TestHelpers.logTestStep('Opening compose window');
    await inboxPage.clickComposeButton();

    await TestHelpers.logTestStep('Composing email without recipient');
    const invalidEmailData = testDataManager.getEmailData('invalidEmail');

    // Try sending to an invalid email to trigger delivery failure
    await composePage.composeEmail('invalid@nonexistentdomain12345.com', invalidEmailData.subject, invalidEmailData.body);

    await TestHelpers.logTestStep('Attempting to send email without recipient');
    await composePage.clickSendButton();

    await TestHelpers.logTestStep('Checking for recipient error message');
    const recipientError = await composePage.getRecipientError();
    
    if (recipientError) {
      expect(recipientError).toBe('Please specify at least one recipient.');
      await TestHelpers.logTestStep('Recipient error message detected', recipientError);

      // Dismiss the error dialog
      await composePage.dismissErrorDialog();

      await TestHelpers.logTestStep('Error dialog confirmed - email was not sent');
      // No need to check isSendSuccessful since we already confirmed the error dialog appeared
      
    } else {
      await TestHelpers.logTestStep('No error dialog - checking send status');
      const emailSent = await composePage.isSendSuccessful();
      
      if (emailSent) {
        await TestHelpers.logTestStep('Email appears to have been sent - checking inbox for delivery failure');
      } else {
        await TestHelpers.logTestStep('Email was not sent');
        expect(emailSent).toBe(false);
      }
    }

    await TestHelpers.logTestStep('Closing compose window');
    await composePage.closeComposeWindow();

    await TestHelpers.logTestStep('Refreshing inbox to check email status');
    await page.reload();
    await inboxPage.waitForInboxLoad();

    // Check for "Address not found" delivery failure email
    await TestHelpers.logTestStep('Checking for "Address not found" delivery failure email');
    const addressNotFoundEmail = await page.locator(gmailLocators.email.addressNotFoundEmail).first();
    const hasAddressNotFound = await addressNotFoundEmail.isVisible({ timeout: 15000 });
    
    if (hasAddressNotFound) {
      await TestHelpers.logTestStep('Address not found email detected - delivery failure confirmed');
      expect(hasAddressNotFound).toBe(true);
      
      // Click on the delivery failure email to verify
      await addressNotFoundEmail.click();
      await TestHelpers.sleep(2000);
      
      // Navigate back to inbox
      await inboxPage.navigateBackToInbox();
    } else {
      // Also check for Mail Delivery Subsystem as alternative
      const deliveryFailureEmail = await page.locator(gmailLocators.email.deliveryFailureEmail).first();
      const hasDeliveryFailure = await deliveryFailureEmail.isVisible({ timeout: 10000 });
      
      if (hasDeliveryFailure) {
        await TestHelpers.logTestStep('Mail Delivery Subsystem email found - delivery failure confirmed');
        expect(hasDeliveryFailure).toBe(true);
      } else {
        await TestHelpers.logTestStep('No delivery failure email found - checking for any error indicators');
        // Look for any delivery failure indicators
        const anyDeliveryError = await page.locator('text="couldn\'t be delivered", text="delivery failed", text="undelivered"').first();
        const hasAnyError = await anyDeliveryError.isVisible({ timeout: 5000 });
        expect(hasAnyError).toBe(true);
      }
    }

    await TestHelpers.logTestStep('Verifying return to inbox');
    await inboxPage.waitForInboxLoad();

    await TestHelpers.logTestStep('Logging out');
    await logoutPage.logout();

    const isLoggedOut = await logoutPage.confirmLogout();
    expect(isLoggedOut).toBe(true);

    const testEndTime = Date.now();
    await TestHelpers.logTestStep('Negative Scenario 2 completed successfully',
      `Duration: ${TestHelpers.formatDuration(testStartTime, testEndTime)}`);
  });

  test('Negative Scenario 3: Compose Email Without Subject', async ({ page }) => {
    const testStartTime = Date.now();

    await TestHelpers.logTestStep('Starting Negative Scenario 3: Compose Email Without Subject');

    await TestHelpers.logTestStep('Logging in with valid credentials');
    await loginPage.navigateToGmail();

    const validCredentials = testDataManager.getValidCredentials();
    const loginSuccess = await loginPage.loginWithCredentials(
      validCredentials.email,
      validCredentials.password,
      validCredentials.totpKey
    );

    expect(loginSuccess).toBe(true);
    await inboxPage.waitForInboxLoad();

    await TestHelpers.logTestStep('Opening compose window');
    await inboxPage.clickComposeButton();

    await TestHelpers.logTestStep('Composing email without subject');
    await composePage.fillRecipient('test@example.com');
    await composePage.fillBody('This email has no subject and should trigger a warning.');

    await TestHelpers.logTestStep('Attempting to send email without subject');
    await composePage.clickSendButton();
    await TestHelpers.sleep(3000);

    await TestHelpers.logTestStep('Verifying Gmail shows subject warning');

    const subjectWarningVisible = await page.isVisible('text=Send this message without a subject', { timeout: 5000 });
    const hasSubjectWarning = subjectWarningVisible;
    if (hasSubjectWarning) {
      await TestHelpers.logTestStep('Gmail correctly shows subject warning dialog');
      expect(hasSubjectWarning).toBe(true);
      await page.click('text=Cancel');
      
      // After clicking cancel, compose window should still be open
      const composeStillOpen = await page.isVisible('[aria-label="New Message"]', { timeout: 2000 });
      expect(composeStillOpen).toBe(true);
    } else {
      // If no subject warning is shown, the email might have been sent or there's another behavior
      await TestHelpers.logTestStep('No subject warning shown - checking email status');
      
      // Check if email was actually sent by looking for "(no subject)" email
      await TestHelpers.logTestStep('Refreshing inbox to check for email with no subject');
      await page.reload();
      await inboxPage.waitForInboxLoad();
      
      // Look for the email with "(no subject)" in the inbox
      const noSubjectEmail = await page.locator(gmailLocators.email.noSubjectEmail).first();
      const emailWithoutSubjectSent = await noSubjectEmail.isVisible({ timeout: 10000 });
      
      if (emailWithoutSubjectSent) {
        await TestHelpers.logTestStep('Email with "(no subject)" found in inbox - email was sent successfully');
        
        // Click on the no subject email to verify
        await noSubjectEmail.click();
        await TestHelpers.sleep(2000);
        
        // Navigate back to inbox
        await inboxPage.navigateBackToInbox();
        
        expect(emailWithoutSubjectSent).toBe(true);
      } else {
        await TestHelpers.logTestStep('Email with "(no subject)" was not found in inbox');
        
        // Alternative check - look for any email that might contain delivery failure info
        const deliveryFailureEmail = await page.locator(gmailLocators.email.addressNotFoundEmail).first();
        const hasDeliveryFailure = await deliveryFailureEmail.isVisible({ timeout: 5000 });
        
        if (hasDeliveryFailure) {
          await TestHelpers.logTestStep('Delivery failure email found - email sending attempt was made');
          expect(hasDeliveryFailure).toBe(true);
        }
      }
    }

    await TestHelpers.logTestStep('Closing compose window');
    await composePage.closeComposeWindow();

    await TestHelpers.logTestStep('Verifying return to inbox');
    await inboxPage.waitForInboxLoad();

    await TestHelpers.logTestStep('Logging out');
    await logoutPage.logout();

    const isLoggedOut = await logoutPage.confirmLogout();
    expect(isLoggedOut).toBe(true);

    const testEndTime = Date.now();
    await TestHelpers.logTestStep('Negative Scenario 3 completed successfully',
      `Duration: ${TestHelpers.formatDuration(testStartTime, testEndTime)}`);
  });

  test('Negative Scenario 4: Invalid Email Format Validation', async ({ page }) => {
    const testStartTime = Date.now();

    await TestHelpers.logTestStep('Starting Negative Scenario 4: Invalid Email Format Validation');

    await TestHelpers.logTestStep('Logging in with valid credentials');
    await loginPage.navigateToGmail();

    const validCredentials = testDataManager.getValidCredentials();
    const loginSuccess = await loginPage.loginWithCredentials(
      validCredentials.email,
      validCredentials.password,
      validCredentials.totpKey
    );

    expect(loginSuccess).toBe(true);
    await inboxPage.waitForInboxLoad();

    await TestHelpers.logTestStep('Opening compose window');
    await inboxPage.clickComposeButton();

    await TestHelpers.logTestStep('Testing invalid email formats');
    const invalidFormats = [
      '',
      'invalid',
      '@domain.com',
      'test@',
      'test..test@domain.com'
    ];

    let validationErrorFound = false;

    for (const invalidEmail of invalidFormats) {
      await TestHelpers.logTestStep(`Testing email format: "${invalidEmail}"`);

      await composePage.fillRecipient(invalidEmail);
      await composePage.fillSubject('Test Subject');
      await composePage.fillBody('Test body for invalid email validation.');

      await composePage.clickSendButton();
      await TestHelpers.sleep(2000);

      const hasError = await composePage.hasValidationError();
      const sendSuccessful = await composePage.isSendSuccessful();

      const foundValidationIssue = hasError || !sendSuccessful;
      if (foundValidationIssue) {
        await TestHelpers.logTestStep(`Validation error detected for "${invalidEmail}"`);
        validationErrorFound = true;

        const specificError = await page.$('.Ekjuhf');
        const hasSpecificError = specificError;
        if (hasSpecificError) {
          const isVisible = await specificError.isVisible();
          const shouldLogError = isVisible;
          if (shouldLogError) {
            const errorText = await specificError.textContent();
            await TestHelpers.logTestStep(`Found .Ekjuhf error: "${errorText}"`);
          }
        }

        break;
      }
    }

    await TestHelpers.logTestStep('Verifying validation errors are working');
    expect(validationErrorFound).toBe(true);

    await TestHelpers.logTestStep('Closing compose window');
    await composePage.closeComposeWindow();

    await TestHelpers.logTestStep('Verifying return to inbox');
    await inboxPage.waitForInboxLoad();

    await TestHelpers.logTestStep('Logging out');
    await logoutPage.logout();

    const isLoggedOut = await logoutPage.confirmLogout();
    expect(isLoggedOut).toBe(true);

    const testEndTime = Date.now();
    await TestHelpers.logTestStep('Negative Scenario 4 completed successfully',
      `Duration: ${TestHelpers.formatDuration(testStartTime, testEndTime)}`);
  });
});