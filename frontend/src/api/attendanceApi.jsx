import api from './api';

export const attendanceApi = {
  // Upload attendance file
  uploadAttendance: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/attendance/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};