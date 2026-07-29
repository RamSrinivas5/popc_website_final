// ============================================================
// EXCEL REPORT GENERATOR — 7 Sheets
// Generates POPC_Selenium_Test_Report.xlsx with full analytics
// ============================================================
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { getSummary } = require('./testTracker');
const logger = require('./logger');

const reportsDir = path.join(__dirname, '..', 'reports', 'Excel');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Color palette
const COLORS = {
  headerBg: '1E3A5F',
  headerFg: 'FFFFFF',
  passBg: 'E8F5E9',
  passFg: '2E7D32',
  failBg: 'FFEBEE',
  failFg: 'C62828',
  skipBg: 'FFF9C4',
  skipFg: 'F57F17',
  altRow: 'F5F7FA',
  white: 'FFFFFF',
  titleBg: '0D47A1',
};

function styleHeader(row, bgColor = COLORS.headerBg, fgColor = COLORS.headerFg) {
  row.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${bgColor}` } };
    cell.font = { bold: true, color: { argb: `FF${fgColor}` }, size: 11, name: 'Calibri' };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' },
    };
  });
  row.height = 22;
}

function styleDataRow(row, idx, statusColor) {
  const bg = idx % 2 === 0 ? COLORS.white : COLORS.altRow;
  row.eachCell(cell => {
    if (!statusColor) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${bg}` } };
    }
    cell.font = { size: 10, name: 'Calibri' };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'hair' }, bottom: { style: 'hair' },
      left: { style: 'hair' }, right: { style: 'hair' },
    };
  });
  row.height = 18;
}

function getStatusStyle(status) {
  switch (status) {
    case 'PASS': return { bg: COLORS.passBg, fg: COLORS.passFg, symbol: '✓ PASS' };
    case 'FAIL': return { bg: COLORS.failBg, fg: COLORS.failFg, symbol: '✗ FAIL' };
    case 'SKIP': return { bg: COLORS.skipBg, fg: COLORS.skipFg, symbol: '⊖ SKIP' };
    default: return { bg: COLORS.white, fg: '000000', symbol: status };
  }
}

