/**
 * Gmail Locators Repository
 * Centralized storage for all CSS selectors, XPath expressions, and element locators
 * Used across all page objects for consistent element identification
 */

export const gmailLocators = {
  // Login Page Locators
  login: {
    emailInput: 'input[type="email"]',
    emailInputAlt: '#identifierId',
    passwordInput: 'input[type="password"]',
    passwordInputAlt: 'input[name="Passwd"]',
    nextButton: '#identifierNext',
    passwordNextButton: '#passwordNext',
    errorMessage: '.LXRPh',
    invalidEmailError: '.Ekjuhf',
    passwordError: '.k6Zj8d',
    wrongCodeError: 'text=Wrong code. Try again.',
    accountDisabledHeading: 'heading:has-text("Account disabled")',
    accountDisabledMessage: 'text=We noticed unusual activity in your Google Account',
    totpInput: 'input[name="totpPin"]',
    totpInputAlt: 'input[aria-label="Enter code"]',
    totpNextButton: '#totpNext',
    staySignedInNo: '//span[text()="Not now"]',
    staySignedInYes: '//span[text()="Yes"]',
    gmailContainer: '.nH',
    inboxIndicator: '[data-test-id="inbox"]'
  },

  // Inbox Page Locators
  inbox: {
    composeButton: '.T-I.T-I-KE.L3',
    composeButtonAlt: 'div[data-tooltip="Compose"]',
    emailRow: '.zA',
    firstEmail: '.zA:first-child',
    emailSubject: '.bog',
    emailSender: '.yW',
    backToInboxButton: '.ar9.T-I-J3.J-J5-Ji',
    refreshButton: '.T-I.J-J5-Ji.nX.T-I-ax7.T-I-Js-Gs.mA',
    inboxLabel: '[data-test-id="inbox"]',
    sidebarInbox: 'a[href="#inbox"]',
    gmailLogo: '.gb_va',
    loadingIndicator: '.aKh',
    progressBar: '.nH .aKh',
    gmailMainContainer: '.nH',
    gmailComposeBtn: '.T-I.T-I-KE.L3',
    gmailSidebar: '.ako',
    gmailMainContent: '[role="main"]',
    gmailNavigation: '.nZ',
    gmailToolbar: '.Tm.aeJ',
    backButtonSelectors: [
      '.ar9.T-I-J3.J-J5-Ji',
      'button[aria-label*="Back"]',
      'div[aria-label*="Back"]',
      '[title*="Back"]',
      '[aria-label*="inbox"]',
      'text=Back'
    ]
  },

  // Compose Page Locators
  compose: {
    composeWindow: '.nH.if',
    composeDialog: '.AD',
    toField: '.vO:has-text("To")',
    toInput: 'input[aria-label="To recipients"]',
    toInputAlt: 'textarea[aria-label="To recipients"]',
    ccField: '.vO:has-text("Cc")',
    ccInput: 'input[aria-label="Cc recipients"]',
    bccField: '.vO:has-text("Bcc")',
    bccInput: 'input[aria-label="Bcc recipients"]',
    subjectField: 'input[name="subjectbox"]',
    subjectFieldAlt: 'input[aria-label="Subject"]',
    bodyField: '.Am.Al.editable',
    bodyFieldAlt: 'div[aria-label="Message Body"]',
    sendButton: '.T-I.J-J5-Ji.aoO.v7.T-I-atl.L3',
    sendButtonAlt: '[data-tooltip="Send ⌘+Enter"]',
    sendButtonIcon: '.J-J5-Ji.J-JN-I.J-J5-Ji.L3.J-JN-M.I-J-Ji3-Jh',
    saveButton: '.J-J5-Ji.J-JN-I.J-J5-Ji.ar4.L3.J-JN-M.I-J-Ji3-Jh',
    discardButton: '.Ha .aao',
    closeButton: '.Ha .aao',
    formatButton: '.J-Z-I.J-J5-Ji.T-I-Js-Gs.L3',
    boldButton: '.J-N-JX',
    italicButton: '.J-N-JT',
    attachButton: '.a1.aaA.aMZ',
    attachIcon: '.aYF',
    toFieldError: '.vO .vN',
    sendConfirmation: '.vh',
    validationError: '.vN',
    errorDialog: '[role="alertdialog"]',
    errorDialogMessage: '.uW2Fw-bHk',
    errorDialogTitle: '.uW2Fw-bHp',
    errorDialogOkButton: '[data-mdc-dialog-action="ok"]',
    recipientErrorDialog: 'div:has-text("Please specify at least one recipient.")',
    recipientErrorMessage: 'text="Please specify at least one recipient."',
    composeSelectors: [
      '.T-I.T-I-KE.L3',
      'div[data-tooltip="Compose"]',
      '[role="button"]:has-text("Compose")',
      'button:has-text("Compose")',
      '.T-I-KE'
    ]
  },

  // Logout Page Locators
  logout: {
    profileButton: 'a[aria-label*="Google Account"]',
    profileButtonAlt: '[data-ved]',
    profileButtonImage: 'img[src*="googleusercontent"]',
    profileButtonGeneric: 'a[href*="SignOutOptions"]',
    accountMenu: '[role="dialog"]',
    accountMenuVisible: 'text=Sign out',
    signOutButton: 'text=Sign out',
    signOutButtonDiv: 'div:has-text("Sign out")',
    signOutButtonSpan: 'span:has-text("Sign out")',
    signOutButtonGeneric: '[aria-label*="Sign out"]',
    addAccountButton: 'text=Add account',
    manageAccountButton: 'text=Manage your Google Account',
    logoutConfirmation: '.gb_g',
    profileSelectors: [
      'a[aria-label*="Google Account"]',
      '[data-ved]',
      'img[src*="googleusercontent"]',
      'a[href*="SignOutOptions"]',
      '[aria-label*="account"]'
    ],
    signOutSelectors: [
      'text=Sign out',
      'a[href*="Logout"]',
      'a[href*="SignOut"]',
      'div:has-text("Sign out")',
      'span:has-text("Sign out")',
      '[data-et="10"]'
    ]
  },

  // Common UI Elements
  common: {
    loadingSpinner: '.loading',
    progressIndicator: '.progress',
    errorDialog: '.error-dialog',
    warningDialog: '.warning-dialog',
    okButton: 'button:has-text("OK")',
    cancelButton: 'button:has-text("Cancel")',
    toast: '.toast',
    notification: '.notification',
    modalOverlay: '.modal-overlay',
    backdrop: '.backdrop'
  },

  // Email Content Locators
  email: {
    deliveryFailureEmail: 'span[email="mailer-daemon@googlemail.com"]',
    addressNotFoundEmail: 'span:has-text("Address not found")',
    noSubjectEmail: 'span.bog:has-text("(no subject)")',
    mailDeliverySubsystem: 'span:has-text("Mail Delivery Subsystem")',
    deliveryFailureSelectors: [
      'span[email="mailer-daemon@googlemail.com"]',
      'span:has-text("Address not found")',
      'span:has-text("delivery failed")',
      'span:has-text("undelivered")',
      'span:has-text("couldn\'t be delivered")'
    ]
  },

  // Validation and Error Locators
  validation: {
    subjectWarning: 'text=Send this message without a subject',
    subjectWarningCancel: 'text=Cancel',
    subjectWarningSend: 'text=Send',
    recipientRequired: 'text=Please specify at least one recipient.',
    invalidEmailFormat: 'text=Invalid email address',
    networkError: 'text=Network error',
    generalError: '[role="alert"]'
  }
};

