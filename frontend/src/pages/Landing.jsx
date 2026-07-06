import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiDollarSign, FiClock, FiShield } from 'react-icons/fi';

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const features = [
    {
      icon: FiUsers,
      title: 'Employee Management',
      description: 'Manage employee records, departments, and designations'
    },
    {
      icon: FiDollarSign,
      title: 'Payroll Processing',
      description: 'Automated payroll generation with salary calculations'
    },
    {
      icon: FiClock,
      title: 'Attendance Tracking',
      description: 'Upload and process monthly attendance sheets'
    },
    {
      icon: FiShield,
      title: 'Leave Management',
      description: 'Manage monthly and annual leave allocations'
    }
  ];

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.content}>
          <div style={styles.logoSection}>
            <img 
              src="/system-heuristics-og.png" 
              alt="System Heuristics" 
              style={styles.logoImage}
            />
            <h1 style={styles.companyName}>System Heuristics</h1>
          </div>
          
          <h1 style={styles.title}>
            Employee Management & <br />
            <span style={styles.highlight}>Payroll Processing System</span>
          </h1>
          
          <p style={styles.subtitle}>
            Streamline your workforce management with automated payroll processing,
            attendance tracking, and employee management all in one place.
          </p>
          
          <button onClick={handleGetStarted} style={styles.ctaButton}>
            Get Started
            <FiArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.featuresSection}>
        <h2 style={styles.featuresTitle}>Key Features</h2>
        <div style={styles.featuresGrid}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} style={styles.featureCard}>
                <div style={styles.featureIcon}>
                  <Icon size={28} color="#027DFF" />
                </div>
                <h3 style={styles.featureName}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p>© {new Date().getFullYear()} System Heuristics. All rights reserved.</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg-dark)',
    color: '#fff',
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    padding: '40px 20px',
    background: 'radial-gradient(ellipse at top, rgba(2, 125, 255, 0.1) 0%, transparent 70%)',
  },
  content: {
    maxWidth: '900px',
    textAlign: 'center',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '30px',
  },
  logoImage: {
    height: '60px',
    width: 'auto',
    objectFit: 'contain',
  },
  companyName: {
    fontSize: 'var(--font-xl)',
    fontWeight: 'var(--font-bold)',
    color: '#fff',
    margin: 0,
  },
  title: {
    fontSize: 'var(--font-2xl)',
    fontWeight: 'var(--font-bold)',
    lineHeight: '1.2',
    marginBottom: '20px',
  },
  highlight: {
    background: 'var(--glowing-blue-color)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: 'var(--font-md)',
    color: 'rgba(255,255,255,0.7)',
    maxWidth: '600px',
    margin: '0 auto 40px',
    lineHeight: '1.6',
  },
  ctaButton: {
    padding: '16px 40px',
    background: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--rounded)',
    fontSize: 'var(--font-md)',
    fontWeight: 'var(--font-medium)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(2, 125, 255, 0.3)',
  },
  featuresSection: {
    padding: '60px 20px',
    background: 'var(--bg-light)',
  },
  featuresTitle: {
    textAlign: 'center',
    fontSize: 'var(--font-xl)',
    fontWeight: 'var(--font-bold)',
    marginBottom: '40px',
    color: '#fff',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featureCard: {
    background: 'rgba(255,255,255,0.05)',
    padding: '30px',
    borderRadius: 'var(--radius)',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.3s ease',
  },
  featureIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '15px',
  },
  featureName: {
    fontSize: 'var(--font-md)',
    fontWeight: 'var(--font-medium)',
    marginBottom: '10px',
    color: '#fff',
  },
  featureDescription: {
    fontSize: 'var(--font-sm)',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.5',
  },
  footer: {
    textAlign: 'center',
    padding: '30px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 'var(--font-sm)',
  },
};

export default Landing;