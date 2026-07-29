// ============================================================
// SELENIUM E2E TEST CONFIGURATION
// POPC Web Application
// ============================================================
require('dotenv').config();

const config = {
  // Application URLs
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  apiUrl: process.env.API_URL || 'http://localhost:8000',

  // Browser Configuration
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS === 'true' || false,
  windowWidth: parseInt(process.env.WINDOW_WIDTH) || 1920,
  windowHeight: parseInt(process.env.WINDOW_HEIGHT) || 1080,

  // Timeouts (ms)
  implicitWait: parseInt(process.env.IMPLICIT_WAIT) || 10000,
  explicitWait: parseInt(process.env.EXPLICIT_WAIT) || 15000,
  pageLoadTimeout: parseInt(process.env.PAGE_LOAD_TIMEOUT) || 30000,
  scriptTimeout: parseInt(process.env.SCRIPT_TIMEOUT) || 30000,

  // Test Credentials
  testUser: {
    username: process.env.TEST_USERNAME || 'testdoctor@popc.com',
    password: process.env.TEST_PASSWORD || 'TestPass@123',
    email: process.env.TEST_EMAIL || 'testdoctor@popc.com',
  },

  adminUser: {
    username: process.env.ADMIN_USERNAME || 'admin@popc.com',
    password: process.env.ADMIN_PASSWORD || 'AdminPass@123',
  },

  // Test Execution
  retries: parseInt(process.env.TEST_RETRIES) || 2,
  parallel: process.env.PARALLEL === 'true' || false,
  timeout: parseInt(process.env.TEST_TIMEOUT) || 60000,

  // Reporting
  screenshotOnFailure: true,
  screenshotOnPass: false,
  screenshotDir: './screenshots',
  reportsDir: './reports',
  logsDir: './logs',

  // Excel Report
  excelReport: {
    filename: 'POPC_Selenium_Test_Report.xlsx',
    passedFilename: 'POPC_Passed_Tests.xlsx',
    failedFilename: 'POPC_Failed_Tests.xlsx',
    summaryFilename: 'POPC_Execution_Summary.xlsx',
  },

  // Routes Map
  routes: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    verifyOtp: '/verify-otp',
    resetPassword: '/reset-password',
    home: '/home',
    profile: '/profile',
    patients: '/patients',
    patientList: '/patients/list',
    addPatient: '/patients/add',
    dashboard: '/dashboard',
    pendingSurveys: '/dashboard/pending',
    highRisk: '/dashboard/high-risk',
    surveys: '/surveys',
    chat: '/chat',
    settings: '/settings',
    changePassword: '/settings/change-password',
    changeUsername: '/settings/change-username',
    deleteAccount: '/settings/delete-account',
    info: '/info',
  },
};

module.exports = config;
