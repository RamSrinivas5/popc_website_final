// ============================================================
// TEST TRACKER — Unified across all 5 test layers
// ============================================================
const fs   = require('fs');
const path = require('path');

const RESULTS_FILE = path.join(__dirname, '../reports/raw-results.json');

let results = [];

function reset() { results = []; }

function track(entry) {
  results.push({
    id:        entry.id       || `TC_${Date.now()}`,
    module:    entry.module   || 'General',
    suite:     entry.suite    || 'Unknown',
    name:      entry.name     || 'Unnamed Test',
    status:    entry.status   || 'UNKNOWN',
    duration:  entry.duration || 0,
    error:     entry.error    || null,
    timestamp: new Date().toISOString(),
    metadata:  entry.metadata || {},
  });
}

function getSummary() {
  const total   = results.length;
  const passed  = results.filter(r => r.status === 'PASS').length;
  const failed  = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  const avgDur  = total ? Math.round(results.reduce((s, r) => s + r.duration, 0) / total) : 0;
  return { total, passed, failed, skipped, passRate: total ? ((passed / total) * 100).toFixed(2) : '0.00', avgDuration: avgDur };
}

function getAll()   { return results; }
function getByModule(mod) { return results.filter(r => r.module === mod); }
function getBySuite(suite) { return results.filter(r => r.suite === suite); }
function getFailed()  { return results.filter(r => r.status === 'FAIL'); }
function getPassed()  { return results.filter(r => r.status === 'PASS'); }

function persist() {
  const dir = path.dirname(RESULTS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(RESULTS_FILE, JSON.stringify({ summary: getSummary(), results }, null, 2));
}

module.exports = { track, reset, getSummary, getAll, getByModule, getBySuite, getFailed, getPassed, persist };
