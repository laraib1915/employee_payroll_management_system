import React, { useState, useEffect } from 'react';
import { employeeApi } from '../api/employeeApi';
import { useNotification } from '../hooks/useNotification';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmployeeForm from '../components/employees/EmployeeForm';
import EmployeeList from '../components/employees/EmployeeList';

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
      console.log('Employees API Response:', response);
      
      // ✅ FIXED: Extract employees from nested structure
      let employeesData = [];
      if (response.data && response.data.employees) {
        employeesData = response.data.employees;
      } else if (response.employees) {
        employeesData = response.employees;
      } else if (Array.isArray(response)) {
        employeesData = response;
      }
      
      console.log('✅ Processed employees:', employeesData);
      console.log('✅ Total employees:', employeesData.length);
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
    <div>
      <div style={styles.header}>
        <h2>Employees</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.addButton}
        >
          {showForm ? 'Cancel' : '+ Add Employee'}
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
      />
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  addButton: {
    padding: '10px 20px',
    background: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--font-sm)',
    fontWeight: 'var(--font-medium)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  formContainer: {
    marginBottom: '20px',
  },
};

export default Employees;