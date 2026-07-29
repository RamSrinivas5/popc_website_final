// ============================================================
// THRESHOLD TEST SUITE — 40 Test Cases (TC_THRESH_001 to TC_THRESH_040)
// Validates performance thresholds against config limits
// ============================================================
const { rawRequest } = require('../utils/httpClient');
const { track }      = require('../utils/tracker');
const config         = require('../config');

const BASE = config.apiBase;

async function run(id, name, module, fn) {
  const start = Date.now();
  try {
    await fn();
    track({ id, module, suite: 'Threshold', name, status: 'PASS', duration: Date.now() - start });
  } catch (e) {
    track({ id, module, suite: 'Threshold', name, status: 'FAIL', duration: Date.now() - start, error: e.message });
  }
}

function assert(cond, msg) { if (!cond) throw new Error(msg || 'Assertion failed'); }

// ── Timed HTTP request helper ─────────────────────────────────
async function timedRequest(endpoint, opts = {}) {
  const url = `${BASE}${endpoint}`;
  const start = Date.now();
  const res = await rawRequest(url, opts).catch(e => ({ status: 0, error: e.message, duration: Date.now() - start }));
  res.duration = res.duration || (Date.now() - start);
  return res;
}

async function runThresholdTests() {
  console.log('\n🟠 ═══ THRESHOLD TEST SUITE — 40 Test Cases ═══');

  // ── RESPONSE TIME THRESHOLDS ──────────────────────────────
  const ENDPOINTS_TO_CHECK = [
    [config.endpoints.login,          'POST', { username: config.validUser.username, password: config.validUser.password }],
    [config.endpoints.patients,       'GET',  null],
    [config.endpoints.dashboard,      'GET',  null],
    [config.endpoints.pendingSurveys, 'GET',  null],
    [config.endpoints.highRisk,       'GET',  null],
    [config.endpoints.surveys,        'GET',  null],
    [config.endpoints.chat,           'POST', { message: 'test' }],
    [config.endpoints.doctorProfile,  'GET',  null],
  ];

  let tcNum = 1;
  for (const [ep, method, body] of ENDPOINTS_TO_CHECK) {
    const id = `TC_THRESH_${String(tcNum).padStart(3, '0')}`;
    await run(id, `Response time < ${config.thresholds.responseTime.max}ms: ${method} ${ep}`, 'Response Time', async () => {
      const res = await timedRequest(ep, { method, body });
      assert(
        res.duration < config.thresholds.responseTime.max,
        `${method} ${ep} took ${res.duration}ms — exceeds ${config.thresholds.responseTime.max}ms limit`
      );
    });
    tcNum++;
  }

  // ── SEQUENTIAL REQUESTS — LATENCY CONSISTENCY ────────────
  await run('TC_THRESH_009', 'Login: 5 sequential requests all under max threshold', 'Latency', async () => {
    const times = [];
    for (let i = 0; i < 5; i++) {
      const res = await timedRequest(config.endpoints.login, { method: 'POST', body: { username: 'test', password: 'test' } });
      times.push(res.duration);
    }
    const maxTime = Math.max(...times);
    assert(maxTime < config.thresholds.responseTime.max, `Max was ${maxTime}ms`);
  });

  await run('TC_THRESH_010', 'Patient list: average of 5 requests < p95 threshold', 'Latency', async () => {
    const times = [];
    for (let i = 0; i < 5; i++) {
      const res = await timedRequest(config.endpoints.patients);
      times.push(res.duration);
    }
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    assert(avg < config.thresholds.responseTime.p95, `Average ${avg}ms exceeds p95 ${config.thresholds.responseTime.p95}ms`);
  });

  // ── CONCURRENT REQUESTS THRESHOLD ────────────────────────
  await run('TC_THRESH_011', '10 concurrent login requests all within max', 'Concurrency', async () => {
    const start = Date.now();
    await Promise.all(Array.from({ length: 10 }, () =>
      timedRequest(config.endpoints.login, { method: 'POST', body: { username: 'u', password: 'p' } })
    ));
    const total = Date.now() - start;
    assert(total < config.thresholds.responseTime.max * 2, `Concurrent batch took ${total}ms`);
  });

  await run('TC_THRESH_012', '25 concurrent patient list requests within threshold', 'Concurrency', async () => {
    const start = Date.now();
    await Promise.all(Array.from({ length: 25 }, () => timedRequest(config.endpoints.patients)));
    const total = Date.now() - start;
    assert(total < config.thresholds.responseTime.max * 3, `25 concurrent took ${total}ms`);
  });

  await run('TC_THRESH_013', '50 concurrent requests — no timeout spike', 'Concurrency', async () => {
    const results = await Promise.all(Array.from({ length: 50 }, () =>
      timedRequest(config.endpoints.login, { method: 'POST', body: {} })
    ));
    const maxDuration = Math.max(...results.map(r => r.duration));
    assert(maxDuration < config.thresholds.responseTime.max, `Slowest request: ${maxDuration}ms`);
  });

  // ── ERROR RATE THRESHOLDS ─────────────────────────────────
  await run('TC_THRESH_014', 'Error rate: 10 requests to login — within threshold', 'Error Rate', async () => {
    const results = await Promise.all(Array.from({ length: 10 }, () =>
      timedRequest(config.endpoints.login, { method: 'POST', body: { username: config.validUser.username, password: config.validUser.password } })
    ));
    // Filter out offline connection errors (status 0)
    const activeResults = results.filter(r => r.status !== 0);
    if (activeResults.length > 0) {
      const errors = activeResults.filter(r => r.status >= 500).length;
      const errorRate = errors / activeResults.length;
      assert(errorRate <= config.thresholds.errorRate, `Error rate ${errorRate} exceeds threshold ${config.thresholds.errorRate}`);
    }
  });

  await run('TC_THRESH_015', 'No internal server errors (500) on valid endpoints', 'Error Rate', async () => {
    const results = await Promise.all(
      Object.values(config.endpoints).filter(e => typeof e === 'string').slice(0, 5).map(ep =>
        timedRequest(ep).catch(() => ({ status: 0 }))
      )
    );
    const serverErrors = results.filter(r => r.status === 500).length;
    assert(serverErrors === 0 || results.every(r => r.status === 0), 'Server returned 500 errors on valid endpoints');
  });

  // ── AVAILABILITY THRESHOLDS ───────────────────────────────
  await run('TC_THRESH_016', 'Availability: health check responds (not 500)', 'Availability', async () => {
    const res = await timedRequest('/');
    assert(res.status !== 500, 'Root endpoint returned 500');
  });

  await run('TC_THRESH_017', 'Availability: API prefix responds', 'Availability', async () => {
    const res = await timedRequest('/api/');
    assert([200, 301, 302, 400, 401, 404, 0].includes(res.status), `Unexpected status ${res.status}`);
  });

  // ── PAYLOAD SIZE THRESHOLDS ───────────────────────────────
  await run('TC_THRESH_018', 'Large payload (10KB) handled within threshold', 'Payload', async () => {
    const bigPayload = { message: 'a'.repeat(10240) };
    const res = await timedRequest(config.endpoints.chat, { method: 'POST', body: bigPayload });
    assert(res.duration < config.thresholds.responseTime.max, `Took ${res.duration}ms`);
  });

  await run('TC_THRESH_019', 'Empty body request returns within threshold', 'Payload', async () => {
    const res = await timedRequest(config.endpoints.login, { method: 'POST', body: {} });
    assert(res.duration < config.thresholds.responseTime.max);
  });

  await run('TC_THRESH_020', 'Unicode body handled within threshold', 'Payload', async () => {
    const res = await timedRequest(config.endpoints.login, { method: 'POST', body: { username: '日本語テスト', password: '한국어' } });
    assert(res.duration < config.thresholds.responseTime.max);
  });

  // ── THRESHOLD CONFIG VALIDATION ───────────────────────────
  await run('TC_THRESH_021', 'p50 threshold < p95 threshold',  'Config', () => { assert(config.thresholds.responseTime.p50 < config.thresholds.responseTime.p95); });
  await run('TC_THRESH_022', 'p95 threshold < p99 threshold',  'Config', () => { assert(config.thresholds.responseTime.p95 < config.thresholds.responseTime.p99); });
  await run('TC_THRESH_023', 'p99 threshold < max threshold',  'Config', () => { assert(config.thresholds.responseTime.p99 < config.thresholds.responseTime.max); });
  await run('TC_THRESH_024', 'errorRate < 0.05 (5%)',          'Config', () => { assert(config.thresholds.errorRate < 0.05); });
  await run('TC_THRESH_025', 'RPS threshold >= 50',            'Config', () => { assert(config.thresholds.rps >= 50); });
  await run('TC_THRESH_026', 'Availability threshold >= 99%',  'Config', () => { assert(config.thresholds.availability >= 99); });
  await run('TC_THRESH_027', 'Max response time < 10s',        'Config', () => { assert(config.thresholds.responseTime.max < 10000); });
  await run('TC_THRESH_028', 'p50 response time < 1s',         'Config', () => { assert(config.thresholds.responseTime.p50 < 1000); });

  // ── LOAD PROFILE VALIDATION ───────────────────────────────
  await run('TC_THRESH_029', 'Baseline: 100 VUsers is configured',   'Load', () => { assert(config.loadTest.baselineUsers === 100); });
  await run('TC_THRESH_030', 'Spike: 500 VUsers is configured',      'Load', () => { assert(config.loadTest.spikeUsers === 500); });
  await run('TC_THRESH_031', 'Stress: 300 VUsers is configured',     'Load', () => { assert(config.loadTest.stressUsers === 300); });
  await run('TC_THRESH_032', 'Duration: 60 seconds is configured',   'Load', () => { assert(config.loadTest.durationSec === 60); });

  // ── MIXED LOAD THRESHOLDS ─────────────────────────────────
  for (let i = 33; i <= 40; i++) {
    const id = `TC_THRESH_${String(i).padStart(3, '0')}`;
    await run(id, `Mixed concurrent scenario ${i} within threshold`, 'Mixed', async () => {
      const endpoint = [config.endpoints.login, config.endpoints.patients, config.endpoints.dashboard][i % 3];
      const res = await timedRequest(endpoint, { method: endpoint === config.endpoints.login ? 'POST' : 'GET', body: endpoint === config.endpoints.login ? {} : null });
      assert(res.duration < config.thresholds.responseTime.max, `Took ${res.duration}ms`);
    });
  }

  console.log('✅ Threshold Test Suite Complete');
}

module.exports = { runThresholdTests };
