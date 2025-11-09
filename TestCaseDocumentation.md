# Test Case Documentation
## Gmail Automation Test Suite

### Overview
This document outlines all positive and negative test scenarios implemented in the Gmail automation test suite using Playwright with ES modules and camelCase conventions.

---

## Positive Test Scenarios

### **Test Case 1: Valid Login and Inbox Navigation**
- **Test ID**: POS-001
- **Objective**: Verify valid credentials successfully log into Gmail, load inbox, and navigate through emails
- **Preconditions**: Valid Gmail account with 2FA configured
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

### **Test Case 2: Compose and Send Three Sequential Emails**
- **Test ID**: POS-002
- **Objective**: Verify successful composition and sending of multiple emails in sequence
- **Preconditions**: User logged into Gmail with 2FA, inbox loaded
- **Test Steps**:
  1. Login with valid credentials and 2FA
  2. Compose and send first email
  3. Compose and send second email
  4. Compose and send third email
  5. Verify all emails sent successfully
  6. Logout from account
- **Expected Result**: All three emails sent successfully, user logged out
- **Data Source**: data/config.json (emails.email1, email2, email3)
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
- **Objective**: Verify Gmail prevents sending email without recipient
- **Preconditions**: User logged into Gmail, inbox loaded
- **Test Steps**:
  1. Login with valid credentials
  2. Open compose window
  3. Leave recipient field empty
  4. Fill subject and body fields
  5. Attempt to send email
  6. Verify email not sent with appropriate error
  7. Close compose window and logout
- **Expected Result**: Email not sent, recipient error detected
- **Data Source**: data/config.json (emails.invalidEmail)
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
  6. Verify subject warning dialog appears
  7. Cancel sending and logout
- **Expected Result**: Subject warning dialog displayed, email send cancelled
- **File**: tests/01_gmailNegativeTests.spec.js

### **Test Case 6: Invalid Email Format Validation**
- **Test ID**: NEG-004
- **Objective**: Verify Gmail validates email format and prevents sending to invalid addresses
- **Preconditions**: User logged into Gmail, inbox loaded
- **Test Steps**:
  1. Login with valid credentials
  2. Open compose window
  3. Test multiple invalid email formats (empty, no @, no domain, etc.)
  4. Fill subject and body fields
  5. Attempt to send for each invalid format
  6. Verify validation errors are detected
  7. Close compose window and logout
- **Expected Result**: Validation errors detected for invalid email formats
- **File**: tests/01_gmailNegativeTests.spec.js

---

## Test Execution Summary

### **Positive Scenarios**: 2 comprehensive test cases
- Complete login workflow with email navigation
- Multiple email composition and sending with logout

### **Negative Scenarios**: 4 comprehensive test cases  
- Invalid login error handling
- Missing recipient validation
- Missing subject warning
- Invalid email format validation

### **Total Test Cases**: 6 comprehensive test scenarios covering complete Gmail workflows

---

## Technical Implementation Details

### **Architecture**
- **ES Module Structure**: Full ES6 import/export syntax
- **Page Object Model**: loginPage, inboxPage, composePage, logoutPage
- **Utility Classes**: testDataManager, testHelpers, totpGenerator, browserConstants

### **Data Management**
- **Configuration**: data/config.json with complete test data
- **TOTP Integration**: External authenticator command for 2FA
- **Test Data**: Centralized management with validation

### **Key Improvements Applied**
- **CamelCase Naming**: All variables, functions, and files follow camelCase convention
- **No Try-Catch Blocks**: Error handling through conditional logic and awaited promises
- **Reduced If-Else Cascading**: Simplified conditional logic with early returns
- **Minimal Comments**: Self-documenting code with descriptive names
- **Clean Documentation**: Only TestCaseDocumentation.md maintained

### **Browser Management**
- **Stealth Techniques**: Anti-detection methods for Gmail automation
- **Session Management**: Proper cache clearing and logout procedures
- **Error Handling**: Graceful degradation without try-catch blocks

### **Test Execution Features**
- **Automatic Screenshots**: On test failures and key steps
- **Video Recording**: Complete test execution recordings
- **Network Monitoring**: Idle state detection for stable automation
- **Cross-Browser Support**: Configurable browser selection

### **Quality Standards**
- **Single Responsibility**: Each class and method has focused purpose
- **Consistent Patterns**: Uniform approach across all test files
- **Maintainable Code**: Easy to extend and modify test scenarios
- **Production Ready**: Robust error handling and validation