# Gmail Automation Test Suite Documentation

This file is a direct copy of the contents from TestCaseDocumentation.md for easier reference.

---

# Test Case Documentation
## Gmail Automation Test Suite

### Overview
This document outlines all positive and negative test scenarios implemented in the Gmail automation test suite using Playwright with ES modules, camelCase conventions, and centralized utility helpers.

### Prerequisites
Before running the test suite, ensure the following requirements are met:

#### **1. npm authenticator Installation**
The test suite requires the `authenticator` npm package for 2FA TOTP token generation:
```bash
npm install -g authenticator
```
This package is used to generate time-based one-time passwords (TOTP) for Gmail 2FA authentication.

#### **2. Gmail Account Setup with 2FA**
1. **Create or use an existing Gmail account**
2. **Enable 2-Factor Authentication (2FA)**:
   - Go to Google Account settings
   - Navigate to Security → 2-Step Verification
   - Enable 2-Step Verification
   - Choose "Authenticator app" as your method
   - **IMPORTANT**: When setting up the authenticator app, save the **secret key** (backup codes)
3. **Configure App Password** (if needed):
   - Go to Security → App passwords
   - Generate an app password for "Mail" 
   - Use this app password instead of your regular password in config.json

#### **3. Update config.json with Valid Credentials**
Update the `data/config.json` file with your actual Gmail credentials:
```json
{
  "credentials": {
    "valid": {
      "email": "your-gmail@gmail.com",
      "password": "your-app-password-or-regular-password",
      "totpKey": "your-2fa-secret-key-with-spaces",
      "useTotp": true
    }
  }
}
```

**Where to find your TOTP key:**
- During 2FA setup, Google shows a secret key (backup codes)
- Format: "abcd efgh ijkl mnop qrst uvwx yzab cdef" (16 characters with spaces)
- This key is used by the authenticator package to generate 6-digit codes
- **Keep this key secure and private**

#### **4. Test Environment Setup**
- Node.js and npm installed
- Playwright dependencies installed (`npm install`)
- Valid internet connection for Gmail access
- Browser permissions for automation (disable popup blockers if needed)

---

## Positive Test Scenarios

### **Test Case 1: Valid Login and Inbox Navigation**
- **Test ID**: POS-001
- **Objective**: Verify valid credentials successfully log into Gmail, load inbox, and navigate through emails
- **Preconditions**: 
  - Valid Gmail account with 2FA configured
  - npm authenticator package installed globally
  - Valid email credentials and TOTP key configured in data/config.json
  - Internet connection and browser permissions set up
- **Test Steps**:
  1. Navigate to Gmail login page
  2. Enter valid username and password
  3. Handle 2FA authentication with TOTP
  4. Verify inbox loads successfully
  5. Open first email in inbox
  6. Navigate back to inbox
  7. Logout from account
- **Expected Result**: Complete login, navigation, and logout workflow succeeds
- **Data Source**: data/config.json (credentials.valid)
- **File**: tests/00_gmailPositiveTests.spec.js

### **Test Case 2: Compose and Send Email with Valid Data**
- **Test ID**: POS-002
- **Objective**: Verify successful composition and sending of email with valid recipient and content
- **Preconditions**: 
  - User logged into Gmail with 2FA
  - Inbox loaded successfully
  - Valid email recipient configured in test data
- **Test Steps**:
  1. Login with valid credentials and 2FA
  2. Open compose window
  3. Fill recipient, subject, and body fields
  4. Send email successfully
  5. Verify email sent confirmation
  6. Return to inbox
  7. Logout from account
- **Expected Result**: Email sent successfully, user logged out
- **Data Source**: data/config.json (emails.email1)
- **File**: tests/00_gmailPositiveTests.spec.js

---

## Negative Test Scenarios

### **Test Case 3: Invalid Login Attempt**
- **Test ID**: NEG-001
- **Objective**: Verify invalid credentials display appropriate error message
- **Preconditions**: Gmail login page accessible
- **Test Steps**:
  1. Navigate to Gmail login page
  2. Enter invalid username and password
  3. Attempt to sign in
  4. Verify login fails with error message
  5. Confirm not logged into Gmail
- **Expected Result**: Error message displayed, login fails, no access to inbox
- **Data Source**: data/config.json (credentials.invalid)
- **File**: tests/01_gmailNegativeTests.spec.js

### **Test Case 4: Compose Email Without Recipient**
- **Test ID**: NEG-002
- **Objective**: Verify Gmail prevents sending email without recipient and shows appropriate error
- **Preconditions**: User logged into Gmail, inbox loaded
- **Test Steps**:
  1. Login with valid credentials
  2. Open compose window
  3. Leave recipient field empty
  4. Fill subject and body fields
  5. Attempt to send email
  6. Verify email not sent with appropriate error
  7. Close compose window and logout
- **Expected Result**: Email not sent, recipient error detected or delivery failure email received
- **Data Source**: data/config.json (emails.noRecipientEmail)
- **File**: tests/01_gmailNegativeTests.spec.js

### **Test Case 5: Compose Email Without Subject**
- **Test ID**: NEG-003
- **Objective**: Verify Gmail shows warning when sending email without subject
- **Preconditions**: User logged into Gmail, inbox loaded
- **Test Steps**:
  1. Login with valid credentials
  2. Open compose window
  3. Fill recipient and body fields
  4. Leave subject field empty
  5. Attempt to send email
  6. Verify subject warning dialog appears or email sent with "(no subject)"
  7. Handle warning appropriately and logout
- **Expected Result**: Subject warning dialog displayed or email sent with subject placeholder
- **Data Source**: data/config.json (emails.noSubjectEmail)
- **File**: tests/01_gmailNegativeTests.spec.js

