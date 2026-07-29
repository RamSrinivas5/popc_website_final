import { NavLink } from 'react-router-dom';
import { Home, Users, MessageSquare, Settings } from 'lucide-react';

export default function BottomNavBar() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={22} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/patients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Users size={22} />
        <span>Patients</span>
      </NavLink>
      <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <MessageSquare size={22} />
        <span>Chat</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Settings size={22} />
        <span>Settings</span>
      </NavLink>
    </nav>
  );
}
