import React, { useState, useEffect } from 'react';
import { EMPLOYMENT_TYPES_LIST, EMPLOYEE_STATUS_LIST } from '../../utils/constants';

const EmployeeForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    employee_number: '',
    employee_name: '',
    contact_number: '',
    cnic: '',
    department: '',
    designation: '',
    employment_type: 'Full-Time',
    monthly_salary: '',
    annual_leave_balance: 10,
    joining_date: '',
    probation_duration: '',
    status: 'Active',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Format the joining date properly
      let joiningDate = '';
      if (initialData.joining_date) {
        // If it's a string, try to format it
        if (typeof initialData.joining_date === 'string') {
          const dateObj = new Date(initialData.joining_date);
          if (!isNaN(dateObj.getTime())) {
            joiningDate = dateObj.toISOString().split('T')[0];
          }
        } else if (initialData.joining_date instanceof Date) {
          joiningDate = initialData.joining_date.toISOString().split('T')[0];
        }
      }

      setFormData({
        employee_number: initialData.employee_number || '',
        employee_name: initialData.employee_name || '',
        contact_number: initialData.contact_number || '',
        cnic: initialData.cnic || '',
        department: initialData.department || '',
        designation: initialData.designation || '',
        employment_type: initialData.employment_type || 'Full-Time',
        monthly_salary: initialData.monthly_salary || '',
        annual_leave_balance: initialData.annual_leave_balance || 10,
        joining_date: joiningDate,
        probation_duration: initialData.probation_duration || '',
        status: initialData.status || 'Active',
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.employee_number) newErrors.employee_number = 'Employee number is required';
    if (!formData.employee_name) newErrors.employee_name = 'Employee name is required';
    if (!formData.employment_type) newErrors.employment_type = 'Employment type is required';
    if (!formData.monthly_salary) newErrors.monthly_salary = 'Monthly salary is required';
    if (formData.monthly_salary && parseFloat(formData.monthly_salary) <= 0) {
      newErrors.monthly_salary = 'Monthly salary must be greater than 0';
    }
    if (formData.contact_number && formData.contact_number.length !== 11) {
      newErrors.contact_number = 'Contact number must be exactly 11 digits';
    }
    if (formData.cnic && formData.cnic.length !== 13) {
      newErrors.cnic = 'CNIC must be exactly 13 digits';
    }
    if (!formData.joining_date) newErrors.joining_date = 'Joining date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Build the submit data with proper types
      const submitData = {};
      
      // Only include fields that have values (for update)
      if (formData.employee_number) submitData.employee_number = formData.employee_number;
      if (formData.employee_name) submitData.employee_name = formData.employee_name;
      if (formData.contact_number) submitData.contact_number = formData.contact_number;
      if (formData.cnic) submitData.cnic = formData.cnic;
      if (formData.department) submitData.department = formData.department;
      if (formData.designation) submitData.designation = formData.designation;
      if (formData.employment_type) submitData.employment_type = formData.employment_type;
      
      // Convert to number
      if (formData.monthly_salary) {
        submitData.monthly_salary = parseFloat(formData.monthly_salary);
      }
      
      // Convert to integer
      if (formData.annual_leave_balance) {
        submitData.annual_leave_balance = parseInt(formData.annual_leave_balance);
      }
      
      if (formData.joining_date) submitData.joining_date = formData.joining_date;
      
      // Convert probation duration to number or null
      if (formData.probation_duration) {
        submitData.probation_duration = parseInt(formData.probation_duration);
      } else {
        submitData.probation_duration = null;
      }
      
      if (formData.status) submitData.status = formData.status;

      console.log('Submitting data:', submitData); // Debug log

      if (initialData) {
        await onSubmit(initialData.id, submitData);
      } else {
        await onSubmit(submitData);
      }
    } catch (error) {
      console.error('Submit error:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div style={styles.card}>
      <h3>{initialData ? 'Edit Employee' : 'Add New Employee'}</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Employee Number *</label>
            <input
              type="text"
              name="employee_number"
              value={formData.employee_number}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.employee_number ? styles.inputError : {}) }}
              disabled={!!initialData}
            />
            {errors.employee_number && <span style={styles.error}>{errors.employee_number}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Employee Name *</label>
            <input
              type="text"
              name="employee_name"
              value={formData.employee_name}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.employee_name ? styles.inputError : {}) }}
            />
            {errors.employee_name && <span style={styles.error}>{errors.employee_name}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contact Number</label>
            <input
              type="text"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.contact_number ? styles.inputError : {}) }}
              placeholder="03331234567"
            />
            {errors.contact_number && <span style={styles.error}>{errors.contact_number}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>CNIC</label>
            <input
              type="text"
              name="cnic"
              value={formData.cnic}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.cnic ? styles.inputError : {}) }}
              placeholder="1234512345678"
            />
            {errors.cnic && <span style={styles.error}>{errors.cnic}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Designation</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Employment Type *</label>
            <select
              name="employment_type"
              value={formData.employment_type}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.employment_type ? styles.inputError : {}) }}
            >
              {EMPLOYMENT_TYPES_LIST.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.employment_type && <span style={styles.error}>{errors.employment_type}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Monthly Salary *</label>
            <input
              type="number"
              name="monthly_salary"
              value={formData.monthly_salary}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.monthly_salary ? styles.inputError : {}) }}
              min="0"
              step="0.01"
            />
            {errors.monthly_salary && <span style={styles.error}>{errors.monthly_salary}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Joining Date *</label>
            <input
              type="date"
              name="joining_date"
              value={formData.joining_date}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.joining_date ? styles.inputError : {}) }}
            />
            {errors.joining_date && <span style={styles.error}>{errors.joining_date}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Probation Duration (Months)</label>
            <input
              type="number"
              name="probation_duration"
              value={formData.probation_duration}
              onChange={handleChange}
              style={styles.input}
              min="0"
              step="1"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Annual Leave Balance</label>
            <input
              type="number"
              name="annual_leave_balance"
              value={formData.annual_leave_balance}
              onChange={handleChange}
              style={styles.input}
              min="0"
              step="1"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={styles.input}
            >
              {EMPLOYEE_STATUS_LIST.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Saving...' : initialData ? 'Update Employee' : 'Create Employee'}
          </button>
          <button type="button" onClick={onCancel} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </form>
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
  form: {
    marginTop: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontWeight: 'var(--font-medium)',
    fontSize: 'var(--font-sm)',
    color: 'var(--text-light)',
  },
  input: {
    padding: '10px',
    border: '1px solid var(--grey-border)',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--font-sm)',
    transition: 'all 0.3s ease',
  },
  inputError: {
    borderColor: 'var(--color-danger)',
  },
  error: {
    color: 'var(--color-danger)',
    fontSize: 'var(--font-xs)',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    justifyContent: 'flex-end',
  },
  submitButton: {
    padding: '10px 20px',
    background: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontWeight: 'var(--font-medium)',
    transition: 'all 0.3s ease',
  },
  cancelButton: {
    padding: '10px 20px',
    background: 'var(--color-light)',
    color: 'var(--text-light)',
    border: '1px solid var(--grey-border)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontWeight: 'var(--font-medium)',
    transition: 'all 0.3s ease',
  },
};

export default EmployeeForm;