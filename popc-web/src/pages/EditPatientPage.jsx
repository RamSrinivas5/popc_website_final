import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, UserCircle, Phone, Calendar, Scale, Ruler, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import api from '../api/client';
import { resolveMediaUrl } from '../utils/mediaUrl';

export default function EditPatientPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [form, setForm] = useState({ 
    patient_id: '', name: '', phone: '', weight: '', height: '', age: '', gender: 'Male', bmi: '' 
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Toast for real-time validation
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef(null);

  function showToast(msg) {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 3000);
  }

  useEffect(() => {
    api.request(`patients/${id}/`).then(p => {
      setForm({ 
        patient_id: p.patient_id || '',
        name: p.name || '', 
        phone: p.phone || '', 
        weight: String(p.weight || ''), 
        height: String(p.height || ''), 
        age: String(p.age || ''), 
        gender: p.gender || 'Male', 
        bmi: String(p.bmi || '') 
      });
      if (p.photo) setImagePreview(resolveMediaUrl(p.photo, p.updated_at));
    }).catch(() => setError('Failed to load patient data')).finally(() => setLoading(false));
  }, [id]);

  const computedBmi = (() => {
    const w = parseFloat(form.weight), h = parseFloat(form.height);
    if (!w || !h || h <= 0) return '';
    return (w / ((h / 100) ** 2)).toFixed(2);
  })();

  // Real-time Handlers (Matching professional standard)
  function handleNameChange(e) {
    const val = e.target.value;
    if (/[^A-Za-z\s]/.test(val)) {
      showToast("Name can only contain letters and spaces.");
      return;
    }
    setForm(f => ({ ...f, name: val }));
  }

  function handlePhoneChange(e) {
    const val = e.target.value;
    if (val && !/^\d+$/.test(val)) {
      showToast("Phone number can only contain digits.");
      return;
    }
    if (val.length > 0 && !/^[6-9]/.test(val[0])) {
      showToast("Phone number must start with 6, 7, 8, or 9.");
      return;
    }
    if (val.length > 10) {
      showToast("Phone number cannot exceed 10 digits.");
      return;
    }
    setForm(f => ({ ...f, phone: val }));
  }

  function handleAgeChange(e) {
    const val = e.target.value;
    if (val && !/^\d+$/.test(val)) {
      showToast("Age must be a valid number.");
      return;
    }
    if (val.length > 3) return;
    setForm(f => ({ ...f, age: val }));
  }

  function handleDecimalChange(field, maxLen) {
    return e => {
      const val = e.target.value;
      if (val && !/^\d*\.?\d*$/.test(val)) {
        showToast(`${field === 'weight' ? 'Weight' : 'Height'} must be a valid number.`);
        return;
      }
      if (val.length > maxLen) return;
      setForm(f => ({ ...f, [field]: val }));
    }
  }

  function handleImageChange(e) {
    const file = e.target.files[0]; if (!file) return;
    setImageFile(file); setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave(e) {
    if(e) e.preventDefault();
    setError('');
    
    // Final validation
    if (!form.name.trim() || form.name.trim().length < 2) { showToast('Name is too short.'); return; }
    if (form.phone.length !== 10) { showToast('Phone must be 10 digits.'); return; }
    if (!form.age || parseInt(form.age) > 120) { showToast('Invalid age.'); return; }

    setSaving(true);
    try {
      const fields = { 
        patient_id: form.patient_id, // Ensure patient_id is included
        name: form.name.trim(), 
        phone: form.phone.trim(), 
        weight: form.weight, 
        height: form.height, 
        age: form.age, 
        gender: form.gender, 
        bmi: computedBmi || form.bmi 
      };
      await api.multipartRequest(`patients/${id}/update/`, { method: 'PATCH', fields, image: imageFile });
      navigate(`/patients/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update patient');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="spinner-center" style={{ minHeight: '80vh' }}><div className="spinner" /></div>;

  return (
    <div className="animate-in">
      {toastMsg && (
        <div style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#1A1F36', color: '#fff', padding: '12px 24px', borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 12, zIndex: 9999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)', animation: 'popIn 0.2s ease-out'
        }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <span style={{ fontWeight: 600 }}>{toastMsg}</span>
        </div>
      )}

      <PageHeader title="EDIT PATIENT" backPath={`/patients/${id}`} />

      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>Edit Profile</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Update the patient's clinical records and personal information.</p>

          {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>}

          <div className="card" style={{ padding: 32, borderRadius: 24 }}>
            {/* Photo Picker */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div 
                className="profile-avatar-large" 
                style={{ width: 120, height: 120, cursor: 'pointer', margin: '0 auto 16px', background: 'var(--primary-gradient)' }} 
                onClick={() => fileRef.current.click()}
              >
                {imagePreview ? <img src={imagePreview} alt="patient" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <UserCircle size={60} color="#fff" />}
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
              <button type="button" className="btn btn-outline btn-sm btn-inline" style={{ height: 40, borderRadius: 10 }} onClick={() => fileRef.current.click()}>
                Change Photo
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div className="field-group">
                <label className="field-label">Full Name</label>
                <div className="field-input-icon">
                  <UserCircle className="icon" size={18} />
                  <input className="field-input" placeholder="Full Name" value={form.name} onChange={handleNameChange} />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Phone Number</label>
                <div className="field-input-icon">
                  <Phone className="icon" size={18} />
                  <input className="field-input" placeholder="Phone" type="text" inputMode="numeric" value={form.phone} onChange={handlePhoneChange} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="field-group">
                  <label className="field-label">Weight (kg)</label>
                  <div className="field-input-icon">
                    <Scale className="icon" size={18} />
                    <input className="field-input" placeholder="Weight" type="text" inputMode="decimal" value={form.weight} onChange={handleDecimalChange('weight', 5)} />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Height (cm)</label>
                  <div className="field-input-icon">
                    <Ruler className="icon" size={18} />
                    <input className="field-input" placeholder="Height" type="text" inputMode="decimal" value={form.height} onChange={handleDecimalChange('height', 5)} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg)', borderRadius: 12 }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Computed Clinical BMI</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>{computedBmi || form.bmi || '—'}</span>
              </div>

              <div className="field-group">
                <label className="field-label">Age</label>
                <div className="field-input-icon">
                  <Calendar className="icon" size={18} />
                  <input className="field-input" placeholder="Age" type="text" inputMode="numeric" value={form.age} onChange={handleAgeChange} />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Gender</label>
                <div className="seg-picker" style={{ padding: 4 }}>
                  {['Male','Female','Other'].map(g => (
                    <div key={g} className={`seg-option ${form.gender === g ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, gender: g }))} style={{ padding: '12px' }}>{g}</div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                <button 
                  id="edit-save-btn" 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={saving} 
                  style={{ flex: 2, height: 56, borderRadius: 14, fontSize: '1.1rem' }}
                >
                  <Save size={20} style={{ marginRight: 8 }} />
                  {saving ? 'Updating...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => navigate(`/patients/${id}`)}
                  style={{ flex: 1, height: 56, borderRadius: 14 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
