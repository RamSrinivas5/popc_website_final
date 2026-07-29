// ============================================================
// MASTER TEST RUNNER — Runs all 5 test layers in sequence
// API | Unit | Threshold | Vulnerability → Excel Report
// ============================================================
const { runAPITests }           = require('./api-tests/api.test');
const { runUnitTests }          = require('./unit-tests/unit.test');
const { runThresholdTests }     = require('./threshold-tests/threshold.test');
const { runVulnerabilityTests } = require('./vulnerability-tests/vulnerability.test');
const { generateExcelReport }   = require('./utils/excelReporter');
const { generateHTMLReport }    = require('./utils/htmlReporter');
const tracker                   = require('./utils/tracker');
const path                      = require('path');
const fs                        = require('fs');

const REPORTS_DIR = path.join(__dirname, 'reports');

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('  🏥  POPC — COMPLETE TESTING SUITE');
  console.log('  API | Unit | Threshold | Vulnerability');
  console.log('═'.repeat(60));
  console.log(`  Started: ${new Date().toLocaleString()}\n`);

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  tracker.reset();

  // ── 1. API TESTS ──────────────────────────────────────────
  try { await runAPITests(); } catch (e) { console.error('API Suite error:', e.message); }

  // ── 2. UNIT TESTS ─────────────────────────────────────────
  try { await runUnitTests(); } catch (e) { console.error('Unit Suite error:', e.message); }

  // ── 3. THRESHOLD TESTS ────────────────────────────────────
  try { await runThresholdTests(); } catch (e) { console.error('Threshold Suite error:', e.message); }

  // ── 4. VULNERABILITY TESTS ────────────────────────────────
  try { await runVulnerabilityTests(); } catch (e) { console.error('Vulnerability Suite error:', e.message); }

  // ── 5. PERSIST RAW RESULTS ────────────────────────────────
  tracker.persist();

  // ── 6. GENERATE EXCEL REPORT ─────────────────────────────
  const sum = tracker.getSummary();
  console.log('\n' + '═'.repeat(60));
  console.log('  📊  GENERATING REPORTS...');
  console.log('═'.repeat(60));

  try {
    const excelPath = await generateExcelReport();
    console.log(`  ✅  Excel  → ${excelPath}`);
    const htmlPath = generateHTMLReport();
    console.log(`  ✅  HTML   → ${htmlPath}`);
  } catch (e) {
    console.error('  ❌  Report generation failed:', e.message);
  }

  // ── 7. FINAL SUMMARY ─────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('  📈  FINAL RESULTS SUMMARY');
  console.log('═'.repeat(60));

  const suites = ['API', 'Unit', 'Threshold', 'Vulnerability'];
  suites.forEach(suite => {
    const st  = tracker.getBySuite(suite);
    const sp  = st.filter(r => r.status === 'PASS').length;
    const sf  = st.filter(r => r.status === 'FAIL').length;
    const sr  = st.length ? ((sp / st.length) * 100).toFixed(1) : '0.0';
    const icon = parseFloat(sr) === 100 ? '✅' : parseFloat(sr) >= 90 ? '🟡' : '❌';
    console.log(`  ${icon}  ${suite.padEnd(18)} ${sp}/${st.length} passed  (${sr}%)`);
  });

  console.log('\n' + '─'.repeat(60));
  console.log(`  TOTAL  : ${sum.total} tests`);
  console.log(`  PASSED : ${sum.passed}`);
  console.log(`  FAILED : ${sum.failed}`);
  console.log(`  SKIP   : ${sum.skipped}`);
  console.log(`  RATE   : ${sum.passRate}%`);
  console.log(`  AVG    : ${sum.avgDuration}ms per test`);
  console.log('─'.repeat(60));
  console.log(`  Completed: ${new Date().toLocaleString()}`);
  console.log('═'.repeat(60) + '\n');

  process.exit(sum.failed > 0 ? 1 : 0);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
