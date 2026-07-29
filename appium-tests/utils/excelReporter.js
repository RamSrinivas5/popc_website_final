// ============================================================
// EXCEL REPORT GENERATOR — Appium iOS (7 Sheets)
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
};

function styleHeader(row, bgColor = COLORS.headerBg, fgColor = COLORS.headerFg) {
  row.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${bgColor}` } };
    cell.font = { bold: true, color: { argb: `FF${fgColor}` }, size: 11, name: 'Calibri' };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });
  row.height = 22;
}

function styleDataRow(row, idx) {
  const bg = idx % 2 === 0 ? COLORS.white : COLORS.altRow;
  row.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${bg}` } };
    cell.font = { size: 10, name: 'Calibri' };
    cell.alignment = { vertical: 'middle', wrapText: true };
  });
  row.height = 18;
}

async function generateExcelReport() {
  ensureDir(reportsDir);
  const summary = getSummary();
  const { results } = summary;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'POPC Appium iOS Framework';
  wb.created = new Date();

  // Sheet 1: Executed Test Cases
  const ws1 = wb.addWorksheet('Executed Test Cases');
  ws1.columns = [
    { key: 'id', width: 16 }, { key: 'module', width: 22 },
    { key: 'name', width: 48 }, { key: 'priority', width: 12 },
    { key: 'status', width: 14 }, { key: 'duration', width: 14 },
    { key: 'error', width: 40 }, { key: 'timestamp', width: 22 },
  ];
  styleHeader(ws1.addRow(['Test ID', 'Module', 'Test Name', 'Priority', 'Status', 'Execution Time (ms)', 'Error Reason', 'Timestamp']));
  results.forEach((r, i) => {
    const row = ws1.addRow([r.id, r.module, r.name, r.priority, r.status, r.duration, r.error || '', r.timestamp]);
    styleDataRow(row, i);
  });

  // Sheet 2: Passed Tests
  const ws2 = wb.addWorksheet('Passed Tests');
  ws2.columns = [{ key: 'id', width: 16 }, { key: 'module', width: 22 }, { key: 'name', width: 48 }, { key: 'duration', width: 14 }];
  styleHeader(ws2.addRow(['Test ID', 'Module', 'Test Name', 'Execution Time (ms)']), '2E7D32');
  results.filter(r => r.status === 'PASS').forEach((r, i) => styleDataRow(ws2.addRow([r.id, r.module, r.name, r.duration]), i));

  // Sheet 3: Failed Tests
  const ws3 = wb.addWorksheet('Failed Tests');
  ws3.columns = [{ key: 'id', width: 16 }, { key: 'module', width: 22 }, { key: 'name', width: 48 }, { key: 'error', width: 50 }];
  styleHeader(ws3.addRow(['Test ID', 'Module', 'Test Name', 'Stack Trace / Failure Reason']), 'C62828');
  results.filter(r => r.status === 'FAIL').forEach((r, i) => styleDataRow(ws3.addRow([r.id, r.module, r.name, r.error || 'Unknown']), i));

  // Sheet 4: Skipped Tests
  const ws4 = wb.addWorksheet('Skipped Tests');
  ws4.columns = [{ key: 'id', width: 16 }, { key: 'module', width: 22 }, { key: 'name', width: 48 }];
  styleHeader(ws4.addRow(['Test ID', 'Module', 'Test Name']), 'F57F17');
  results.filter(r => r.status === 'SKIP').forEach((r, i) => styleDataRow(ws4.addRow([r.id, r.module, r.name]), i));

  // Sheet 5: Execution Metrics
  const ws5 = wb.addWorksheet('Execution Metrics');
  ws5.columns = [{ key: 'm', width: 30 }, { key: 'v', width: 30 }];
  styleHeader(ws5.addRow(['Metric', 'Value']), '0D47A1');
  [
    ['Total Test Cases', summary.total], ['Executed', summary.executed],
    ['Passed', summary.passed], ['Failed', summary.failed],
    ['Skipped', summary.skipped], ['Blocked', summary.blocked],
    ['Pass Rate', summary.passRate], ['Execution Duration', summary.totalDuration],
    ['Platform', 'iOS Simulator'], ['Framework', 'Appium + WebdriverIO'],
  ].forEach(([k, v], i) => styleDataRow(ws5.addRow([k, v]), i));

  // Sheet 6: Defect Summary
  const ws6 = wb.addWorksheet('Defect Summary');
  ws6.columns = [{ key: 'm', width: 25 }, { key: 't', width: 15 }, { key: 'f', width: 15 }];
  styleHeader(ws6.addRow(['Module', 'Total Tests', 'Failed Tests']), 'B71C1C');
  const modMap = {};
  results.forEach(r => {
    if (!modMap[r.module]) modMap[r.module] = { total: 0, failed: 0 };
    modMap[r.module].total++;
    if (r.status === 'FAIL') modMap[r.module].failed++;
  });
  Object.entries(modMap).forEach(([mod, val], i) => styleDataRow(ws6.addRow([mod, val.total, val.failed]), i));

  // Sheet 7: Pass Rate Summary
  const ws7 = wb.addWorksheet('Pass Rate Summary');
  ws7.columns = [{ key: 'm', width: 25 }, { key: 't', width: 15 }, { key: 'pr', width: 15 }];
  styleHeader(ws7.addRow(['Module', 'Total Tests', 'Pass Rate %']), '1B5E20');
  Object.entries(modMap).forEach(([mod, val], i) => {
    const pr = val.total > 0 ? (((val.total - val.failed) / val.total) * 100).toFixed(1) : '0.0';
    styleDataRow(ws7.addRow([mod, val.total, `${pr}%`]), i);
  });

  const mainPath = path.join(reportsDir, 'Automation_Test_Report.xlsx');
  await wb.xlsx.writeFile(mainPath);

  // Write individual files
  await _writeSingleSheet(path.join(reportsDir, 'Passed_Test_Cases.xlsx'), 'Passed', results.filter(r => r.status === 'PASS'), '2E7D32');
  await _writeSingleSheet(path.join(reportsDir, 'Failed_Test_Cases.xlsx'), 'Failed', results.filter(r => r.status === 'FAIL'), 'C62828');
  await _writeSummary(path.join(reportsDir, 'Execution_Summary.xlsx'), summary);

  logger.info(`Excel reports written to ${reportsDir}`);
  return mainPath;
}

async function _writeSingleSheet(filePath, sheetName, data, color) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);
  ws.columns = [{ key: 'id', width: 16 }, { key: 'module', width: 22 }, { key: 'name', width: 48 }, { key: 'duration', width: 14 }];
  styleHeader(ws.addRow(['Test ID', 'Module', 'Test Name', 'Duration (ms)']), color);
  data.forEach((r, i) => styleDataRow(ws.addRow([r.id, r.module, r.name, r.duration]), i));
  await wb.xlsx.writeFile(filePath);
}

async function _writeSummary(filePath, summary) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Summary');
  ws.columns = [{ key: 'k', width: 30 }, { key: 'v', width: 30 }];
  styleHeader(ws.addRow(['Metric', 'Value']));
  [['Total', summary.total], ['Passed', summary.passed], ['Failed', summary.failed], ['Pass Rate', summary.passRate]].forEach(([k, v], i) => styleDataRow(ws.addRow([k, v]), i));
  await wb.xlsx.writeFile(filePath);
}

module.exports = { generateExcelReport };

if (require.main === module) {
  generateExcelReport().catch(console.error);
}
