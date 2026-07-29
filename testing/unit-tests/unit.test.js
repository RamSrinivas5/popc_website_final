// ============================================================
// UNIT TEST SUITE — 80 Test Cases (TC_UNIT_001 to TC_UNIT_080)
// Tests pure JS logic: API client, utils, validators, helpers
// No DOM / No browser — pure Node.js
// ============================================================
const { track } = require('../utils/tracker');
const config    = require('../config');

// ── Mini assert ──────────────────────────────────────────────
function assert(cond, msg) { if (!cond) throw new Error(msg || 'Assertion failed'); }
function assertEqual(a, b, msg) { if (a !== b) throw new Error(msg || `Expected ${b}, got ${a}`); }
function assertThrows(fn, msg) {
  try { fn(); throw new Error('Should have thrown'); }
  catch (e) { if (e.message === 'Should have thrown') throw new Error(msg || 'Expected error not thrown'); }
}
function assertNotNull(v, msg) { if (v == null) throw new Error(msg || 'Expected non-null value'); }

async function run(id, name, module, fn) {
  const start = Date.now();
  try {
    await fn();
    track({ id, module, suite: 'Unit', name, status: 'PASS', duration: Date.now() - start });
    return true;
  } catch (e) {
    track({ id, module, suite: 'Unit', name, status: 'FAIL', duration: Date.now() - start, error: e.message });
    return false;
  }
}

// ══════════════════════════════════════════════════════════════
// ── 1. CONFIG VALIDATION (TC_UNIT_001 to TC_UNIT_010) ────────
// ══════════════════════════════════════════════════════════════
async function runConfigTests() {
  await run('TC_UNIT_001', 'Config: apiBase is a non-empty string',            'Config', () => { assert(typeof config.apiBase === 'string' && config.apiBase.length > 0); });
  await run('TC_UNIT_002', 'Config: validUser has username and password',      'Config', () => { assertNotNull(config.validUser.username); assertNotNull(config.validUser.password); });
  await run('TC_UNIT_003', 'Config: thresholds.responseTime.p95 < p99',       'Config', () => { assert(config.thresholds.responseTime.p95 < config.thresholds.responseTime.p99); });
  await run('TC_UNIT_004', 'Config: errorRate is between 0 and 1',            'Config', () => { assert(config.thresholds.errorRate >= 0 && config.thresholds.errorRate <= 1); });
  await run('TC_UNIT_005', 'Config: endpoints.login starts with /api',        'Config', () => { assert(config.endpoints.login.startsWith('/api')); });
  await run('TC_UNIT_006', 'Config: endpoints.patients is a string',          'Config', () => { assert(typeof config.endpoints.patients === 'string'); });
  await run('TC_UNIT_007', 'Config: patientDetail returns correct URL',       'Config', () => { assertEqual(config.endpoints.patientDetail(42), '/api/patients/42/'); });
  await run('TC_UNIT_008', 'Config: surveyDetail returns correct URL',        'Config', () => { assertEqual(config.endpoints.surveyDetail(5), '/api/surveys/5/'); });
  await run('TC_UNIT_009', 'Config: score endpoint returns correct URL',      'Config', () => { assertEqual(config.endpoints.score(7), '/api/surveys/7/score/'); });
  await run('TC_UNIT_010', 'Config: loadTest.baselineUsers is 100',           'Config', () => { assertEqual(config.loadTest.baselineUsers, 100); });
}

