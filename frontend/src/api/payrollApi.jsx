import api from './api';

export const payrollApi = {
  // Generate payroll
  generatePayroll: async (payload) => {
    const response = await api.post('/payroll/generate', payload);
    return response.data;
  },

  // Export salary sheet
  exportSalarySheet: async (month, year) => {
    const response = await api.get(`/payroll/export/${month}/${year}`, {
      responseType: 'blob', // Important: Keep as blob
    });
    
    // Check if the response is an error (blob will contain JSON error)
    // We need to read the blob to check if it's JSON or actual Excel file
    const text = await response.data.text();
    
    try {
      // Try to parse as JSON - if it succeeds, it's an error response
      const json = JSON.parse(text);
      // If we get here, it's an error response
      throw new Error(json.message || json.error || json.detail || 'Server error occurred');
    } catch (parseError) {
      // If it's not JSON, it's a valid Excel file
      // Return the original blob
      return response.data;
    }
  },
};