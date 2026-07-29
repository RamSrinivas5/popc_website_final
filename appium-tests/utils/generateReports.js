// ============================================================
// GENERATE ALL REPORTS — Appium iOS
// ============================================================
const { generateExcelReport } = require('./excelReporter');
const { generateHTMLReport } = require('./htmlReporter');
const { getSummary } = require('./testTracker');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');

async function generateAllReports() {
  logger.info('═══════════════════════════════════════════════');
  logger.info('     GENERATING ALL APPIUM iOS TEST REPORTS     ');
  logger.info('═══════════════════════════════════════════════');

  const summary = getSummary();

  try {
    await generateExcelReport();
  } catch (e) {
    logger.error(`Excel report error: ${e.message}`);
  }

  try {
    await generateHTMLReport();
  } catch (e) {
    logger.error(`HTML report error: ${e.message}`);
  }

  // Summary.md
  const summaryDir = path.join(__dirname, '..', 'reports', 'Summary');
  if (!fs.existsSync(summaryDir)) fs.mkdirSync(summaryDir, { recursive: true });
  const md = `# iOS Appium E2E Execution Summary

Build Number: ${process.env.GITHUB_RUN_NUMBER || 'Local'}
Execution Date: ${new Date().toISOString()}
Git Commit: ${process.env.GITHUB_SHA || 'Local'}
Branch: ${process.env.GITHUB_REF_NAME || 'main'}

Device: iPhone 15 Simulator
iOS Version: 17.0

## Execution Metrics

Total Test Cases: ${summary.total}
Executed: ${summary.executed}
Passed: ${summary.passed}
Failed: ${summary.failed}
Skipped: ${summary.skipped}
Blocked: ${summary.blocked}

Pass Percentage: ${summary.passRate}
Fail Percentage: ${summary.failRate}
Execution Duration: ${summary.totalDuration}
`;
  fs.writeFileSync(path.join(summaryDir, 'summary.md'), md);

  // Write JSON report
  const jsonDir = path.join(__dirname, '..', 'reports', 'JSON');
  if (!fs.existsSync(jsonDir)) fs.mkdirSync(jsonDir, { recursive: true });
  fs.writeFileSync(path.join(jsonDir, 'execution-results.json'), JSON.stringify(summary, null, 2));

  return summary;
}

module.exports = { generateAllReports };

if (require.main === module) {
  generateAllReports().catch(console.error);
}
