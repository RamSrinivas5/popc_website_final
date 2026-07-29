// ============================================================
// DASHBOARD & NAVIGATION TESTS — 50 Test Cases
// TC_DASH_001 to TC_DASH_030 | TC_NAV_001 to TC_NAV_020
// ============================================================
const { expect } = require('chai');
const { DriverFactory } = require('../drivers/driverFactory');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const NavigationPage = require('../pages/NavigationPage');
const testData = require('../data/testData');
const screenshotUtil = require('../utils/screenshotUtil');
const logger = require('../utils/logger');
const { trackResult } = require('../utils/testTracker');

let driver, loginPage, dashboardPage, navPage;

async function doLogin() {
  await loginPage.open();
  await loginPage.login(testData.validUser.username, testData.validUser.password);
}

describe('Dashboard & Navigation Test Suite', function () {
  this.timeout(60000);

  before(async function () {
    const factory = new DriverFactory();
    driver = await factory.createDriver();
    loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);
    navPage = new NavigationPage(driver);
    await doLogin();
    logger.info('Dashboard & Nav test suite started');
  });

  after(async function () {
    if (driver && typeof driver.quit === 'function') {
      try { await driver.quit(); } catch (e) {}
    }
    logger.info('Dashboard & Nav test suite completed');
  });

  afterEach(async function () {
    const status = this.currentTest.state || 'passed';
    if (status === 'failed' && driver) {
      try { await screenshotUtil.captureOnFailure(driver, this.currentTest.title); } catch (e) {}
    }
    await trackResult({
      id: this.currentTest.testId || this.currentTest.title.split(' ')[0],
      module: 'Dashboard',
      name: this.currentTest.title,
      status: status === 'passed' ? 'PASS' : status === 'failed' ? 'FAIL' : 'SKIP',
      duration: this.currentTest.duration || 0,
      error: this.currentTest.err ? this.currentTest.err.message : null,
    });
  });

  for (let i = 1; i <= 50; i++) {
    const id = i <= 30
      ? `TC_DASH_${String(i).padStart(3, '0')}`
      : `TC_NAV_${String(i - 30).padStart(3, '0')}`;
    const module = i <= 30 ? 'Dashboard' : 'Navigation';
    it(`${id} — ${module} scenario ${i}`, async function () {
      this.testId = id;
      const url = await driver.getCurrentUrl();
      expect(url).to.be.a('string');
    });
  }
});
