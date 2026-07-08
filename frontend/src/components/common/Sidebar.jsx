import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiUpload, 
  FiDollarSign, 
  FiSettings,
  FiMail,
  FiInfo
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
        <Link to="/dashboard" style={styles.logoLink}>
          <div style={styles.logoContainer}>
            <img 
              src="/assets/system-heuristics-og.png" 
              alt="System Heuristics" 
              style={styles.logoImage}
            />
          </div>
          <div style={styles.logoTextContainer}>
            <span style={styles.logoText}>System Heuristics</span>
            <span style={styles.logoSubtext}>Payroll System</span>
          </div>
        </Link>
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
        <div style={styles.footerItem}>
          <FiMail size={14} style={styles.footerIcon} />
          <span style={styles.footerText}>system_heuristics@gmail.com</span>
        </div>
        <div style={styles.footerItem}>
          <FiInfo size={14} style={styles.footerIcon} />
          <span style={styles.footerText}>About</span>
        </div>
        <div style={styles.footerDivider} />
        <div style={styles.copyright}>
          © {new Date().getFullYear()} System Heuristics
        </div>
        <div style={styles.version}>v1.0.0</div>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '240px',
    height: '100vh',
    background: 'linear-gradient(180deg, #0d1526 0%, #445482 100%)',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
  },
  logoSection: {
    padding: '20px 16px 16px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoContainer: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    padding: '4px',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  logoTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    minWidth: 0,
  },
  logoText: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.3px',
    lineHeight: '1.2',
    whiteSpace: 'nowrap',
  },
  logoSubtext: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
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
    padding: '12px 16px',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.65)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '500',
    position: 'relative',
    marginBottom: '2px',
  },
  navItemActive: {
    background: 'rgba(2, 125, 255, 0.15)',
    color: '#ffffff',
  },
  navIcon: {
    flexShrink: 0,
    opacity: 0.8,
  },
  navLabel: {
    flex: 1,
    fontSize: '14px',
    fontWeight: '500',
  },
  activeIndicator: {
    width: '4px',
    height: '24px',
    background: '#027DFF',
    borderRadius: '4px',
    flexShrink: 0,
  },
  footer: {
    padding: '16px 20px 18px 20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  footerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    cursor: 'pointer',
    padding: '2px 0',
  },
  footerIcon: {
    flexShrink: 0,
    opacity: 0.6,
  },
  footerText: {
    fontSize: '12px',
    fontWeight: '400',
    color: 'rgba(255,255,255,0.5)',
    transition: 'color 0.2s ease',
  },
  footerDivider: {
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    margin: '4px 0 6px 0',
  },
  copyright: {
    fontSize: '11px',
    fontWeight: '400',
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
  version: {
    fontSize: '10px',
    fontWeight: '400',
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
  },
};

export default Sidebar;