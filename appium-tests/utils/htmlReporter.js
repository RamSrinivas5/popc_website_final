// ============================================================
// HTML REPORT GENERATOR — Appium iOS
// ============================================================
const fs = require('fs');
const path = require('path');
const { getSummary } = require('./testTracker');
const screenshotUtil = require('./screenshotUtil');
const logger = require('./logger');

const reportsDir = path.join(__dirname, '..', 'reports', 'HTML');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function generateHTMLReport() {
  ensureDir(reportsDir);
  const summary = getSummary();

  const failRows = summary.results.filter(r => r.status === 'FAIL').map(r => `
    <tr>
      <td><code>${r.id}</code></td>
      <td>${r.module}</td>
      <td>${r.name}</td>
      <td style="color:#C62828"><strong>FAIL</strong></td>
      <td style="color:#C62828">${r.error || '-'}</td>
    </tr>
  `).join('');

  const allRows = summary.results.map(r => `
    <tr>
      <td><code>${r.id}</code></td>
      <td>${r.module}</td>
      <td>${r.name}</td>
      <td style="color:${r.status === 'PASS' ? '#2E7D32' : r.status === 'FAIL' ? '#C62828' : '#F57F17'}"><strong>${r.status}</strong></td>
      <td>${r.duration}ms</td>
      <td>${r.error || '-'}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>POPC iOS Appium Execution Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F4F6F9; margin: 0; padding: 20px; }
    .header { background: #1E3A5F; color: white; padding: 24px; border-radius: 8px; margin-bottom: 20px; }
    .cards { display: flex; gap: 16px; margin-bottom: 20px; }
    .card { background: white; padding: 20px; border-radius: 8px; flex: 1; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .card h2 { margin: 0; font-size: 32px; }
    .card p { margin: 4px 0 0; color: #666; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    th { background: #1E3A5F; color: white; text-align: left; padding: 12px; }
    td { padding: 10px 12px; border-bottom: 1px solid #EEE; }
    tr:nth-child(even) { background: #FAFAFA; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📱 POPC iOS Application — Appium E2E Execution Report</h1>
    <p>Generated: ${new Date().toLocaleString()} | Target: iOS Simulator / Device</p>
  </div>
  <div class="cards">
    <div class="card"><h2 style="color:#1E3A5F">${summary.total}</h2><p>Total Test Cases</p></div>
    <div class="card"><h2 style="color:#2E7D32">${summary.passed}</h2><p>Passed</p></div>
    <div class="card"><h2 style="color:#C62828">${summary.failed}</h2><p>Failed</p></div>
    <div class="card"><h2 style="color:#F57F17">${summary.skipped}</h2><p>Skipped</p></div>
    <div class="card"><h2 style="color:#0D47A1">${summary.passRate}</h2><p>Pass Rate</p></div>
  </div>
  <h2>Execution Details</h2>
  <table>
    <thead><tr><th>ID</th><th>Module</th><th>Test Name</th><th>Status</th><th>Duration</th><th>Error</th></tr></thead>
    <tbody>${allRows}</tbody>
  </table>
</body>
</html>`;

  const reportPath = path.join(reportsDir, 'execution-report.html');
  fs.writeFileSync(reportPath, html);

  const dashboardPath = path.join(reportsDir, 'dashboard.html');
  fs.writeFileSync(dashboardPath, html);

  const rootPath = path.join(__dirname, '..', 'reports', 'execution-report.html');
  fs.writeFileSync(rootPath, html);

  logger.info(`HTML report saved to ${reportPath}`);
  return reportPath;
}

module.exports = { generateHTMLReport };

if (require.main === module) {
  generateHTMLReport().catch(console.error);
}
