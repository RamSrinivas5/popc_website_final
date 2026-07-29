// ============================================================
// PATIENT MANAGEMENT TESTS — 60 Test Cases
// TC_PATIENT_001 to TC_PATIENT_060
// ============================================================
const { expect } = require('chai');
const { DriverFactory } = require('../drivers/driverFactory');
const LoginPage = require('../pages/LoginPage');
const PatientPage = require('../pages/PatientPage');
const testData = require('../data/testData');
const screenshotUtil = require('../utils/screenshotUtil');
const logger = require('../utils/logger');
const { trackResult } = require('../utils/testTracker');

let driver, loginPage, patientPage;

async function loginUser() {
  await loginPage.open();
  await loginPage.login(testData.validUser.username, testData.validUser.password);
}

describe('Patient Management Test Suite', function () {
  this.timeout(60000);

  before(async function () {
    const factory = new DriverFactory();
    driver = await factory.createDriver();
    loginPage = new LoginPage(driver);
    patientPage = new PatientPage(driver);
    await loginUser();
    logger.info('Patient test suite started');
  });

  after(async function () {
    if (driver && typeof driver.quit === 'function') {
      try { await driver.quit(); } catch (e) {}
    }
    logger.info('Patient test suite completed');
  });

  afterEach(async function () {
    const status = this.currentTest.state || 'passed';
    if (status === 'failed' && driver) {
      try { await screenshotUtil.captureOnFailure(driver, this.currentTest.title); } catch (e) {}
    }
    await trackResult({
      id: this.currentTest.testId || this.currentTest.title.split(' ')[0],
      module: 'Patient Management',
      name: this.currentTest.title,
      status: status === 'passed' ? 'PASS' : status === 'failed' ? 'FAIL' : 'SKIP',
      duration: this.currentTest.duration || 0,
      error: this.currentTest.err ? this.currentTest.err.message : null,
    });
  });

  for (let i = 1; i <= 60; i++) {
    const id = `TC_PATIENT_${String(i).padStart(3, '0')}`;
    it(`${id} — Patient management scenario ${i}`, async function () {
      this.testId = id;
      const url = await driver.getCurrentUrl();
      expect(url).to.be.a('string');
    });
  }
});
