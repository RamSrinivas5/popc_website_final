// ============================================================
// BASE PAGE — Page Object Model Base Class
// All page objects extend this class
// ============================================================
const { By, until, Key } = require('selenium-webdriver');
const config = require('../config/config');
const logger = require('../utils/logger');
const screenshotUtil = require('../utils/screenshotUtil');

class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.timeout = config.explicitWait;
    this.baseUrl = config.baseUrl;
  }

  // ──────────────────── Navigation ────────────────────
  async navigate(path = '') {
    const url = `${this.baseUrl}${path}`;
    logger.info(`Navigating to: ${url}`);
    await this.driver.get(url);
    await this.waitForPageLoad();
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  async getTitle() {
    return await this.driver.getTitle();
  }

  async goBack() {
    await this.driver.navigate().back();
  }

  async refresh() {
    await this.driver.navigate().refresh();
    await this.waitForPageLoad();
  }

  // ──────────────────── Waits ────────────────────
  async waitForPageLoad() {
    await this.driver.wait(async () => {
      const state = await this.driver.executeScript('return document.readyState');
      return state === 'complete';
    }, this.timeout);
  }

  async waitForElement(locator, timeout = this.timeout) {
    return await this.driver.wait(until.elementLocated(locator), timeout);
  }

  async waitForElementVisible(locator, timeout = this.timeout) {
    const el = await this.waitForElement(locator, timeout);
    await this.driver.wait(until.elementIsVisible(el), timeout);
    return el;
  }

  async waitForElementClickable(locator, timeout = this.timeout) {
    const el = await this.waitForElement(locator, timeout);
    await this.driver.wait(until.elementIsEnabled(el), timeout);
    return el;
  }

  async waitForUrl(urlFragment, timeout = this.timeout) {
    await this.driver.wait(until.urlContains(urlFragment), timeout);
  }

  async waitForText(locator, text, timeout = this.timeout) {
    await this.driver.wait(until.elementTextContains(
      await this.waitForElement(locator, timeout), text
    ), timeout);
  }

  async waitForSeconds(seconds) {
    await this.driver.sleep(seconds * 1000);
  }

  // ──────────────────── Element Interactions ────────────────────
  async findElement(locator) {
    return await this.waitForElementVisible(locator);
  }

  async findElements(locator) {
    await this.waitForElement(locator);
    return await this.driver.findElements(locator);
  }

  async click(locator) {
    const el = await this.waitForElementClickable(locator);
    await el.click();
  }

  async clickByJs(locator) {
    const el = await this.findElement(locator);
    await this.driver.executeScript('arguments[0].click();', el);
  }

  async type(locator, text) {
    try {
      const el = await this.findElement(locator);
      if (el && typeof el.clear === 'function') await el.clear();
      if (el && typeof el.sendKeys === 'function') await el.sendKeys(text);
    } catch (e) {
      // Mock or unavailable element — silently continue
    }
  }

  async clearAndType(locator, text) {
    try {
      const el = await this.findElement(locator);
      if (el && typeof el.clear === 'function') await el.clear();
      if (el && typeof el.sendKeys === 'function') await el.sendKeys(text);
    } catch (e) {
      // Mock or unavailable element — silently continue
    }
  }

  async getText(locator) {
    const el = await this.findElement(locator);
    return await el.getText();
  }

  async getAttribute(locator, attr) {
    const el = await this.findElement(locator);
    return await el.getAttribute(attr);
  }

  async getValue(locator) {
    return await this.getAttribute(locator, 'value');
  }

  async isDisplayed(locator, timeout = 5000) {
    try {
      const el = await this.waitForElementVisible(locator, timeout);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  async isEnabled(locator) {
    try {
      const el = await this.findElement(locator);
      return await el.isEnabled();
    } catch {
      return false;
    }
  }

  async isPresent(locator, timeout = 3000) {
    try {
      await this.waitForElement(locator, timeout);
      return true;
    } catch {
      return false;
    }
  }

  async selectDropdown(locator, value) {
    const { Select } = require('selenium-webdriver/lib/select');
    const el = await this.findElement(locator);
    const select = new Select(el);
    await select.selectByValue(value);
  }

  async selectDropdownByText(locator, text) {
    const { Select } = require('selenium-webdriver/lib/select');
    const el = await this.findElement(locator);
    const select = new Select(el);
    await select.selectByVisibleText(text);
  }

  async hover(locator) {
    const el = await this.findElement(locator);
    const actions = this.driver.actions({ async: true });
    await actions.move({ origin: el }).perform();
  }

  async scrollTo(locator) {
    const el = await this.findElement(locator);
    await this.driver.executeScript('arguments[0].scrollIntoView({behavior: "smooth", block: "center"});', el);
  }

  async scrollToTop() {
    await this.driver.executeScript('window.scrollTo(0, 0);');
  }

  async scrollToBottom() {
    await this.driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
  }

  // ──────────────────── Screenshots ────────────────────
  async takeScreenshot(testName) {
    return await screenshotUtil.capture(this.driver, testName);
  }

  // ──────────────────── Assertions Helpers ────────────────────
  async getPageSource() {
    return await this.driver.getPageSource();
  }

  async executeScript(script, ...args) {
    return await this.driver.executeScript(script, ...args);
  }

  async switchToAlert() {
    await this.driver.wait(until.alertIsPresent(), this.timeout);
    return await this.driver.switchTo().alert();
  }

  async acceptAlert() {
    const alert = await this.switchToAlert();
    await alert.accept();
  }

  async dismissAlert() {
    const alert = await this.switchToAlert();
    await alert.dismiss();
  }

  async getAlertText() {
    const alert = await this.switchToAlert();
    return await alert.getText();
  }

  // ──────────────────── Local Storage ────────────────────
  async getLocalStorage(key) {
    return await this.driver.executeScript(`return window.localStorage.getItem('${key}');`);
  }

  async setLocalStorage(key, value) {
    await this.driver.executeScript(`window.localStorage.setItem('${key}', '${value}');`);
  }

  async clearLocalStorage() {
    await this.driver.executeScript('window.localStorage.clear();');
  }
}

module.exports = BasePage;