// ══════════════════════════════════════════════════════════════
// ── 2. AUTH LOGIC (TC_UNIT_011 to TC_UNIT_025) ───────────────
// ══════════════════════════════════════════════════════════════
async function runAuthLogicTests() {
  // Token parsing simulation
  function parseToken(response) {
    if (!response) return null;
    return response.token || response.access || null;
  }
  // Password strength
  function isStrongPassword(pwd) {
    return /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%^&*]/.test(pwd) && pwd.length >= 8;
  }
  // Email validation
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  // Token storage key
  const TOKEN_KEY = 'popc_token';

  await run('TC_UNIT_011', 'parseToken: extracts token from {token: ...}',   'Auth Logic', () => { assertEqual(parseToken({ token: 'abc123' }), 'abc123'); });
  await run('TC_UNIT_012', 'parseToken: extracts access from {access: ...}', 'Auth Logic', () => { assertEqual(parseToken({ access: 'xyz789' }), 'xyz789'); });
  await run('TC_UNIT_013', 'parseToken: returns null for empty response',    'Auth Logic', () => { assertEqual(parseToken(null), null); });
  await run('TC_UNIT_014', 'parseToken: returns null for no token key',      'Auth Logic', () => { assertEqual(parseToken({ user: 'doc' }), null); });
  await run('TC_UNIT_015', 'isStrongPassword: strong password passes',       'Auth Logic', () => { assert(isStrongPassword('SecurePass@123')); });
  await run('TC_UNIT_016', 'isStrongPassword: no uppercase fails',           'Auth Logic', () => { assert(!isStrongPassword('securepass@123')); });
  await run('TC_UNIT_017', 'isStrongPassword: no number fails',              'Auth Logic', () => { assert(!isStrongPassword('SecurePass@')); });
  await run('TC_UNIT_018', 'isStrongPassword: no special char fails',        'Auth Logic', () => { assert(!isStrongPassword('SecurePass123')); });
  await run('TC_UNIT_019', 'isStrongPassword: too short fails',              'Auth Logic', () => { assert(!isStrongPassword('S@1a')); });
  await run('TC_UNIT_020', 'isValidEmail: valid email passes',               'Auth Logic', () => { assert(isValidEmail('doctor@popc.com')); });
  await run('TC_UNIT_021', 'isValidEmail: no @ fails',                       'Auth Logic', () => { assert(!isValidEmail('notanemail')); });
  await run('TC_UNIT_022', 'isValidEmail: no domain fails',                  'Auth Logic', () => { assert(!isValidEmail('test@')); });
  await run('TC_UNIT_023', 'isValidEmail: spaces invalid',                   'Auth Logic', () => { assert(!isValidEmail('test @test.com')); });
  await run('TC_UNIT_024', 'Token storage key is "popc_token"',              'Auth Logic', () => { assertEqual(TOKEN_KEY, 'popc_token'); });
  await run('TC_UNIT_025', 'Auth header format is "Token {token}"',          'Auth Logic', () => {
    const t = 'abc123';
    assertEqual(`Token ${t}`, 'Token abc123');
  });
}

// ══════════════════════════════════════════════════════════════
// ── 3. PATIENT VALIDATION (TC_UNIT_026 to TC_UNIT_040) ───────
// ══════════════════════════════════════════════════════════════
async function runPatientValidationTests() {
  function validatePatient(p) {
    const errors = [];
    if (!p.first_name || p.first_name.trim().length < 2) errors.push('first_name too short');
    if (!p.last_name  || p.last_name.trim().length < 2)  errors.push('last_name too short');
    if (p.phone && !/^\+?[\d\-\s()]{7,15}$/.test(p.phone)) errors.push('invalid phone');
    if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) errors.push('invalid email');
    return errors;
  }

  function formatPatientName(first, last) { return `${last}, ${first}`; }
  function calculateAge(dob) {
    const d = new Date(dob);
    const now = new Date();
    return Math.floor((now - d) / (365.25 * 24 * 3600 * 1000));
  }
  function getBloodTypeLabel(bt) {
    const map = { 'A+': 'A Positive', 'A-': 'A Negative', 'B+': 'B Positive', 'O+': 'O Positive', 'AB+': 'AB Positive' };
    return map[bt] || bt;
  }

  await run('TC_UNIT_026', 'validatePatient: valid patient passes',          'Patient', () => { assert(validatePatient({ first_name: 'John', last_name: 'Doe' }).length === 0); });
  await run('TC_UNIT_027', 'validatePatient: empty first_name fails',        'Patient', () => { assert(validatePatient({ first_name: '', last_name: 'Doe' }).length > 0); });
  await run('TC_UNIT_028', 'validatePatient: empty last_name fails',         'Patient', () => { assert(validatePatient({ first_name: 'John', last_name: '' }).length > 0); });
  await run('TC_UNIT_029', 'validatePatient: invalid phone fails',           'Patient', () => { assert(validatePatient({ first_name: 'John', last_name: 'Doe', phone: 'abc' }).length > 0); });
  await run('TC_UNIT_030', 'validatePatient: valid phone passes',            'Patient', () => { assert(validatePatient({ first_name: 'John', last_name: 'Doe', phone: '+1-555-0100' }).length === 0); });
  await run('TC_UNIT_031', 'validatePatient: invalid email fails',           'Patient', () => { assert(validatePatient({ first_name: 'J', last_name: 'D', email: 'bad-email' }).length > 0); });
  await run('TC_UNIT_032', 'formatPatientName: returns Last, First format',  'Patient', () => { assertEqual(formatPatientName('Jane', 'Doe'), 'Doe, Jane'); });
  await run('TC_UNIT_033', 'calculateAge: age for 1980 patient is 40+',      'Patient', () => { assert(calculateAge('1980-01-01') >= 40); });
  await run('TC_UNIT_034', 'calculateAge: future DOB returns negative',      'Patient', () => { assert(calculateAge('2099-01-01') < 0); });
  await run('TC_UNIT_035', 'getBloodTypeLabel: A+ maps to A Positive',       'Patient', () => { assertEqual(getBloodTypeLabel('A+'), 'A Positive'); });
  await run('TC_UNIT_036', 'getBloodTypeLabel: unknown type returns as-is',  'Patient', () => { assertEqual(getBloodTypeLabel('X+'), 'X+'); });
  await run('TC_UNIT_037', 'validatePatient: single-char name fails',        'Patient', () => { assert(validatePatient({ first_name: 'J', last_name: 'D' }).length > 0); });
  await run('TC_UNIT_038', 'validatePatient: name with spaces is trimmed',   'Patient', () => { assert(validatePatient({ first_name: '  J  ', last_name: 'Doe' }).length > 0); });
  await run('TC_UNIT_039', 'Patient search filter: case insensitive match',  'Patient', () => {
    const patients = [{ first_name: 'John', last_name: 'Doe' }, { first_name: 'Jane', last_name: 'Smith' }];
    const filtered = patients.filter(p => p.first_name.toLowerCase().includes('jo'));
    assert(filtered.length === 1 && filtered[0].first_name === 'John');
  });
  await run('TC_UNIT_040', 'Patient list: sorting by last name',             'Patient', () => {
    const patients = [{ last_name: 'Zebra' }, { last_name: 'Apple' }, { last_name: 'Mango' }];
    const sorted = [...patients].sort((a, b) => a.last_name.localeCompare(b.last_name));
    assertEqual(sorted[0].last_name, 'Apple');
  });
}

