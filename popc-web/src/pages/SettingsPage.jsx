import { useNavigate } from 'react-router-dom';
import { Lock, UserRoundPen, Trash2, LogOut, ChevronRight, Settings } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  const SETTINGS_GROUPS = [
    {
      title: 'Security & Account',
      items: [
        { id: 'set-pwd', label: 'Change Password', icon: Lock, path: '/settings/change-password', color: '#3345CC' },
        { id: 'set-un', label: 'Update Username', icon: UserRoundPen, path: '/settings/change-username', color: '#26C6DA' },
      ]
    },
    {
      title: 'Danger Zone',
      items: [
        { id: 'set-del', label: 'Delete Account', icon: Trash2, path: '/settings/delete-account', color: '#F44336' },
      ]
    }
  ];

  return (
    <div className="animate-in">
      <PageHeader title="SETTINGS" backPath="/home" showProfile />

      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Settings className="icon" size={28} style={{ color: 'var(--primary)' }} />
            Application Settings
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {SETTINGS_GROUPS.map(group => (
              <div key={group.title}>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16, paddingLeft: 8 }}>
                  {group.title}
                </h3>
                <div className="card card-premium" style={{ padding: 0, overflow: 'hidden' }}>
                  {group.items.map((item, idx) => (
                    <div
                      key={item.id}
                      id={item.id}
                      onClick={() => navigate(item.path)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', 
                        cursor: 'pointer', transition: 'background 0.2s',
                        borderBottom: idx === group.items.length - 1 ? 'none' : '1px solid var(--border)'
                      }}
                      className="sidebar-item-hover"
                    >
                      <div style={{ color: item.color }}>
                        <item.icon size={22} />
                      </div>
                      <span style={{ flex: 1, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</span>
                      <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              id="set-logout"
              className="btn btn-outline"
              onClick={handleLogout}
              style={{ 
                marginTop: 16, border: '2px solid var(--red)', color: 'var(--red)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, height: 56, borderRadius: 16 
              }}
            >
              <LogOut size={20} />
              Sign Out from Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
