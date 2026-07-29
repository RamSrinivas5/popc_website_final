import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, Search } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function PatientManagementPage() {
  const navigate = useNavigate();

  return (
    <div className="animate-in">
      <PageHeader title="PATIENTS" backPath="/home" showProfile />

      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 12 }}>Patient Management</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Add new patients to the system or search through your existing records.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            <div
              id="mgmt-view-list"
              className="card pop-in card-premium"
              style={{ padding: 32, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, borderTop: '4px solid var(--primary)' }}
              onClick={() => navigate('/patients/list')}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(51,69,204,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Users size={32} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontWeight: 800, marginBottom: 4 }}>View Patients</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Search and manage registered patients</p>
              </div>
            </div>

            <div
              id="mgmt-add-patient"
              className="card pop-in card-premium"
              style={{ padding: 32, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, borderTop: '4px solid var(--teal)' }}
              onClick={() => navigate('/patients/add')}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(38,198,218,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}>
                <UserPlus size={32} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontWeight: 800, marginBottom: 4 }}>Add Patient</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Register a new patient for assessment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
