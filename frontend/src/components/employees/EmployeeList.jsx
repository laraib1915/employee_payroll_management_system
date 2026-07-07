import React, { useState } from 'react';
import { FiEdit, FiSearch, FiX } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';

const EmployeeList = ({ employees = [], onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const employeesArray = Array.isArray(employees) ? employees : [];
  
  const filteredEmployees = employeesArray.filter(emp => {
    const matchesSearch = 
      emp.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || emp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div style={styles.card}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchContainer}>
          <FiSearch size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search employees by name, ID, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={clearSearch} style={styles.clearButton}>
              <FiX size={16} />
            </button>
          )}
        </div>
        
        <div style={styles.filterContainer}>
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
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Emp No.</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Designation</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th} align="right">Salary</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th} align="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
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
                      ...styles.typeBadge,
                      ...(emp.employment_type === 'Intern' ? styles.typeIntern : styles.typeFullTime)
                    }}>
                      {emp.employment_type}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <span style={styles.salaryText}>{formatCurrency(emp.monthly_salary)}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      ...(emp.status === 'Active' ? styles.statusActive : styles.statusInactive)
                    }}>
                      {emp.status}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <button
                      onClick={() => onEdit && onEdit(emp)}
                      style={styles.editButton}
                      title="Edit Employee"
                    >
                      <FiEdit size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={styles.emptyState}>
                  <p style={styles.emptyText}>No employees found</p>
                  <p style={styles.emptySubtext}>Try adjusting your search or filters</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <span style={styles.footerText}>
          Showing <strong>{filteredEmployees.length}</strong> of <strong>{employeesArray.length}</strong> employees
        </span>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f0f0f0',
    overflow: 'hidden',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #f0f0f0',
    gap: '15px',
    flexWrap: 'wrap',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    flex: '1',
    minWidth: '200px',
    background: '#f5f6fa',
    borderRadius: '8px',
    padding: '0 12px',
    transition: 'all 0.2s ease',
  },
  searchIcon: {
    color: '#9ca3af',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    outline: 'none',
    padding: '10px 10px',
    fontSize: '14px',
    color: '#1a1a2e',
    fontFamily: 'inherit',
  },
  clearButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  filterContainer: {
    display: 'flex',
    gap: '8px',
  },
  filterSelect: {
    padding: '10px 14px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1a1a2e',
    background: '#ffffff',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'inherit',
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
    padding: '14px 16px',
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
    padding: '14px 16px',
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
  salaryText: {
    fontWeight: '600',
    color: '#1a1a2e',
  },
  typeBadge: {
    display: 'inline-block',
    padding: '3px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  typeFullTime: {
    backgroundColor: 'rgba(2, 125, 255, 0.10)',
    color: '#027DFF',
  },
  typeIntern: {
    backgroundColor: 'rgba(214, 160, 0, 0.12)',
    color: '#d6a000',
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
  editButton: {
    background: 'transparent',
    border: 'none',
    padding: '6px',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#6b7280',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: '50px 20px',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: '16px',
    color: '#4b5563',
    margin: '0 0 4px 0',
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0,
  },
  footer: {
    padding: '14px 20px',
    borderTop: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  footerText: {
    fontSize: '14px',
    color: '#6b7280',
  },
};

export default EmployeeList;