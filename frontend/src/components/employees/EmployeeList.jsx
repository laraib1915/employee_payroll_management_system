import React, { useState } from 'react';
import { FiEdit } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';

const EmployeeList = ({ employees = [], onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const employeesArray = Array.isArray(employees) ? employees : [];
  
  const filteredEmployees = employeesArray.filter(emp => {
    const matchesSearch = emp.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.employee_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || emp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={styles.card}>
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Emp No.</th>
              <th>Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Type</th>
              <th>Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr key={emp.id || emp._id}>
                  <td>{emp.employee_number}</td>
                  <td>{emp.employee_name}</td>
                  <td>{emp.department || '-'}</td>
                  <td>{emp.designation || '-'}</td>
                  <td>
                    <span className={`badge badge-${emp.employment_type === 'Intern' ? 'warning' : 'info'}`}>
                      {emp.employment_type}
                    </span>
                  </td>
                  <td>{formatCurrency(emp.monthly_salary)}</td>
                  <td>
                    <span className={`badge badge-${emp.status === 'Active' ? 'success' : 'danger'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <div style={styles.actions}>
                      <button
                        onClick={() => onEdit && onEdit(emp)}
                        style={styles.actionButton}
                        title="Edit"
                      >
                        <FiEdit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.footer}>
        <span>Total: {filteredEmployees.length} employees</span>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: '#fff',
    padding: '20px',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--box-shadow)',
  },
  toolbar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: '1',
    minWidth: '200px',
    padding: '10px',
    border: '1px solid var(--grey-border)',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--font-sm)',
  },
  filterSelect: {
    padding: '10px',
    border: '1px solid var(--grey-border)',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--font-sm)',
    minWidth: '150px',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    color: 'var(--color-primary)',
    transition: 'all 0.3s ease',
  },
  footer: {
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid var(--grey-border)',
    color: 'var(--text-light)',
  },
};

export default EmployeeList;