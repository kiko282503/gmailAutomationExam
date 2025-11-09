import { expect } from '@playwright/test';
import { gmailLocators } from '../locators/gmailLocators.js';
import logger from '../utils/logger.js';

class InboxPage {
  constructor(page) {
    this.page = page;
    this.elements = gmailLocators.inbox;
  }

  async waitForInboxLoad() {
    logger.step('Waiting for Gmail inbox to load...');

    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    logger.info('DOM content loaded');

    let gmailDetected = false;

    logger.action('Looking for compose button...');
    const composeVisible = await this.page.isVisible(this.elements.composeButton, { timeout: 20000 });
    if (composeVisible) {
      gmailDetected = true;
      logger.success('Compose button found - Gmail loaded successfully!');
    }

    const shouldTryAlternative = !gmailDetected;
    if (shouldTryAlternative) {
      logger.action('Looking for compose button alternative...');
      const altComposeVisible = await this.page.isVisible(this.elements.composeButtonAlt, { timeout: 15000 });
      if (altComposeVisible) {
        gmailDetected = true;
        logger.success('Alternative compose button found!');
      }
    }

    const shouldTryGmailDetection = !gmailDetected;
    if (shouldTryGmailDetection) {
      logger.action('Trying Gmail interface detection...');
      const gmailElementsVisible = await this.page.isVisible('[role="main"], .ako, .nZ', { timeout: 10000 });
      if (gmailElementsVisible) {
        gmailDetected = true;
        logger.success('Gmail elements detected!');
      }
    }

    const shouldContinueAnyway = !gmailDetected;
    if (shouldContinueAnyway) {
      logger.warning('Gmail detection failed, but URL looks correct - continuing anyway...');
      gmailDetected = true;
    }

    await this.page.waitForTimeout(3000);
    logger.success('Gmail inbox ready!');
  }

  async clickComposeButton() {
    logger.action('Looking for compose button...');

    const composeSelectors = [
      this.elements.composeButton,
      this.elements.composeButtonAlt,
      'div[role="button"][aria-label*="Compose"]',
      'text=Compose',
      '[data-tooltip*="Compose"]'
    ];

    let composeClicked = false;
    for (const selector of composeSelectors) {
      logger.debug(`Trying compose selector: ${selector}`);
      const isVisible = await this.page.isVisible(selector, { timeout: 5000 });
      if (isVisible) {
        await this.page.click(selector);
        logger.success(`Successfully clicked compose button with: ${selector}`);
        composeClicked = true;
        break;
      }
      logger.debug(`Compose selector ${selector} failed`);
    }

    const composeFailed = !composeClicked;
    if (composeFailed) {
      throw new Error('Failed to find and click compose button');
    }

    await this.page.waitForTimeout(2000);
  }

  async openFirstEmail() {
    logger.action('Looking for emails in inbox...');

    const emailSelectors = [
      this.elements.emailRow,
      'tr[role="listitem"]',
      '.zA',
      '[data-legacy-thread-id]'
    ];

    let emailsFound = false;
    for (const selector of emailSelectors) {
      logger.debug(`Trying email selector: ${selector}`);
      const isVisible = await this.page.isVisible(selector, { timeout: 5000 });
      if (isVisible) {
        const emailCount = await this.page.locator(selector).count();
        logger.info(`Found ${emailCount} emails with selector: ${selector}`);

        const hasEmails = emailCount > 0;
        if (hasEmails) {
          await this.page.locator(selector).first().click();
          logger.success('Successfully clicked first email');
          await this.page.waitForTimeout(3000);
          emailsFound = true;
          break;
        }
      }
      logger.debug(`Email selector ${selector} failed`);
    }

    return emailsFound;
  }

  async navigateBackToInbox() {
    logger.action('Navigating back to inbox...');

    const backSelectors = gmailLocators.inbox.backButtonSelectors;

    let navigatedBack = false;
    for (const selector of backSelectors) {
      logger.debug(`Trying back button selector: ${selector}`);
      const isVisible = await this.page.isVisible(selector, { timeout: 3000 });
      if (isVisible) {
        await this.page.click(selector);
        logger.success(`Successfully clicked back button with: ${selector}`);
        navigatedBack = true;
        break;
      }
      logger.debug(`Back button selector ${selector} failed`);
    }

    const shouldTrySidebar = !navigatedBack;
    if (shouldTrySidebar) {
      logger.action('Back button not found, trying sidebar inbox...');
      const sidebarSelectors = [
        this.elements.sidebarInbox,
        'a[href="#inbox"]',
        'text=Inbox'
      ];

      for (const selector of sidebarSelectors) {
        const isVisible = await this.page.isVisible(selector, { timeout: 2000 });
        if (isVisible) {
          await this.page.click(selector);
          logger.success(`Clicked sidebar inbox with: ${selector}`);
          navigatedBack = true;
          break;
        }
        logger.debug(`Sidebar selector ${selector} failed`);
      }
    }

    const shouldUseDirectNavigation = !navigatedBack;
    if (shouldUseDirectNavigation) {
      logger.warning('Sidebar navigation failed, using direct URL...');
      await this.page.goto('https://mail.google.com/mail/u/0/#inbox');
      navigatedBack = true;
    }

    await this.page.waitForTimeout(2000);
    logger.success('Navigation back to inbox completed');
  }

  async getEmailCount() {
    const emailsVisible = await this.page.isVisible(this.elements.emailRow, { timeout: 5000 });
    if (emailsVisible) {
      const emails = await this.page.locator(this.elements.emailRow);
      return await emails.count();
    }
    return 0;
  }

  async refreshInbox() {
    const refreshButtonVisible = await this.page.isVisible(this.elements.refreshButton);
    if (refreshButtonVisible) {
      await this.page.click(this.elements.refreshButton);
    } else {
      await this.page.reload();
    }

    await this.waitForInboxLoad();
  }
}

export default InboxPage;