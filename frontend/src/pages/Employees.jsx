import React, { useState, useEffect } from 'react';
import { employeeApi } from '../api/employeeApi';
import { useNotification } from '../hooks/useNotification';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmployeeForm from '../components/employees/EmployeeForm';
import EmployeeList from '../components/employees/EmployeeList';
import { FiPlus } from 'react-icons/fi';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.getAllEmployees();
      
      let employeesData = [];
      if (response.data && response.data.employees) {
        employeesData = response.data.employees;
      } else if (response.employees) {
        employeesData = response.employees;
      } else if (Array.isArray(response)) {
        employeesData = response;
      }
      
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      showError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (employeeData) => {
    try {
      await employeeApi.createEmployee(employeeData);
      showSuccess('Employee created successfully!');
      await fetchEmployees();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating employee:', error);
      showError(error.response?.data?.message || 'Failed to create employee');
    }
  };

  const handleUpdateEmployee = async (employeeId, employeeData) => {
    try {
      await employeeApi.updateEmployee(employeeId, employeeData);
      showSuccess('Employee updated successfully!');
      await fetchEmployees();
      setEditingEmployee(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating employee:', error);
      showError(error.response?.data?.message || 'Failed to update employee');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Employees</h1>
          <p style={styles.pageSubtitle}>Manage your workforce and employee records</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.addButton}
        >
          <FiPlus size={18} />
          {showForm ? 'Cancel' : 'Add Employee'}
        </button>
      </div>

      {showForm && (
        <div style={styles.formContainer}>
          <EmployeeForm
            initialData={editingEmployee}
            onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
            onCancel={handleCancel}
          />
        </div>
      )}

      <EmployeeList
        employees={employees}
        onEdit={handleEdit}
        onRefresh={fetchEmployees}
      />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
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
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    background: '#3871ae',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(2, 125, 255, 0.25)',
  },
  formContainer: {
    marginBottom: '24px',
  },
};

export default Employees;