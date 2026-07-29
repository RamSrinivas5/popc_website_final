// ============================================================
// GENERATE ALL REPORTS
// Orchestrates Excel + HTML + JSON report generation
// ============================================================
const { generateExcelReport } = require('./excelReporter');
const { generateHTMLReport } = require('./htmlReporter');
const { getSummary } = require('./testTracker');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');

async function generateAllReports() {
  logger.info('═══════════════════════════════════════════════');
  logger.info('          GENERATING ALL TEST REPORTS          ');
  logger.info('═══════════════════════════════════════════════');

  const summary = getSummary();

  if (summary.total === 0) {
    logger.warn('No test results found. Run tests first.');
    // Create demo results for CI
    await _createDemoResults();
  }

  try {
    const excelPath = await generateExcelReport();
    logger.info(`✓ Excel Report: ${excelPath}`);
  } catch (e) {
    logger.error(`✗ Excel report failed: ${e.message}`);
  }

  try {
    const htmlPath = await generateHTMLReport();
    logger.info(`✓ HTML Report: ${htmlPath}`);
  } catch (e) {
    logger.error(`✗ HTML report failed: ${e.message}`);
  }

  const finalSummary = getSummary();
  logger.info('═══════════════════════════════════════════════');
  logger.info(`TOTAL: ${finalSummary.total} | PASS: ${finalSummary.passed} | FAIL: ${finalSummary.failed} | SKIP: ${finalSummary.skipped}`);
  logger.info(`PASS RATE: ${finalSummary.passRate}`);
  logger.info('═══════════════════════════════════════════════');

  // Generate summary.md
  const summaryDir = path.join(__dirname, '..', 'reports', 'Summary');
  if (!fs.existsSync(summaryDir)) fs.mkdirSync(summaryDir, { recursive: true });
  const md = `# POPC Selenium E2E Execution Summary

**Generated:** ${new Date().toISOString()}
**Branch:** ${process.env.GITHUB_REF_NAME || 'local'}
**Build:** ${process.env.GITHUB_RUN_NUMBER || 'N/A'}

## Execution Metrics

| Metric | Value |
|--------|-------|
| Total Test Cases | ${finalSummary.total} |
| Executed | ${finalSummary.executed} |
| Passed | ${finalSummary.passed} |
| Failed | ${finalSummary.failed} |
| Skipped | ${finalSummary.skipped} |
| Pass Rate | ${finalSummary.passRate} |
| Duration | ${finalSummary.totalDuration} |

## Status

${parseFloat(finalSummary.passRate) >= 95 ? '✅ **PASSED** — All critical tests passed' : '❌ **FAILED** — Critical tests below 95% threshold'}
`;
  fs.writeFileSync(path.join(summaryDir, 'summary.md'), md);
  logger.info('✓ Summary markdown generated');

  return finalSummary;
}

async function _createDemoResults() {
  const { trackResult } = require('./testTracker');
  // Create minimal demo results so reports render
  await trackResult({ id: 'TC_DEMO_001', module: 'Demo', name: 'Demo test (no results found)', status: 'SKIP' });
}

module.exports = { generateAllReports };

if (require.main === module) {
  generateAllReports().catch(console.error);
}
