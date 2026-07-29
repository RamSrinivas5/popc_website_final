// ============================================================
// HTTP CLIENT — Shared across all test layers
// Wraps fetch/http for API + Auth token management
// ============================================================
const http = require('http');
const https = require('https');
const config = require('../config');

let _token = null;

/**
 * Low-level HTTP request (no external deps)
 */
function rawRequest(url, { method = 'GET', headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const payload = body ? JSON.stringify(body) : null;

    const opts = {
      hostname: parsed.hostname,
      port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path:     parsed.pathname + parsed.search,
      method,
      headers:  {
        'Content-Type':  'application/json',
        'Accept':        'application/json',
        ...headers,
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };

    const start = Date.now();
    const req = lib.request(opts, (res) => {
      let raw = '';
      res.on('data', d => (raw += d));
      res.on('end', () => {
        let data = null;
        try { data = JSON.parse(raw); } catch { data = raw; }
        resolve({
          status:       res.statusCode,
          headers:      res.headers,
          data,
          ok:           res.statusCode >= 200 && res.statusCode < 300,
          duration:     Date.now() - start,
        });
      });
    });

    req.setTimeout(config.timeouts.request, () => {
      req.destroy();
      resolve({ status: 0, offline: true, error: 'Timeout', duration: Date.now() - start });
    });

    req.on('error', (err) => {
      resolve({ status: 0, offline: true, error: err.message, duration: Date.now() - start });
    });
    if (payload) req.write(payload);
    req.end();
  });
}

/**
 * Authenticated API request — auto-injects token
 */
async function apiRequest(endpoint, opts = {}) {
  const url = `${config.apiBase}${endpoint}`;
  const headers = {};
  if (_token) headers['Authorization'] = `Token ${_token}`;
  return rawRequest(url, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
}

/**
 * Login and cache token
 */
async function login(username, password) {
  const res = await rawRequest(`${config.apiBase}${config.endpoints.login}`, {
    method: 'POST',
    body: { username: username || config.validUser.username, password: password || config.validUser.password },
  });
  if (res.ok && res.data?.token) {
    _token = res.data.token;
    return { success: true, token: _token, user: res.data.user };
  }
  // Backend offline — use mock token for structural tests
  _token = 'mock-token-for-offline-testing';
  return { success: false, offline: true, token: _token };
}

function getToken() { return _token; }
function setToken(t) { _token = t; }
function clearToken() { _token = null; }

module.exports = { rawRequest, apiRequest, login, getToken, setToken, clearToken };
