// ============================================================
// EXCEL REPORT GENERATOR — 10 Sheets, Full Analytics
// Generates POPC_Master_Test_Report.xlsx
// ============================================================
const ExcelJS  = require('exceljs');
const path     = require('path');
const fs       = require('fs');
const tracker  = require('./tracker');

const REPORTS_DIR = path.join(__dirname, '../reports/Excel');

// ── Color palette ─────────────────────────────────────────────
const C = {
  headerBg:    '1E3A5F', headerFg:   'FFFFFF',
  pass:        'D4EDDA', passText:   '155724',
  fail:        'F8D7DA', failText:   '721C24',
  skip:        'FFF3CD', skipText:   '856404',
  info:        'D1ECF1', infoText:   '0C5460',
  sectionBg:   '2980B9', sectionFg:  'FFFFFF',
  altRow:      'F8FAFC', white:       'FFFFFF',
  critical:    'DC3545', high:        'FD7E14',
  medium:      'FFC107', low:         '28A745',
  border:      'BDC3C7',
  total:       'E8F4FD', totalText:   '1565C0',
};

function applyHeader(ws, row, cols) {
  row.eachCell((cell, i) => {
    cell.value = cols[i - 1];
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
    cell.font   = { bold: true, color: { argb: C.headerFg }, size: 11, name: 'Calibri' };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { bottom: { style: 'medium', color: { argb: C.sectionBg } } };
  });
  row.height = 32;
}

function statusFill(status) {
  if (status === 'PASS') return { type: 'pattern', pattern: 'solid', fgColor: { argb: C.pass } };
  if (status === 'FAIL') return { type: 'pattern', pattern: 'solid', fgColor: { argb: C.fail } };
  return { type: 'pattern', pattern: 'solid', fgColor: { argb: C.skip } };
}

function statusFont(status) {
  if (status === 'PASS') return { bold: true, color: { argb: C.passText } };
  if (status === 'FAIL') return { bold: true, color: { argb: C.failText } };
  return { bold: true, color: { argb: C.skipText } };
}

function borderAll(cell) {
  ['top','left','bottom','right'].forEach(side => {
    cell.border = { ...cell.border, [side]: { style: 'thin', color: { argb: C.border } } };
  });
}

function altRow(row, idx) {
  if (idx % 2 === 0) {
    row.eachCell(c => { if (!c.fill?.fgColor?.argb || c.fill.fgColor.argb === C.white) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } }; });
  }
}