---

## Test Execution Summary

### **Positive Scenarios**: 2 comprehensive test cases
- Complete login workflow with email navigation
- Single email composition and sending with logout

### **Negative Scenarios**: 3 comprehensive test cases  
- Invalid login error handling
- Missing recipient validation and error handling
- Missing subject warning and handling

### **Total Test Cases**: 5 comprehensive test scenarios covering complete Gmail workflows

---

## Configuration Template

### **config.json Template**
Use this template to set up your test configuration with real credentials:

```json
{
  "credentials": {
    "valid": {
      "email": "your-actual-gmail@gmail.com",
      "password": "your-app-password-or-regular-password", 
      "totpKey": "abcd efgh ijkl mnop qrst uvwx yzab cdef",
      "useTotp": true
    },
    "invalid": {
      "email": "invalid-email@gmail.com",
      "password": "wrongpassword", 
      "totpKey": "",
      "useTotp": false
    }
  },
  "emails": {
    "email1": {
      "recipient": "test-recipient@gmail.com",
      "subject": "Test Email 1 - Playwright Automation",
      "body": "Hello! This is a test email sent via Playwright automation."
    },
    "noRecipientEmail": {
      "recipient": "",
      "subject": "Email without recipient",
      "body": "This email is missing a recipient to test error handling."
    },
    "noSubjectEmail": {
      "recipient": "test-recipient@gmail.com", 
      "subject": "",
      "body": "This email is missing a subject to test error handling."
    }
  }
}
```

### **Security Notes**
- **Never commit real credentials to version control**
- Use environment variables for sensitive data in production
- Keep your TOTP secret key private and secure
- Consider using app passwords instead of your main Gmail password
- Add `data/config.json` to `.gitignore` to prevent accidental commits

### **Getting Your TOTP Key**
1. **During Gmail 2FA Setup**:
   - When adding authenticator app, Google displays a secret key
   - Copy this key exactly as shown (with spaces)
   - Example format: "oqjz aair jfkr lgi2 j6rb st56 trgy lwvv"

2. **Testing Your Setup**:
   ```bash
   # Test if authenticator works with your key
   authenticator "your-totp-key-here"
   # Should output a 6-digit code
   ```

3. **Backup Your Key**:
   - Save the TOTP key in a secure password manager
   - Print backup codes provided by Google
   - Store in multiple secure locations

---

## Technical Implementation Details

### **Architecture**
- **ES Module Structure**: Full ES6 import/export syntax
- **Page Object Model**: loginPage, inboxPage, composePage, logoutPage
- **Utility Classes**: 
  - `testHelpers.js` - General test utilities (element interactions, retries, validation)
  - `testRecordingHelpers.js` - Playwright recording features (screenshots, test reports, logging)
  - `testDataManager.js` - Centralized data management
  - `totpGenerator.js` - 2FA authentication
  - `browserManager.js` - Browser management and configuration

### **Locator Management**
- **Centralized Locators**: `gmailLocators.js` with semantic CSS selectors
- **Semantic Selectors**: Replaced cryptic auto-generated classes with meaningful selectors
  - Example: `.T-I.T-I-KE.L3` → `[role="button"][aria-label*="Compose"]`
  - Example: `.zA` → `tr[role="listitem"]`
- **Maintainable Code**: Easy to update and understand selectors

### **Data Management**
- **Configuration**: data/config.json with comprehensive test data
- **TOTP Integration**: Uses npm `authenticator` package for 2FA token generation
  - Requires global installation: `npm install -g authenticator`
  - Generates 6-digit codes from secret key: `authenticator "your-secret-key"`
  - Automatic retry mechanism for invalid/expired tokens
- **Test Data**: Centralized management with validation
- **Multiple Email Scenarios**: Valid, invalid, missing recipient, missing subject test data
- **Security**: Template provided for secure credential management

### **Logging and Recording**
- **Clean Console Output**: Removed verbose selector information from user-facing logs
- **Test Step Logging**: Detailed step-by-step execution tracking
- **Screenshot Support**: Manual screenshot capabilities for debugging
- **Duration Tracking**: Test execution timing for performance monitoring

### **Key Improvements Applied**
- **CamelCase Naming**: All variables, functions, and files follow camelCase convention
- **No Try-Catch Blocks**: Error handling through conditional logic and awaited promises
- **Reduced If-Else Cascading**: Simplified conditional logic with early returns
- **Minimal Comments**: Self-documenting code with descriptive names
- **Clean Documentation**: Only TestCaseDocumentation.md maintained
- **Semantic Selectors**: Improved maintainability and readability

### **Browser Management**
- **Stealth Techniques**: Anti-detection methods for Gmail automation
- **Session Management**: Proper cache clearing and logout procedures
- **Error Handling**: Graceful degradation without try-catch blocks
- **Playwright Configuration**: Trace, screenshot, and video recording enabled

### **Test Execution Features**
- **Automatic Screenshots**: On test failures and key steps (via Playwright config)
- **Video Recording**: Complete test execution recordings
- **Network Monitoring**: Idle state detection for stable automation
- **Cross-Browser Support**: Configurable browser selection
- **Manual Screenshot Support**: Available via TestRecordingHelpers for detailed debugging

### **Quality Standards**
- **Single Responsibility**: Each class and method has focused purpose
- **Consistent Patterns**: Uniform approach across all test files
- **Maintainable Code**: Easy to extend and modify test scenarios
- **Production Ready**: Robust error handling and validation
- **Clean Architecture**: Separated concerns between general utilities and recording features
