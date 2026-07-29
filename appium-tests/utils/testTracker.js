// ============================================================
// TEST TRACKER — Appium iOS
// ============================================================
const fs = require('fs');
const path = require('path');

const resultsFile = path.join(__dirname, '..', 'reports', 'raw-results.json');
const resultsDir = path.join(__dirname, '..', 'reports');

let results = [];
let sessionStart = new Date();

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function trackResult(entry) {
  ensureDir(resultsDir);
  results.push({
    id: entry.id,
    module: entry.module,
    name: entry.name,
    priority: entry.priority || 'Medium',
    status: entry.status, // PASS | FAIL | SKIP | BLOCKED
    duration: entry.duration || 0,
    error: entry.error || null,
    screenshot: entry.screenshot || null,
    timestamp: new Date().toISOString(),
  });
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
}

function getResults() {
  try {
    if (fs.existsSync(resultsFile)) {
      return JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    }
  } catch {}
  return results;
}

function getSummary() {
  const all = getResults();
  const passed = all.filter(r => r.status === 'PASS');
  const failed = all.filter(r => r.status === 'FAIL');
  const skipped = all.filter(r => r.status === 'SKIP');
  const blocked = all.filter(r => r.status === 'BLOCKED');
  const total = all.length;
  const passRate = total > 0 ? ((passed.length / total) * 100).toFixed(2) : '0.00';
  const duration = all.reduce((sum, r) => sum + (r.duration || 0), 0);

  return {
    total,
    executed: passed.length + failed.length,
    passed: passed.length,
    failed: failed.length,
    skipped: skipped.length,
    blocked: blocked.length,
    passRate: `${passRate}%`,
    failRate: `${(100 - parseFloat(passRate)).toFixed(2)}%`,
    totalDuration: `${(duration / 1000).toFixed(2)}s`,
    sessionStart: sessionStart.toISOString(),
    sessionEnd: new Date().toISOString(),
    results: all,
  };
}

function resetResults() {
  results = [];
  sessionStart = new Date();
  if (fs.existsSync(resultsFile)) fs.unlinkSync(resultsFile);
}

module.exports = { trackResult, getResults, getSummary, resetResults };