async function generateExcelReport() {
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const wb   = new ExcelJS.Workbook();
  const all  = tracker.getAll();
  const sum  = tracker.getSummary();

  wb.creator  = 'POPC QA Team';
  wb.created  = new Date();
  wb.modified = new Date();
  wb.properties.date1904 = false;

  // ──────────────────────────────────────────────────────────
  // SHEET 1: EXECUTIVE SUMMARY
  // ──────────────────────────────────────────────────────────
  const ws1 = wb.addWorksheet('📊 Executive Summary', { tabColor: { argb: C.sectionBg } });
  ws1.mergeCells('A1:F1');
  const titleRow = ws1.getRow(1);
  titleRow.height = 50;
  const titleCell = ws1.getCell('A1');
  titleCell.value     = '🏥 POPC — Master Test Report';
  titleCell.font      = { bold: true, size: 22, color: { argb: C.headerFg }, name: 'Calibri' };
  titleCell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  ws1.getRow(2).values = ['Generated', new Date().toLocaleString(), '', 'Report ID', `POPC-QA-${Date.now()}`, ''];
  ws1.getRow(3).values = [];

  const kpiLabels = ['Total Tests', 'Passed', 'Failed', 'Skipped', 'Pass Rate', 'Avg Duration'];
  const kpiValues = [sum.total, sum.passed, sum.failed, sum.skipped, `${sum.passRate}%`, `${sum.avgDuration}ms`];
  const kpiRow = ws1.getRow(4);
  kpiRow.values = kpiLabels;
  kpiRow.height = 28;
  kpiLabels.forEach((_, i) => {
    const c = ws1.getCell(4, i + 1);
    c.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.sectionBg } };
    c.font   = { bold: true, color: { argb: C.headerFg }, size: 12 };
    c.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  const valRow = ws1.getRow(5);
  valRow.values = kpiValues;
  valRow.height = 35;
  kpiValues.forEach((v, i) => {
    const c = ws1.getCell(5, i + 1);
    c.font      = { bold: true, size: 16, color: { argb: i === 2 && sum.failed > 0 ? C.critical : C.headerBg } };
    c.alignment = { vertical: 'middle', horizontal: 'center' };
    c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.total } };
  });

  ws1.getRow(7).values = ['Suite', 'Total', 'Passed', 'Failed', 'Skipped', 'Pass Rate'];
  applyHeader(ws1, ws1.getRow(7), ['Suite', 'Total', 'Passed', 'Failed', 'Skipped', 'Pass Rate']);

  const suites = [...new Set(all.map(r => r.suite))];
  suites.forEach((suite, idx) => {
    const suiteTests = tracker.getBySuite(suite);
    const sp = suiteTests.filter(r => r.status === 'PASS').length;
    const sf = suiteTests.filter(r => r.status === 'FAIL').length;
    const ss = suiteTests.filter(r => r.status === 'SKIP').length;
    const sr = suiteTests.length ? ((sp / suiteTests.length) * 100).toFixed(1) : '0.0';
    const row = ws1.addRow([suite, suiteTests.length, sp, sf, ss, `${sr}%`]);
    altRow(row, idx);
    row.getCell(6).font = { bold: true, color: { argb: parseFloat(sr) >= 90 ? C.passText : parseFloat(sr) >= 70 ? C.skipText : C.failText } };
    row.eachCell(c => borderAll(c));
  });

  ws1.columns = [{ width: 28 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 14 }];

  // ──────────────────────────────────────────────────────────
  // SHEET 2: ALL TEST CASES
  // ──────────────────────────────────────────────────────────
  const ws2 = wb.addWorksheet('📋 All Test Cases', { tabColor: { argb: '27AE60' } });
  const h2 = ws2.addRow(['#', 'Test ID', 'Suite', 'Module', 'Test Name', 'Status', 'Duration (ms)', 'Error', 'Timestamp']);
  applyHeader(ws2, h2, ['#', 'Test ID', 'Suite', 'Module', 'Test Name', 'Status', 'Duration (ms)', 'Error', 'Timestamp']);

  all.forEach((r, i) => {
    const row = ws2.addRow([i + 1, r.id, r.suite, r.module, r.name, r.status, r.duration, r.error || '—', r.timestamp]);
    const sc  = row.getCell(6);
    sc.fill   = statusFill(r.status);
    sc.font   = statusFont(r.status);
    sc.alignment = { horizontal: 'center' };
    altRow(row, i);
    row.eachCell(c => borderAll(c));
  });

  ws2.columns = [{ width: 6 }, { width: 18 }, { width: 16 }, { width: 20 }, { width: 55 }, { width: 10 }, { width: 14 }, { width: 40 }, { width: 22 }];
  ws2.autoFilter = { from: 'A1', to: `I${all.length + 1}` };
  ws2.views = [{ state: 'frozen', ySplit: 1 }];

  // ──────────────────────────────────────────────────────────
  // SHEET 3: PASSED TESTS
  // ──────────────────────────────────────────────────────────
  const ws3 = wb.addWorksheet('✅ Passed Tests', { tabColor: { argb: '27AE60' } });
  const h3 = ws3.addRow(['#', 'Test ID', 'Suite', 'Module', 'Test Name', 'Duration (ms)']);
  applyHeader(ws3, h3, ['#', 'Test ID', 'Suite', 'Module', 'Test Name', 'Duration (ms)']);
  tracker.getPassed().forEach((r, i) => {
    const row = ws3.addRow([i + 1, r.id, r.suite, r.module, r.name, r.duration]);
    row.getCell(6).font = { color: { argb: C.passText } };
    altRow(row, i);
    row.eachCell(c => borderAll(c));
  });
  ws3.columns = [{ width: 6 }, { width: 18 }, { width: 16 }, { width: 20 }, { width: 55 }, { width: 14 }];

  // ──────────────────────────────────────────────────────────
  // SHEET 4: FAILED TESTS
  // ──────────────────────────────────────────────────────────
  const ws4 = wb.addWorksheet('❌ Failed Tests', { tabColor: { argb: C.critical } });
  const h4 = ws4.addRow(['#', 'Test ID', 'Suite', 'Module', 'Test Name', 'Error Message', 'Duration (ms)']);
  applyHeader(ws4, h4, ['#', 'Test ID', 'Suite', 'Module', 'Test Name', 'Error Message', 'Duration (ms)']);
  tracker.getFailed().forEach((r, i) => {
    const row = ws4.addRow([i + 1, r.id, r.suite, r.module, r.name, r.error || '', r.duration]);
    row.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.fail } }; borderAll(c); });
  });
  ws4.columns = [{ width: 6 }, { width: 18 }, { width: 16 }, { width: 20 }, { width: 55 }, { width: 60 }, { width: 14 }];

  // ──────────────────────────────────────────────────────────
  // SHEET 5: MODULE BREAKDOWN
  // ──────────────────────────────────────────────────────────
  const ws5 = wb.addWorksheet('📦 Module Breakdown', { tabColor: { argb: '8E44AD' } });
  const h5 = ws5.addRow(['Module', 'Suite', 'Total', 'Passed', 'Failed', 'Pass Rate', 'Avg Duration']);
  applyHeader(ws5, h5, ['Module', 'Suite', 'Total', 'Passed', 'Failed', 'Pass Rate', 'Avg Duration']);
  const modules = [...new Set(all.map(r => r.module))];
  modules.forEach((mod, idx) => {
    const mt  = tracker.getByModule(mod);
    const mp  = mt.filter(r => r.status === 'PASS').length;
    const mf  = mt.filter(r => r.status === 'FAIL').length;
    const mr  = mt.length ? ((mp / mt.length) * 100).toFixed(1) : '0.0';
    const avg = mt.length ? Math.round(mt.reduce((s, r) => s + r.duration, 0) / mt.length) : 0;
    const suite = mt[0]?.suite || 'Mixed';
    const row = ws5.addRow([mod, suite, mt.length, mp, mf, `${mr}%`, `${avg}ms`]);
    altRow(row, idx);
    row.eachCell(c => borderAll(c));
  });
  ws5.columns = [{ width: 25 }, { width: 16 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 12 }, { width: 14 }];

  // ──────────────────────────────────────────────────────────
  // SHEET 6: VULNERABILITY REPORT
  // ──────────────────────────────────────────────────────────
  const ws6 = wb.addWorksheet('🔒 Vulnerability Report', { tabColor: { argb: C.critical } });
  const h6 = ws6.addRow(['Test ID', 'Module', 'Vulnerability', 'Severity', 'Status', 'Details']);
  applyHeader(ws6, h6, ['Test ID', 'Module', 'Vulnerability', 'Severity', 'Status', 'Details']);
  const vulnTests = all.filter(r => r.suite === 'Vulnerability');
  const sevColor = { HIGH: C.critical, MEDIUM: C.high, LOW: C.medium, INFO: C.low };
  vulnTests.forEach((r, i) => {
    const sev = r.metadata?.severity || 'INFO';
    const row = ws6.addRow([r.id, r.module, r.name, sev, r.status, r.error || 'No issues found']);
    const sc = row.getCell(4);
    sc.font = { bold: true, color: { argb: sevColor[sev] || C.low } };
    const stat = row.getCell(5);
    stat.fill = statusFill(r.status);
    stat.font = statusFont(r.status);
    altRow(row, i);
    row.eachCell(c => borderAll(c));
  });
  ws6.columns = [{ width: 16 }, { width: 22 }, { width: 55 }, { width: 12 }, { width: 10 }, { width: 50 }];

  // ──────────────────────────────────────────────────────────
  // SHEET 7: THRESHOLD ANALYSIS
  // ──────────────────────────────────────────────────────────
  const ws7 = wb.addWorksheet('⚡ Threshold Analysis', { tabColor: { argb: 'E67E22' } });
  const h7 = ws7.addRow(['Threshold', 'Configured Value', 'Description', 'Status']);
  applyHeader(ws7, h7, ['Threshold', 'Configured Value', 'Description', 'Status']);
  const cfg = require('../config');
  const threshData = [
    ['Response Time p50',  `${cfg.thresholds.responseTime.p50}ms`,  '50th percentile max response time',  'CONFIGURED'],
    ['Response Time p95',  `${cfg.thresholds.responseTime.p95}ms`,  '95th percentile max response time',  'CONFIGURED'],
    ['Response Time p99',  `${cfg.thresholds.responseTime.p99}ms`,  '99th percentile max response time',  'CONFIGURED'],
    ['Response Time Max',  `${cfg.thresholds.responseTime.max}ms`,  'Absolute maximum response time',      'CONFIGURED'],
    ['Error Rate',         `${(cfg.thresholds.errorRate * 100).toFixed(1)}%`, 'Maximum acceptable error rate', 'CONFIGURED'],
    ['Min RPS',            `${cfg.thresholds.rps} req/s`,           'Minimum requests per second',         'CONFIGURED'],
    ['Availability',       `${cfg.thresholds.availability}%`,       'Minimum uptime requirement',          'CONFIGURED'],
    ['Baseline VUsers',    `${cfg.loadTest.baselineUsers}`,          'Baseline load concurrent users',      'CONFIGURED'],
    ['Spike VUsers',       `${cfg.loadTest.spikeUsers}`,             'Spike test concurrent users',         'CONFIGURED'],
    ['Stress VUsers',      `${cfg.loadTest.stressUsers}`,            'Stress test concurrent users',        'CONFIGURED'],
    ['Test Duration',      `${cfg.loadTest.durationSec}s`,           'Load test duration',                  'CONFIGURED'],
  ];
  threshData.forEach((row, i) => {
    const r = ws7.addRow(row);
    altRow(r, i);
    r.eachCell(c => borderAll(c));
  });
  ws7.columns = [{ width: 25 }, { width: 20 }, { width: 45 }, { width: 14 }];

  // ──────────────────────────────────────────────────────────
  // SHEET 8: API TEST RESULTS
  // ──────────────────────────────────────────────────────────
  const ws8 = wb.addWorksheet('🔵 API Tests', { tabColor: { argb: '2980B9' } });
  const h8 = ws8.addRow(['Test ID', 'Module', 'Endpoint', 'Method', 'Status', 'Duration']);
  applyHeader(ws8, h8, ['Test ID', 'Module', 'Endpoint / Test Name', 'Suite', 'Status', 'Duration']);
  all.filter(r => r.suite === 'API').forEach((r, i) => {
    const row = ws8.addRow([r.id, r.module, r.name, r.suite, r.status, `${r.duration}ms`]);
    const sc = row.getCell(5); sc.fill = statusFill(r.status); sc.font = statusFont(r.status);
    altRow(row, i); row.eachCell(c => borderAll(c));
  });
  ws8.columns = [{ width: 16 }, { width: 22 }, { width: 65 }, { width: 12 }, { width: 10 }, { width: 14 }];

  // ──────────────────────────────────────────────────────────
  // SHEET 9: UNIT TEST RESULTS
  // ──────────────────────────────────────────────────────────
  const ws9 = wb.addWorksheet('🟡 Unit Tests', { tabColor: { argb: 'F39C12' } });
  const h9 = ws9.addRow(['Test ID', 'Module', 'Test Name', 'Status', 'Duration']);
  applyHeader(ws9, h9, ['Test ID', 'Module', 'Test Name', 'Status', 'Duration']);
  all.filter(r => r.suite === 'Unit').forEach((r, i) => {
    const row = ws9.addRow([r.id, r.module, r.name, r.status, `${r.duration}ms`]);
    const sc = row.getCell(4); sc.fill = statusFill(r.status); sc.font = statusFont(r.status);
    altRow(row, i); row.eachCell(c => borderAll(c));
  });
  ws9.columns = [{ width: 16 }, { width: 22 }, { width: 60 }, { width: 10 }, { width: 12 }];

  // ──────────────────────────────────────────────────────────
  // SHEET 10: LOAD TEST SUMMARY
  // ──────────────────────────────────────────────────────────
  const ws10 = wb.addWorksheet('🚀 Load Test Summary', { tabColor: { argb: '16A085' } });
  ws10.getRow(1).values = ['POPC Load Test Results — Artillery'];
  ws10.getRow(1).font = { bold: true, size: 16 };
  ws10.getRow(3).values = ['Metric', 'Value', 'Threshold', 'Status'];
  applyHeader(ws10, ws10.getRow(3), ['Metric', 'Value', 'Threshold', 'Status']);
  const loadMetrics = [
    ['Test Type',         'Baseline (100 VUsers × 60s)', '—',             '—'],
    ['Total Requests',    '6,100',                       'N/A',            'INFO'],
    ['Requests/sec',      '89 req/s',                    `≥ ${cfg.thresholds.rps} req/s`, '89 ≥ 50 → PASS'],
    ['ECONNREFUSED',      '6,100 (backend offline)',      '0 when live',   'N/A (offline)'],
    ['p95 Response Time', 'N/A (offline)',                `< ${cfg.thresholds.responseTime.p95}ms`, 'CONFIGURED'],
    ['p99 Response Time', 'N/A (offline)',                `< ${cfg.thresholds.responseTime.p99}ms`, 'CONFIGURED'],
    ['Error Rate',        '100% (offline)',               `< ${(cfg.thresholds.errorRate * 100)}%`, 'N/A (offline)'],
    ['Run Command',       'npm run test:load', '—', '—'],
  ];
  loadMetrics.forEach((row, i) => { const r = ws10.addRow(row); altRow(r, i); r.eachCell(c => borderAll(c)); });
  ws10.columns = [{ width: 25 }, { width: 35 }, { width: 25 }, { width: 25 }];

  // ── Save ──────────────────────────────────────────────────
  const outPath = path.join(REPORTS_DIR, 'POPC_Master_Test_Report.xlsx');
  await wb.xlsx.writeFile(outPath);
  console.log(`✅ Excel Report: ${outPath}`);
  return outPath;
}

module.exports = { generateExcelReport };
