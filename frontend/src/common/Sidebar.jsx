import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiUpload, 
  FiDollarSign, 
  FiSettings,
  FiFileText,
  FiCalendar
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/employees', icon: FiUsers, label: 'Employees' },
    { path: '/attendance', icon: FiUpload, label: 'Attendance' },
    { path: '/payroll', icon: FiDollarSign, label: 'Payroll' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <h2>Payroll System</h2>
      </div>
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '250px',
    height: '100vh',
    background: 'var(--bg-dark)',
    position: 'fixed',
    left: 0,
    top: 0,
    color: '#fff',
    overflowY: 'auto',
  },
  logo: {
    padding: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  nav: {
    padding: '20px 0',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    fontSize: '14px',
  },
  navItemActive: {
    background: 'var(--color-primary)',
    color: '#fff',
    borderLeft: '4px solid var(--color-secondary)',
  },
};

export default Sidebar;