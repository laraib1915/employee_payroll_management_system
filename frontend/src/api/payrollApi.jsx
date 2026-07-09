import api from './api';

export const payrollApi = {
  generatePayroll: async (payload) => {
    const response = await api.post('/payroll/generate', payload);
    return response.data;
  },

  exportSalarySheet: async (month, year) => {
    const response = await api.get(`/payroll/export/${month}/${year}`, {
      responseType: 'blob',
    });

    return response.data;
  },
};