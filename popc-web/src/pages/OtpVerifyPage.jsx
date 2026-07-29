import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';

export default function OtpVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const identifier = location.state?.identifier || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.trim().length < 6) { setError('Please enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      await api.request('accounts/verify-otp/', {
        method: 'POST',
        body: { identifier, otp: otp.trim() },
        requiresAuth: false,
      });
      navigate('/reset-password', { state: { identifier, otp: otp.trim() } });
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page animate-in">
      <div className="auth-logo">📱</div>
      <h1 className="auth-title">Verify OTP</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, textAlign: 'center', maxWidth: 320 }}>
        Enter the 6-digit code sent to your registered email address.
      </p>

      <form className="auth-card pop-in" onSubmit={handleVerify} noValidate>
        <div className="auth-card-title">Enter OTP</div>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="field-group">
          <input
            id="otp-input"
            className="field-input"
            placeholder="6-digit OTP"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            maxLength={6}
            style={{ letterSpacing: 8, fontSize: '1.4rem', textAlign: 'center' }}
          />
        </div>

        <button id="otp-verify-btn" type="submit" className="btn btn-primary" disabled={loading || otp.length < 6}>
          {loading ? 'Verifying…' : 'Verify OTP'}
        </button>

        <button type="button" className="btn btn-outline" onClick={() => navigate('/forgot-password')}>
          Resend OTP
        </button>
      </form>
    </div>
  );
}
