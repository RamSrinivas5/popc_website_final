import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import api from '../api/client';

export default function DeletePatientPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.request(`patients/${id}/`).then(setPatient).catch(() => setError('Failed to load patient'));
  }, [id]);

  async function handleDelete() {
    setDeleting(true); setError('');
    try {
      await api.request(`patients/${id}/delete/`, { method: 'DELETE' });
      navigate('/patients/list', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to delete patient');
      setDeleting(false);
    }
  }

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <PageHeader title="DELETE PATIENT" backPath={`/patients/${id}`} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 24 }}>
        <div className="card pop-in" style={{ maxWidth: 400, width: '100%', textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontWeight: 800, color: 'var(--red)', marginBottom: 12 }}>Delete Patient</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            Are you sure you want to delete <strong>{patient?.name || 'this patient'}</strong>?
            This action cannot be undone and will remove all associated survey records.
          </p>
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
            <button id="delete-confirm-btn" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : '🗑 Delete Patient'}
            </button>
            <button id="delete-cancel-btn" className="btn btn-outline" onClick={() => navigate(`/patients/${id}`)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
