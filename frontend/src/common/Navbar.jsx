import React, { useState } from 'react';
import { FiBell, FiUser, FiChevronDown, FiSearch } from 'react-icons/fi';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div style={styles.navbar}>
      {/* Left Section */}
      <div style={styles.left}>
        <h3 style={styles.title}>Employee Management & Payroll System</h3>
      </div>

      {/* Right Section */}
      <div style={styles.right}>
        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <FiSearch size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search..."
            style={styles.searchInput}
          />
        </div>

        {/* Notifications */}
        <button style={styles.iconButton} title="Notifications">
          <FiBell size={20} />
          <span style={styles.notificationDot} />
        </button>

        {/* User Profile */}
        <div 
          style={styles.profileContainer}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div style={styles.avatar}>
            <FiUser size={20} />
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>Admin</span>
            <FiChevronDown size={16} style={styles.chevron} />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  navbar: {
    height: '70px',
    background: '#ffffff',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 32px',
    position: 'fixed',
    top: 0,
    right: 0,
    left: '240px',
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a2e',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    background: '#f5f6fa',
    borderRadius: '10px',
    padding: '8px 14px',
    gap: '10px',
    transition: 'all 0.2s ease',
    marginRight: '8px',
  },
  searchIcon: {
    color: '#9ca3af',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14px',
    color: '#1a1a2e',
    width: '180px',
    fontFamily: 'inherit',
  },
  iconButton: {
    position: 'relative',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: '#6b7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  notificationDot: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '8px',
    height: '8px',
    background: '#ef4444',
    borderRadius: '50%',
    border: '2px solid #ffffff',
  },
  profileContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 12px 6px 6px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid transparent',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #027DFF 0%, #0067d4 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a2e',
  },
  chevron: {
    color: '#9ca3af',
  },
};

export default Navbar;