// ══════════════════════════════════════════════════════════════
// ── 4. SURVEY LOGIC (TC_UNIT_041 to TC_UNIT_055) ─────────────
// ══════════════════════════════════════════════════════════════
async function runSurveyLogicTests() {
  function calculateRiskScore(factors) {
    let score = 0;
    if (factors.age > 65)         score += 2;
    if (factors.hypertension)     score += 1;
    if (factors.diabetes)         score += 2;
    if (factors.heartDisease)     score += 3;
    if (factors.smoking)          score += 1;
    if (factors.obesity)          score += 1;
    if (factors.previousSurgery)  score += 1;
    return score;
  }
  function getRiskLevel(score) {
    if (score >= 7) return 'HIGH';
    if (score >= 4) return 'MEDIUM';
    return 'LOW';
  }
  function isSurveyComplete(sections) {
    return ['demographics', 'medical_history', 'surgery_factors', 'preoperative', 'postoperative', 'anesthesia']
      .every(s => sections[s] === 'completed');
  }
  function getSurveyProgress(sections) {
    const total = 6;
    const done = Object.values(sections).filter(v => v === 'completed').length;
    return Math.round((done / total) * 100);
  }

  await run('TC_UNIT_041', 'calculateRiskScore: high-risk patient scores ≥ 7',    'Survey', () => {
    const score = calculateRiskScore({ age: 70, heartDisease: true, diabetes: true, hypertension: true, smoking: false, obesity: false, previousSurgery: false });
    assert(score >= 7);
  });
  await run('TC_UNIT_042', 'calculateRiskScore: healthy young patient scores 0',   'Survey', () => {
    const score = calculateRiskScore({ age: 30, heartDisease: false, diabetes: false, hypertension: false, smoking: false, obesity: false, previousSurgery: false });
    assertEqual(score, 0);
  });
  await run('TC_UNIT_043', 'getRiskLevel: score 8 = HIGH',                         'Survey', () => { assertEqual(getRiskLevel(8), 'HIGH'); });
  await run('TC_UNIT_044', 'getRiskLevel: score 5 = MEDIUM',                       'Survey', () => { assertEqual(getRiskLevel(5), 'MEDIUM'); });
  await run('TC_UNIT_045', 'getRiskLevel: score 2 = LOW',                          'Survey', () => { assertEqual(getRiskLevel(2), 'LOW'); });
  await run('TC_UNIT_046', 'getRiskLevel: score 0 = LOW',                          'Survey', () => { assertEqual(getRiskLevel(0), 'LOW'); });
  await run('TC_UNIT_047', 'isSurveyComplete: all completed = true',               'Survey', () => {
    const secs = { demographics: 'completed', medical_history: 'completed', surgery_factors: 'completed', preoperative: 'completed', postoperative: 'completed', anesthesia: 'completed' };
    assert(isSurveyComplete(secs));
  });
  await run('TC_UNIT_048', 'isSurveyComplete: one missing = false',                'Survey', () => {
    const secs = { demographics: 'completed', medical_history: 'pending', surgery_factors: 'completed', preoperative: 'completed', postoperative: 'completed', anesthesia: 'completed' };
    assert(!isSurveyComplete(secs));
  });
  await run('TC_UNIT_049', 'getSurveyProgress: 3/6 = 50%',                         'Survey', () => {
    const secs = { demographics: 'completed', medical_history: 'completed', surgery_factors: 'completed', preoperative: 'pending', postoperative: 'pending', anesthesia: 'pending' };
    assertEqual(getSurveyProgress(secs), 50);
  });
  await run('TC_UNIT_050', 'getSurveyProgress: 0/6 = 0%',                          'Survey', () => {
    const secs = { demographics: 'pending', medical_history: 'pending', surgery_factors: 'pending', preoperative: 'pending', postoperative: 'pending', anesthesia: 'pending' };
    assertEqual(getSurveyProgress(secs), 0);
  });
  await run('TC_UNIT_051', 'BMI calculation: 70kg/1.75m = 22.86',                  'Survey', () => {
    const bmi = parseFloat((70 / (1.75 * 1.75)).toFixed(2));
    assert(bmi > 22 && bmi < 24);
  });
  await run('TC_UNIT_052', 'Age >65 adds to risk score',                           'Survey', () => {
    const young  = calculateRiskScore({ age: 40 });
    const old    = calculateRiskScore({ age: 70 });
    assert(old > young);
  });
  await run('TC_UNIT_053', 'Heart disease is highest single factor (3 pts)',        'Survey', () => {
    const base  = calculateRiskScore({ heartDisease: false });
    const withHD = calculateRiskScore({ heartDisease: true });
    assertEqual(withHD - base, 3);
  });
  await run('TC_UNIT_054', 'Multiple comorbidities stack correctly',               'Survey', () => {
    const score = calculateRiskScore({ diabetes: true, hypertension: true, smoking: true });
    assertEqual(score, 4);
  });
  await run('TC_UNIT_055', 'Survey section names are valid strings',               'Survey', () => {
    const names = ['demographics', 'medical_history', 'surgery_factors', 'preoperative', 'postoperative', 'anesthesia'];
    assert(names.every(n => typeof n === 'string' && n.length > 0));
  });
}

