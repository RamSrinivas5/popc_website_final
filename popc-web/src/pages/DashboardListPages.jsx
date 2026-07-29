import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import api from '../api/client';

function PatientList({ title, endpoint, emptyMsg, backPath }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.request(endpoint).then(d => setItems(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false));
  }, [endpoint]);

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <PageHeader title={title} backPath={backPath} />
      <div className="scroll-content" style={{ background: 'var(--bg)', padding: 16 }}>
        {loading ? (
          <div className="spinner-center"><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div className="spinner-center"><span style={{ color: 'var(--text-muted)' }}>{emptyMsg}</span></div>
        ) : (
          <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map(p => (
              <div key={p.pk} className="patient-card pop-in" onClick={() => navigate(`/patients/${p.pk}`)}>
                <div className="patient-avatar">{(p.name || '?')[0].toUpperCase()}</div>
                <div className="patient-info">
                  <div className="patient-name">{p.name}</div>
                  <div className="patient-id">ID: {p.id || p.patient_id}</div>
                </div>
                {p.risk_level && (
                  <span className={`risk-badge risk-${(p.risk_level || 'na').toLowerCase().replace(' ','-')}`}>
                    {p.risk_level}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PendingSurveysPage() {
  return <PatientList title="PENDING SURVEYS" endpoint="api/surveys/not-completed/" emptyMsg="No pending surveys." backPath="/dashboard" />;
}

// High Risk page: re-validates risk from actual score to avoid stale DB values
export function HighRiskListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  function getRiskLevel(score) {
    if (score <= 30) return 'Low';
    if (score <= 45) return 'Moderate';
    if (score <= 60) return 'High';
    return 'Very High';
  }

  useEffect(() => {
    api.request('api/surveys/high-risk/')
      .then(async (data) => {
        const candidates = Array.isArray(data) ? data : [];
        // Fetch each patient's actual survey score and reclassify
        const verified = await Promise.all(
          candidates.map(async (p) => {
            try {
              const survey = await api.request(`api/surveys/patient/${p.pk}/`);
              const score = survey?.total_score;
              if (score !== undefined && score !== null) {
                const correct = getRiskLevel(score);
                // Only keep patients who are genuinely High or Very High
                if (correct === 'High' || correct === 'Very High') {
                  return { ...p, risk_level: correct };
                }
                return null; // Was stale — not actually high risk
              }
              return p; // No score data — trust the DB value
            } catch {
              return p; // API error — trust the DB value
            }
          })
        );
        setItems(verified.filter(Boolean));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <PageHeader title="HIGH RISK PATIENTS" backPath="/dashboard" />
      <div className="scroll-content" style={{ background: 'var(--bg)', padding: 16 }}>
        {loading ? (
          <div className="spinner-center"><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div className="spinner-center"><span style={{ color: 'var(--text-muted)' }}>No high-risk patients.</span></div>
        ) : (
          <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map(p => (
              <div key={p.pk} className="patient-card pop-in" onClick={() => navigate(`/patients/${p.pk}`)}>
                <div className="patient-avatar">{(p.name || '?')[0].toUpperCase()}</div>
                <div className="patient-info">
                  <div className="patient-name">{p.name}</div>
                  <div className="patient-id">ID: {p.id || p.patient_id}</div>
                </div>
                <span className={`risk-badge risk-${(p.risk_level || 'na').toLowerCase().replace(' ', '-')}`}>
                  {p.risk_level}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
