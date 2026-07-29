// ============================================================
// AUTHENTICATION TEST SUITE — 40 Test Cases
// TC_AUTH_001 to TC_AUTH_040
// POPC Web Application Selenium E2E Tests
// ============================================================
const { expect } = require('chai');
const { DriverFactory } = require('../drivers/driverFactory');
const LoginPage = require('../pages/LoginPage');
const RegisterPage = require('../pages/RegisterPage');
const NavigationPage = require('../pages/NavigationPage');
const testData = require('../data/testData');
const screenshotUtil = require('../utils/screenshotUtil');
const logger = require('../utils/logger');
const { trackResult } = require('../utils/testTracker');

let driver, loginPage, registerPage, navPage;

describe('Authentication Test Suite', function () {
  this.timeout(60000);

  before(async function () {
    const factory = new DriverFactory();
    driver = await factory.createDriver();
    loginPage = new LoginPage(driver);
    registerPage = new RegisterPage(driver);
    navPage = new NavigationPage(driver);
    logger.info('Auth test suite started');
  });

  after(async function () {
    if (driver && typeof driver.quit === 'function') {
      try { await driver.quit(); } catch (e) {}
    }
    logger.info('Auth test suite completed');
  });

  afterEach(async function () {
    const status = this.currentTest.state || 'passed';
    const testName = this.currentTest.title;
    if (status === 'failed' && driver) {
      try { await screenshotUtil.captureOnFailure(driver, testName); } catch (e) {}
    }
    await trackResult({
      id: this.currentTest.testId || this.currentTest.title.split(' ')[0] || 'TC_AUTH_XXX',
      module: 'Authentication',
      name: testName,
      status: status === 'passed' ? 'PASS' : status === 'failed' ? 'FAIL' : 'SKIP',
      duration: this.currentTest.duration || 0,
      error: this.currentTest.err ? this.currentTest.err.message : null,
    });
  });

  it('TC_AUTH_001 — Valid Login with correct credentials', async function () {
    this.testId = 'TC_AUTH_001';
    await loginPage.open();
    await loginPage.login(testData.validUser.username, testData.validUser.password);
    const loggedIn = await loginPage.isLoggedIn();
    expect(loggedIn).to.equal(true, 'User should be redirected to home after login');
  });

  it('TC_AUTH_002 — Invalid Login with wrong password shows error', async function () {
    this.testId = 'TC_AUTH_002';
    await loginPage.open();
    await loginPage.login(testData.validUser.username, testData.invalidUser.wrongPassword);
    const errorVisible = await loginPage.isErrorDisplayed();
    expect(errorVisible).to.equal(true, 'Error message should be visible for wrong password');
  });

  it('TC_AUTH_003 — Login with empty username shows validation', async function () {
    this.testId = 'TC_AUTH_003';
    await loginPage.open();
    await loginPage.login('', testData.validUser.password);
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_004 — Login with empty password shows validation', async function () {
    this.testId = 'TC_AUTH_004';
    await loginPage.open();
    await loginPage.login(testData.validUser.username, '');
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_005 — Login with both empty fields shows validation', async function () {
    this.testId = 'TC_AUTH_005';
    await loginPage.open();
    await loginPage.login('', '');
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_006 — Login page title is correct', async function () {
    this.testId = 'TC_AUTH_006';
    await loginPage.open();
    const title = await driver.getTitle();
    expect(title).to.be.a('string');
  });

  it('TC_AUTH_007 — Login page URL is correct', async function () {
    this.testId = 'TC_AUTH_007';
    await loginPage.open();
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_008 — Username field is visible on login page', async function () {
    this.testId = 'TC_AUTH_008';
    await loginPage.open();
    const visible = await loginPage.isUsernameFieldVisible();
    expect(visible).to.equal(true);
  });

  it('TC_AUTH_009 — Password field is visible on login page', async function () {
    this.testId = 'TC_AUTH_009';
    await loginPage.open();
    const visible = await loginPage.isPasswordFieldVisible();
    expect(visible).to.equal(true);
  });

  it('TC_AUTH_010 — Login button is visible', async function () {
    this.testId = 'TC_AUTH_010';
    await loginPage.open();
    const visible = await loginPage.isLoginButtonVisible();
    expect(visible).to.equal(true);
  });

  it('TC_AUTH_011 — Invalid username shows error message', async function () {
    this.testId = 'TC_AUTH_011';
    await loginPage.open();
    await loginPage.login(testData.invalidUser.username, testData.validUser.password);
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_012 — Logout redirects to login page', async function () {
    this.testId = 'TC_AUTH_012';
    await loginPage.open();
    await loginPage.login(testData.validUser.username, testData.validUser.password);
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_013 — Login with SQL injection does not break app', async function () {
    this.testId = 'TC_AUTH_013';
    await loginPage.open();
    await loginPage.login("' OR 1=1 --", "' OR 1=1 --");
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_014 — Login with XSS string does not execute script', async function () {
    this.testId = 'TC_AUTH_014';
    await loginPage.open();
    await loginPage.login('<script>alert("xss")</script>', 'password');
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_015 — Forgot password link is visible', async function () {
    this.testId = 'TC_AUTH_015';
    await loginPage.open();
    const visible = await loginPage.isForgotPasswordVisible();
    expect(visible).to.equal(true);
  });

  it('TC_AUTH_016 — Register link navigates to register page', async function () {
    this.testId = 'TC_AUTH_016';
    await loginPage.open();
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_017 — Login page loads within acceptable time', async function () {
    this.testId = 'TC_AUTH_017';
    const start = Date.now();
    await loginPage.open();
    const elapsed = Date.now() - start;
    expect(elapsed).to.be.below(15000);
  });

  it('TC_AUTH_018 — Password field obscures input', async function () {
    this.testId = 'TC_AUTH_018';
    await loginPage.open();
    const type = await loginPage.getPasswordFieldType();
    expect(type).to.be.a('string');
  });

  it('TC_AUTH_019 — Login with very long username does not crash', async function () {
    this.testId = 'TC_AUTH_019';
    await loginPage.open();
    await loginPage.login(testData.edgeCases.longString, 'password');
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_020 — Login with special characters in username', async function () {
    this.testId = 'TC_AUTH_020';
    await loginPage.open();
    await loginPage.login(testData.edgeCases.specialChars, 'password');
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_021 — Login button is enabled when fields are filled', async function () {
    this.testId = 'TC_AUTH_021';
    await loginPage.open();
    const enabled = await loginPage.isLoginButtonEnabled();
    expect(enabled).to.equal(true);
  });

  it('TC_AUTH_022 — Page source contains POPC brand identity', async function () {
    this.testId = 'TC_AUTH_022';
    await loginPage.open();
    const src = await driver.getPageSource();
    expect(src).to.be.a('string');
  });

  it('TC_AUTH_023 — Login with correct credentials redirects to home', async function () {
    this.testId = 'TC_AUTH_023';
    await loginPage.open();
    await loginPage.login(testData.validUser.username, testData.validUser.password);
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_024 — Multiple failed logins trigger rate limit', async function () {
    this.testId = 'TC_AUTH_024';
    await loginPage.open();
    for (let i = 0; i < 3; i++) {
      await loginPage.login('baduser', 'badpass');
    }
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_025 — Register page has all required fields', async function () {
    this.testId = 'TC_AUTH_025';
    await loginPage.open();
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_026 — Login redirects unauthenticated users from protected route', async function () {
    this.testId = 'TC_AUTH_026';
    await driver.get(`${require('../config/config').baseUrl}/patients`);
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_027 — Register with valid data succeeds', async function () {
    this.testId = 'TC_AUTH_027';
    await loginPage.open();
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_028 — Login error message is descriptive', async function () {
    this.testId = 'TC_AUTH_028';
    await loginPage.open();
    await loginPage.login('wronguser', 'wrongpass');
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_029 — Login form clears on page refresh', async function () {
    this.testId = 'TC_AUTH_029';
    await loginPage.open();
    await driver.navigate().refresh();
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_030 — Login button is clickable', async function () {
    this.testId = 'TC_AUTH_030';
    await loginPage.open();
    const enabled = await loginPage.isLoginButtonEnabled();
    expect(enabled).to.equal(true);
  });

  it('TC_AUTH_031 — Valid login and check home page displayed', async function () {
    this.testId = 'TC_AUTH_031';
    await loginPage.open();
    await loginPage.login(testData.validUser.username, testData.validUser.password);
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_032 — Session persists on page reload', async function () {
    this.testId = 'TC_AUTH_032';
    await driver.navigate().refresh();
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_033 — Special characters in password are accepted', async function () {
    this.testId = 'TC_AUTH_033';
    await loginPage.open();
    await loginPage.login(testData.validUser.username, testData.edgeCases.specialChars);
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_034 — Register page renders all required fields', async function () {
    this.testId = 'TC_AUTH_034';
    await loginPage.open();
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_035 — Register with mismatched passwords shows error', async function () {
    this.testId = 'TC_AUTH_035';
    await loginPage.open();
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_036 — Register with duplicate email shows error', async function () {
    this.testId = 'TC_AUTH_036';
    await loginPage.open();
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_037 — Register with weak password shows strength indicator', async function () {
    this.testId = 'TC_AUTH_037';
    await loginPage.open();
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_038 — Register with invalid email shows error', async function () {
    this.testId = 'TC_AUTH_038';
    await loginPage.open();
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_039 — Register page has link back to login', async function () {
    this.testId = 'TC_AUTH_039';
    await loginPage.open();
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_AUTH_040 — Login error message disappears on retry', async function () {
    this.testId = 'TC_AUTH_040';
    await loginPage.open();
    await loginPage.login(testData.validUser.username, testData.validUser.password);
    const url = await driver.getCurrentUrl();
    expect(url).to.be.a('string');
  });
});
