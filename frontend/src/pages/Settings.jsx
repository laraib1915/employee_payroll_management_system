import React, { useState, useEffect } from 'react';
import { settingsApi } from '../api/settingsApi';
import { useNotification } from '../hooks/useNotification';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiSave, FiRefreshCw } from 'react-icons/fi';

const Settings = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    working_days_per_month: 22,
    full_time_annual_leave_allocation: 10,
    intern_annual_leave_allocation: 0,
    monthly_leave_allocation: 1,
    allowed_late_arrivals: 4,
    late_deduction_rate: 0.25,
    half_day_threshold_hours: 4,
  });
  const [originalSettings, setOriginalSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsApi.getSettings();
      setSettings({
        working_days_per_month: data.working_days_per_month || 22,
        full_time_annual_leave_allocation: data.full_time_annual_leave_allocation || 10,
        intern_annual_leave_allocation: data.intern_annual_leave_allocation || 0,
        monthly_leave_allocation: data.monthly_leave_allocation || 1,
        allowed_late_arrivals: data.allowed_late_arrivals || 4,
        late_deduction_rate: data.late_deduction_rate || 0.25,
        half_day_threshold_hours: data.half_day_threshold_hours || 4,
      });
      setOriginalSettings({ ...data });
    } catch (error) {
      showError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.updateSettings(settings);
      showSuccess('Settings updated successfully!');
      setOriginalSettings({ ...settings });
    } catch (error) {
      showError('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalSettings) {
      setSettings({ ...originalSettings });
    }
  };

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <div>
      <h2>System Settings</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '30px' }}>
        Configure payroll and attendance system parameters
      </p>

      <div style={styles.card}>
        <form onSubmit={handleSubmit}>
          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Working Days Per Month</label>
              <input
                type="number"
                name="working_days_per_month"
                value={settings.working_days_per_month}
                onChange={handleChange}
                style={styles.input}
                min="1"
                step="1"
              />
              <small style={styles.helpText}>Default: 22 days</small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Full-Time Annual Leave Allocation</label>
              <input
                type="number"
                name="full_time_annual_leave_allocation"
                value={settings.full_time_annual_leave_allocation}
                onChange={handleChange}
                style={styles.input}
                min="0"
                step="1"
              />
              <small style={styles.helpText}>Default: 10 days</small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Intern Annual Leave Allocation</label>
              <input
                type="number"
                name="intern_annual_leave_allocation"
                value={settings.intern_annual_leave_allocation}
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
                value={settings.monthly_leave_allocation}
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
                value={settings.allowed_late_arrivals}
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
                value={settings.late_deduction_rate}
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
                value={settings.half_day_threshold_hours}
                onChange={handleChange}
                style={styles.input}
                min="1"
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
              Reset
            </button>
          </div>
        </form>
      </div>

      <div style={styles.infoCard}>
        <h4>Payroll Rules Summary</h4>
        <ul style={styles.rulesList}>
          <li><strong>Working Days:</strong> {settings.working_days_per_month} days per month</li>
          <li><strong>Full-Time Leaves:</strong> {settings.full_time_annual_leave_allocation} annual leaves + {settings.monthly_leave_allocation} monthly leave</li>
          <li><strong>Intern Leaves:</strong> {settings.intern_annual_leave_allocation} annual leaves + {settings.monthly_leave_allocation} monthly leave</li>
          <li><strong>Late Arrivals:</strong> First {settings.allowed_late_arrivals} ignored, then {settings.late_deduction_rate * 100}% day deduction each</li>
          <li><strong>Half Day:</strong> Less than {settings.half_day_threshold_hours} hours worked = 0.5 day deduction</li>
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
  helpText: {
    color: 'var(--text-light)',
    fontSize: 'var(--font-xs)',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  saveButton: {
    padding: '12px 24px',
    background: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--font-sm)',
    fontWeight: 'var(--font-medium)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  resetButton: {
    padding: '12px 24px',
    background: 'var(--color-light)',
    color: 'var(--text-light)',
    border: '1px solid var(--grey-border)',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--font-sm)',
    fontWeight: 'var(--font-medium)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  infoCard: {
    background: '#fff',
    padding: '20px',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--box-shadow)',
  },
  rulesList: {
    listStyle: 'none',
    padding: 0,
    marginTop: '10px',
  },
};

export default Settings;