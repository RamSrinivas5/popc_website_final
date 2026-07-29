// ============================================================
// APPIUM iOS CONFIGURATION
// WebdriverIO + Appium XCUITest capabilities for POPC iOS App
// ============================================================
require('dotenv').config();

const config = {
  // Appium Server
  appiumHost: process.env.APPIUM_HOST || 'localhost',
  appiumPort: parseInt(process.env.APPIUM_PORT) || 4723,

  // iOS Device / Simulator
  platformName: 'iOS',
  platformVersion: process.env.IOS_VERSION || '17.0',
  deviceName: process.env.DEVICE_NAME || 'iPhone 15',
  udid: process.env.DEVICE_UDID || '',

  // App Configuration
  bundleId: process.env.BUNDLE_ID || 'com.popc.updatedpopc',
  appPath: process.env.APP_PATH || './resources/updatedpopc.app',

  // Timeouts (ms)
  implicitWaitTimeout: 10000,
  explicitWaitTimeout: 15000,
  newCommandTimeout: 300,
  launchTimeout: 90000,
  sessionTimeout: 120,

  // Test Credentials
  testUser: {
    username: process.env.TEST_USERNAME || 'testdoctor',
    password: process.env.TEST_PASSWORD || 'TestPass@123',
    email: process.env.TEST_EMAIL || 'testdoctor@popc.com',
  },

  // Reporting
  screenshotOnFailure: true,
  screenshotDir: './screenshots',
  reportsDir: './reports',
  logsDir: './logs',

  // Execution
  retries: parseInt(process.env.TEST_RETRIES) || 2,
  parallel: false,  // iOS requires single session

  // Excel Report Config
  excelReport: {
    filename: 'POPC_iOS_Appium_Test_Report.xlsx',
    passedFilename: 'POPC_iOS_Passed_Tests.xlsx',
    failedFilename: 'POPC_iOS_Failed_Tests.xlsx',
    summaryFilename: 'POPC_iOS_Execution_Summary.xlsx',
  },

  // App API
  apiUrl: process.env.API_URL || 'http://localhost:8000',

  // XCUITest specific
  xcodeOrgId: process.env.XCODE_ORG_ID || '',
  xcodeSigningId: process.env.XCODE_SIGNING_ID || 'iPhone Developer',
  xcodeConfigFile: process.env.XCODE_CONFIG || '',

  // Accessibility IDs for POPC app elements
  // These should match the accessibilityIdentifier set in Swift code
  elements: {
    // Login
    usernameField: 'username-field',
    passwordField: 'password-field',
    loginButton: 'login-button',
    forgotPasswordLink: 'forgot-password-link',
    registerLink: 'register-link',
    errorMessage: 'error-message',
    eyeToggle: 'eye-toggle',

    // Register
    firstNameField: 'first-name-field',
    lastNameField: 'last-name-field',
    emailField: 'email-field',
    registerPasswordField: 'register-password-field',
    confirmPasswordField: 'confirm-password-field',
    hospitalField: 'hospital-field',
    licenseField: 'license-field',
    registerButton: 'register-button',

    // OTP
    otpField: 'otp-field',
    otpVerifyButton: 'otp-verify-button',

    // Home / Dashboard
    homeScreen: 'home-screen',
    homeTitle: 'home-title',
    dashboardButton: 'dashboard-button',
    patientCount: 'patient-count-label',

    // Navigation Tab Bar
    homeTab: 'home-tab',
    patientsTab: 'patients-tab',
    surveysTab: 'surveys-tab',
    dashboardTab: 'dashboard-tab',
    profileTab: 'profile-tab',
    chatTab: 'chat-tab',
    settingsTab: 'settings-tab',

    // Patients
    patientListScreen: 'patient-list-screen',
    patientCell: 'patient-cell',
    addPatientButton: 'add-patient-button',
    searchField: 'patient-search-field',
    patientFirstName: 'patient-first-name',
    patientLastName: 'patient-last-name',
    patientDOB: 'patient-dob',
    patientPhone: 'patient-phone',
    savePatientButton: 'save-patient-button',
    deletePatientButton: 'delete-patient-button',
    confirmDeleteButton: 'confirm-delete-button',
    editPatientButton: 'edit-patient-button',

    // Surveys
    surveyListScreen: 'survey-list-screen',
    surveyCell: 'survey-cell',
    startSurveyButton: 'start-survey-button',
    nextButton: 'survey-next-button',
    prevButton: 'survey-prev-button',
    submitSurveyButton: 'submit-survey-button',

    // Profile
    profileScreen: 'profile-screen',
    profileName: 'profile-name-label',
    editProfileButton: 'edit-profile-button',
    saveProfileButton: 'save-profile-button',

    // Settings
    settingsScreen: 'settings-screen',
    changePasswordButton: 'change-password-button',
    logoutButton: 'logout-button',

    // Chat
    chatScreen: 'chat-screen',
    chatInput: 'chat-input-field',
    sendButton: 'chat-send-button',
    chatMessage: 'chat-message-cell',

    // Common
    backButton: 'Back',
    alertOkButton: 'OK',
    alertCancelButton: 'Cancel',
    loadingIndicator: 'loading-indicator',
    emptyState: 'empty-state-view',
    successToast: 'success-toast',
    errorToast: 'error-toast',
  },
};

module.exports = config;
