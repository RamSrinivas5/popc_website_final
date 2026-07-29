import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!identifier.trim()) { setError('Please enter your username or email'); return; }
    setLoading(true);
    try {
      await api.request('accounts/forgot-password/', {
        method: 'POST',
        body: { identifier: identifier.trim() },
        requiresAuth: false,
      });
      navigate('/verify-otp', { state: { identifier: identifier.trim() } });
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check your username/email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page animate-in">
      <div className="auth-logo">🔑</div>
      <h1 className="auth-title">Forgot Password</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, textAlign: 'center', maxWidth: 320 }}>
        Enter your username or email to receive a one-time password reset code.
      </p>

      <form className="auth-card pop-in" onSubmit={handleSubmit} noValidate>
        <div className="auth-card-title">Reset Password</div>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="field-group">
          <div className="field-input-icon">
            <span className="icon">👤</span>
            <input
              id="forgot-identifier"
              className="field-input"
              placeholder="Username or Email"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              autoCapitalize="none"
            />
          </div>
        </div>

        <button id="forgot-submit-btn" type="submit" className="btn btn-primary" disabled={loading || !identifier.trim()}>
          {loading ? 'Sending OTP…' : 'Send OTP'}
        </button>

        <button type="button" className="btn btn-outline" onClick={() => navigate('/login')}>
          Back to Login
        </button>
      </form>
    </div>
  );
}
