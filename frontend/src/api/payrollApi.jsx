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
      responseType: 'blob',
    });
    return response.data;
  },
};