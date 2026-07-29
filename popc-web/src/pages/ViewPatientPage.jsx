import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, UserCircle, Edit, Trash2, ChevronRight, Phone, User, Calendar, Scale, Ruler, Activity } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import api from '../api/client';
import { resolveMediaUrl } from '../utils/mediaUrl';

export default function ViewPatientPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [surveyAnswers, setSurveyAnswers] = useState([]);

  useEffect(() => {
    api.request(`patients/${id}/`).then(setPatient).catch(() => {}).finally(() => setLoading(false));
    api.request(`api/surveys/patient/${id}/`).then(data => {
      if (data && Array.isArray(data.answers)) {
        setSurveyAnswers(data.answers);
      }
    }).catch(() => {});
  }, [id]);

  const initial = (patient?.name || '?')[0].toUpperCase();

  const getBmiStatus = (bmiVal) => {
    const val = parseFloat(bmiVal);
    if (isNaN(val)) return null;
    if (val < 18.5) return { label: 'Underweight', color: '#ff8a00', bg: 'rgba(255, 138, 0, 0.08)' };
    if (val < 25) return { label: 'Normal', color: 'var(--primary)', bg: 'rgba(5, 150, 105, 0.08)' };
    if (val < 30) return { label: 'Overweight', color: '#ff8a00', bg: 'rgba(255, 138, 0, 0.08)' };
    return { label: 'Obese', color: 'var(--red)', bg: 'rgba(244, 67, 54, 0.08)' };
  };

  const getSpo2Status = (spo2Val) => {
    if (!spo2Val || spo2Val === 'Not Assessed') return { label: 'Not Assessed', color: 'var(--text-secondary)', bg: 'rgba(107, 114, 128, 0.08)' };
    if (spo2Val.includes('>=96')) return { label: 'Normal (≥96%)', color: 'var(--primary)', bg: 'rgba(5, 150, 105, 0.08)' };
    if (spo2Val.includes('91-95')) return { label: 'Moderate Risk (91-95%)', color: '#ff8a00', bg: 'rgba(255, 138, 0, 0.08)' };
    return { label: 'Critical Risk (≤90%)', color: 'var(--red)', bg: 'rgba(244, 67, 54, 0.08)' };
  };

  const spo2Answer = surveyAnswers.find(a => a.question === 'SpO2')?.selected_option;

  const details = patient ? [
    { label: 'Full Name', value: patient.name, icon: User },
    { label: 'Patient ID', value: patient.patient_id, icon: Activity },
    { label: 'Age', value: `${patient.age} Years`, icon: Calendar },
    { label: 'Gender', value: patient.gender, icon: UserCircle },
    { label: 'Phone', value: patient.phone, icon: Phone },
    { label: 'Weight', value: patient.weight ? `${patient.weight} kg` : null, icon: Scale },
    { label: 'Height', value: patient.height ? `${patient.height} cm` : null, icon: Ruler },
    { label: 'Clinical BMI', value: patient.bmi, icon: Activity, type: 'bmi' },
    { label: 'Preoperative SpO2', value: spo2Answer || 'Not Assessed', icon: Activity, type: 'spo2' },
  ] : [];

  return (
    <div className="animate-in">
      <PageHeader title="PATIENT DETAILS" backPath="/patients/list" />

      <div className="container" style={{ padding: '40px 24px' }}>
        {loading ? (
          <div className="spinner-center"><div className="spinner" /></div>
        ) : !patient ? (
          <div className="spinner-center">Patient not found.</div>
        ) : (
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
            
            {/* Profile Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card card-premium" style={{ padding: 40, textAlign: 'center', borderRadius: 24 }}>
                <div className="profile-avatar-large" style={{ width: 120, height: 120, fontSize: '3rem', margin: '0 auto 20px', background: 'var(--primary-gradient)' }}>
                  {resolveMediaUrl(patient.photo, patient.updated_at)
                    ? <img src={resolveMediaUrl(patient.photo, patient.updated_at)} alt={patient.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : initial}
                </div>
                <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 4 }}>{patient.name}</h2>
                <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', marginBottom: 24 }}>Registered Patient</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button className="btn btn-primary" onClick={() => navigate(`/surveys/${id}`)} style={{ height: 50, borderRadius: 14 }}>
                    <FileText size={18} style={{ marginRight: 8 }} />
                    View Survey Records
                  </button>
                  <button className="btn btn-outline" onClick={() => navigate(`/patients/${id}/edit`)} style={{ height: 50, borderRadius: 14 }}>
                    <Edit size={18} style={{ marginRight: 8 }} />
                    Edit Profile
                  </button>
                </div>
              </div>

              <div className="card" style={{ padding: 24, background: 'rgba(239,68,68,0.02)', border: '1px solid rgba(239,68,68,0.1)' }}>
                <h3 style={{ color: 'var(--red)', fontSize: '0.9rem', fontWeight: 800, marginBottom: 12 }}>Danger Zone</h3>
                <button className="btn btn-danger" onClick={() => navigate(`/patients/${id}/delete`)} style={{ height: 44, borderRadius: 12, fontSize: '0.85rem' }}>
                  <Trash2 size={16} style={{ marginRight: 8 }} />
                  Remove Patient Record
                </button>
              </div>
            </div>

            {/* Information Grid */}
            <div className="card card-premium" style={{ padding: 32, borderRadius: 24 }}>
              <h3 style={{ fontWeight: 800, marginBottom: 24, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
                Clinical Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {details.map((item, idx) => item.value ? (
                  <div key={idx} style={{ 
                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', 
                    borderBottom: idx === details.length - 1 ? 'none' : '1px solid var(--border)' 
                  }}>
                    <div style={{ color: 'var(--primary)', opacity: 0.7 }}>
                      <item.icon size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{item.label}</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                        <span>{item.value}</span>
                        {item.type === 'bmi' && getBmiStatus(item.value) && (
                          <span style={{ 
                            fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 99,
                            color: getBmiStatus(item.value).color, background: getBmiStatus(item.value).bg
                          }}>
                            {getBmiStatus(item.value).label}
                          </span>
                        )}
                        {item.type === 'spo2' && (
                          <span style={{ 
                            fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 99,
                            color: getSpo2Status(item.value).color, background: getSpo2Status(item.value).bg
                          }}>
                            {getSpo2Status(item.value).label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null)}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
