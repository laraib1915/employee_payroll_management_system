import React, { useState, useEffect } from 'react';
import { settingsApi } from '../api/settingsApi';
import { useNotification } from '../hooks/useNotification';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiSave, FiEdit2, FiX, FiRefreshCw } from 'react-icons/fi';

const Settings = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Default settings values
  const defaultSettings = {
    working_days_per_month: 22,
    full_time_annual_leave_allocation: 10,
    intern_annual_leave_allocation: 0,
    monthly_leave_allocation: 1,
    allowed_late_arrivals: 4,
    late_deduction_rate: 0.25,
    half_day_threshold_hours: 4,
  };
  
  const [settings, setSettings] = useState(defaultSettings);
  const [formData, setFormData] = useState(defaultSettings);

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching latest settings from database...');
      
      const response = await settingsApi.getSettings();
      console.log('📥 Full API response:', response);
      
      // Handle both wrapped and unwrapped responses
      // Your backend returns: { status_code, message, data: { ...settings } }
      let settingsData = response;
      
      // If the response has a 'data' field, use that (wrapped response)
      if (response && response.data) {
        settingsData = response.data;
      }
      // If the response has a 'success' field from core_response
      else if (response && response.success !== undefined && response.data) {
        settingsData = response.data;
      }
      
      console.log('📥 Extracted settings data:', settingsData);
      
      // Map the data from API to our settings structure
      // Handle both field naming conventions
      const mappedSettings = {
        working_days_per_month: settingsData.working_days_per_month !== undefined 
          ? settingsData.working_days_per_month 
          : defaultSettings.working_days_per_month,
        full_time_annual_leave_allocation: settingsData.full_time_annual_leave_allocation !== undefined 
          ? settingsData.full_time_annual_leave_allocation 
          : settingsData.annual_leave_allocation !== undefined 
            ? settingsData.annual_leave_allocation 
            : defaultSettings.full_time_annual_leave_allocation,
        intern_annual_leave_allocation: settingsData.intern_annual_leave_allocation !== undefined 
          ? settingsData.intern_annual_leave_allocation 
          : defaultSettings.intern_annual_leave_allocation,
        monthly_leave_allocation: settingsData.monthly_leave_allocation !== undefined 
          ? settingsData.monthly_leave_allocation 
          : defaultSettings.monthly_leave_allocation,
        allowed_late_arrivals: settingsData.allowed_late_arrivals !== undefined 
          ? settingsData.allowed_late_arrivals 
          : defaultSettings.allowed_late_arrivals,
        late_deduction_rate: settingsData.late_deduction_rate !== undefined 
          ? settingsData.late_deduction_rate 
          : defaultSettings.late_deduction_rate,
        half_day_threshold_hours: settingsData.half_day_threshold_hours !== undefined 
          ? settingsData.half_day_threshold_hours 
          : defaultSettings.half_day_threshold_hours,
      };
      
      console.log('✅ Mapped settings for display:', mappedSettings);
      
      setSettings(mappedSettings);
      setFormData(mappedSettings);
      
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      showError('Failed to load settings. Using default values.');
      setSettings(defaultSettings);
      setFormData(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        working_days_per_month: formData.working_days_per_month,
        full_time_annual_leave_allocation: formData.full_time_annual_leave_allocation,
        intern_annual_leave_allocation: formData.intern_annual_leave_allocation,
        monthly_leave_allocation: formData.monthly_leave_allocation,
        allowed_late_arrivals: formData.allowed_late_arrivals,
        late_deduction_rate: formData.late_deduction_rate,
        half_day_threshold_hours: formData.half_day_threshold_hours,
      };
      
      console.log('📤 Updating settings with payload:', payload);
      
      await settingsApi.updateSettings(payload);
      
      // Update the displayed settings
      setSettings({ ...formData });
      showSuccess('Settings updated successfully!');
      setShowEditForm(false);
      
      // Refresh to confirm update
      await fetchSettings();
      
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      showError('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...settings });
    setShowEditForm(false);
  };

  const handleReset = () => {
    setFormData({
      working_days_per_month: 0,
      full_time_annual_leave_allocation: 0,
      intern_annual_leave_allocation: 0,
      monthly_leave_allocation: 0,
      allowed_late_arrivals: 0,
      late_deduction_rate: 0,
      half_day_threshold_hours: 0,
    });
  };

  const handleRefresh = () => {
    fetchSettings();
    showSuccess('Settings refreshed!');
  };

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>System Settings</h1>
          <p style={styles.pageSubtitle}>Configure payroll and attendance system parameters</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={handleRefresh} style={styles.refreshButton} title="Refresh data">
            <FiRefreshCw size={18} />
          </button>
          {!showEditForm && (
            <button onClick={() => setShowEditForm(true)} style={styles.editButton}>
              <FiEdit2 size={18} />
              Edit Settings
            </button>
          )}
        </div>
      </div>

      {/* Current Settings Summary - Always Visible */}
      <div style={styles.summaryCard}>
        <h3 style={styles.cardTitle}>Current Settings</h3>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Working Days</span>
            <span style={styles.summaryValue}>{settings.working_days_per_month} days</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Full-Time Annual Leave</span>
            <span style={styles.summaryValue}>{settings.full_time_annual_leave_allocation} days</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Intern Annual Leave</span>
            <span style={styles.summaryValue}>{settings.intern_annual_leave_allocation} days</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Monthly Leave</span>
            <span style={styles.summaryValue}>{settings.monthly_leave_allocation} day</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Allowed Late Arrivals</span>
            <span style={styles.summaryValue}>{settings.allowed_late_arrivals} times</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Late Deduction Rate</span>
            <span style={styles.summaryValue}>{Math.round(settings.late_deduction_rate * 100)}%</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Half Day Threshold</span>
            <span style={styles.summaryValue}>{settings.half_day_threshold_hours} hours</span>
          </div>
        </div>

        {/* Rules Summary */}
        <div style={styles.rulesSection}>
          <h4 style={styles.rulesTitle}>📋 Payroll Rules Summary</h4>
          <ul style={styles.rulesList}>
            <li><strong>Working Days:</strong> {settings.working_days_per_month} days per month</li>
            <li><strong>Full-Time Leaves:</strong> {settings.full_time_annual_leave_allocation} annual + {settings.monthly_leave_allocation} monthly</li>
            <li><strong>Intern Leaves:</strong> {settings.intern_annual_leave_allocation} annual + {settings.monthly_leave_allocation} monthly</li>
            <li><strong>Late Arrivals:</strong> First {settings.allowed_late_arrivals} ignored, then {Math.round(settings.late_deduction_rate * 100)}% day deduction</li>
            <li><strong>Half Day:</strong> Less than {settings.half_day_threshold_hours} hours = 0.5 day deduction</li>
          </ul>
        </div>
      </div>

      {/* Edit Form - Expandable/Dropdown */}
      {showEditForm && (
        <div style={styles.editCard}>
          <div style={styles.editHeader}>
            <h3 style={styles.cardTitle}>Edit Settings</h3>
            <button onClick={handleCancel} style={styles.closeButton}>
              <FiX size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Working Days Per Month</label>
                <input
                  type="number"
                  name="working_days_per_month"
                  value={formData.working_days_per_month}
                  onChange={handleChange}
                  style={styles.input}
                  min="0"
                  step="1"
                />
                <small style={styles.helpText}>Default: 22 days</small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Full-Time Annual Leave</label>
                <input
                  type="number"
                  name="full_time_annual_leave_allocation"
                  value={formData.full_time_annual_leave_allocation}
                  onChange={handleChange}
                  style={styles.input}
                  min="0"
                  step="1"
                />
                <small style={styles.helpText}>Default: 10 days</small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Intern Annual Leave</label>
                <input
                  type="number"
                  name="intern_annual_leave_allocation"
                  value={formData.intern_annual_leave_allocation}
                  onChange={handleChange}
                  style={styles.input}
                  min="0"
                  step="1"
                />
                <small style={styles.helpText}>Default: 0 days</small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Monthly Leave Allocation</label>
                <input
                  type="number"
                  name="monthly_leave_allocation"
                  value={formData.monthly_leave_allocation}
                  onChange={handleChange}
                  style={styles.input}
                  min="0"
                  step="1"
                />
                <small style={styles.helpText}>Default: 1 day</small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Allowed Late Arrivals</label>
                <input
                  type="number"
                  name="allowed_late_arrivals"
                  value={formData.allowed_late_arrivals}
                  onChange={handleChange}
                  style={styles.input}
                  min="0"
                  step="1"
                />
                <small style={styles.helpText}>Default: 4 times</small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Late Deduction Rate</label>
                <input
                  type="number"
                  name="late_deduction_rate"
                  value={formData.late_deduction_rate}
                  onChange={handleChange}
                  style={styles.input}
                  min="0"
                  max="1"
                  step="0.01"
                />
                <small style={styles.helpText}>Default: 0.25 (1/4 day)</small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Half Day Threshold Hours</label>
                <input
                  type="number"
                  name="half_day_threshold_hours"
                  value={formData.half_day_threshold_hours}
                  onChange={handleChange}
                  style={styles.input}
                  min="0"
                  step="1"
                />
                <small style={styles.helpText}>Default: 4 hours</small>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.saveButton} disabled={saving}>
                <FiSave size={18} />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              <button type="button" onClick={handleReset} style={styles.resetButton}>
                <FiRefreshCw size={18} />
                Reset to Zero
              </button>
              <button type="button" onClick={handleCancel} style={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
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
  headerActions: {
    display: 'flex',
    gap: '10px',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    background: '#f3f4f6',
    color: '#4b5563',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    background: '#027DFF',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(2, 125, 255, 0.25)',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f0f0f0',
    marginBottom: '24px',
  },
  editCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '2px solid #027DFF',
    marginBottom: '24px',
    animation: 'slideDown 0.3s ease',
  },
  editHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a2e',
    margin: 0,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px 16px',
    backgroundColor: '#f8f9fc',
    borderRadius: '8px',
    border: '1px solid #f0f0f0',
  },
  summaryLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  summaryValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a2e',
  },
  rulesSection: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #f0f0f0',
  },
  rulesTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a2e',
    margin: '0 0 10px 0',
  },
  rulesList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
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
  helpText: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '2px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
    flexWrap: 'wrap',
  },
  saveButton: {
    padding: '12px 28px',
    background: '#027DFF',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  resetButton: {
    padding: '12px 24px',
    background: '#f3f4f6',
    color: '#4b5563',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  cancelButton: {
    padding: '12px 24px',
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
};

// Add animation keyframes
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleSheet);

export default Settings;