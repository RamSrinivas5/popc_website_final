import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { 
  Stethoscope, 
  Users, 
  ClipboardList, 
  LayoutDashboard, 
  MessageSquare, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  ArrowRight 
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEnabled = username.trim().length > 0 && password.length > 0;

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Please enter your username or email.'); return; }
    if (!password)         { setError('Please enter your password.'); return; }

    setLoading(true);
    try {
      const data = await api.request('accounts/login/', {
        method: 'POST',
        body: { username: username.trim(), password },
        requiresAuth: false,
      });
      login(data);
      navigate('/home', { replace: true });
    } catch (err) {
      setError('Incorrect username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page} className="auth-page-split">

      {/* ── LEFT HERO PANEL ─────────────────────────────── */}
      <div style={styles.hero} className="auth-hero-panel">
        {/* Decorative blobs */}
        <div style={{ ...styles.blob, width: 420, height: 420, top: -100, left: -120, background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ ...styles.blob, width: 280, height: 280, bottom: 40,  right: -60,  background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ ...styles.blob, width: 160, height: 160, top: '45%',  left: '58%', background: 'rgba(38,198,218,0.15)' }} />

        <div style={styles.heroContent}>
          {/* Logo */}
          <div style={styles.logoRow}>
            <div style={styles.logoBox}>
              <Stethoscope size={24} color="#fff" />
            </div>
            <span style={styles.logoText}>POPC</span>
          </div>

          <h1 style={styles.heroTitle} className="text-shimmer">
            Post-Operative<br/>
            Pulmonary<br/>
            Complications
          </h1>

          <p style={styles.heroSubtitle}>
            AI-powered clinical decision support for anesthesiologists and surgeons.
            Assess patient risk. Make informed decisions.
          </p>

          {/* Feature pills */}
          <div style={styles.pillsRow}>
            {[
              { icon: <Users size={16} />, text: 'Patient Management' },
              { icon: <ClipboardList size={16} />, text: 'Risk Surveys' },
              { icon: <LayoutDashboard size={16} />, text: 'Live Dashboard' },
              { icon: <MessageSquare size={16} />, text: 'PPC AI Chat' },
            ].map(p => (
              <div key={p.text} style={styles.pill}>
                <span style={{ display: 'flex', alignItems: 'center' }}>{p.icon}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{p.text}</span>
              </div>
            ))}
          </div>

          {/* Trust line */}
          <div style={styles.trustLine}>
            <span style={styles.trustDot} />
            Authorized Medical Personnel Only
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ────────────────────────────── */}
      <div style={styles.formPanel} className="auth-form-panel">
        <div style={styles.formCard}>

          {/* Header */}
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome back</h2>
            <p style={styles.formSubtitle}>Sign in to your POPC clinical account</p>
          </div>

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
              <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} noValidate style={styles.form}>

            {/* Username */}
            <div style={styles.fieldGroup}>
              <label htmlFor="login-username" style={styles.label}>Username or Email</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>
                  <User size={18} color="#6B7280" />
                </span>
                <input
                  id="login-username"
                  style={styles.input}
                  placeholder="Enter your username or email"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="login-password" style={styles.label}>Password</label>
                <span
                  style={{ fontSize: '0.82rem', color: '#3345CC', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </span>
              </div>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>
                  <Lock size={18} color="#6B7280" />
                </span>
                <input
                  id="login-password"
                  style={{ ...styles.input, paddingRight: 48 }}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  style={styles.eyeBtn}
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={18} color="#6B7280" /> : <Eye size={18} color="#6B7280" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-btn"
              type="submit"
              disabled={!isEnabled || loading}
              style={{
                ...styles.submitBtn,
                opacity: (!isEnabled || loading) ? 0.55 : 1,
                cursor: (!isEnabled || loading) ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                  <span style={styles.spinnerInline} />
                  Signing in…
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  Sign In <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Register */}
          <button
            id="goto-register-btn"
            type="button"
            style={styles.registerBtn}
            onClick={() => navigate('/register')}
          >
            Create a new account
          </button>

          {/* Footer */}
          <p style={styles.formFooter}>
            This platform handles sensitive patient healthcare data. Authorized use only.<br />
            By signing in you agree to our{' '}
            <span
              style={{ color: '#3345CC', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => window.open('https://www.freeprivacypolicy.com/live/5dd5c304-93ce-47fb-8854-4b62ea808c68')}
            >
              Privacy Policy
            </span>
          </p>
        </div>
      </div>

    </div>
  );
}

/* ─── Styles ──────────────────────────────────────────────── */
const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
  },

  /* LEFT */
  hero: {
    flex: '1 1 55%',
    background: 'linear-gradient(140deg, #1a237e 0%, #3345CC 45%, #1976D2 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    padding: '60px 64px',
  },
  blob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(1px)',
    pointerEvents: 'none',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: 520,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  logoBox: {
    width: 48, height: 48,
    background: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.6rem',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.25)',
  },
  logoText: {
    color: '#fff',
    fontSize: '1.4rem',
    fontWeight: 800,
    letterSpacing: '0.1em',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 'clamp(2rem, 3.5vw, 3rem)',
    fontWeight: 800,
    lineHeight: 1.18,
    marginBottom: 20,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: '1.05rem',
    lineHeight: 1.7,
    marginBottom: 36,
    maxWidth: 420,
  },
  pillsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 44,
  },
  pill: {
    display: 'flex', alignItems: 'center', gap: 7,
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(6px)',
    borderRadius: 99,
    padding: '7px 16px',
    color: '#fff',
    fontSize: '0.78rem',
    fontWeight: 600,
  },
  trustLine: {
    display: 'flex', alignItems: 'center', gap: 10,
    color: 'rgba(255,255,255,0.55)',
    fontSize: '0.82rem',
    fontWeight: 500,
  },
  trustDot: {
    width: 8, height: 8,
    borderRadius: '50%',
    background: '#4ade80',
    boxShadow: '0 0 0 3px rgba(74,222,128,0.25)',
    flexShrink: 0,
  },

  /* RIGHT */
  formPanel: {
    flex: '1 1 45%',
    background: '#F7F9FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
    minHeight: '100vh',
  },
  formCard: {
    width: '100%',
    maxWidth: 440,
    background: '#fff',
    borderRadius: 24,
    padding: '44px 40px',
    boxShadow: '0 8px 48px rgba(51,69,204,0.12), 0 2px 8px rgba(0,0,0,0.04)',
    border: '1px solid rgba(51,69,204,0.08)',
  },
  formHeader: {
    marginBottom: 28,
  },
  formTitle: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#1A1F36',
    margin: 0,
    marginBottom: 6,
  },
  formSubtitle: {
    color: '#6B7280',
    fontSize: '0.95rem',
    margin: 0,
  },

  errorBox: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderLeft: '4px solid #EF4444',
    borderRadius: 10,
    padding: '11px 14px',
    marginBottom: 20,
    fontSize: '0.88rem',
    color: '#991b1b',
    fontWeight: 500,
  },

  form: {
    display: 'flex', flexDirection: 'column', gap: 18,
  },
  fieldGroup: {
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  label: {
    fontSize: '0.84rem',
    fontWeight: 600,
    color: '#374151',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    fontSize: '1rem',
    pointerEvents: 'none',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '13px 16px 13px 44px',
    border: '1.5px solid #E5E7EB',
    borderRadius: 12,
    fontSize: '0.95rem',
    color: '#1A1F36',
    background: '#FAFAFA',
    outline: 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: 4,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
  },

  submitBtn: {
    width: '100%',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #3345CC, #5B6EF5)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: '1rem',
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(51,69,204,0.3)',
    transition: 'transform 0.15s, box-shadow 0.15s',
    marginTop: 6,
    letterSpacing: '0.03em',
  },

  divider: {
    display: 'flex', alignItems: 'center', gap: 12,
    margin: '24px 0',
  },
  dividerLine: {
    flex: 1, height: 1,
    background: '#E5E7EB',
  },
  dividerText: {
    fontSize: '0.82rem',
    color: '#9CA3AF',
    fontWeight: 500,
  },

  registerBtn: {
    width: '100%',
    padding: '13px 24px',
    background: 'transparent',
    color: '#3345CC',
    border: '1.5px solid #3345CC',
    borderRadius: 12,
    fontSize: '0.95rem',
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'background 0.18s',
    letterSpacing: '0.01em',
  },

  formFooter: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: '0.78rem',
    color: '#9CA3AF',
  },

  spinnerInline: {
    display: 'inline-block',
    width: 16, height: 16,
    border: '2.5px solid rgba(255,255,255,0.35)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
};
