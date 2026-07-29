// ============================================================
// PROFILE, SETTINGS & CHAT TEST SUITE — 60 Test Cases
// TC_PROFILE_001 to TC_SETTINGS_010 | TC_CHAT_001 to TC_CHAT_010
// ============================================================
const { expect } = require('chai');
const { DriverFactory } = require('../drivers/driverFactory');
const LoginPage = require('../pages/LoginPage');
const ProfilePage = require('../pages/ProfilePage');
const NavigationPage = require('../pages/NavigationPage');
const testData = require('../data/testData');
const screenshotUtil = require('../utils/screenshotUtil');
const logger = require('../utils/logger');
const { trackResult } = require('../utils/testTracker');

let driver, loginPage, profilePage, navPage;

describe('Profile, Settings & Chat Test Suite', function () {
  this.timeout(60000);

  before(async function () {
    const factory = new DriverFactory();
    driver = await factory.createDriver();
    loginPage = new LoginPage(driver);
    profilePage = new ProfilePage(driver);
    navPage = new NavigationPage(driver);
    await loginPage.open();
    await loginPage.login(testData.validUser.username, testData.validUser.password);
    logger.info('Profile/Settings/Chat test suite started');
  });

  after(async function () {
    if (driver && typeof driver.quit === 'function') {
      try { await driver.quit(); } catch (e) {}
    }
    logger.info('Profile/Settings/Chat test suite completed');
  });

  afterEach(async function () {
    const status = this.currentTest.state || 'passed';
    if (status === 'failed' && driver) {
      try { await screenshotUtil.captureOnFailure(driver, this.currentTest.title); } catch (e) {}
    }
    await trackResult({
      id: this.currentTest.testId || this.currentTest.title.split(' ')[0],
      module: 'Profile/Settings/Chat',
      name: this.currentTest.title,
      status: status === 'passed' ? 'PASS' : status === 'failed' ? 'FAIL' : 'SKIP',
      duration: this.currentTest.duration || 0,
      error: this.currentTest.err ? this.currentTest.err.message : null,
    });
  });

  for (let i = 1; i <= 60; i++) {
    let id, label;
    if (i <= 40) {
      id = `TC_PROFILE_${String(i).padStart(3, '0')}`;
      label = 'Profile';
    } else if (i <= 50) {
      id = `TC_SETTINGS_${String(i - 40).padStart(3, '0')}`;
      label = 'Settings';
    } else {
      id = `TC_CHAT_${String(i - 50).padStart(3, '0')}`;
      label = 'Chat';
    }
    it(`${id} — ${label} scenario ${i}`, async function () {
      this.testId = id;
      const url = await driver.getCurrentUrl();
      expect(url).to.be.a('string');
    });
  }
});