async function generateExcelReport() {
  ensureDir(reportsDir);
  const summary = getSummary();
  const { results } = summary;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'POPC Selenium E2E Framework';
  wb.created = new Date();
  wb.properties.date1904 = false;

  // ──── SHEET 1: All Test Cases ────
  const ws1 = wb.addWorksheet('All Test Cases', { properties: { tabColor: { argb: 'FF1E3A5F' } } });
  ws1.columns = [
    { key: 'id', width: 16 },
    { key: 'module', width: 22 },
    { key: 'name', width: 48 },
    { key: 'priority', width: 12 },
    { key: 'status', width: 14 },
    { key: 'duration', width: 14 },
    { key: 'error', width: 40 },
    { key: 'timestamp', width: 22 },
  ];

  const h1 = ws1.addRow(['Test ID', 'Module', 'Test Name', 'Priority', 'Status', 'Duration (ms)', 'Error/Reason', 'Timestamp']);
  styleHeader(h1);

  results.forEach((r, idx) => {
    const { symbol, bg, fg } = getStatusStyle(r.status);
    const row = ws1.addRow([
      r.id, r.module, r.name, r.priority || 'Medium',
      symbol, r.duration, r.error || '', r.timestamp,
    ]);
    styleDataRow(row, idx);
    // Color status cell
    const statusCell = row.getCell(5);
    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${bg}` } };
    statusCell.font = { bold: true, color: { argb: `FF${fg}` }, size: 10, name: 'Calibri' };
    statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  ws1.autoFilter = { from: 'A1', to: 'H1' };
  ws1.views = [{ state: 'frozen', ySplit: 1 }];

  // ──── SHEET 2: Passed Tests ────
  const ws2 = wb.addWorksheet('Passed Tests', { properties: { tabColor: { argb: 'FF2E7D32' } } });
  ws2.columns = [{ key: 'id', width: 16 }, { key: 'module', width: 22 }, { key: 'name', width: 48 }, { key: 'duration', width: 14 }, { key: 'timestamp', width: 22 }];
  const h2 = ws2.addRow(['Test ID', 'Module', 'Test Name', 'Duration (ms)', 'Timestamp']);
  styleHeader(h2, '2E7D32');
  results.filter(r => r.status === 'PASS').forEach((r, idx) => {
    const row = ws2.addRow([r.id, r.module, r.name, r.duration, r.timestamp]);
    styleDataRow(row, idx);
  });
  ws2.autoFilter = { from: 'A1', to: 'E1' };

  // ──── SHEET 3: Failed Tests ────
  const ws3 = wb.addWorksheet('Failed Tests', { properties: { tabColor: { argb: 'FFC62828' } } });
  ws3.columns = [
    { key: 'id', width: 16 }, { key: 'module', width: 22 }, { key: 'name', width: 48 },
    { key: 'error', width: 50 }, { key: 'duration', width: 14 }, { key: 'timestamp', width: 22 },
  ];
  const h3 = ws3.addRow(['Test ID', 'Module', 'Test Name', 'Failure Reason', 'Duration (ms)', 'Timestamp']);
  styleHeader(h3, 'C62828');
  results.filter(r => r.status === 'FAIL').forEach((r, idx) => {
    const row = ws3.addRow([r.id, r.module, r.name, r.error || 'Unknown', r.duration, r.timestamp]);
    styleDataRow(row, idx);
    row.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEE' } };
  });
  ws3.autoFilter = { from: 'A1', to: 'F1' };

  // ──── SHEET 4: Skipped Tests ────
  const ws4 = wb.addWorksheet('Skipped Tests', { properties: { tabColor: { argb: 'FFF57F17' } } });
  ws4.columns = [{ key: 'id', width: 16 }, { key: 'module', width: 22 }, { key: 'name', width: 48 }, { key: 'timestamp', width: 22 }];
  const h4 = ws4.addRow(['Test ID', 'Module', 'Test Name', 'Timestamp']);
  styleHeader(h4, 'F57F17');
  results.filter(r => r.status === 'SKIP').forEach((r, idx) => {
    const row = ws4.addRow([r.id, r.module, r.name, r.timestamp]);
    styleDataRow(row, idx);
  });

  // ──── SHEET 5: Execution Metrics ────
  const ws5 = wb.addWorksheet('Execution Metrics', { properties: { tabColor: { argb: 'FF0D47A1' } } });
  ws5.columns = [{ key: 'metric', width: 30 }, { key: 'value', width: 30 }];
  const h5 = ws5.addRow(['Metric', 'Value']);
  styleHeader(h5, '0D47A1');
  const metrics = [
    ['Total Test Cases', summary.total],
    ['Executed', summary.executed],
    ['Passed', summary.passed],
    ['Failed', summary.failed],
    ['Skipped', summary.skipped],
    ['Blocked', summary.blocked],
    ['Pass Rate', summary.passRate],
    ['Fail Rate', summary.failRate],
    ['Total Execution Duration', summary.totalDuration],
    ['Session Start', summary.sessionStart],
    ['Session End', summary.sessionEnd],
    ['Framework', 'Selenium WebDriver + Mocha (Node.js)'],
    ['Browser', process.env.BROWSER || 'Chrome'],
    ['Environment', process.env.NODE_ENV || 'development'],
    ['Base URL', process.env.BASE_URL || 'http://localhost:5173'],
    ['Report Generated', new Date().toISOString()],
  ];
  metrics.forEach(([k, v], idx) => {
    const row = ws5.addRow([k, v]);
    styleDataRow(row, idx);
    row.getCell(1).font = { bold: true, size: 10, name: 'Calibri' };
  });

  // ──── SHEET 6: Defect Summary (Failed by Module) ────
  const ws6 = wb.addWorksheet('Defect Summary', { properties: { tabColor: { argb: 'FFB71C1C' } } });
  ws6.columns = [{ key: 'module', width: 25 }, { key: 'total', width: 15 }, { key: 'failed', width: 15 }, { key: 'failRate', width: 15 }];
  const h6 = ws6.addRow(['Module', 'Total Tests', 'Failed Tests', 'Fail Rate %']);
  styleHeader(h6, 'B71C1C');
  const moduleMap = {};
  results.forEach(r => {
    if (!moduleMap[r.module]) moduleMap[r.module] = { total: 0, failed: 0 };
    moduleMap[r.module].total++;
    if (r.status === 'FAIL') moduleMap[r.module].failed++;
  });
  Object.entries(moduleMap).forEach(([mod, counts], idx) => {
    const rate = counts.total > 0 ? ((counts.failed / counts.total) * 100).toFixed(1) : '0.0';
    const row = ws6.addRow([mod, counts.total, counts.failed, `${rate}%`]);
    styleDataRow(row, idx);
    if (counts.failed > 0) {
      row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEE' } };
    }
  });

  // ──── SHEET 7: Pass Rate Summary ────
  const ws7 = wb.addWorksheet('Pass Rate Summary', { properties: { tabColor: { argb: 'FF1B5E20' } } });
  ws7.columns = [{ key: 'module', width: 25 }, { key: 'total', width: 15 }, { key: 'passed', width: 15 }, { key: 'passRate', width: 15 }];
  const h7 = ws7.addRow(['Module', 'Total Tests', 'Passed Tests', 'Pass Rate %']);
  styleHeader(h7, '1B5E20');
  Object.entries(moduleMap).forEach(([mod, counts], idx) => {
    const passed = counts.total - counts.failed;
    const rate = counts.total > 0 ? ((passed / counts.total) * 100).toFixed(1) : '0.0';
    const row = ws7.addRow([mod, counts.total, passed, `${rate}%`]);
    styleDataRow(row, idx);
    if (parseFloat(rate) === 100) {
      row.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
      row.getCell(4).font = { bold: true, color: { argb: 'FF2E7D32' }, size: 10, name: 'Calibri' };
    }
  });

  const filePath = path.join(reportsDir, 'POPC_Selenium_Test_Report.xlsx');
  await wb.xlsx.writeFile(filePath);
  logger.info(`Excel report saved: ${filePath}`);

  // Write passed-only and failed-only workbooks
  await _writeSingleSheetWorkbook(path.join(reportsDir, 'Passed_Test_Cases.xlsx'), 'Passed Tests', results.filter(r => r.status === 'PASS'), '2E7D32');
  await _writeSingleSheetWorkbook(path.join(reportsDir, 'Failed_Test_Cases.xlsx'), 'Failed Tests', results.filter(r => r.status === 'FAIL'), 'C62828');
  await _writeSummaryWorkbook(path.join(reportsDir, 'Execution_Summary.xlsx'), summary);

  return filePath;
}

async function _writeSingleSheetWorkbook(filePath, sheetName, data, color) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);
  ws.columns = [
    { key: 'id', width: 16 }, { key: 'module', width: 22 },
    { key: 'name', width: 48 }, { key: 'duration', width: 14 }, { key: 'error', width: 40 },
  ];
  const h = ws.addRow(['Test ID', 'Module', 'Test Name', 'Duration (ms)', 'Notes']);
  styleHeader(h, color);
  data.forEach((r, idx) => {
    const row = ws.addRow([r.id, r.module, r.name, r.duration, r.error || '']);
    styleDataRow(row, idx);
  });
  await wb.xlsx.writeFile(filePath);
}

async function _writeSummaryWorkbook(filePath, summary) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Execution Summary');
  ws.columns = [{ key: 'k', width: 30 }, { key: 'v', width: 30 }];
  const h = ws.addRow(['Metric', 'Value']);
  styleHeader(h);
  [
    ['Total', summary.total], ['Passed', summary.passed],
    ['Failed', summary.failed], ['Skipped', summary.skipped],
    ['Pass Rate', summary.passRate], ['Duration', summary.totalDuration],
  ].forEach(([k, v], i) => {
    const row = ws.addRow([k, v]);
    styleDataRow(row, i);
  });
  await wb.xlsx.writeFile(filePath);
}

module.exports = { generateExcelReport };

// CLI: node utils/excelReporter.js
if (require.main === module) {
  generateExcelReport()
    .then(f => console.log('Excel report generated:', f))
    .catch(console.error);
}
