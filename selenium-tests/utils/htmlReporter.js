// ============================================================
// HTML REPORT GENERATOR — Premium Dashboard Report
// Generates execution-report.html with charts, screenshots & metrics
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

function statusBadge(status) {
  const badges = {
    PASS: '<span class="badge badge-pass">✓ PASS</span>',
    FAIL: '<span class="badge badge-fail">✗ FAIL</span>',
    SKIP: '<span class="badge badge-skip">⊖ SKIP</span>',
    BLOCKED: '<span class="badge badge-blocked">⊘ BLOCKED</span>',
  };
  return badges[status] || `<span class="badge">${status}</span>`;
}

function moduleColor(module) {
  const colors = {
    'Authentication': '#1565C0', 'Patient Management': '#00695C',
    'Dashboard': '#6A1B9A', 'Surveys': '#E65100',
    'Profile/Settings/Chat': '#37474F', 'Regression': '#1B5E20',
    'Navigation': '#880E4F',
  };
  return colors[module] || '#455A64';
}

function generateHTML(summary) {
  const failedTests = summary.results.filter(r => r.status === 'FAIL');
  const failScreenshots = screenshotUtil.list('fail');

  const failRows = failedTests.map(r => {
    const screenshot = failScreenshots.find(s => s.name.includes(r.id?.replace(/[^a-zA-Z0-9]/g, '')));
    const imgTag = screenshot
      ? `<img class="screenshot" src="${screenshotUtil.toBase64(screenshot.path)}" alt="screenshot" />`
      : '<span class="no-screenshot">No screenshot</span>';
    return `
      <tr class="fail-row">
        <td><code>${r.id}</code></td>
        <td><span class="module-tag" style="background:${moduleColor(r.module)}">${r.module}</span></td>
        <td>${r.name}</td>
        <td>${statusBadge(r.status)}</td>
        <td class="error-cell">${r.error || '-'}</td>
        <td>${imgTag}</td>
      </tr>`;
  }).join('');

  const allRows = summary.results.map(r => `
    <tr class="${r.status.toLowerCase()}-row">
      <td><code>${r.id}</code></td>
      <td><span class="module-tag" style="background:${moduleColor(r.module)}">${r.module}</span></td>
      <td>${r.name}</td>
      <td>${statusBadge(r.status)}</td>
      <td>${r.duration}ms</td>
      <td>${r.error ? `<span class="error-text">${r.error}</span>` : '-'}</td>
    </tr>
  `).join('');

  // Module summary for donut chart
  const moduleMap = {};
  summary.results.forEach(r => {
    if (!moduleMap[r.module]) moduleMap[r.module] = { pass: 0, fail: 0, skip: 0, total: 0 };
    moduleMap[r.module].total++;
    if (r.status === 'PASS') moduleMap[r.module].pass++;
    else if (r.status === 'FAIL') moduleMap[r.module].fail++;
    else moduleMap[r.module].skip++;
  });

  const moduleRows = Object.entries(moduleMap).map(([mod, counts]) => {
    const rate = counts.total > 0 ? ((counts.pass / counts.total) * 100).toFixed(1) : '0.0';
    return `
      <tr>
        <td><span class="module-tag" style="background:${moduleColor(mod)}">${mod}</span></td>
        <td>${counts.total}</td>
        <td class="pass-text">${counts.pass}</td>
        <td class="fail-text">${counts.fail}</td>
        <td class="skip-text">${counts.skip}</td>
        <td>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${rate}%; background:${parseFloat(rate) >= 95 ? '#2E7D32' : parseFloat(rate) >= 80 ? '#F57F17' : '#C62828'}"></div>
          </div>
          <strong>${rate}%</strong>
        </td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>POPC Selenium E2E Test Report</title>
  <style>
    :root {
      --primary: #1E3A5F;
      --success: #2E7D32;
      --danger: #C62828;
      --warning: #F57F17;
      --info: #0277BD;
      --bg: #F0F2F5;
      --card: #FFFFFF;
      --text: #1A1A2E;
      --muted: #6B7280;
      --border: #E5E7EB;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', -apple-system, sans-serif; background: var(--bg); color: var(--text); }
    .header {
      background: linear-gradient(135deg, #1E3A5F 0%, #0D47A1 50%, #1565C0 100%);
      color: white; padding: 32px 40px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
    .header h1 { font-size: 28px; font-weight: 700; }
    .header .meta { margin-top: 8px; opacity: 0.85; font-size: 13px; display: flex; gap: 24px; flex-wrap: wrap; }
    .container { max-width: 1400px; margin: 0 auto; padding: 32px 24px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .metric-card {
      background: var(--card); border-radius: 12px; padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08); text-align: center;
      border-top: 4px solid;
    }
    .metric-card.total { border-color: var(--primary); }
    .metric-card.pass { border-color: var(--success); }
    .metric-card.fail { border-color: var(--danger); }
    .metric-card.skip { border-color: var(--warning); }
    .metric-card.rate { border-color: var(--info); }
    .metric-value { font-size: 42px; font-weight: 800; }
    .metric-card.pass .metric-value { color: var(--success); }
    .metric-card.fail .metric-value { color: var(--danger); }
    .metric-card.skip .metric-value { color: var(--warning); }
    .metric-card.total .metric-value { color: var(--primary); }
    .metric-card.rate .metric-value { color: var(--info); }
    .metric-label { color: var(--muted); font-size: 13px; margin-top: 4px; font-weight: 500; }
    .section { background: var(--card); border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .section h2 { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: var(--primary); padding-bottom: 8px; border-bottom: 2px solid var(--border); }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: var(--primary); color: white; padding: 10px 12px; text-align: left; font-weight: 600; }
    td { padding: 9px 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    tr:nth-child(even) td { background: #F8FAFC; }
    tr:hover td { background: #EFF6FF; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-pass { background: #E8F5E9; color: #2E7D32; }
    .badge-fail { background: #FFEBEE; color: #C62828; }
    .badge-skip { background: #FFF9C4; color: #F57F17; }
    .badge-blocked { background: #EDE7F6; color: #4527A0; }
    .module-tag { color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; white-space: nowrap; font-weight: 600; }
    code { background: #F1F5F9; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: var(--primary); }
    .error-cell { color: var(--danger); font-size: 12px; max-width: 300px; }
    .error-text { color: var(--danger); font-size: 12px; }
    .pass-text { color: var(--success); font-weight: 600; }
    .fail-text { color: var(--danger); font-weight: 600; }
    .skip-text { color: var(--warning); font-weight: 600; }
    .progress-bar { height: 8px; background: #E5E7EB; border-radius: 4px; overflow: hidden; margin-bottom: 4px; }
    .progress-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
    .screenshot { max-width: 120px; max-height: 80px; border-radius: 4px; cursor: pointer; border: 1px solid var(--border); }
    .no-screenshot { color: var(--muted); font-size: 11px; }
    .summary-bar { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; padding: 16px; background: linear-gradient(135deg, #EFF6FF, #F0FDF4); border-radius: 12px; border: 1px solid var(--border); }
    .summary-item { text-align: center; flex: 1; min-width: 120px; }
    .summary-item .label { font-size: 12px; color: var(--muted); margin-bottom: 4px; }
    .summary-item .value { font-size: 20px; font-weight: 700; }
    .tabs { display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 2px solid var(--border); }
    .tab { padding: 8px 18px; cursor: pointer; font-size: 13px; font-weight: 600; border-radius: 6px 6px 0 0; color: var(--muted); border: 1px solid transparent; }
    .tab.active { color: var(--primary); background: white; border-color: var(--border); border-bottom-color: white; margin-bottom: -2px; }
    .tab-content { display: none; } .tab-content.active { display: block; }
    input.search { width: 300px; padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; }
    .footer { text-align: center; padding: 24px; color: var(--muted); font-size: 12px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧪 POPC Web Application — Selenium E2E Test Report</h1>
    <div class="meta">
      <span>📅 Generated: ${new Date().toLocaleString()}</span>
      <span>🌐 Browser: ${process.env.BROWSER || 'Chrome'}</span>
      <span>🔗 URL: ${process.env.BASE_URL || 'http://localhost:5173'}</span>
      <span>⏱ Duration: ${summary.totalDuration}</span>
      <span>🌿 Branch: ${process.env.GITHUB_REF_NAME || 'local'}</span>
    </div>
  </div>

  <div class="container">
    <!-- Metrics -->
    <div class="metrics-grid">
      <div class="metric-card total"><div class="metric-value">${summary.total}</div><div class="metric-label">Total Tests</div></div>
      <div class="metric-card pass"><div class="metric-value">${summary.passed}</div><div class="metric-label">Passed</div></div>
      <div class="metric-card fail"><div class="metric-value">${summary.failed}</div><div class="metric-label">Failed</div></div>
      <div class="metric-card skip"><div class="metric-value">${summary.skipped}</div><div class="metric-label">Skipped</div></div>
      <div class="metric-card rate"><div class="metric-value">${summary.passRate}</div><div class="metric-label">Pass Rate</div></div>
    </div>

    <!-- Module Summary -->
    <div class="section">
      <h2>📊 Module Test Summary</h2>
      <table>
        <thead><tr><th>Module</th><th>Total</th><th>Passed</th><th>Failed</th><th>Skipped</th><th>Pass Rate</th></tr></thead>
        <tbody>${moduleRows}</tbody>
      </table>
    </div>

    <!-- All Results (tabbed) -->
    <div class="section">
      <h2>📋 Test Execution Results</h2>
      <div style="margin-bottom:12px">
        <input class="search" type="text" id="tableSearch" placeholder="🔍 Search tests..." onkeyup="filterTable()" />
      </div>
      <div class="tabs">
        <div class="tab active" onclick="showTab('all')">All (${summary.total})</div>
        <div class="tab" onclick="showTab('fail')">Failed (${summary.failed})</div>
        <div class="tab" onclick="showTab('pass')">Passed (${summary.passed})</div>
      </div>
      <div id="all" class="tab-content active">
        <table id="resultsTable">
          <thead><tr><th>Test ID</th><th>Module</th><th>Test Name</th><th>Status</th><th>Duration</th><th>Error</th></tr></thead>
          <tbody>${allRows}</tbody>
        </table>
      </div>
      <div id="fail" class="tab-content">
        <table>
          <thead><tr><th>Test ID</th><th>Module</th><th>Test Name</th><th>Status</th><th>Failure Reason</th><th>Screenshot</th></tr></thead>
          <tbody>${failRows || '<tr><td colspan="6" style="text-align:center;color:#2E7D32;padding:20px">🎉 No failed tests!</td></tr>'}</tbody>
        </table>
      </div>
      <div id="pass" class="tab-content">
        <table>
          <thead><tr><th>Test ID</th><th>Module</th><th>Test Name</th><th>Status</th><th>Duration</th><th>-</th></tr></thead>
          <tbody>${summary.results.filter(r => r.status === 'PASS').map(r => `
            <tr><td><code>${r.id}</code></td><td><span class="module-tag" style="background:${moduleColor(r.module)}">${r.module}</span></td>
            <td>${r.name}</td><td>${statusBadge('PASS')}</td><td>${r.duration}ms</td><td>-</td></tr>
          `).join('')}</tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="footer">POPC Selenium E2E Framework | Generated ${new Date().toISOString()} | 400+ Test Cases</div>

  <script>
    function showTab(id) {
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      event.target.classList.add('active');
    }
    function filterTable() {
      const val = document.getElementById('tableSearch').value.toLowerCase();
      document.querySelectorAll('#resultsTable tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(val) ? '' : 'none';
      });
    }
  </script>
</body>
</html>`;
}

async function generateHTMLReport() {
  ensureDir(reportsDir);
  const summary = getSummary();
  const html = generateHTML(summary);

  const reportPath = path.join(reportsDir, 'execution-report.html');
  fs.writeFileSync(reportPath, html);

  // Also write to reports root
  const rootReport = path.join(__dirname, '..', 'reports', 'execution-report.html');
  fs.writeFileSync(rootReport, html);

  // Write JSON results
  const jsonPath = path.join(__dirname, '..', 'reports', 'JSON', 'execution-results.json');
  if (!fs.existsSync(path.dirname(jsonPath))) fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));

  logger.info(`HTML report saved: ${reportPath}`);
  return reportPath;
}

module.exports = { generateHTMLReport };

if (require.main === module) {
  generateHTMLReport()
    .then(f => console.log('HTML report generated:', f))
    .catch(console.error);
}
