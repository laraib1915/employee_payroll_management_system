import React, { useState } from 'react';
import { payrollApi } from '../api/payrollApi';
import { useNotification } from '../hooks/useNotification';
import { MONTHS } from '../utils/constants';
import { FiDownload, FiPlus, FiX } from 'react-icons/fi';

const Payroll = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    public_holidays: 0,
  });

  const [overrides, setOverrides] = useState([]);

  // Generate and Download in one action
  const handleGenerateAndDownload = async () => {
    setLoading(true);
    try {
      const payload = {
        month: formData.month,
        year: formData.year,
        public_holidays: formData.public_holidays,
        payroll_overrides: overrides
          .filter(o => o.employee_no && o.employee_no.trim() !== '')
          .map(o => ({
            employee_no: o.employee_no,
            worked_days_to_apply: o.worked_days_to_apply ? parseInt(o.worked_days_to_apply) : null,
            half_days_to_apply: o.half_days_to_apply ? parseInt(o.half_days_to_apply) : null,
            annual_leaves_to_apply: parseInt(o.annual_leaves_to_apply) || 0,
            bonus_to_apply: parseFloat(o.bonus_to_apply) || 0,
            loan_deduction_to_apply: parseFloat(o.loan_deduction_to_apply) || 0,
          }))
      };
      
      console.log('Generating payroll with payload:', JSON.stringify(payload, null, 2));
      
      // Generate payroll
      await payrollApi.generatePayroll(payload);
      
      // Immediately download the Excel file
      await handleExport();
      
      showSuccess(`Payroll generated and downloaded successfully for ${MONTHS.find(m => m.value === formData.month)?.label} ${formData.year}!`);
      
      // Clear overrides after successful generation
      setOverrides([]);
      
    } catch (error) {
      console.error('Error generating payroll:', error);
      showError(error.response?.data?.message || 'Failed to generate payroll');
    } finally {
      setLoading(false);
    }
  };

  // Export function
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const blob = await payrollApi.exportSalarySheet(formData.month, formData.year);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Salary_Sheet_${formData.month}_${formData.year}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
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
    updated[index][field] = value;
    setOverrides(updated);
  };

  const handleRemoveOverride = (index) => {
    setOverrides(overrides.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2>Payroll Management</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '30px' }}>
        Generate monthly payroll with employee adjustments
      </p>

      <div style={styles.card}>
        <h3>Generate Payroll</h3>
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

        {/* Overrides Section */}
        <div style={styles.overridesSection}>
          <div style={styles.overridesHeader}>
            <h4>Employee Overrides (Optional)</h4>
            <button onClick={handleAddOverride} style={styles.addOverrideButton}>
              <FiPlus size={16} />
              Add Override
            </button>
          </div>
          
          {overrides.length > 0 && (
            <div style={styles.overridesList}>
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
                    value={override.worked_days_to_apply || ''}
                    onChange={(e) => handleOverrideChange(index, 'worked_days_to_apply', e.target.value ? parseInt(e.target.value) : null)}
                    style={styles.overrideInputSmall}
                  />
                  <input
                    placeholder="Half Days"
                    type="number"
                    value={override.half_days_to_apply || ''}
                    onChange={(e) => handleOverrideChange(index, 'half_days_to_apply', e.target.value ? parseInt(e.target.value) : null)}
                    style={styles.overrideInputSmall}
                  />
                  <input
                    placeholder="Annual Leaves"
                    type="number"
                    value={override.annual_leaves_to_apply || ''}
                    onChange={(e) => handleOverrideChange(index, 'annual_leaves_to_apply', parseInt(e.target.value) || 0)}
                    style={styles.overrideInputSmall}
                  />
                  <input
                    placeholder="Bonus"
                    type="number"
                    value={override.bonus_to_apply || ''}
                    onChange={(e) => handleOverrideChange(index, 'bonus_to_apply', parseFloat(e.target.value) || 0)}
                    style={styles.overrideInputSmall}
                  />
                  <input
                    placeholder="Loan Deduction"
                    type="number"
                    value={override.loan_deduction_to_apply || ''}
                    onChange={(e) => handleOverrideChange(index, 'loan_deduction_to_apply', parseFloat(e.target.value) || 0)}
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
          )}
          
          {overrides.length === 0 && (
            <p style={styles.noOverridesText}>
              No overrides added. Click "Add Override" to manually adjust employee data.
            </p>
          )}
        </div>

        {/* Action Buttons */}
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

      <div style={styles.infoCard}>
        <h4>📋 Payroll Generation Information</h4>
        <ul style={styles.infoList}>
          <li><strong>Monthly Leave:</strong> 1 day (automatically applied)</li>
          <li><strong>Annual Leave:</strong> 10 days for Full-Time employees</li>
          <li><strong>Late Arrivals:</strong> First 4 ignored, then 1/4 day deduction</li>
          <li><strong>Half Day:</strong> Less than 4 hours worked = 1/2 day deduction</li>
          <li><strong>Public Holidays:</strong> Enter the number of public holidays for the month</li>
        </ul>
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
    marginBottom: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginTop: '15px',
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
  },
  select: {
    padding: '10px',
    border: '1px solid var(--grey-border)',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--font-sm)',
  },
  overridesSection: {
    marginTop: '20px',
    padding: '15px',
    background: 'var(--light-grey-bg)',
    borderRadius: 'var(--radius)',
  },
  overridesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  addOverrideButton: {
    padding: '8px 16px',
    background: 'var(--color-secondary)',
    color: 'var(--text-dark)',
    border: 'none',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: 'var(--font-sm)',
  },
  overridesList: {
    marginTop: '10px',
  },
  overrideRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginTop: '10px',
    flexWrap: 'wrap',
  },
  overrideInput: {
    flex: '2',
    minWidth: '120px',
    padding: '8px',
    border: '1px solid var(--grey-border)',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--font-sm)',
  },
  overrideInputRequired: {
    borderColor: 'var(--color-primary)',
  },
  overrideInputSmall: {
    flex: '1',
    minWidth: '80px',
    padding: '8px',
    border: '1px solid var(--grey-border)',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--font-sm)',
  },
  removeButton: {
    padding: '6px 10px',
    background: 'var(--color-danger)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noOverridesText: {
    color: 'var(--text-light)',
    fontSize: 'var(--font-sm)',
    margin: '5px 0',
  },
  buttonRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    flexWrap: 'wrap',
  },
  generateButton: {
    padding: '12px 24px',
    background: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--font-sm)',
    fontWeight: 'var(--font-medium)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  exportButton: {
    padding: '12px 24px',
    background: 'var(--color-success)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--font-sm)',
    fontWeight: 'var(--font-medium)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
  },
  infoCard: {
    background: '#fff',
    padding: '20px',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--box-shadow)',
  },
  infoList: {
    listStyle: 'none',
    padding: 0,
    marginTop: '10px',
  },
};

export default Payroll;