import { Outlet } from 'react-router-dom';
import MobileNavBar from '@/components/mobile/MobileNavBar';
import './MobileLayout.css';

export default function MobileLayout() {
  return (
    <div className="mobile-layout">
      <div className="mobile-content">
        <Outlet />
      </div>
      <MobileNavBar />
    </div>
  );
}
