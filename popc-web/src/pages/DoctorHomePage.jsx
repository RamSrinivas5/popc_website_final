import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LayoutDashboard, MessageSquare, ClipboardList, Settings, Info, ChevronRight, CheckCircle, ShieldCheck } from 'lucide-react';
import doctorAvatar from '../assets/doctor_profile.png';
import api from '../api/client';
import { resolveMediaUrl } from '../utils/mediaUrl';

const MENU_ITEMS = [
  { 
    id: 'home-patients', 
    icon: Users, 
    label: 'Patient Management', 
    desc: 'Manage patient details and records',
    path: '/patients', 
    color: '#3345CC',
    bgColor: 'rgba(51, 69, 204, 0.1)'
  },
  { 
    id: 'home-surveys', 
    icon: ClipboardList, 
    label: 'Survey Records', 
    desc: 'View and manage survey data',
    path: '/surveys', 
    color: '#FF8A00',
    bgColor: 'rgba(255, 138, 0, 0.1)'
  },
  { 
    id: 'home-dashboard', 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    desc: 'Overview and key statistics',
    path: '/dashboard', 
    color: '#9C27B0',
    bgColor: 'rgba(156, 39, 176, 0.1)'
  },
  { 
    id: 'home-settings', 
    icon: Settings, 
    label: 'Settings', 
    desc: 'Configure application preferences',
    path: '/settings', 
    color: '#4CAF50',
    bgColor: 'rgba(76, 175, 80, 0.1)'
  },
  { 
    id: 'home-chat', 
    icon: MessageSquare, 
    label: 'PPC Chat', 
    desc: 'Chat with PPC support team',
    path: '/chat', 
    color: '#26C6DA',
    bgColor: 'rgba(38, 198, 218, 0.1)'
  },
  { 
    id: 'home-info', 
    icon: Info, 
    label: 'App Info', 
    desc: 'View application information',
    path: '/info', 
    color: '#3345CC',
    bgColor: 'rgba(51, 69, 204, 0.1)'
  },
];

export default function DoctorHomePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const username = localStorage.getItem('popc_username') || 'Ram Srinivas';

  useEffect(() => {
    api.request('accounts/profile/')
      .then(data => setProfile(data))
      .catch(() => {});
  }, []);

  const displayAvatar = resolveMediaUrl(profile?.profile_image) || doctorAvatar;
  const displayName = profile?.name || username;
  const displayId = profile?.doctor_id || 'Doc0001';
  const displayRole = profile?.specialization || 'Medical Administrator';

  return (
    <div className="home-container animate-in">
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="rgba(38, 198, 218, 0.05)" fillOpacity="1" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,218.7C960,235,1056,213,1152,186.7C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>

        <header 
          className="home-header-wrap clickable" 
          onClick={() => navigate('/profile')} 
          style={{ position: 'relative', zIndex: 1, cursor: 'pointer', transition: 'opacity 0.2s' }}
          title="Click to view profile details"
        >
          <div className="home-header-info">
            <div className="home-doc-id">
              {displayId} <CheckCircle size={18} fill="#10B981" color="#fff" strokeWidth={1} />
            </div>
            <h1 className="home-doc-name">{displayName}</h1>
            <div className="home-doc-role">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: 'rgba(38, 198, 218, 0.1)', marginRight: 4 }}>
                <ShieldCheck size={14} color="var(--teal)" />
              </div>
              {displayRole}
            </div>
          </div>
          
          <div className="home-avatar-wrap">
            <img 
              src={displayAvatar} 
              alt="Doctor Profile" 
              className="home-avatar-img" 
            />
            <div className="home-avatar-status"></div>
          </div>
        </header>
      </div>

      <div className="home-grid">
        {MENU_ITEMS.map(item => (
          <div
            key={item.id}
            id={item.id}
            className="home-card card-premium"
            onClick={() => navigate(item.path)}
          >
            <div className="home-card-icon" style={{ background: item.bgColor, color: item.color }}>
              <item.icon size={30} strokeWidth={2.5} />
            </div>
            <div className="home-card-title">{item.label}</div>
            <div className="home-card-desc">{item.desc}</div>
            <div className="home-card-arrow" style={{ color: item.color, opacity: 0.8 }}>
              <ChevronRight size={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
