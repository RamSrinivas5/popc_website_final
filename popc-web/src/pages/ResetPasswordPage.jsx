import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identifier, otp } = location.state || {};

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset(e) {
    e.preventDefault();
    setError('');
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.request('accounts/reset-password/', {
        method: 'POST',
        body: { identifier, otp, new_password: newPassword },
        requiresAuth: false,
      });
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page animate-in">
      <div className="auth-logo">🔐</div>
      <h1 className="auth-title">New Password</h1>

      <form className="auth-card pop-in" onSubmit={handleReset} noValidate>
        <div className="auth-card-title">Set New Password</div>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="field-group">
          <div className="field-input-icon">
            <input id="reset-password" className="field-input"
              type={showPw ? 'text' : 'password'} placeholder="New Password"
              value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ paddingRight: 44 }} />
            <span className="icon-right" onClick={() => setShowPw(v => !v)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        <div className="field-group">
          <div className="field-input-icon">
            <input id="reset-confirm-password" className="field-input"
              type={showConfirm ? 'text' : 'password'} placeholder="Confirm New Password"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ paddingRight: 44 }} />
            <span className="icon-right" onClick={() => setShowConfirm(v => !v)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          {confirmPassword && (
            <span style={{ fontSize: '0.78rem', color: newPassword === confirmPassword ? 'var(--green)' : 'var(--red)' }}>
              {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
            </span>
          )}
        </div>

        <button id="reset-submit-btn" type="submit" className="btn btn-primary"
          disabled={loading || !newPassword || newPassword !== confirmPassword}>
          {loading ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
