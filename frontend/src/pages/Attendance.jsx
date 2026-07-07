import React, { useState, useRef } from 'react';
import { attendanceApi } from '../api/attendanceApi';
import { useNotification } from '../hooks/useNotification';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiUpload, FiCheckCircle, FiAlertCircle, FiFile, FiX, FiInfo } from 'react-icons/fi';

const Attendance = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const { showSuccess, showError } = useNotification();
  const fileInputRef = useRef(null);

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
      console.log('Upload response:', response);
      setResult(response);
      showSuccess('Attendance uploaded successfully!');
      setFile(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorData = error.response?.data;
      setResult(errorData || { success: false, message: error.message });
      showError(errorData?.message || 'Failed to upload attendance');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderErrors = (errors) => {
    if (!errors) return null;
    if (!Array.isArray(errors)) return null;
    
    return errors.map((err, index) => {
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
      return <li key={index}>{String(err)}</li>;
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Attendance Management</h1>
          <p style={styles.pageSubtitle}>Upload and process monthly attendance sheets</p>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Upload Attendance Sheet</h3>
        <p style={styles.cardSubtitle}>Upload employee attendance in Excel format (.xlsx, .xls)</p>

        <div style={styles.uploadArea}>
          <div style={styles.dropZone}>
            <FiFile size={40} style={styles.dropIcon} />
            <div style={styles.dropContent}>
              <p style={styles.dropTitle}>
                {file ? file.name : 'Drag & drop your file here'}
              </p>
              <p style={styles.dropSubtext}>
                {file 
                  ? `Size: ${(file.size / 1024).toFixed(2)} KB` 
                  : 'or click to browse'
                }
              </p>
            </div>
            
            {file ? (
              <button onClick={handleRemoveFile} style={styles.removeButton}>
                <FiX size={16} />
                Remove
              </button>
            ) : (
              <label style={styles.browseButton}>
                Browse Files
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  style={styles.hiddenInput}
                />
              </label>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            style={{
              ...styles.uploadButton,
              ...(!file || uploading ? styles.uploadButtonDisabled : {})
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Attendance'}
          </button>

          {uploading && (
            <div style={styles.loadingContainer}>
              <LoadingSpinner size="small" />
              <span style={styles.loadingText}>Processing your file...</span>
            </div>
          )}

          {result && (
            <div style={{
              ...styles.resultBox,
              ...(result.success !== false ? styles.resultSuccess : styles.resultError)
            }}>
              <div style={styles.resultIcon}>
                {result.success !== false ? (
                  <FiCheckCircle size={20} style={{ color: '#13a835' }} />
                ) : (
                  <FiAlertCircle size={20} style={{ color: '#dc2626' }} />
                )}
              </div>
              <div style={styles.resultContent}>
                <h4 style={styles.resultTitle}>
                  {result.success !== false ? 'Upload Successful' : 'Upload Failed'}
                </h4>
                <p style={styles.resultMessage}>
                  {result.message || 'Attendance processed successfully'}
                </p>
                {result.data && (
                  <div style={styles.resultDetails}>
                    <span style={styles.resultBadge}>
                      Processed: {result.data.processed || 0} records
                    </span>
                    {result.data.total && (
                      <span style={styles.resultBadge}>
                        Total: {result.data.total} records
                      </span>
                    )}
                    {result.data.errors && result.data.errors.length > 0 && (
                      <div style={styles.errorContainer}>
                        <strong>Errors ({result.data.errors.length}):</strong>
                        <ul style={styles.errorList}>
                          {renderErrors(result.data.errors)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {result.errors && result.errors.length > 0 && (
                  <div style={styles.errorContainer}>
                    <strong>Errors ({result.errors.length}):</strong>
                    <ul style={styles.errorList}>
                      {renderErrors(result.errors)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={styles.infoCard}>
        <h3 style={styles.cardTitle}>
          <FiInfo size={18} style={styles.infoIcon} />
          Required Excel Columns
        </h3>
        
        <div style={styles.columnsContainer}>
          <div style={styles.columnGroup}>
            <h4 style={styles.columnTitle}>Required Columns</h4>
            <ul style={styles.columnList}>
              <li><span style={styles.columnBadge}>Emp No.</span> Employee number</li>
              <li><span style={styles.columnBadge}>Name</span> Employee name</li>
              <li><span style={styles.columnBadge}>Date</span> Attendance date</li>
              <li><span style={styles.columnBadge}>Clock In</span> Actual check-in time</li>
              <li><span style={styles.columnBadge}>Clock Out</span> Actual check-out time</li>
            </ul>
          </div>
          
          <div style={styles.columnGroup}>
            <h4 style={styles.columnTitle}>Optional Columns</h4>
            <ul style={styles.columnList}>
              <li><span style={styles.columnBadge}>No.</span> Serial number</li>
              <li><span style={styles.columnBadge}>On duty</span> Scheduled start</li>
              <li><span style={styles.columnBadge}>Off duty</span> Scheduled end</li>
              <li><span style={styles.columnBadge}>Late</span> Late arrival</li>
              <li><span style={styles.columnBadge}>Early</span> Early departure</li>
              <li><span style={styles.columnBadge}>Absent</span> Absent flag</li>
              <li><span style={styles.columnBadge}>OT Time</span> Overtime hours</li>
              <li><span style={styles.columnBadge}>NDays_OT</span> Normal days OT</li>
              <li><span style={styles.columnBadge}>WeekEnd_OT</span> Weekend OT</li>
              <li><span style={styles.columnBadge}>Holiday_OT</span> Holiday OT</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
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
    margin: '0 0 6px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 20px 0',
  },
  infoIcon: {
    color: '#027DFF',
  },
  uploadArea: {
    width: '100%',
  },
  dropZone: {
    border: '2px dashed #e5e7eb',
    borderRadius: '10px',
    padding: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    backgroundColor: '#fafafa',
    transition: 'all 0.2s ease',
    marginBottom: '16px',
  },
  dropIcon: {
    color: '#9ca3af',
    flexShrink: 0,
  },
  dropContent: {
    flex: 1,
    minWidth: '150px',
  },
  dropTitle: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#1a1a2e',
    margin: '0 0 4px 0',
  },
  dropSubtext: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
  },
  removeButton: {
    padding: '6px 14px',
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  browseButton: {
    padding: '8px 20px',
    background: '#027DFF',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  hiddenInput: {
    display: 'none',
  },
  uploadButton: {
    width: '100%',
    padding: '12px',
    background: '#027DFF',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  uploadButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f8f9fc',
    borderRadius: '8px',
  },
  loadingText: {
    fontSize: '14px',
    color: '#6b7280',
  },
  resultBox: {
    marginTop: '16px',
    padding: '16px',
    borderRadius: '10px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  resultSuccess: {
    backgroundColor: 'rgba(19, 168, 53, 0.08)',
    border: '1px solid #bbf7d0',
  },
  resultError: {
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    border: '1px solid #fecaca',
  },
  resultIcon: {
    marginTop: '2px',
    flexShrink: 0,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a2e',
    margin: '0 0 4px 0',
  },
  resultMessage: {
    fontSize: '14px',
    color: '#4b5563',
    margin: '0 0 8px 0',
  },
  resultDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '4px',
  },
  resultBadge: {
    display: 'inline-block',
    padding: '2px 12px',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '20px',
    fontSize: '13px',
    color: '#4b5563',
  },
  errorContainer: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    width: '100%',
    border: '1px solid #fecaca',
  },
  errorList: {
    margin: '6px 0 0 0',
    paddingLeft: '20px',
    color: '#dc2626',
    fontSize: '13px',
  },
  columnsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginTop: '16px',
  },
  columnGroup: {},
  columnTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 10px 0',
  },
  columnList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  columnBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#4b5563',
    marginRight: '8px',
    fontFamily: 'monospace',
    minWidth: '70px',
  },
};

export default Attendance;