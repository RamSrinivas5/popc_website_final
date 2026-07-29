// ============================================================
// SCREENSHOT UTILITY — Appium iOS
// ============================================================
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const screenshotDir = path.join(__dirname, '..', 'screenshots');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const screenshotUtil = {
  async captureAppium(testName, type = 'info') {
    try {
      const sanitized = testName.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 80);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${type}_ios_${sanitized}_${timestamp}.png`;
      const typeDir = path.join(screenshotDir, type);
      ensureDir(typeDir);

      const filePath = path.join(typeDir, filename);
      if (typeof browser !== 'undefined' && browser.saveScreenshot) {
        await browser.saveScreenshot(filePath);
        logger.info(`iOS Screenshot saved: ${filePath}`);
        return filePath;
      }
    } catch (error) {
      logger.error(`iOS Screenshot capture failed: ${error.message}`);
    }
    return null;
  },

  async captureOnFailure(testName) {
    return await this.captureAppium(testName, 'fail');
  },

  toBase64(filePath) {
    if (!filePath || !fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath);
    return `data:image/png;base64,${data.toString('base64')}`;
  },

  list(type) {
    const typeDir = path.join(screenshotDir, type);
    if (!fs.existsSync(typeDir)) return [];
    return fs.readdirSync(typeDir)
      .filter(f => f.endsWith('.png'))
      .map(f => ({ name: f, path: path.join(typeDir, f) }));
  },
};

module.exports = screenshotUtil;
