import React, { useState } from 'react';
import { payrollApi } from '../api/payrollApi';
import { useNotification } from '../hooks/useNotification';
import { MONTHS } from '../utils/constants';
import { FiDownload, FiPlus, FiX, FiAlertCircle } from 'react-icons/fi';

const Payroll = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    public_holidays: 0,
  });

  const [overrides, setOverrides] = useState([]);

  // Helper function to extract meaningful error message
  const getErrorMessage = (error) => {
    console.error('Full error:', error);
    
    // Check if error response exists
    if (error && error.response) {
      const { status, data } = error.response;
      
      // Handle 404 specifically
      if (status === 404) {
        if (data && data.message) {
          // Check for specific error types
          if (data.message.includes('No attendance records')) {
            return `📋 ${data.message}`;
          }
          if (data.message.includes('No payroll records')) {
            return `📋 ${data.message}`;
          }
          return data.message;
        }
        return 'No data found for the selected month. Please check if attendance records exist.';
      }
      
      // Handle 400 (Bad Request - including future month validation)
      if (status === 400) {
        if (data && data.message) {
          return `⚠️ ${data.message}`;
        }
        return 'Invalid request. Please check your input and try again.';
      }
      
      // Handle 405 (Method Not Allowed)
      if (status === 405) {
        return 'The requested action is not allowed. Please try refreshing the page.';
      }
      
      // Handle 500 (Server Error)
      if (status === 500) {
        if (data && data.message) {
          return `❌ ${data.message}`;
        }
        return 'The server encountered an issue. Please try again later.';
      }
      
      // If we have a data object with message
      if (data) {
        if (data.message) return data.message;
        if (data.error) return data.error;
        if (data.detail) return data.detail;
      }
      
      return `Server error (${status}). Please try again.`;
    }
    
    // Network errors (no response)
    if (error && error.request) {
      return 'Network error: Unable to reach the server. Please check your internet connection.';
    }
    
    // If error has a message property
    if (error && error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  };

  const handleGenerateAndDownload = async () => {
    setLoading(true);
    setErrorDetails(null);
    try {
      const payload = {
        month: formData.month,
        year: formData.year,
        public_holidays: formData.public_holidays,
        payroll_overrides: overrides
          .filter(o => o.employee_no && o.employee_no.trim() !== '')
          .map(o => ({
            employee_no: o.employee_no,
            worked_days_to_apply: o.worked_days_to_apply !== null && o.worked_days_to_apply !== '' ? parseInt(o.worked_days_to_apply) : null,
            half_days_to_apply: o.half_days_to_apply !== null && o.half_days_to_apply !== '' ? parseInt(o.half_days_to_apply) : null,
            annual_leaves_to_apply: o.annual_leaves_to_apply !== null && o.annual_leaves_to_apply !== '' ? parseInt(o.annual_leaves_to_apply) : 0,
            bonus_to_apply: o.bonus_to_apply !== null && o.bonus_to_apply !== '' ? parseFloat(o.bonus_to_apply) : 0,
            loan_deduction_to_apply: o.loan_deduction_to_apply !== null && o.loan_deduction_to_apply !== '' ? parseFloat(o.loan_deduction_to_apply) : 0,
          }))
      };
      
      console.log('📤 Generating payroll with payload:', payload);
      
      const response = await payrollApi.generatePayroll(payload);
      console.log('✅ Payroll generated:', response);
      
      await handleExport();
      
      showSuccess(`✅ Payroll generated and downloaded successfully for ${MONTHS.find(m => m.value === formData.month)?.label} ${formData.year}!`);
      setOverrides([]);
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setErrorDetails(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    setErrorDetails(null);
    try {
      const result = await payrollApi.exportSalarySheet(formData.month, formData.year);
      
      // Check if the result is a blob (Excel file) or an error object
      if (result instanceof Blob) {
        // It's a valid Excel file
        const url = window.URL.createObjectURL(result);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Salary_Sheet_${formData.month}_${formData.year}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } else if (result && result.message) {
        // It's an error response
        throw new Error(result.message);
      } else {
        throw new Error('Unexpected response format');
      }
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setErrorDetails(errorMessage);
      showError(errorMessage);
      throw error;
    } finally {
      setExportLoading(false);
    }
  };

  const handleAddOverride = () => {
    setOverrides([
      ...overrides,
      {
        employee_no: '',
        worked_days_to_apply: null,
        half_days_to_apply: null,
        annual_leaves_to_apply: 0,
        bonus_to_apply: 0,
        loan_deduction_to_apply: 0,
      },
    ]);
  };

  const handleOverrideChange = (index, field, value) => {
    const updated = [...overrides];
    
    if (field !== 'employee_no') {
      if (value === '') {
        updated[index][field] = null;
      } else {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
          updated[index][field] = value;
        }
      }
    } else {
      updated[index][field] = value;
    }
    
    setOverrides(updated);
  };

  const handleRemoveOverride = (index) => {
    setOverrides(overrides.filter((_, i) => i !== index));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Payroll Management</h1>
          <p style={styles.pageSubtitle}>Generate monthly payroll with employee adjustments</p>
        </div>
      </div>

      {/* Error Banner */}
      {errorDetails && (
        <div style={styles.errorBanner}>
          <FiAlertCircle size={20} style={styles.errorIcon} />
          <span style={styles.errorText}>{errorDetails}</span>
        </div>
      )}

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Generate Payroll</h3>
        
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Month</label>
            <select
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
              style={styles.select}
            >
              {MONTHS.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Year</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              style={styles.input}
              min="2020"
              max="2100"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Public Holidays</label>
            <input
              type="number"
              value={formData.public_holidays}
              onChange={(e) => setFormData({ ...formData, public_holidays: parseInt(e.target.value) || 0 })}
              style={styles.input}
              min="0"
            />
          </div>
        </div>

        <div style={styles.overridesSection}>
          <div style={styles.overridesHeader}>
            <h4 style={styles.overridesTitle}>Employee Overrides (Optional)</h4>
            <button onClick={handleAddOverride} style={styles.addOverrideButton}>
              <FiPlus size={16} />
              Add Override
            </button>
          </div>
          
          {overrides.length > 0 ? (
            <div>
              {overrides.map((override, index) => (
                <div key={index} style={styles.overrideRow}>
                  <input
                    placeholder="Employee No.*"
                    value={override.employee_no}
                    onChange={(e) => handleOverrideChange(index, 'employee_no', e.target.value)}
                    style={{ ...styles.overrideInput, ...styles.overrideInputRequired }}
                  />
                  <input
                    placeholder="Worked Days"
                    type="number"
                    min="0"
                    value={override.worked_days_to_apply !== null && override.worked_days_to_apply !== '' ? override.worked_days_to_apply : ''}
                    onChange={(e) => handleOverrideChange(index, 'worked_days_to_apply', e.target.value)}
                    style={styles.overrideInputSmall}
                  />
                  <input
                    placeholder="Half Days"
                    type="number"
                    min="0"
                    value={override.half_days_to_apply !== null && override.half_days_to_apply !== '' ? override.half_days_to_apply : ''}
                    onChange={(e) => handleOverrideChange(index, 'half_days_to_apply', e.target.value)}
                    style={styles.overrideInputSmall}
                  />
                  <input
                    placeholder="Annual Leaves"
                    type="number"
                    min="0"
                    value={override.annual_leaves_to_apply !== null && override.annual_leaves_to_apply !== '' ? override.annual_leaves_to_apply : ''}
                    onChange={(e) => handleOverrideChange(index, 'annual_leaves_to_apply', e.target.value)}
                    style={styles.overrideInputSmall}
                  />
                  <input
                    placeholder="Bonus"
                    type="number"
                    min="0"
                    step="0.01"
                    value={override.bonus_to_apply !== null && override.bonus_to_apply !== '' ? override.bonus_to_apply : ''}
                    onChange={(e) => handleOverrideChange(index, 'bonus_to_apply', e.target.value)}
                    style={styles.overrideInputSmall}
                  />
                  <input
                    placeholder="Loan Deduction"
                    type="number"
                    min="0"
                    step="0.01"
                    value={override.loan_deduction_to_apply !== null && override.loan_deduction_to_apply !== '' ? override.loan_deduction_to_apply : ''}
                    onChange={(e) => handleOverrideChange(index, 'loan_deduction_to_apply', e.target.value)}
                    style={styles.overrideInputSmall}
                  />
                  <button
                    onClick={() => handleRemoveOverride(index)}
                    style={styles.removeButton}
                    title="Remove override"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.noOverridesText}>
              No overrides added. Click "Add Override" to manually adjust employee data.
            </p>
          )}
        </div>

        <div style={styles.buttonRow}>
          <button 
            onClick={handleGenerateAndDownload} 
            style={styles.generateButton}
            disabled={loading || exportLoading}
          >
            {loading || exportLoading ? 'Processing...' : 'Generate & Download'}
          </button>
          
          <button 
            onClick={handleExport} 
            style={styles.exportButton}
            disabled={exportLoading}
          >
            <FiDownload size={18} />
            {exportLoading ? 'Downloading...' : 'Download Only'}
          </button>
        </div>
      </div>

      <div style={styles.infoGrid}>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>📅 Monthly Leave</span>
          <span style={styles.infoValue}>1 day (automatically applied)</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>📅 Annual Leave</span>
          <span style={styles.infoValue}>10 days for Full-Time</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>⏰ Late Arrivals</span>
          <span style={styles.infoValue}>First 4 ignored, then 1/4 day</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>⏰ Half Day</span>
          <span style={styles.infoValue}>&lt;4 hrs = 1/2 day deduction</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>📊 Public Holidays</span>
          <span style={styles.infoValue}>Enter number for the month</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
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
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    marginBottom: '20px',
    color: '#dc2626',
  },
  errorIcon: {
    flexShrink: 0,
  },
  errorText: {
    fontSize: '14px',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f0f0f0',
    marginBottom: '24px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a2e',
    margin: '0 0 20px 0',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4b5563',
  },
  input: {
    padding: '10px 14px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1a1a2e',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#ffffff',
  },
  select: {
    padding: '10px 14px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1a1a2e',
    backgroundColor: '#ffffff',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
  },
  overridesSection: {
    backgroundColor: '#f8f9fc',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '20px',
  },
  overridesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  overridesTitle: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#1a1a2e',
    margin: 0,
  },
  addOverrideButton: {
    padding: '6px 16px',
    background: '#3871ae',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
  },
  overrideRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
  overrideInput: {
    flex: '2',
    minWidth: '120px',
    padding: '8px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '13px',
    backgroundColor: '#ffffff',
    fontFamily: 'inherit',
    outline: 'none',
  },
  overrideInputRequired: {
    borderColor: '#027DFF',
    borderWidth: '2px',
  },
  overrideInputSmall: {
    flex: '1',
    minWidth: '80px',
    padding: '8px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '13px',
    backgroundColor: '#ffffff',
    fontFamily: 'inherit',
    outline: 'none',
  },
  removeButton: {
    padding: '6px 10px',
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  noOverridesText: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0,
    padding: '4px 0',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: '4px',
  },
  generateButton: {
    padding: '12px 28px',
    background: '#3871ae',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    flex: 1,
    minWidth: '180px',
    transition: 'all 0.2s ease',
  },
  exportButton: {
    padding: '12px 24px',
    background: '#00be2c9d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '150px',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  infoItem: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '14px 16px',
    border: '1px solid #f0f0f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  infoLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
  },
  infoValue: {
    fontSize: '13px',
    color: '#1a1a2e',
    fontWeight: '500',
  },
};

export default Payroll;