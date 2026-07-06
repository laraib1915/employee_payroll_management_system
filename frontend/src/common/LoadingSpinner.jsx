import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => {
  const sizeMap = {
    small: '20px',
    medium: '40px',
    large: '60px',
  };

  const colorMap = {
    primary: 'var(--color-primary)',
    white: '#ffffff',
    dark: 'var(--bg-dark)',
  };

  return (
    <div
      style={{
        border: `4px solid var(--color-light)`,
        borderTop: `4px solid ${colorMap[color]}`,
        borderRadius: '50%',
        width: sizeMap[size],
        height: sizeMap[size],
        animation: 'spin 1s linear infinite',
        margin: '20px auto',
      }}
    />
  );
};

export default LoadingSpinner;