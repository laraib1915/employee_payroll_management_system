import api from './api';

export const settingsApi = {
  // Get settings
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Update settings
  updateSettings: async (settingsData) => {
    const response = await api.put('/settings', settingsData);
    return response.data;
  },
};