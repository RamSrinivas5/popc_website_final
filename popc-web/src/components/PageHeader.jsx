import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { resolveMediaUrl } from '../utils/mediaUrl';

export default function PageHeader({ title, onBack, backPath, showProfile = false }) {
  const navigate = useNavigate();
  const [profileImg, setProfileImg] = useState(null);

  useEffect(() => {
    if (showProfile) {
      api.request('accounts/profile/')
        .then(data => {
          if (data && data.profile_image) {
            setProfileImg(resolveMediaUrl(data.profile_image));
          }
        })
        .catch(() => {});
    }
  }, [showProfile]);

  function handleBack() {
    if (onBack) { onBack(); return; }
    if (backPath) { navigate(backPath); return; }
    navigate(-1);
  }

  return (
    <div className="page-header">
      {(onBack !== null) && (
        <button className="header-back-btn" onClick={handleBack} aria-label="Back">
          ‹
        </button>
      )}
      <span className="header-title">{title}</span>
      {showProfile && (
        <div 
          className="header-avatar" 
          onClick={() => navigate('/profile')} 
          title="View Profile Details"
          style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {profileImg ? (
            <img src={profileImg} alt="Doctor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            '👤'
          )}
        </div>
      )}
    </div>
  );
}
