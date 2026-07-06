import React, { useState, useEffect } from 'react';
import { useNotification } from '../hooks/useNotification';
import { employeeApi } from '../api/employeeApi';
import { formatCurrency } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiUsers, FiDollarSign } from 'react-icons/fi';

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
      console.log('Full API Response:', response);
      
      // ✅ FIXED: Extract employees from nested structure
      let employees = [];
      if (response.data && response.data.employees) {
        employees = response.data.employees;
      } else if (response.employees) {
        employees = response.employees;
      } else if (Array.isArray(response)) {
        employees = response;
      }
      
      console.log('✅ Processed employees:', employees);
      console.log('✅ Total employees:', employees.length);
      
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '30px' }}>
        Welcome to the Employee Management & Payroll System
      </p>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'var(--color-primary)' }}>
            <FiUsers size={24} color="white" />
          </div>
          <div>
            <div style={styles.statValue}>{stats.totalEmployees}</div>
            <div style={styles.statLabel}>Total Employees</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'var(--color-success)' }}>
            <FiUsers size={24} color="white" />
          </div>
          <div>
            <div style={styles.statValue}>{stats.activeEmployees}</div>
            <div style={styles.statLabel}>Active Employees</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'var(--color-warning)' }}>
            <FiDollarSign size={24} color="white" />
          </div>
          <div>
            <div style={styles.statValue}>{formatCurrency(stats.totalPayroll)}</div>
            <div style={styles.statLabel}>Total Monthly Salary</div>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3>Recent Employees</h3>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Employee Number</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEmployees.length > 0 ? (
                recentEmployees.map((emp) => (
                  <tr key={emp.id || emp._id}>
                    <td>{emp.employee_number}</td>
                    <td>{emp.employee_name}</td>
                    <td>{emp.department || '-'}</td>
                    <td>{emp.designation || '-'}</td>
                    <td>
                      <span className={`badge badge-${emp.status === 'Active' ? 'success' : 'danger'}`}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    No employees found
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: '#fff',
    padding: '20px',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--box-shadow)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  statIcon: {
    width: '50px',
    height: '50px',
    borderRadius: 'var(--radius)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 'var(--font-xl)',
    fontWeight: 'var(--font-bold)',
    color: 'var(--text-dark)',
  },
  statLabel: {
    fontSize: 'var(--font-sm)',
    color: 'var(--text-light)',
  },
  section: {
    background: '#fff',
    padding: '20px',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--box-shadow)',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
};

export default Dashboard;