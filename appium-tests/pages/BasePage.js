// ============================================================
// BASE PAGE — Appium iOS Page Object Model
// All iOS page objects extend this class
// ============================================================
const config = require('../config/appiumConfig');
const logger = require('../utils/logger');
const screenshotUtil = require('../utils/screenshotUtil');

class BaseIOSPage {
  constructor() {
    this.timeout = config.explicitWaitTimeout;
    this.config = config;
  }

  // ──────────────────── Locator Helpers ────────────────────
  byAccessibility(id) {
    return `~${id}`;
  }

  byClassName(name) {
    return `//XCUIElementType${name}`;
  }

  byPredicateString(pred) {
    return `-ios predicate string:${pred}`;
  }

  byChainSelector(sel) {
    return `-ios class chain:${sel}`;
  }

  byXPath(xpath) {
    return xpath;
  }

  // ──────────────────── Element Interactions ────────────────────
  async findElement(selector, timeout = this.timeout) {
    const el = await $(selector);
    await el.waitForExist({ timeout });
    await el.waitForDisplayed({ timeout });
    return el;
  }

  async findElements(selector, timeout = this.timeout) {
    const el = await $(selector);
    await el.waitForExist({ timeout });
    return await $$(selector);
  }

  async tap(selector) {
    const el = await this.findElement(selector);
    await el.click();
    logger.info(`Tapped: ${selector}`);
  }

  async typeText(selector, text) {
    const el = await this.findElement(selector);
    await el.clearValue();
    await el.setValue(text);
    logger.info(`Typed "${text}" into ${selector}`);
  }

  async clearAndType(selector, text) {
    const el = await this.findElement(selector);
    await el.clearValue();
    await el.addValue(text);
  }

  async getText(selector) {
    const el = await this.findElement(selector);
    const text = await el.getText();
    return text;
  }

  async getAttribute(selector, attr) {
    const el = await this.findElement(selector);
    return await el.getAttribute(attr);
  }

  async getValue(selector) {
    const el = await this.findElement(selector);
    return await el.getValue();
  }

  async isDisplayed(selector, timeout = 5000) {
    try {
      const el = await $(selector);
      return await el.waitForDisplayed({ timeout });
    } catch {
      return false;
    }
  }

  async isExisting(selector, timeout = 3000) {
    try {
      const el = await $(selector);
      return await el.waitForExist({ timeout });
    } catch {
      return false;
    }
  }

  async isEnabled(selector) {
    try {
      const el = await $(selector);
      return await el.isEnabled();
    } catch {
      return false;
    }
  }

  // ──────────────────── Gestures ────────────────────
  async swipeUp() {
    const { width, height } = await driver.getWindowSize();
    await driver.touchAction([
      { action: 'press', x: width / 2, y: height * 0.7 },
      { action: 'moveTo', x: width / 2, y: height * 0.3 },
      'release',
    ]);
  }

  async swipeDown() {
    const { width, height } = await driver.getWindowSize();
    await driver.touchAction([
      { action: 'press', x: width / 2, y: height * 0.3 },
      { action: 'moveTo', x: width / 2, y: height * 0.7 },
      'release',
    ]);
  }

  async scrollTo(selector) {
    let found = false;
    let attempts = 0;
    while (!found && attempts < 5) {
      try {
        const el = await $(selector);
        if (await el.isDisplayed()) {
          found = true;
        } else {
          await this.swipeUp();
        }
      } catch {
        await this.swipeUp();
      }
      attempts++;
    }
  }

  async tapBackButton() {
    await this.tap(this.byAccessibility('Back'));
  }

  async tapAlertButton(label = 'OK') {
    await this.tap(this.byAccessibility(label));
  }

  // ──────────────────── Wait Utilities ────────────────────
  async waitForElement(selector, timeout = this.timeout) {
    const el = await $(selector);
    await el.waitForExist({ timeout });
    return el;
  }

  async waitForDisplayed(selector, timeout = this.timeout) {
    const el = await $(selector);
    await el.waitForDisplayed({ timeout });
    return el;
  }

  async waitForNotDisplayed(selector, timeout = this.timeout) {
    const el = await $(selector);
    await el.waitForDisplayed({ timeout, reverse: true });
  }

  async waitForSeconds(seconds) {
    await browser.pause(seconds * 1000);
  }

  async waitForLoading(loadingSelector = '~loading-indicator') {
    try {
      await this.waitForNotDisplayed(loadingSelector, 30000);
    } catch {
      // Loading may not exist
    }
  }

  // ──────────────────── App Control ────────────────────
  async restartApp() {
    await driver.terminateApp(config.bundleId);
    await browser.pause(1000);
    await driver.activateApp(config.bundleId);
    await browser.pause(2000);
  }

  async backgroundApp(seconds = 3) {
    await driver.background(seconds);
  }

  async getOrientation() {
    return await driver.getOrientation();
  }

  async setLandscape() {
    await driver.setOrientation('LANDSCAPE');
  }

  async setPortrait() {
    await driver.setOrientation('PORTRAIT');
  }

  // ──────────────────── Screenshots ────────────────────
  async takeScreenshot(testName) {
    return await screenshotUtil.captureAppium(testName);
  }

  // ──────────────────── Keyboard ────────────────────
  async dismissKeyboard() {
    try {
      await driver.hideKeyboard();
    } catch {
      // Keyboard may not be open
    }
  }

  async pressHomeButton() {
    await driver.pressKeyCode(3);
  }

  // ──────────────────── Current Screen ────────────────────
  async getCurrentScreen() {
    try {
      const source = await driver.getPageSource();
      return source;
    } catch {
      return '';
    }
  }

  async isOnScreen(identifier) {
    const source = await this.getCurrentScreen();
    return source.includes(identifier);
  }
}

module.exports = BaseIOSPage;
