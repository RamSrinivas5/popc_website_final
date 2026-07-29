// ============================================================
// CONFIG — POPC Testing Suite
// Centralised configuration for all 5 testing layers
// ============================================================
require('dotenv').config();

module.exports = {
  // ── Backend API ──────────────────────────────────────────
  apiBase:      process.env.API_BASE      || 'http://127.0.0.1:8000',
  apiPrefix:    process.env.API_PREFIX    || '/api',

  // ── Auth Credentials ─────────────────────────────────────
  validUser: {
    username: process.env.TEST_USERNAME || 'testdoctor',
    password: process.env.TEST_PASSWORD || 'TestPass@123',
  },

  // ── Performance Thresholds ───────────────────────────────
  thresholds: {
    responseTime: {
      p50:  500,    // 50th percentile < 500ms
      p95:  1000,   // 95th percentile < 1s
      p99:  2000,   // 99th percentile < 2s
      max:  5000,   // No response > 5s
    },
    errorRate:     0.01,  // < 1% error rate
    rps:           50,    // Minimum 50 requests/sec sustained
    availability:  99.9,  // 99.9% uptime
  },

  // ── Load Test Settings ───────────────────────────────────
  loadTest: {
    baselineUsers:  100,
    spikeUsers:     500,
    stressUsers:    300,
    durationSec:    60,
  },

  // ── Timeouts ─────────────────────────────────────────────
  timeouts: {
    request:        10000,   // 10 s per request
    suite:          120000,  // 2 min per suite
  },

  // ── Endpoints (Django backend) ───────────────────────────
  endpoints: {
    // Auth
    login:          '/api/auth/login/',
    register:       '/api/auth/register/',
    logout:         '/api/auth/logout/',
    forgotPassword: '/api/auth/forgot-password/',
    verifyOtp:      '/api/auth/verify-otp/',
    resetPassword:  '/api/auth/reset-password/',

    // Doctor
    doctorProfile:  '/api/doctor/profile/',
    doctorHome:     '/api/doctor/home/',

    // Patients
    patients:       '/api/patients/',
    patientDetail:  (id) => `/api/patients/${id}/`,

    // Surveys
    surveys:        '/api/surveys/',
    surveyDetail:   (patientId) => `/api/surveys/${patientId}/`,
    demographics:   (patientId) => `/api/surveys/${patientId}/demographics/`,
    medicalHistory: (patientId) => `/api/surveys/${patientId}/medical-history/`,
    surgeryFactors: (patientId) => `/api/surveys/${patientId}/surgery-factors/`,
    preoperative:   (patientId) => `/api/surveys/${patientId}/preoperative/`,
    postoperative:  (patientId) => `/api/surveys/${patientId}/postoperative/`,
    anesthesia:     (patientId) => `/api/surveys/${patientId}/anesthesia/`,
    score:          (patientId) => `/api/surveys/${patientId}/score/`,

    // Dashboard
    dashboard:      '/api/dashboard/',
    pendingSurveys: '/api/dashboard/pending/',
    highRisk:       '/api/dashboard/high-risk/',

    // Chat
    chat:           '/api/chat/',

    // Settings
    changePassword: '/api/settings/change-password/',
    changeUsername: '/api/settings/change-username/',
    deleteAccount:  '/api/settings/delete-account/',
  },
};
