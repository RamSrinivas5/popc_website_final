import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import api from '../api/client';

export default function AddPatientPage() {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [patientId, setPatientId] = useState('Generating…');
  const [form, setForm] = useState({ name: '', phone: '', weight: '', height: '', age: '', gender: 'Female' });
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedPk, setSavedPk] = useState(null);
  const [apiError, setApiError] = useState('');

  // Toast for real-time validation
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef(null);

  function showToast(msg) {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 3000);
  }

  useEffect(() => {
    api.request('patients/next-id/').then(d => setPatientId(d.patient_id || '')).catch(() => setPatientId(''));
  }, []);

  const bmi = (() => {
    const w = parseFloat(form.weight), h = parseFloat(form.height);
    if (!w || !h || h <= 0) return '';
    return (w / ((h / 100) ** 2)).toFixed(2);
  })();

  // Real-time Handlers
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

  function validate() {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.phone || form.phone.length !== 10) e.phone = 'Phone must be exactly 10 digits';
    else if (!/^[6-9]/.test(form.phone)) e.phone = 'Phone must start with 6, 7, 8, or 9';
    if (!form.weight || parseFloat(form.weight) <= 0) e.weight = 'Enter valid weight';
    if (!form.height || parseFloat(form.height) < 30) e.height = 'Enter valid height in cm';
    if (!form.age) e.age = 'Age is required';
    else if (parseInt(form.age) > 120) e.age = 'Age cannot exceed 120';
    return e;
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function savePatient(andNext = false) {
    setApiError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      const fields = {
        patient_id: patientId,
        name: form.name.trim(),
        phone: form.phone.trim(),
        weight: form.weight,
        height: form.height,
        age: form.age,
        gender: form.gender,
        bmi,
      };
      const data = await api.multipartRequest('patients/create/', { method: 'POST', fields, image: imageFile });
      setSaved(true);
      setSavedPk(data.id);
      if (andNext) navigate(`/surveys/${data.id}/demographics`);
    } catch (err) {
      setApiError(err.message || 'Failed to save patient');
    } finally {
      setSaving(false);
    }
  }

  const ef = field => errors[field] ? <span className="field-error">{errors[field]}</span> : null;
  const isValid = form.name.trim().length >= 2 && form.phone.length === 10 && form.weight && form.height && form.age && bmi;

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

      <PageHeader title="ADD PATIENT" backPath="/patients" showProfile />

      <div className="scroll-content" style={{ background: 'var(--bg)', padding: '16px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {apiError && <div className="alert alert-error">{apiError}</div>}

          {/* Photo picker */}
          <div style={{ textAlign: 'center' }}>
            <div
              className="profile-avatar-large"
              style={{ cursor: 'pointer' }}
              onClick={() => fileRef.current.click()}
            >
              {imagePreview
                ? <img src={imagePreview} alt="patient" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} />
                : '👤'}
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
            <button type="button" className="btn btn-outline btn-sm btn-inline" style={{ marginTop: 8 }}
              onClick={() => fileRef.current.click()}>
              Choose Photo
            </button>
          </div>

          {/* Patient ID (read-only) */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Patient ID</span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{patientId}</span>
          </div>

          <div className="field-group">
            <input id="add-name" className={`field-input ${errors.name ? 'error' : ''}`} placeholder="Name" value={form.name} onChange={handleNameChange} />
            {ef('name')}
          </div>

          <div className="field-group">
            <input id="add-phone" className={`field-input ${errors.phone ? 'error' : ''}`} placeholder="Phone (10 digits)" value={form.phone}
              onChange={handlePhoneChange} type="text" inputMode="numeric" />
            {ef('phone')}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div className="field-group" style={{ flex: 1 }}>
              <input id="add-weight" className={`field-input ${errors.weight ? 'error' : ''}`} placeholder="Weight (kg)" value={form.weight}
                onChange={handleDecimalChange('weight', 5)} type="text" inputMode="decimal" />
              {ef('weight')}
            </div>
            <div className="field-group" style={{ flex: 1 }}>
              <input id="add-height" className={`field-input ${errors.height ? 'error' : ''}`} placeholder="Height (cm)" value={form.height}
                onChange={handleDecimalChange('height', 5)} type="text" inputMode="decimal" />
              {ef('height')}
            </div>
          </div>

          {bmi && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, paddingLeft: 4 }}>
              BMI: <span style={{ color: 'var(--primary)' }}>{bmi}</span>
            </div>
          )}

          {/* Age */}
          <div className="field-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid var(--border)', borderRadius: 14, padding: '8px 16px', background: '#fff' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Age:</span>
              <button type="button" className="btn btn-outline btn-sm btn-inline" style={{ width: 32, padding: '4px 0' }}
                onClick={() => setForm(f => ({ ...f, age: String(Math.max(0, parseInt(f.age || '0') - 1)) }))}>−</button>
              <input id="add-age" className="field-input" type="text" inputMode="numeric" value={form.age}
                onChange={handleAgeChange}
                style={{ width: 70, textAlign: 'center', border: 'none', boxShadow: 'none', padding: '8px 4px' }} />
              <button type="button" className="btn btn-outline btn-sm btn-inline" style={{ width: 32, padding: '4px 0' }}
                onClick={() => setForm(f => ({ ...f, age: String(Math.min(120, parseInt(f.age || '0') + 1)) }))}>+</button>
            </div>
            {ef('age')}
          </div>

          {/* Gender */}
          <div className="field-group">
            <label className="field-label">Gender</label>
            <div className="seg-picker">
              {['Male','Female','Other'].map(g => (
                <div key={g} className={`seg-option ${form.gender === g ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, gender: g }))}>{g}</div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8, paddingBottom: 40 }}>
            <button id="add-save-btn" type="button" className="btn btn-teal" style={{ flex: 1 }}
              disabled={!isValid || saved || saving} onClick={() => savePatient(false)}>
              {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save'}
            </button>
            <button id="add-next-btn" type="button" className="btn btn-primary" style={{ flex: 1 }}
              disabled={!isValid || saving}
              onClick={() => saved ? navigate(`/surveys/${savedPk}/demographics`) : savePatient(true)}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
