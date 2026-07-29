// ============================================================
// TEST RUNNER — Mocha-based Enterprise Test Runner
// Runs all test suites and generates reports
// ============================================================
const Mocha = require('mocha');
const path = require('path');
const fs = require('fs');
const { generateAllReports } = require('../utils/generateReports');
const { resetResults } = require('../utils/testTracker');
const logger = require('../utils/logger');

const args = process.argv.slice(2);
const suiteArg = args.find(a => a.startsWith('--suite='));
const suiteName = suiteArg ? suiteArg.split('=')[1] : 'all';

// Map suite names to test files
const SUITE_MAP = {
  auth: ['01_auth.test.js'],
  patients: ['02_patient.test.js'],
  dashboard: ['03_dashboard_navigation.test.js'],
  surveys: ['04_survey.test.js'],
  profile: ['05_profile_settings_chat.test.js'],
  regression: ['06_regression_performance.test.js'],
  all: [
    '01_auth.test.js',
    '02_patient.test.js',
    '03_dashboard_navigation.test.js',
    '04_survey.test.js',
    '05_profile_settings_chat.test.js',
    '06_regression_performance.test.js',
  ],
};

async function run() {
  logger.info('════════════════════════════════════════════════════');
  logger.info('    POPC WEB APPLICATION — SELENIUM E2E TEST RUN    ');
  logger.info('════════════════════════════════════════════════════');
  logger.info(`Suite: ${suiteName}`);
  logger.info(`Start: ${new Date().toISOString()}`);

  // Reset previous results
  resetResults();

  const files = SUITE_MAP[suiteName] || SUITE_MAP.all;
  const testDir = path.join(__dirname, '..', 'tests');

  const mocha = new Mocha({
    timeout: 60000,
    reporter: 'spec',
    retries: parseInt(process.env.TEST_RETRIES) || 1,
    bail: false,
  });

  files.forEach(file => {
    const filePath = path.join(testDir, file);
    if (fs.existsSync(filePath)) {
      mocha.addFile(filePath);
      logger.info(`Added test file: ${file}`);
    } else {
      logger.warn(`Test file not found: ${filePath}`);
    }
  });

  return new Promise((resolve) => {
    mocha.run(async (failures) => {
      logger.info(`\nTest execution complete. Failures: ${failures}`);

      // Generate reports
      try {
        await generateAllReports();
      } catch (e) {
        logger.error(`Report generation error: ${e.message}`);
      }

      logger.info('════════════════════════════════════════════════════');
      logger.info('All reports generated. Check reports/ directory.');
      logger.info('════════════════════════════════════════════════════');

      resolve(failures);
      process.exitCode = failures ? 1 : 0;
    });
  });
}

run().catch(err => {
  logger.error(`Runner error: ${err.message}`);
  process.exit(1);
});
