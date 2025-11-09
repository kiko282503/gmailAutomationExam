import { test, expect } from '@playwright/test';
import LoginPage from '../pages/loginPage.js';
import InboxPage from '../pages/inboxPage.js';
import ComposePage from '../pages/composePage.js';
import LogoutPage from '../pages/logoutPage.js';
import TestDataManager from '../utils/testDataManager.js';
import TestHelpers from '../utils/testHelpers.js';

test.describe('Gmail Positive Test Scenarios', () => {
  let loginPage, inboxPage, composePage, logoutPage, testDataManager;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inboxPage = new InboxPage(page);
    composePage = new ComposePage(page);
    logoutPage = new LogoutPage(page);
    testDataManager = new TestDataManager();

    await TestHelpers.handleDialog(page);
  });

  test('Positive Scenario 1: Valid Login and Inbox Navigation', async ({ page }) => {
    const testStartTime = Date.now();

    await TestHelpers.logTestStep('Starting Positive Scenario 1: Valid Login and Inbox Navigation');
    
    await TestHelpers.logTestStep('Navigating to Gmail');
    await loginPage.navigateToGmail();

    await TestHelpers.logTestStep('Logging in with valid credentials (with 2FA)');
    const validCredentials = testDataManager.getValidCredentials();

    const loginSuccess = await loginPage.loginWithCredentials(
      validCredentials.email,
      validCredentials.password,
      validCredentials.totpKey
    );

    expect(loginSuccess).toBe(true);

    await TestHelpers.logTestStep('Verifying inbox loads');
    await inboxPage.waitForInboxLoad();

    const isLoginSuccessful = await loginPage.isLoginSuccessful();
    expect(isLoginSuccessful).toBe(true);

    await TestHelpers.logTestStep('Opening first email in inbox');
    const emailOpened = await inboxPage.openFirstEmail();

    const shouldNavigateBack = emailOpened;
    if (shouldNavigateBack) {
      await TestHelpers.logTestStep('Navigating back to inbox');
      await inboxPage.navigateBackToInbox();
    }

    await inboxPage.waitForInboxLoad();

    await TestHelpers.logTestStep('Logging out');
    await logoutPage.logout();

    const isLoggedOut = await logoutPage.confirmLogout();
    expect(isLoggedOut).toBe(true);

    const testEndTime = Date.now();
    await TestHelpers.logTestStep('Positive Scenario 1 completed successfully',
      `Duration: ${TestHelpers.formatDuration(testStartTime, testEndTime)}`);
  });

  test('Positive Scenario 2: Compose and Send Email with Valid Data', async ({ page }) => {
    const testStartTime = Date.now();

    await TestHelpers.logTestStep('Starting Positive Scenario 2: Compose and Send Email');

    await TestHelpers.logTestStep('Navigating to Gmail and logging in with 2FA');
    await loginPage.navigateToGmail();

    const validCredentials = testDataManager.getValidCredentials();
    const loginSuccess = await loginPage.loginWithCredentials(
      validCredentials.email,
      validCredentials.password,
      validCredentials.totpKey
    );

    expect(loginSuccess).toBe(true);
    await inboxPage.waitForInboxLoad();

    await TestHelpers.logTestStep('Composing and sending first email');
    await inboxPage.clickComposeButton();

    const email1Data = testDataManager.getEmailData('email1');
    await composePage.sendEmail(email1Data.recipient, email1Data.subject, email1Data.body);

    const firstEmailSent = await composePage.isSendSuccessful();
    expect(firstEmailSent).toBe(true);

    await TestHelpers.logTestStep('Composing and sending second email');
    await inboxPage.clickComposeButton();

    const email2Data = testDataManager.getEmailData('email2');
    await composePage.sendEmail(email2Data.recipient, email2Data.subject, email2Data.body);

    const secondEmailSent = await composePage.isSendSuccessful();
    expect(secondEmailSent).toBe(true);

    await TestHelpers.logTestStep('Composing and sending third email');
    await inboxPage.clickComposeButton();

    const email3Data = testDataManager.getEmailData('email3');
    await composePage.sendEmail(email3Data.recipient, email3Data.subject, email3Data.body);

    const thirdEmailSent = await composePage.isSendSuccessful();
    expect(thirdEmailSent).toBe(true);

    await TestHelpers.logTestStep('Verifying return to inbox');
    await inboxPage.waitForInboxLoad();

    await TestHelpers.logTestStep('Logging out');
    await logoutPage.logout();

    const isLoggedOut = await logoutPage.confirmLogout();
    expect(isLoggedOut).toBe(true);

    const testEndTime = Date.now();
    await TestHelpers.logTestStep('Positive Scenario 2 completed successfully',
      `Duration: ${TestHelpers.formatDuration(testStartTime, testEndTime)}`);
  });
});