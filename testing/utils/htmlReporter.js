// ============================================================
// HTML REPORT GENERATOR — Testing Suite
// Generates execution-report.html with charts, tabs & filters
// ============================================================
const fs      = require('fs');
const path    = require('path');
const tracker = require('./tracker');

const REPORTS_DIR = path.join(__dirname, '../reports/HTML');

function generateHTMLReport() {
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const all = tracker.getAll();
  const sum = tracker.getSummary();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>POPC Master Test Report</title>
  <style>
    :root {
      --bg: #0f172a; --surface: #1e293b; --card: #334155;
      --text: #f8fafc; --muted: #94a3b8;
      --pass: #22c55e; --fail: #ef4444; --warn: #eab308; --info: #3b82f6;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--card); padding-bottom: 1rem; }
    .title h1 { font-size: 1.8rem; background: linear-gradient(to right, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .title p { color: var(--muted); font-size: 0.9rem; margin-top: 0.2rem; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card { background: var(--surface); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--card); }
    .card .val { font-size: 2rem; font-weight: bold; margin-top: 0.4rem; }
    .card.pass .val { color: var(--pass); }
    .card.fail .val { color: var(--fail); }
    .card.rate .val { color: var(--info); }
    .controls { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    input[type="text"] { background: var(--surface); border: 1px solid var(--card); color: var(--text); padding: 0.6rem 1rem; border-radius: 8px; flex: 1; min-width: 250px; }
    .btn { background: var(--surface); border: 1px solid var(--card); color: var(--text); padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; transition: 0.2s; }
    .btn:hover, .btn.active { background: var(--card); border-color: var(--info); }
    table { width: 100%; border-collapse: collapse; background: var(--surface); border-radius: 12px; overflow: hidden; }
    th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--card); font-size: 0.9rem; }
    th { background: #0f172a; color: var(--muted); text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; }
    tr:hover { background: var(--card); }
    .badge { padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 0.75rem; }
    .badge.PASS { background: rgba(34, 197, 94, 0.2); color: var(--pass); }
    .badge.FAIL { background: rgba(239, 68, 68, 0.2); color: var(--fail); }
    .badge.HIGH { background: rgba(239, 68, 68, 0.3); color: #f87171; }
    .badge.MEDIUM { background: rgba(234, 179, 8, 0.3); color: #fde047; }
    .badge.LOW { background: rgba(34, 197, 94, 0.3); color: #4ade80; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">
      <h1>🏥 POPC Enterprise QA Dashboard</h1>
      <p>API, Unit, Threshold, & Vulnerability Test Results</p>
    </div>
    <div>${new Date().toLocaleString()}</div>
  </div>

  <div class="metrics">
    <div class="card"><div style="color:var(--muted)">Total Tests</div><div class="val">${sum.total}</div></div>
    <div class="card pass"><div style="color:var(--muted)">Passed</div><div class="val">${sum.passed}</div></div>
    <div class="card fail"><div style="color:var(--muted)">Failed</div><div class="val">${sum.failed}</div></div>
    <div class="card rate"><div style="color:var(--muted)">Pass Rate</div><div class="val">${sum.passRate}%</div></div>
    <div class="card"><div style="color:var(--muted)">Avg Duration</div><div class="val">${sum.avgDuration}ms</div></div>
  </div>

  <div class="controls">
    <input type="text" id="search" placeholder="Search tests by name, ID, or module..." onkeyup="filterTests()">
    <button class="btn active" onclick="filterStatus('ALL')">All</button>
    <button class="btn" onclick="filterStatus('PASS')">Passed</button>
    <button class="btn" onclick="filterStatus('FAIL')">Failed</button>
    <button class="btn" onclick="filterSuite('API')">API</button>
    <button class="btn" onclick="filterSuite('Unit')">Unit</button>
    <button class="btn" onclick="filterSuite('Threshold')">Threshold</button>
    <button class="btn" onclick="filterSuite('Vulnerability')">Vulnerability</button>
  </div>

  <table id="testTable">
    <thead>
      <tr>
        <th>ID</th>
        <th>Suite</th>
        <th>Module</th>
        <th>Name</th>
        <th>Status</th>
        <th>Duration</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      ${all.map(r => `
        <tr data-status="${r.status}" data-suite="${r.suite}">
          <td><code>${r.id}</code></td>
          <td>${r.suite}</td>
          <td>${r.module}</td>
          <td>${r.name}</td>
          <td><span class="badge ${r.status}">${r.status}</span></td>
          <td>${r.duration}ms</td>
          <td>${r.error ? `<span style="color:var(--fail)">${r.error}</span>` : '—'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <script>
    let currentStatus = 'ALL';
    let currentSuite = 'ALL';

    function filterTests() {
      const q = document.getElementById('search').value.toLowerCase();
      const rows = document.querySelectorAll('#testTable tbody tr');
      rows.forEach(r => {
        const text = r.innerText.toLowerCase();
        const stat = r.getAttribute('data-status');
        const suite = r.getAttribute('data-suite');
        const matchSearch = text.includes(q);
        const matchStatus = currentStatus === 'ALL' || stat === currentStatus;
        const matchSuite = currentSuite === 'ALL' || suite === currentSuite;
        r.style.display = (matchSearch && matchStatus && matchSuite) ? '' : 'none';
      });
    }

    function filterStatus(st) {
      currentStatus = st;
      document.querySelectorAll('.controls .btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      filterTests();
    }

    function filterSuite(s) {
      currentSuite = (currentSuite === s) ? 'ALL' : s;
      filterTests();
    }
  </script>
</body>
</html>`;

  const outPath = path.join(REPORTS_DIR, 'execution-report.html');
  fs.writeFileSync(outPath, html);
  console.log(`✅ HTML Dashboard: ${outPath}`);
  return outPath;
}

module.exports = { generateHTMLReport };
