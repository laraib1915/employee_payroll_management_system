import React, { useState, useEffect } from 'react';
import { useNotification } from '../hooks/useNotification';
import { employeeApi } from '../api/employeeApi';
import { formatCurrency } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiUsers, FiUserCheck, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

const Dashboard = () => {
  const { showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalPayroll: 0,
  });
  const [recentEmployees, setRecentEmployees] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await employeeApi.getAllEmployees();
      
      let employees = [];
      if (response.data && response.data.employees) {
        employees = response.data.employees;
      } else if (response.employees) {
        employees = response.employees;
      } else if (Array.isArray(response)) {
        employees = response;
      }
      
      const active = employees.filter(emp => emp.status === 'Active');
      
      setStats({
        totalEmployees: employees.length,
        activeEmployees: active.length,
        totalPayroll: employees.reduce((sum, emp) => sum + (emp.monthly_salary || 0), 0),
      });
      
      setRecentEmployees(employees.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const statCards = [
    { 
      icon: FiUsers, 
      label: 'Total Employees', 
      value: stats.totalEmployees, 
      color: '#027DFF',
      bgColor: 'rgba(2, 125, 255, 0.1)'
    },
    { 
      icon: FiUserCheck, 
      label: 'Active Employees', 
      value: stats.activeEmployees, 
      color: '#13a835',
      bgColor: 'rgba(19, 168, 53, 0.1)'
    },
    { 
      icon: FiDollarSign, 
      label: 'Monthly Payroll', 
      value: formatCurrency(stats.totalPayroll), 
      color: '#d6a000',
      bgColor: 'rgba(214, 160, 0, 0.1)'
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Dashboard</h1>
          <p style={styles.pageSubtitle}>Welcome to the Employee Management & Payroll System</p>
        </div>
        <div style={styles.headerBadge}>
          <FiTrendingUp size={18} />
          <span>Live</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: stat.bgColor, color: stat.color }}>
                <Icon size={24} />
              </div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Employees Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Recent Employees</h3>
          <span style={styles.tableCount}>{recentEmployees.length} of {stats.totalEmployees}</span>
        </div>
        
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Employee ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Designation</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEmployees.length > 0 ? (
                recentEmployees.map((emp) => (
                  <tr key={emp.id || emp._id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.employeeId}>#{emp.employee_number}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.employeeName}>{emp.employee_name}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.departmentText}>{emp.department || '—'}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.designationText}>{emp.designation || '—'}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(emp.status === 'Active' ? styles.statusActive : styles.statusInactive)
                      }}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={styles.emptyState}>
                    <p>No employees found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 6px 0',
  },
  pageSubtitle: {
    fontSize: '15px',
    color: '#6b7280',
    margin: 0,
  },
  headerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    backgroundColor: 'rgba(19, 168, 53, 0.1)',
    borderRadius: '20px',
    color: '#13a835',
    fontSize: '13px',
    fontWeight: '500',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '20px 24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f0f0f0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.2s ease',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a2e',
    lineHeight: '1.2',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '2px',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f0f0f0',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 24px',
    borderBottom: '1px solid #f0f0f0',
  },
  tableTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#1a1a2e',
    margin: 0,
  },
  tableCount: {
    fontSize: '14px',
    color: '#6b7280',
  },
  tableWrapper: {
    overflowX: 'auto',
    padding: '0 4px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    padding: '14px 20px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#6b7280',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #f0f0f0',
    backgroundColor: '#fafafa',
  },
  tr: {
    borderBottom: '1px solid #f5f5f5',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '14px 20px',
    verticalAlign: 'middle',
  },
  employeeId: {
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#4b5563',
    fontWeight: '500',
  },
  employeeName: {
    fontWeight: '500',
    color: '#1a1a2e',
  },
  departmentText: {
    color: '#4b5563',
  },
  designationText: {
    color: '#4b5563',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusActive: {
    backgroundColor: 'rgba(19, 168, 53, 0.12)',
    color: '#13a835',
  },
  statusInactive: {
    backgroundColor: 'rgba(220, 38, 38, 0.10)',
    color: '#dc2626',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: '#9ca3af',
  },
};

export default Dashboard;