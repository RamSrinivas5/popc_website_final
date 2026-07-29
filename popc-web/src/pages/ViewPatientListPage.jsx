import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, ChevronRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import api from '../api/client';
import { resolveMediaUrl } from '../utils/mediaUrl';

export default function ViewPatientListPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.request('patients/').then(d => setPatients(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.patient_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in">
      <PageHeader title="PATIENT LIST" backPath="/patients" />

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Search Bar and Add Button */}
        <div style={{ maxWidth: 600, margin: '0 auto 32px', display: 'flex', gap: 12 }}>
          <div className="field-input-icon" style={{ flex: 1 }}>
            <Search className="icon" size={18} style={{ color: 'var(--text-muted)' }} />
            <input
              id="patient-search"
              className="field-input"
              placeholder="Search by name or Patient ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ borderRadius: 16, paddingLeft: 46, height: 54, fontSize: '1rem' }}
            />
          </div>
          <button 
            id="list-add-patient-btn"
            className="btn btn-primary btn-inline" 
            style={{ borderRadius: 16, width: 'auto', whiteSpace: 'nowrap', height: 54, padding: '0 20px', margin: 0 }}
            onClick={() => navigate('/patients/add')}
          >
            + Add Patient
          </button>
        </div>

        {loading ? (
          <div className="spinner-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="spinner-center" style={{ padding: 60 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: 16 }}>
              <User size={40} />
            </div>
            <p style={{ fontWeight: 600, marginBottom: 16 }}>No patients found.</p>
            <button 
              className="btn btn-primary btn-inline" 
              onClick={() => navigate('/patients/add')}
            >
              + Add New Patient
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {filtered.map(p => (
              <div
                key={p.id}
                className="patient-card card-premium pop-in"
                onClick={() => navigate(`/patients/${p.id}`)}
                style={{ padding: 20, background: '#fff' }}
              >
                <div className="patient-avatar" style={{ width: 56, height: 56, fontSize: '1.2rem', background: 'var(--primary-gradient)' }}>
                  {resolveMediaUrl(p.photo, p.updated_at) ? <img src={resolveMediaUrl(p.photo, p.updated_at)} alt={p.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : p.name[0].toUpperCase()}
                </div>
                <div className="patient-info">
                  <div className="patient-name" style={{ fontSize: '1.05rem' }}>{p.name}</div>
                  <div className="patient-id">ID: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{p.patient_id || p.id}</span></div>
                </div>
                <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
