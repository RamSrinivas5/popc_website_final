import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { 
  Stethoscope, 
  Eye, 
  EyeOff, 
  AlertTriangle 
} from 'lucide-react';

const SPECIALIZATIONS = ['Anesthesia','Surgery','Cardiology','Neurology','Orthopedics','General','Others'];
const GENDERS = ['Male','Female','Other'];

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    doctorId: '', name: '', phone: '', email: '', age: '',
    gender: 'Male', specialization: 'Anesthesia',
    username: '', password: '', confirmPassword: '',
  });

  const [touched, setTouched] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  // Custom Toast/Popup for Invalid Entry
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef(null);

  function showToast(msg) {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 3000);
  }

  // Real-time validation blocking
  function handleDoctorIdChange(e) {
    const val = e.target.value;
    if (val && !/^[A-Za-z0-9]+$/.test(val)) {
      showToast("Doctor ID can only contain letters and numbers.");
      return;
    }
    setForm(f => ({ ...f, doctorId: val }));
    setTouched(t => ({ ...t, doctorId: true }));
  }

  function handleNameChange(e) {
    const val = e.target.value;
    if (/[^A-Za-z\s]/.test(val)) {
      showToast("Name can only contain letters and spaces.");
      return;
    }
    setForm(f => ({ ...f, name: val }));
    setTouched(t => ({ ...t, name: true }));
  }

  function handlePhoneChange(e) {
    const val = e.target.value;
    if (val && !/^\d+$/.test(val)) {
      showToast("Phone number can only contain digits.");
      return;
    }
    if (val.length > 0 && !/^[6-9]/.test(val[0])) {
      showToast("Phone number must start with 6, 7, 8, or 9.");
      return;
    }
    if (val.length > 10) {
      showToast("Phone number cannot exceed 10 digits.");
      return;
    }
    setForm(f => ({ ...f, phone: val }));
    setTouched(t => ({ ...t, phone: true }));
  }

  function handleAgeChange(e) {
    const val = e.target.value;
    if (val && !/^\d+$/.test(val)) {
      showToast("Age must be a valid number.");
      return;
    }
    if (val.length > 3) return; // limit to 3 digits max
    setForm(f => ({ ...f, age: val }));
    setTouched(t => ({ ...t, age: true }));
  }

  function handleUsernameChange(e) {
    const val = e.target.value;
    if (/\s/.test(val)) {
      showToast("Username cannot contain spaces.");
      return;
    }
    setForm(f => ({ ...f, username: val }));
    setTouched(t => ({ ...t, username: true }));
  }

  function handleChange(field) {
    return e => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      setTouched(t => ({ ...t, [field]: true }));
    };
  }

  function handleBlur(field) {
    return () => setTouched(t => ({ ...t, [field]: true }));
  }

  // Submission Validation Logic
  function getErrors() {
    const e = {};
    if (!form.doctorId.trim()) e.doctorId = 'Doctor ID is required';
    
    const nm = form.name.trim();
    if (!nm) e.name = 'Full name is required';
    else if (nm.length < 2) e.name = 'Name must be at least 2 characters';

    const ph = form.phone.trim();
    if (!ph) e.phone = 'Phone number is required';
    else if (ph.length !== 10) e.phone = 'Phone must be exactly 10 digits';
    else if (!/^[6-9]/.test(ph)) e.phone = 'Phone must start with 6-9';

    const em = form.email.trim();
    if (!em) e.email = 'Email is required';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Za-z]{2,}$/i.test(em)) e.email = 'Enter a valid email address';

    if (!form.age) e.age = 'Age is required';
    else if (parseInt(form.age) < 18 || parseInt(form.age) > 100) e.age = 'Age must be between 18 and 100';

    const un = form.username.trim();
    if (!un) e.username = 'Username is required';
    else if (un.length < 3) e.username = 'Username must be at least 3 characters';

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';

    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';

    return e;
  }

  const errors = getErrors();
  const isFormValid = Object.keys(errors).length === 0;

  async function handleRegister(e) {
    e.preventDefault();
    setApiError('');
    
    // Mark all touched
    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    if (!isFormValid) return;

    setLoading(true);
    try {
      await api.request('accounts/register/', {
        method: 'POST',
        requiresAuth: false,
        body: {
          doctor_id: form.doctorId.trim(),
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          age: form.age,
          gender: form.gender,
          specialization: form.specialization,
          username: form.username.trim(),
          password: form.password,
          password2: form.password,
        },
      });
      navigate('/login', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again or use a different username/email.');
    } finally {
      setLoading(false);
    }
  }

  const ef = field => (touched[field] && errors[field]) ? <span style={styles.errorText}>{errors[field]}</span> : null;
  const hasError = field => touched[field] && errors[field];

  // Password strength logic
  const pwScore = (() => {
    let s = 0;
    if (form.password.length >= 6) s++;
    if (form.password.length >= 10) s++;
    if (/[A-Z]/.test(form.password)) s++;
    if (/[0-9]/.test(form.password)) s++;
    if (/[^A-Za-z0-9]/.test(form.password)) s++;
    return Math.min(s, 4);
  })();
  const pwColors = ['#E5E9FF', '#ef4444', '#f97316', '#eab308', '#22c55e'];
  const pwLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div style={styles.page} className="auth-page-split">

      {/* Floating Validation Toast */}
      {toastMsg && (
        <div style={styles.toast}>
          <AlertTriangle size={20} color="#fff" style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 600 }}>{toastMsg}</span>
        </div>
      )}

      {/* ── LEFT HERO PANEL ─────────────────────────────── */}
      <div style={styles.hero} className="auth-hero-panel">
        <div style={{ ...styles.blob, width: 420, height: 420, top: -100, left: -120, background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ ...styles.blob, width: 280, height: 280, bottom: 40,  right: -60,  background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ ...styles.blob, width: 160, height: 160, top: '45%',  left: '58%', background: 'rgba(38,198,218,0.15)' }} />

        <div style={styles.heroContent}>
          <div style={styles.logoRow}>
            <div style={styles.logoBox}>
              <Stethoscope size={24} color="#fff" />
            </div>
            <span style={styles.logoText}>POPC</span>
          </div>

          <h1 style={styles.heroTitle} className="text-shimmer">
            Join the Clinical<br/>
            Network
          </h1>

          <p style={styles.heroSubtitle}>
            Create your account to access advanced AI-driven risk assessment tools, manage patients, and collaborate securely.
          </p>

          <div style={styles.trustLine}>
            <span style={styles.trustDot} />
            Secure Medical Grade Platform
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ────────────────────────────── */}
      <div style={styles.formPanel} className="auth-form-panel">
        <div style={styles.formWrapper}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSubtitle}>Please fill in your details to register</p>
          </div>

          {apiError && (
            <div style={styles.errorBox}>
              <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleRegister} noValidate style={styles.form}>
            
            <div style={styles.formGrid}>
              {/* Doctor ID */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Doctor ID</label>
                <input
                  style={hasError('doctorId') ? { ...styles.input, borderColor: 'var(--red)' } : styles.input}
                  placeholder="e.g. DOC12345"
                  value={form.doctorId}
                  onChange={handleDoctorIdChange}
                  onBlur={handleBlur('doctorId')}
                  autoCapitalize="none"
                />
                {ef('doctorId')}
              </div>

              {/* Full Name */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={hasError('name') ? { ...styles.input, borderColor: 'var(--red)' } : styles.input}
                  placeholder="Dr. John Doe"
                  value={form.name}
                  onChange={handleNameChange}
                  onBlur={handleBlur('name')}
                />
                {ef('name')}
              </div>

              {/* Email */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  style={hasError('email') ? { ...styles.input, borderColor: 'var(--red)' } : styles.input}
                  placeholder="doctor@hospital.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  onBlur={handleBlur('email')}
                  autoCapitalize="none"
                />
                {ef('email')}
              </div>

              {/* Phone */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  style={hasError('phone') ? { ...styles.input, borderColor: 'var(--red)' } : styles.input}
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  onBlur={handleBlur('phone')}
                />
                {ef('phone')}
              </div>

              {/* Age */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Age</label>
                <input
                  type="text"
                  inputMode="numeric"
                  style={hasError('age') ? { ...styles.input, borderColor: 'var(--red)' } : styles.input}
                  placeholder="e.g. 35"
                  value={form.age}
                  onChange={handleAgeChange}
                  onBlur={handleBlur('age')}
                />
                {ef('age')}
              </div>

              {/* Gender */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Gender</label>
                <div className="seg-picker" style={{ padding: 4 }}>
                  {GENDERS.map(g => (
                    <div
                      key={g}
                      className={`seg-option ${form.gender === g ? 'active' : ''}`}
                      onClick={() => setForm(f => ({ ...f, gender: g }))}
                      style={{ padding: '11px 8px' }}
                    >
                      {g}
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialization */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Specialization</label>
                <select
                  style={{...styles.input, appearance: 'auto'}}
                  value={form.specialization}
                  onChange={handleChange('specialization')}
                >
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Username */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Username</label>
                <input
                  style={hasError('username') ? { ...styles.input, borderColor: 'var(--red)' } : styles.input}
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={handleUsernameChange}
                  onBlur={handleBlur('username')}
                  autoCapitalize="none"
                />
                {ef('username')}
              </div>
            </div>

            {/* Password Fields (Full Width) */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <input
                  style={hasError('password') ? { ...styles.input, borderColor: 'var(--red)', paddingRight: 48 } : { ...styles.input, paddingRight: 48 }}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={handleChange('password')}
                  onBlur={handleBlur('password')}
                />
                <button type="button" style={styles.eyeBtn} onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                  {showPw ? <EyeOff size={18} color="#6B7280" /> : <Eye size={18} color="#6B7280" />}
                </button>
              </div>
              {/* Password Strength */}
              {form.password && (
                <div>
                  <div className="pw-strength" style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="pw-strength-bar" style={{ flex: 1, height: 4, borderRadius: 2, background: i <= pwScore ? pwColors[pwScore] : '#E5E9FF', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: pwColors[pwScore], marginTop: 4, fontWeight: 500 }}>
                    {pwLabels[pwScore]} Password
                  </div>
                </div>
              )}
              {ef('password')}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrap}>
                <input
                  style={hasError('confirmPassword') ? { ...styles.input, borderColor: 'var(--red)', paddingRight: 48 } : { ...styles.input, paddingRight: 48 }}
                  type={showCPw ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                />
                <button type="button" style={styles.eyeBtn} onClick={() => setShowCPw(v => !v)} tabIndex={-1}>
                  {showCPw ? <EyeOff size={18} color="#6B7280" /> : <Eye size={18} color="#6B7280" />}
                </button>
              </div>
              {touched.confirmPassword && !errors.confirmPassword && form.confirmPassword && (
                <span style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 500 }}>✓ Passwords match</span>
              )}
              {ef('confirmPassword')}
            </div>

            {/* Submit */}
            <button
              id="reg-submit-btn"
              type="submit"
              disabled={loading || (Object.keys(touched).length > 0 && !isFormValid)}
              style={{
                ...styles.submitBtn,
                opacity: (loading || (Object.keys(touched).length > 0 && !isFormValid)) ? 0.6 : 1,
                cursor: (loading || (Object.keys(touched).length > 0 && !isFormValid)) ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                  <span style={styles.spinnerInline} />
                  Registering…
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={styles.formFooter}>
            <p style={{ margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Registering establishes your clinical identity. This platform is for licensed medical professionals only. <br />
              By registering, you agree to our{' '}
              <span
                style={{ color: '#3345CC', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => window.open('https://www.freeprivacypolicy.com/live/5dd5c304-93ce-47fb-8854-4b62ea808c68')}
              >
                Privacy Policy
              </span>
            </p>
            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>already have an account?</span>
              <div style={styles.dividerLine} />
            </div>
            <button
              id="goto-login-btn"
              type="button"
              style={styles.loginBtn}
              onClick={() => navigate('/login')}
            >
              Sign In to Existing Account
            </button>
          </div>
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
  
  toast: {
    position: 'fixed',
    top: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1A1F36',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    zIndex: 9999,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    animation: 'popIn 0.2s ease-out',
  },

  /* LEFT HERO */
  hero: {
    flex: '1 1 45%',
    background: 'linear-gradient(140deg, #1a237e 0%, #3345CC 45%, #26C6DA 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    padding: '60px 48px',
    '@media (max-width: 900px)': {
      display: 'none',
    }
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
    maxWidth: 480,
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
    fontSize: 'clamp(2rem, 3vw, 2.8rem)',
    fontWeight: 800,
    lineHeight: 1.2,
    marginBottom: 20,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '1.05rem',
    lineHeight: 1.7,
    marginBottom: 36,
  },
  trustLine: {
    display: 'flex', alignItems: 'center', gap: 10,
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  trustDot: {
    width: 8, height: 8,
    borderRadius: '50%',
    background: '#4ade80',
    boxShadow: '0 0 0 3px rgba(74,222,128,0.25)',
    flexShrink: 0,
  },

  /* RIGHT FORM PANEL */
  formPanel: {
    flex: '1 1 55%',
    background: '#F7F9FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    height: '100vh',
    overflowY: 'auto',
  },
  formWrapper: {
    width: '100%',
    maxWidth: 580,
    background: '#fff',
    borderRadius: 20,
    padding: '40px',
    boxShadow: '0 8px 32px rgba(51,69,204,0.08), 0 2px 8px rgba(0,0,0,0.04)',
    border: '1px solid rgba(51,69,204,0.08)',
    margin: 'auto',
  },
  formHeader: {
    marginBottom: 28,
  },
  formTitle: {
    fontSize: '1.8rem',
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 18,
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
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #E5E7EB',
    borderRadius: 10,
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
  errorText: {
    fontSize: '0.78rem',
    color: 'var(--red)',
    fontWeight: 500,
    marginTop: 2,
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
    transition: 'transform 0.15s, box-shadow 0.15s',
    marginTop: 12,
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: 12,
    margin: '16px 0',
  },
  dividerLine: {
    flex: 1, height: 1,
    background: '#E5E7EB',
  },
  dividerText: {
    fontSize: '0.82rem',
    color: '#9CA3AF',
    fontWeight: 500,
    textTransform: 'uppercase',
  },
  loginBtn: {
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
  },
  formFooter: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: '0.82rem',
    color: '#6B7280',
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
