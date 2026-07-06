import api from './api';

export const employeeApi = {
  // Create employee
  createEmployee: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  // Get all employees
  getAllEmployees: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  // Get single employee
  getEmployee: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}`);
    return response.data;
  },

  // Update employee
  updateEmployee: async (employeeId, employeeData) => {
    const response = await api.patch(`/employees/${employeeId}`, employeeData);
    return response.data;
  },
};