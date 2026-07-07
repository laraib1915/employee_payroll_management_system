import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiUpload, 
  FiDollarSign, 
  FiSettings,
  FiGrid,
  FiLogOut
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
      {/* Logo Section */}
      <div style={styles.logoSection}>
        <div style={styles.logo}>
          <FiGrid size={24} style={styles.logoIcon} />
          <span style={styles.logoText}>Payroll</span>
        </div>
        <div style={styles.logoSubtext}>System Heuristics</div>
      </div>

      {/* Navigation */}
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
              <Icon size={20} style={styles.navIcon} />
              <span style={styles.navLabel}>{item.label}</span>
              {isActive && <span style={styles.activeIndicator} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.version}>v1.0.0</div>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '240px',
    height: '100vh',
    background: 'linear-gradient(180deg, #0d1526 0%, #0a0f1e 100%)',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
  },
  logoSection: {
    padding: '24px 20px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    color: '#027DFF',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  logoSubtext: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '4px',
    paddingLeft: '36px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  nav: {
    flex: 1,
    padding: '16px 12px',
    overflowY: 'auto',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '11px 16px',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.6)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '500',
    position: 'relative',
    marginBottom: '2px',
  },
  navItemActive: {
    background: 'rgba(2, 125, 255, 0.12)',
    color: '#ffffff',
  },
  navIcon: {
    flexShrink: 0,
  },
  navLabel: {
    flex: 1,
  },
  activeIndicator: {
    width: '4px',
    height: '24px',
    background: '#027DFF',
    borderRadius: '4px',
    flexShrink: 0,
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  version: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
  },
};

export default Sidebar;