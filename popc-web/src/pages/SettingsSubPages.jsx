import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';


export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setSuccess('');
    if (!form.old_password) { setError('Current password is required'); return; }
    if (!form.new_password || form.new_password.length < 6) { setError('New password must be at least 6 characters'); return; }
    if (form.new_password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.request('accounts/change-password/', { method: 'PUT', body: { old_password: form.old_password, new_password: form.new_password } });
      setSuccess('Password changed successfully!');
      setForm({ old_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <PageHeader title="CHANGE PASSWORD" backPath="/settings" />
      <div className="scroll-content" style={{ background: 'var(--bg)', padding: 16 }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <form className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }} onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="field-input-icon">
              <input id="cp-old" className="field-input" type={showOld ? 'text' : 'password'} placeholder="Current Password"
                value={form.old_password} onChange={e => setForm(f => ({ ...f, old_password: e.target.value }))} style={{ paddingRight: 44 }} />
              <span className="icon-right" onClick={() => setShowOld(v => !v)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <div className="field-input-icon">
              <input id="cp-new" className="field-input" type={showNew ? 'text' : 'password'} placeholder="New Password"
                value={form.new_password} onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))} style={{ paddingRight: 44 }} />
              <span className="icon-right" onClick={() => setShowNew(v => !v)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <div className="field-input-icon">
              <input id="cp-confirm" className="field-input" type={showConfirm ? 'text' : 'password'} placeholder="Confirm New Password"
                value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} style={{ paddingRight: 44 }} />
              <span className="icon-right" onClick={() => setShowConfirm(v => !v)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            {form.confirm && (
              <span style={{ fontSize: '0.78rem', color: form.new_password === form.confirm ? 'var(--green)' : 'var(--red)' }}>
                {form.new_password === form.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            )}

            <button id="cp-submit-btn" type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Updating…' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function ChangeUsernamePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setSuccess('');
    if (!username.trim() || username.trim().length < 3) { setError('Username must be at least 3 characters'); return; }
    setLoading(true);
    try {
      await api.request('accounts/change-username/', { method: 'PUT', body: { username: username.trim() } });
      localStorage.setItem('popc_username', username.trim());
      setSuccess('Username changed successfully!');
    } catch (err) {
      setError(err.message || 'Failed to change username');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <PageHeader title="CHANGE USERNAME" backPath="/settings" />
      <div className="scroll-content" style={{ background: 'var(--bg)', padding: 16 }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <form className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }} onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <input id="cu-input" className="field-input" placeholder="New Username" value={username}
              onChange={e => setUsername(e.target.value)} autoCapitalize="none" />
            <button id="cu-submit-btn" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating…' : 'Change Username'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function DeleteAccountPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [confirmed, setConfirmed] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  async function handleDelete() {
    if (confirmed !== 'DELETE') { setError('Type DELETE to confirm'); return; }
    setLoading(true);
    try {
      await api.request('accounts/delete-account/', { method: 'DELETE' });
      localStorage.clear();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      setLoading(false);
    }
  }

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <PageHeader title="DELETE ACCOUNT" backPath="/settings" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 24 }}>
        <div className="card pop-in" style={{ maxWidth: 400, width: '100%', textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontWeight: 800, color: 'var(--red)', marginBottom: 12 }}>Delete Account</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
            This permanently deletes your account and all patient data. This action cannot be undone.
          </p>
          {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
          <input id="delete-account-confirm" className="field-input" placeholder='Type "DELETE" to confirm'
            value={confirmed} onChange={e => setConfirmed(e.target.value)} style={{ marginBottom: 16, textAlign: 'center' }} />
          <button id="delete-account-btn" className="btn btn-danger" onClick={handleDelete}
            disabled={loading || confirmed !== 'DELETE'}>
            {loading ? 'Deleting…' : '🗑 Delete My Account'}
          </button>
          <button className="btn btn-outline" style={{ marginTop: 10 }} onClick={() => navigate('/settings')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