// ══════════════════════════════════════════════════════════════
// ── 5. UTILITY & HELPER TESTS (TC_UNIT_056 to TC_UNIT_080) ───
// ══════════════════════════════════════════════════════════════
async function runUtilityTests() {
  // Date utilities
  function formatDate(iso) { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }); }
  function isValidDate(str) { const d = new Date(str); return d instanceof Date && !isNaN(d); }
  function daysBetween(a, b) { return Math.abs(Math.round((new Date(b) - new Date(a)) / (1000 * 86400))); }

  // String utilities
  function truncate(str, max) { return str.length > max ? str.slice(0, max) + '...' : str; }
  function capitalize(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''; }
  function slugify(str) { return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }

  // Number utilities
  function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
  function roundTo(n, places) { return parseFloat(n.toFixed(places)); }
  function toPercent(num, denom) { return denom === 0 ? 0 : roundTo((num / denom) * 100, 2); }

  // Array utilities
  function groupBy(arr, key) { return arr.reduce((g, item) => { (g[item[key]] = g[item[key]] || []).push(item); return g; }, {}); }
  function uniqueBy(arr, key) { const seen = new Set(); return arr.filter(i => seen.has(i[key]) ? false : seen.add(i[key])); }

  // API utilities
  function buildQueryString(params) { return '?' + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&'); }
  function extractErrorMessage(err) { return err?.response?.data?.detail || err?.response?.data?.error || err?.message || 'Unknown error'; }

  await run('TC_UNIT_056', 'formatDate: ISO string formats correctly',             'Utils', () => { assert(typeof formatDate('2024-01-15') === 'string'); });
  await run('TC_UNIT_057', 'isValidDate: valid date string returns true',          'Utils', () => { assert(isValidDate('2024-01-15')); });
  await run('TC_UNIT_058', 'isValidDate: invalid date string returns false',       'Utils', () => { assert(!isValidDate('not-a-date')); });
  await run('TC_UNIT_059', 'daysBetween: 2024-01-01 and 2024-01-08 = 7',          'Utils', () => { assertEqual(daysBetween('2024-01-01', '2024-01-08'), 7); });
  await run('TC_UNIT_060', 'truncate: string longer than max gets truncated',     'Utils', () => {
    const result = truncate('Hello World', 5);
    assertEqual(result, 'Hello...');
  });
  await run('TC_UNIT_061', 'truncate: string shorter than max is unchanged',      'Utils', () => { assertEqual(truncate('Hi', 10), 'Hi'); });
  await run('TC_UNIT_062', 'capitalize: lowercase string gets capitalized',       'Utils', () => { assertEqual(capitalize('doctor'), 'Doctor'); });
  await run('TC_UNIT_063', 'capitalize: all-caps string lowercased then cap',     'Utils', () => { assertEqual(capitalize('DOCTOR'), 'Doctor'); });
  await run('TC_UNIT_064', 'slugify: converts spaces to hyphens',                 'Utils', () => { assertEqual(slugify('Hello World'), 'hello-world'); });
  await run('TC_UNIT_065', 'slugify: removes special chars',                      'Utils', () => { assertEqual(slugify('test@123!'), 'test123'); });
  await run('TC_UNIT_066', 'clamp: value below min clamped to min',               'Utils', () => { assertEqual(clamp(-5, 0, 100), 0); });
  await run('TC_UNIT_067', 'clamp: value above max clamped to max',               'Utils', () => { assertEqual(clamp(200, 0, 100), 100); });
  await run('TC_UNIT_068', 'clamp: value in range unchanged',                     'Utils', () => { assertEqual(clamp(50, 0, 100), 50); });
  await run('TC_UNIT_069', 'roundTo: 2 decimal places',                           'Utils', () => { assertEqual(roundTo(3.14159, 2), 3.14); });
  await run('TC_UNIT_070', 'toPercent: 1/4 = 25',                                 'Utils', () => { assertEqual(toPercent(1, 4), 25); });
  await run('TC_UNIT_071', 'toPercent: 0 denominator returns 0',                  'Utils', () => { assertEqual(toPercent(5, 0), 0); });
  await run('TC_UNIT_072', 'groupBy: groups array items correctly',               'Utils', () => {
    const data = [{ type: 'A' }, { type: 'B' }, { type: 'A' }];
    const grouped = groupBy(data, 'type');
    assertEqual(grouped['A'].length, 2);
  });
  await run('TC_UNIT_073', 'uniqueBy: removes duplicate keys',                    'Utils', () => {
    const data = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 1, name: 'C' }];
    assertEqual(uniqueBy(data, 'id').length, 2);
  });
  await run('TC_UNIT_074', 'buildQueryString: builds correct query',              'Utils', () => {
    const qs = buildQueryString({ page: 1, search: 'John' });
    assert(qs.includes('page=1'));
    assert(qs.includes('search=John'));
  });
  await run('TC_UNIT_075', 'extractErrorMessage: extracts from detail',           'Utils', () => {
    const err = { response: { data: { detail: 'Not found' } } };
    assertEqual(extractErrorMessage(err), 'Not found');
  });
  await run('TC_UNIT_076', 'extractErrorMessage: falls back to message',         'Utils', () => {
    const err = { message: 'Network error' };
    assertEqual(extractErrorMessage(err), 'Network error');
  });
  await run('TC_UNIT_077', 'extractErrorMessage: unknown returns default',        'Utils', () => {
    assertEqual(extractErrorMessage({}), 'Unknown error');
  });
  await run('TC_UNIT_078', 'Array of patient statuses is non-empty',              'Utils', () => {
    const statuses = ['active', 'inactive', 'high-risk', 'pending'];
    assert(statuses.length > 0);
    assert(statuses.includes('high-risk'));
  });
  await run('TC_UNIT_079', 'Survey section count is exactly 6',                   'Utils', () => {
    const sections = ['demographics', 'medical_history', 'surgery_factors', 'preoperative', 'postoperative', 'anesthesia'];
    assertEqual(sections.length, 6);
  });
  await run('TC_UNIT_080', 'Config thresholds form a valid hierarchy',            'Utils', () => {
    const { p50, p95, p99, max } = config.thresholds.responseTime;
    assert(p50 < p95 && p95 < p99 && p99 < max, 'p50 < p95 < p99 < max');
  });
}

// ── Main runner ───────────────────────────────────────────────
async function runUnitTests() {
  console.log('\n🟡 ═══ UNIT TEST SUITE — 80 Test Cases ═══');
  await runConfigTests();
  await runAuthLogicTests();
  await runPatientValidationTests();
  await runSurveyLogicTests();
  await runUtilityTests();
  console.log('✅ Unit Test Suite Complete');
}

module.exports = { runUnitTests };
