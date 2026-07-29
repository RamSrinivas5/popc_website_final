// ============================================================
// WebdriverIO Configuration — Appium iOS
// ============================================================
require('dotenv').config();
const config = require('./appiumConfig');

exports.config = {
  runner: 'local',
  port: config.appiumPort,
  hostname: config.appiumHost,
  path: '/',

  specs: [
    './tests/**/*.test.js',
  ],
  exclude: [],

  maxInstances: 1,  // iOS requires single instance

  capabilities: [{
    platformName: config.platformName,
    'appium:platformVersion': config.platformVersion,
    'appium:deviceName': config.deviceName,
    'appium:automationName': 'XCUITest',
    'appium:app': config.appPath,
    'appium:bundleId': config.bundleId,
    'appium:noReset': false,
    'appium:newCommandTimeout': config.newCommandTimeout,
    'appium:launchTimeout': config.launchTimeout,
    'appium:wdaLaunchTimeout': 60000,
    'appium:wdaConnectionTimeout': 60000,
    'appium:screenshotQuality': 1,
    'appium:reduceMotion': true,
    'appium:connectHardwareKeyboard': false,
    'appium:xcodeOrgId': config.xcodeOrgId,
    'appium:xcodeSigningId': config.xcodeSigningId,
  }],

  logLevel: 'info',
  bail: 0,
  baseUrl: config.apiUrl,
  waitforTimeout: config.explicitWaitTimeout,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: [
    ['appium', {
      command: 'appium',
      args: {
        address: config.appiumHost,
        port: config.appiumPort,
        relaxedSecurity: true,
        logLevel: 'info',
      },
      logPath: './logs',
    }],
  ],

  framework: 'mocha',
  reporters: ['spec'],

  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    retries: config.retries,
  },

  // ── Hooks ──
  before: async function () {
    const { resetResults } = require('../utils/testTracker');
    resetResults();
  },

  afterTest: async function (test, context, { error, result, duration, passed }) {
    if (!passed) {
      await browser.saveScreenshot(
        `./screenshots/fail_${test.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 60)}_${Date.now()}.png`
      );
    }
  },

  after: async function () {
    const { generateAllReports } = require('../utils/generateReports');
    await generateAllReports();
  },

  onComplete: function () {
    console.log('🎉 iOS Appium E2E Test Suite Complete!');
  },
};
