// ============================================================
// SCREENSHOT UTILITY
// Captures and saves screenshots for test reporting
// ============================================================
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const screenshotDir = path.join(__dirname, '..', 'screenshots');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const screenshotUtil = {
  /**
   * Capture screenshot and save to disk
   * @param {WebDriver} driver
   * @param {string} testName
   * @param {string} type - 'pass' | 'fail' | 'info'
   * @returns {string} screenshot file path
   */
  async capture(driver, testName, type = 'info') {
    try {
      const sanitized = testName.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 80);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${type}_${sanitized}_${timestamp}.png`;
      const typeDir = path.join(screenshotDir, type);
      ensureDir(typeDir);

      const screenshot = await driver.takeScreenshot();
      const filePath = path.join(typeDir, filename);
      fs.writeFileSync(filePath, screenshot, 'base64');
      logger.info(`Screenshot saved: ${filePath}`);
      return filePath;
    } catch (error) {
      logger.error(`Screenshot capture failed: ${error.message}`);
      return null;
    }
  },

  async captureOnFailure(driver, testName) {
    return await this.capture(driver, testName, 'fail');
  },

  async captureOnPass(driver, testName) {
    return await this.capture(driver, testName, 'pass');
  },

  /**
   * Convert screenshot to base64 for HTML embedding
   */
  toBase64(filePath) {
    if (!filePath || !fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath);
    return `data:image/png;base64,${data.toString('base64')}`;
  },

  /**
   * List all screenshots in a category
   */
  list(type) {
    const typeDir = path.join(screenshotDir, type);
    if (!fs.existsSync(typeDir)) return [];
    return fs.readdirSync(typeDir)
      .filter(f => f.endsWith('.png'))
      .map(f => ({ name: f, path: path.join(typeDir, f) }));
  },

  getDir() {
    return screenshotDir;
  },
};

module.exports = screenshotUtil;
