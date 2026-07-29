import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import api from '../api/client';
import { resolveMediaUrl } from '../utils/mediaUrl';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    api.request('accounts/profile/').then(data => {
      setProfile(data);
      setForm({
        name: data.name || '',
        phone: data.phone || '',
        age: data.age || '',
        gender: data.gender || 'Male',
        specialization: data.specialization || '',
      });
      if (data.profile_image) setImagePreview(resolveMediaUrl(data.profile_image));
    }).catch(() => setError('Failed to load profile')).finally(() => setLoading(false));
  }, []);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const updated = await api.multipartProfileRequest('accounts/profile/update/', {
        method: 'PATCH',
        fields: { name: form.name, phone: form.phone, age: String(form.age), gender: form.gender, specialization: form.specialization },
        image: imageFile,
      });
      setProfile(updated);
      if (updated.profile_image) {
        setImagePreview(resolveMediaUrl(updated.profile_image, Date.now()));
      }
      setImageFile(null);
      setEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  const avatarLetter = (profile?.name || profile?.username || '?')[0]?.toUpperCase();

  return (
    <div className="animate-in">
      <PageHeader title="MY PROFILE" backPath="/home" />

      <div className="container" style={{ padding: '40px 24px' }}>
        {loading ? (
          <div className="spinner-center"><div className="spinner" /></div>
        ) : (
          <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
            {/* Avatar */}
            <div style={{ textAlign: 'center', marginBottom: 20, marginTop: 8 }}>
              <div
                className="profile-avatar-large"
                style={{ cursor: editing ? 'pointer' : 'default' }}
                onClick={() => editing && fileRef.current.click()}
              >
                {imagePreview
                  ? <img src={imagePreview} alt="profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} />
                  : avatarLetter}
              </div>
              {editing && (
                <>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
                  <button type="button" className="btn btn-outline btn-sm btn-inline" onClick={() => fileRef.current.click()}>
                    Change Photo
                  </button>
                </>
              )}
            </div>

            {success && <div className="alert alert-success" style={{ marginBottom: 12 }}>{success}</div>}
            {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

            {editing ? (
              <form onSubmit={handleSave} className="card flex-col gap-12" style={{ gap: 12 }}>
                {[
                  { id: 'p-name', field: 'name', placeholder: 'Full Name' },
                  { id: 'p-phone', field: 'phone', placeholder: 'Phone', type: 'tel' },
                  { id: 'p-age', field: 'age', placeholder: 'Age', type: 'number' },
                  { id: 'p-spec', field: 'specialization', placeholder: 'Specialization' },
                ].map(({ id, field, placeholder, type = 'text' }) => (
                  <input key={field} id={id} className="field-input" type={type} placeholder={placeholder}
                    value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                ))}

                <div className="seg-picker">
                  {['Male','Female','Other'].map(g => (
                    <div key={g} className={`seg-option ${form.gender === g ? 'active' : ''}`}
                      onClick={() => setForm(f => ({ ...f, gender: g }))}>{g}</div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button id="profile-save-btn" type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="card flex-col gap-12">
                {[
                  { label: 'Doctor ID', value: profile?.doctor_id },
                  { label: 'Full Name', value: profile?.name },
                  { label: 'Username', value: profile?.username },
                  { label: 'Email', value: profile?.email },
                  { label: 'Phone', value: profile?.phone },
                  { label: 'Age', value: profile?.age },
                  { label: 'Gender', value: profile?.gender },
                  { label: 'Specialization', value: profile?.specialization },
                ].map(({ label, value }) => value ? (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{value}</span>
                  </div>
                ) : null)}
                <button id="profile-edit-btn" className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => setEditing(true)}>
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
