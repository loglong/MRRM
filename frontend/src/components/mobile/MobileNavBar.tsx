import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, TeamOutlined, FileTextOutlined, BellOutlined } from '@ant-design/icons';
import './MobileNavBar.css';

export default function MobileNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { key: '/mobile', icon: <HomeOutlined />, label: '首页' },
    { key: '/mobile/patients', icon: <TeamOutlined />, label: '患者' },
    { key: '/mobile/demands', icon: <FileTextOutlined />, label: '需求' },
    { key: '/mobile/tasks', icon: <BellOutlined />, label: '任务' },
  ];

  const isActive = (path: string) => {
    if (path === '/mobile') {
      return location.pathname === '/mobile';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="mobile-nav-bar">
      {items.map(item => (
        <div
          key={item.key}
          className={`mobile-nav-item ${isActive(item.key) ? 'active' : ''}`}
          onClick={() => navigate(item.key)}
        >
          <span className="mobile-nav-icon">{item.icon}</span>
          <span className="mobile-nav-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