// Helper functions for locator management
export const locatorHelpers = {
  // Get all alternative selectors for a given element
  getAlternativeSelectors(category, element) {
    const categoryLocators = gmailLocators[category];
    if (!categoryLocators) return [];

    const selectors = [];
    const baseSelector = categoryLocators[element];
    
    if (baseSelector) {
      selectors.push(baseSelector);
    }

    // Look for alternative selectors
    let altIndex = 1;
    while (categoryLocators[`${element}Alt${altIndex > 1 ? altIndex : ''}`]) {
      selectors.push(categoryLocators[`${element}Alt${altIndex > 1 ? altIndex : ''}`]);
      altIndex++;
    }

    return selectors;
  },

  // Get selector by category and element name
  getSelector(category, element) {
    return gmailLocators[category]?.[element] || null;
  },

  // Validate that all required selectors exist
  validateSelectors(category, requiredElements = []) {
    const categoryLocators = gmailLocators[category];
    if (!categoryLocators) {
      return { isValid: false, missing: [category], errors: [`Category '${category}' not found`] };
    }

    const missing = [];
    const errors = [];

    requiredElements.forEach(element => {
      if (!categoryLocators[element]) {
        missing.push(element);
        errors.push(`Required element '${element}' not found in category '${category}'`);
      }
    });

    return {
      isValid: missing.length === 0,
      missing,
      errors,
      totalElements: Object.keys(categoryLocators).length
    };
  },

  // Get all selectors for a category
  getAllSelectors(category) {
    return gmailLocators[category] || {};
  }
};

export default gmailLocators;