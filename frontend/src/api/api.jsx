import axios from 'axios';

// Use empty string for relative URLs
const API_BASE_URL = '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Something went wrong. Please try again.';

    if (error.response) {
      message = error.response.data?.message || message;
      switch (error.response.status) {
        case 400:
        case 401:
        case 403:
        case 404:
        case 409:
        case 422:
        case 500:
          console.error(message);
          break;
        default:
          console.error(message);
      }
    } else if (error.request) {
      message = 'Unable to connect to the server. Please check your network connection.';
      console.error(message);
    } else {
      message = error.message;
      console.error(message);
    }

    error.message = message;
    return Promise.reject(error);
  }
);

export default api;