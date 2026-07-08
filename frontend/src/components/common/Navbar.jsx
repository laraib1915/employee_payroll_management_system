import React from 'react';

const Navbar = () => {
  return (
    <div style={styles.navbar}>
      <div style={styles.left}>
        <h3 style={styles.title}>Employee Management & Payroll System</h3>
      </div>
      <div style={styles.right}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>A</div>
          <span style={styles.userName}>Admin</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  navbar: {
    height: '70px',
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 32px',
    position: 'fixed',
    top: 0,
    right: 0,
    left: '240px',
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: 0,
    letterSpacing: '-0.4px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 12px 6px 6px',
    borderRadius: '10px',
    border: '1px solid #f0f0f0',
    backgroundColor: '#fafafa',
    transition: 'all 0.2s ease',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3871ae 0%, #3871ae 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '700',
  },
  userName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a2e',
    paddingRight: '4px',
  },
};

export default Navbar;