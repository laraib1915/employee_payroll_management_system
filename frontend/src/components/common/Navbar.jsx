import React from 'react';
import { FiUser } from 'react-icons/fi';

const Navbar = () => {
  return (
    <div style={styles.navbar}>
      <div style={styles.left}>
        <h3>Employee Management & Payroll System</h3>
      </div>
      <div style={styles.right}>
        <div style={styles.userInfo}>
          <FiUser size={20} />
          <span>Admin</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  navbar: {
    height: '70px',
    background: 'var(--bg-dark)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 30px',
    color: '#fff',
    position: 'fixed',
    top: 0,
    right: 0,
    left: '250px',
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
};

export default Navbar;