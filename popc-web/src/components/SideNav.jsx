import { NavLink } from 'react-router-dom';
import { Home, Users, LayoutDashboard, MessageSquare, Settings, Info } from 'lucide-react';

export default function SideNav() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-box" style={{ width: 40, height: 40, background: 'var(--primary-gradient)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem' }}>⚕️</div>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>POPC</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/home" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <Home size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/patients" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Patients</span>
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <MessageSquare size={20} />
          <span>AI Chat</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
        <NavLink to="/info" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <Info size={20} />
          <span>App Info</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Version 2.0.0
        </div>
      </div>
    </div>
  );
}
