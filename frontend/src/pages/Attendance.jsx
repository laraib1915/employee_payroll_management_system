import React, { useState } from 'react';
import { attendanceApi } from '../api/attendanceApi';
import { useNotification } from '../hooks/useNotification';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiUpload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const Attendance = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const { showSuccess, showError } = useNotification();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      if (!validTypes.includes(selectedFile.type)) {
        showError('Please upload an Excel file (.xlsx or .xls)');
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showError('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const response = await attendanceApi.uploadAttendance(file);
      console.log('Upload response:', response); // Debug log
      setResult(response);
      showSuccess('Attendance uploaded successfully!');
      setFile(null);
      document.getElementById('fileInput').value = '';
    } catch (error) {
      console.error('Upload error:', error);
      const errorData = error.response?.data;
      setResult(errorData || { success: false, message: error.message });
      showError(errorData?.message || 'Failed to upload attendance');
    } finally {
      setUploading(false);
    }
  };

  // Helper function to render errors properly
  const renderErrors = (errors) => {
    if (!errors) return null;
    if (!Array.isArray(errors)) return null;
    
    return errors.map((err, index) => {
      // If error is an object with error field
      if (typeof err === 'object' && err !== null) {
        const errorMessage = err.error || err.message || JSON.stringify(err);
        const employeeInfo = err.row_employee_no || err.row_employee_name || '';
        return (
          <li key={index}>
            {employeeInfo && <strong>{employeeInfo}: </strong>}
            {errorMessage}
          </li>
        );
      }
      // If error is a string
      return <li key={index}>{String(err)}</li>;
    });
  };

  return (
    <div>
      <h2>Attendance Management</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '30px' }}>
        Upload monthly attendance sheets in Excel format
      </p>

      <div style={styles.card}>
        <div style={styles.uploadArea}>
          <div style={styles.uploadBox}>
            <FiUpload size={48} style={styles.uploadIcon} />
            <h3>Upload Attendance Sheet</h3>
            <p style={styles.uploadText}>
              Supported formats: .xlsx, .xls
            </p>
            <input
              id="fileInput"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
            {file && (
              <div style={styles.fileInfo}>
                <FiCheckCircle style={{ color: 'var(--color-success)' }} />
                <span>{file.name}</span>
                <span style={styles.fileSize}>
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
            )}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              style={{
                ...styles.uploadButton,
                ...(!file || uploading ? styles.uploadButtonDisabled : {}),
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Attendance'}
            </button>
          </div>
        </div>

        {uploading && <LoadingSpinner size="medium" />}

        {result && (
          <div style={styles.resultContainer}>
            <div style={{
              ...styles.resultBox,
              ...(result.success !== false ? styles.resultSuccess : styles.resultError),
            }}>
              <div style={styles.resultIcon}>
                {result.success !== false ? (
                  <FiCheckCircle size={24} style={{ color: 'var(--color-success)' }} />
                ) : (
                  <FiAlertCircle size={24} style={{ color: 'var(--color-danger)' }} />
                )}
              </div>
              <div style={styles.resultContent}>
                <h4 style={{ margin: '0 0 8px 0' }}>
                  {result.success !== false ? 'Upload Successful' : 'Upload Failed'}
                </h4>
                <p style={{ margin: '0 0 10px 0' }}>
                  {result.message || 'Attendance processed successfully'}
                </p>
                {result.data && (
                  <div style={styles.resultDetails}>
                    <span>Processed: {result.data.processed || 0} records</span>
                    {result.data.total && (
                      <span> | Total: {result.data.total} records</span>
                    )}
                    {result.data.errors && result.data.errors.length > 0 && (
                      <div style={styles.errors}>
                        <strong>Errors ({result.data.errors.length}):</strong>
                        <ul style={styles.errorList}>
                          {renderErrors(result.data.errors)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {result.errors && result.errors.length > 0 && (
                  <div style={styles.errors}>
                    <strong>Errors ({result.errors.length}):</strong>
                    <ul style={styles.errorList}>
                      {renderErrors(result.errors)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={styles.infoCard}>
        <h4>Required Excel Columns:</h4>
        <ul style={styles.columnList}>
          <li><strong>Emp No.</strong> - Employee number</li>
          <li><strong>No.</strong> - Serial number (optional)</li>
          <li><strong>Name</strong> - Employee name</li>
          <li><strong>Date</strong> - Attendance date</li>
          <li><strong>On duty</strong> - Scheduled start time</li>
          <li><strong>Off duty</strong> - Scheduled end time</li>
          <li><strong>Clock In</strong> - Actual check-in time</li>
          <li><strong>Clock Out</strong> - Actual check-out time</li>
          <li><strong>Late</strong> - Late arrival minutes</li>
          <li><strong>Early</strong> - Early departure minutes</li>
          <li><strong>Absent</strong> - Absent flag</li>
          <li><strong>OT Time</strong> - Overtime hours</li>
          <li><strong>NDays_OT</strong> - Normal days OT</li>
          <li><strong>WeekEnd_OT</strong> - Weekend OT</li>
          <li><strong>Holiday_OT</strong> - Holiday OT</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: '#fff',
    padding: '30px',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--box-shadow)',
    marginBottom: '20px',
  },
  uploadArea: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBox: {
    textAlign: 'center',
    padding: '40px',
    border: '2px dashed var(--grey-border)',
    borderRadius: 'var(--radius)',
    width: '100%',
    maxWidth: '500px',
    transition: 'all 0.3s ease',
  },
  uploadIcon: {
    color: 'var(--color-primary)',
    marginBottom: '15px',
  },
  uploadText: {
    color: 'var(--text-light)',
    marginBottom: '15px',
  },
  fileInput: {
    display: 'block',
    margin: '15px auto',
    padding: '10px',
    border: '1px solid var(--grey-border)',
    borderRadius: 'var(--radius)',
    width: '100%',
    cursor: 'pointer',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    background: 'var(--color-primary-light)',
    borderRadius: 'var(--radius)',
    margin: '10px 0',
  },
  fileSize: {
    color: 'var(--text-light)',
    fontSize: 'var(--font-xs)',
  },
  uploadButton: {
    padding: '12px 30px',
    background: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--font-md)',
    fontWeight: 'var(--font-medium)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '15px',
  },
  uploadButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  resultContainer: {
    marginTop: '20px',
  },
  resultBox: {
    padding: '20px',
    borderRadius: 'var(--radius)',
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-start',
  },
  resultSuccess: {
    background: 'var(--payroll-success-bg)',
    border: '1px solid var(--color-success)',
  },
  resultError: {
    background: 'var(--payroll-danger-bg)',
    border: '1px solid var(--color-danger)',
  },
  resultIcon: {
    marginTop: '2px',
    flexShrink: 0,
  },
  resultContent: {
    flex: 1,
  },
  resultDetails: {
    marginTop: '10px',
  },
  errors: {
    marginTop: '10px',
    padding: '10px',
    background: '#fff',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-danger)',
  },
  errorList: {
    margin: '5px 0 0 0',
    paddingLeft: '20px',
    color: 'var(--color-danger)',
  },
  infoCard: {
    background: '#fff',
    padding: '20px',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--box-shadow)',
  },
  columnList: {
    columns: '2',
    columnGap: '30px',
    listStyle: 'none',
    padding: 0,
  },
};

export default Attendance;