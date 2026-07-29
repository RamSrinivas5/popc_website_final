import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Search, ChevronRight, User } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import api from '../api/client';
import { resolveMediaUrl } from '../utils/mediaUrl';

export default function SurveyListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('completed'); // 'completed' or 'pending'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = tab === 'completed' ? 'api/surveys/completed/' : 'api/surveys/not-completed/';
    setLoading(true);
    api.request(endpoint)
      .then(async (d) => {
        const records = Array.isArray(d) ? d : [];
        setItems(records);
        
        if (tab === 'completed') {
          // Pre-fetch scores to correct risk levels dynamically
          const detailPromises = records.map(record =>
            api.request(`api/surveys/patient/${record.pk}/`)
              .then(survey => {
                const score = survey.total_score;
                if (score !== undefined && score !== null) {
                  if (score <= 30) {
                    record.risk_level = 'Low';
                  } else if (score <= 45) {
                    record.risk_level = 'Moderate';
                  } else {
                    record.risk_level = 'High';
                  }
                }
              })
              .catch(() => {})
          );
          
          await Promise.all(detailPromises);
          setItems([...records]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  const filtered = items.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in">
      <PageHeader title="SURVEY RECORDS" backPath="/home" />

      <div className="container" style={{ padding: '24px 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Survey Records</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Access clinical risk assessment reports.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
            {/* Segment Picker */}
            <div className="seg-picker" style={{ maxWidth: 400 }}>
              <div className={`seg-option ${tab === 'completed' ? 'active' : ''}`} onClick={() => setTab('completed')}>COMPLETED</div>
              <div className={`seg-option ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>PENDING</div>
            </div>

            {/* Search */}
            <div className="field-input-icon">
              <Search className="icon" size={18} />
              <input 
                className="field-input" 
                placeholder={`Search ${tab} records...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ borderRadius: 12, paddingLeft: 42 }}
              />
            </div>
          </div>

          {loading ? (
            <div className="spinner-center"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ padding: 60, textAlign: 'center' }}>
              <ClipboardList size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
              <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>No {tab} surveys found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(p => (
                <div 
                  key={p.pk} 
                  className="patient-card pop-in" 
                  onClick={() => navigate(tab === 'completed' ? `/surveys/${p.pk}` : `/surveys/${p.pk}/demographics`)}
                  style={{ padding: '16px 20px', background: '#fff', border: '1px solid var(--border)', borderRadius: 16 }}
                >
                  {(p.photoUrl || p.photo) ? (
                    <img
                      src={`${p.photoUrl || p.photo}?t=${Date.now()}`}
                      alt={p.name}
                      style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }}
                    />
                  ) : (
                    <div className="patient-avatar" style={{ background: tab === 'completed' ? 'var(--primary-gradient)' : 'var(--teal-gradient)', width: 44, height: 44 }}>
                      {p.name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="patient-info">
                    <div className="patient-name" style={{ fontSize: '1rem' }}>{p.name}</div>
                    <div className="patient-id" style={{ fontSize: '0.8rem' }}>ID: {p.id}</div>
                  </div>
                  {tab === 'completed' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 800, fontSize: '0.75rem' }}>
                      {p.risk_level?.toUpperCase() || 'LOW'}
                      <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  ) : (
                    <div style={{ padding: '4px 10px', background: 'rgba(38,198,218,0.1)', color: 'var(--teal)', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800 }}>
                      CONTINUE
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

