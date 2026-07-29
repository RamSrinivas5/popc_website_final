import { Outlet } from 'react-router-dom';
import SideNav from './SideNav';
import BottomNavBar from './BottomNavBar';

export default function AuthenticatedLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFF', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative Background Shapes */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(51,69,204,0.03)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -150, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(38,198,218,0.03)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      
      <SideNav />
      <main className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>
      <BottomNavBar />
    </div>
  );
}
