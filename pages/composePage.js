import { expect } from '@playwright/test';
import { gmailLocators } from '../locators/gmailLocators.js';
import logger from '../utils/logger.js';

class ComposePage {
  constructor(page) {
    this.page = page;
    this.elements = gmailLocators.compose;
  }

  async waitForComposeWindow() {
    const combinedTimeout = 20000;
    const start = Date.now();
    
    const composeWindowVisible = await this.page.isVisible(this.elements.composeWindow, { timeout: 8000 });
    if (composeWindowVisible) {
      return;
    }

    const elapsed = Date.now() - start;
    const remaining = Math.max(1000, combinedTimeout - elapsed);

    const pageIsClosed = this.page.isClosed && this.page.isClosed();
    if (pageIsClosed) {
      throw new Error('Page closed while waiting for compose window');
    }

    await this.page.waitForSelector(this.elements.toInput, { timeout: remaining });
    await this.page.waitForTimeout(400);
  }

  async fillRecipient(recipient) {
    const primaryInputVisible = await this.page.isVisible(this.elements.toInput, { timeout: 5000 });
    if (primaryInputVisible) {
      await this.page.fill(this.elements.toInput, recipient);
      } else {
        const altInputVisible = await this.page.isVisible(this.elements.toInputAlt);
        if (altInputVisible) {
          await this.page.fill(this.elements.toInputAlt, recipient);
        } else {
          await this.page.click(this.elements.toField);
          await this.page.waitForTimeout(500);
          await this.page.fill(this.elements.toInput, recipient);
        }
      }    await this.page.waitForTimeout(500);
  }

  async clearRecipientField() {
    const primaryInputVisible = await this.page.isVisible(this.elements.toInput, { timeout: 5000 });
    if (primaryInputVisible) {
      await this.page.fill(this.elements.toInput, '');
    } else {
      const toFieldVisible = await this.page.isVisible(this.elements.toField);
      if (toFieldVisible) {
        await this.page.click(this.elements.toField);
        await this.page.keyboard.press('Control+a');
        await this.page.keyboard.press('Delete');
      } else {
        await this.page.click('[name="to"]');
        await this.page.keyboard.press('Control+a');
        await this.page.keyboard.press('Delete');
      }
    }

    await this.page.waitForTimeout(300);
  }

  async fillSubject(subject) {
    await this.page.waitForSelector(this.elements.subjectField, { timeout: 5000 });
    await this.page.fill(this.elements.subjectField, subject);
    await this.page.waitForTimeout(500);
  }

  async fillBody(body) {
    const primaryBodyVisible = await this.page.isVisible(this.elements.bodyField, { timeout: 5000 });
    if (primaryBodyVisible) {
      await this.page.click(this.elements.bodyField);
      await this.page.fill(this.elements.bodyField, body);
    } else {
      const altBodyVisible = await this.page.isVisible(this.elements.bodyFieldAlt);
      if (altBodyVisible) {
        await this.page.click(this.elements.bodyFieldAlt);
        await this.page.fill(this.elements.bodyFieldAlt, body);
      } else {
        await this.page.click(this.elements.bodyField);
        await this.page.keyboard.type(body);
      }
    }

    await this.page.waitForTimeout(500);
  }

  async composeEmail(recipient, subject, body) {
    await this.waitForComposeWindow();

    const hasRecipient = recipient;
    if (hasRecipient) {
      await this.fillRecipient(recipient);
    }

    const hasSubject = subject;
    if (hasSubject) {
      await this.fillSubject(subject);
    }

    const hasBody = body;
    if (hasBody) {
      await this.fillBody(body);
    }

    await this.page.waitForTimeout(1000);
  }

  async clickSendButton() {
    const primarySendVisible = await this.page.isVisible(this.elements.sendButton, { timeout: 5000 });
    if (primarySendVisible) {
      await this.page.click(this.elements.sendButton);
    } else {
      const altSendVisible = await this.page.isVisible(this.elements.sendButtonAlt);
      if (altSendVisible) {
        await this.page.click(this.elements.sendButtonAlt);
      } else {
        await this.page.keyboard.press('Control+Enter');
      }
    }

    await this.page.waitForTimeout(2000);
  }

  async sendEmail(recipient, subject, body) {
    await this.composeEmail(recipient, subject, body);
    await this.clickSendButton();
  }

  async getRecipientError() {
    // First check for the error dialog
    const errorDialogVisible = await this.page.isVisible(this.elements.errorDialog, { timeout: 3000 });
    if (errorDialogVisible) {
      const errorMessage = await this.page.textContent(this.elements.errorDialogMessage);
      logger.warning(`Error dialog found with message: ${errorMessage}`);
      return errorMessage;
    }

    // Fallback to check for recipient error message specifically
    const recipientErrorVisible = await this.page.isVisible(this.elements.recipientErrorMessage, { timeout: 3000 });
    if (recipientErrorVisible) {
      return 'Please specify at least one recipient.';
    }

    // Fallback to original field error check
    const errorVisible = await this.page.isVisible(this.elements.toFieldError, { timeout: 3000 });
    if (errorVisible) {
      const errorElement = await this.page.locator(this.elements.toFieldError);
      return await errorElement.textContent();
    }
    
    return null;
  }

  async dismissErrorDialog() {
    const errorDialogVisible = await this.page.isVisible(this.elements.errorDialog, { timeout: 3000 });
    if (errorDialogVisible) {
      logger.action('Dismissing error dialog');
      await this.page.click(this.elements.errorDialogOkButton);
      await this.page.waitForTimeout(1000);
      return true;
    }
    return false;
  }

  async isSendSuccessful() {
    const hasValidationError = await this.hasValidationError();
    if (hasValidationError) {
      logger.error('Email validation error detected - send failed');
      return false;
    }

    const composeStillOpen = await this.page.locator(this.elements.composeWindow).isVisible();
    if (composeStillOpen) {
      logger.warning('Compose window still open - checking for validation errors');
      await this.page.waitForTimeout(2000);
      const hasDelayedValidationError = await this.hasValidationError();
      if (hasDelayedValidationError) {
        return false;
      }
    }

    const composeWindowHidden = await this.page.isVisible(this.elements.composeWindow, { state: 'hidden', timeout: 10000 });
    if (composeWindowHidden) {
      return true;
    }

    const sendConfirmationVisible = await this.page.isVisible(this.elements.sendConfirmation, { timeout: 5000 });
    return sendConfirmationVisible;
  }

  async hasValidationError() {
    const errorSelectors = [
      this.elements.toFieldError,
      this.elements.validationError,
      'text=Please specify at least one recipient',
      'text=Invalid email address',
      'text=Enter a valid email or phone number',
      '.vN:has-text("recipient")',
      '.vN:has-text("address")',
      '.vN:has-text("valid email")',
      '.Ekjuhf.Jj6Lae',
      '.Ekjuhf',
      '.error-message'
    ];

    for (const selector of errorSelectors) {
      const element = this.page.locator(selector);
      const isVisible = await element.isVisible();
      if (isVisible) {
        const errorText = await element.textContent();
        logger.error(`Validation error found: ${errorText}`);
        return true;
      }
    }
    return false;
  }

  async closeComposeWindow() {
    const closeButtonVisible = await this.page.isVisible(this.elements.closeButton);
    if (closeButtonVisible) {
      await this.page.click(this.elements.closeButton);
    } else {
      await this.page.keyboard.press('Escape');
    }

    await this.page.waitForTimeout(1000);
  }
}

export default ComposePage;