import axios from 'axios';

// Determine the API base URL based on environment
const getBaseURL = () => {
  // If running on Vercel (production)
  if (import.meta.env.PROD) {
    // Use the environment variable set in Vercel
    return import.meta.env.VITE_API_URL || '';
  }
  // Local development
  return 'http://localhost:8000/api';
};

const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Something went wrong. Please try again.';

    if (error.response) {
      // Use the message returned by the backend
      message = error.response.data?.message || message;

      switch (error.response.status) {
        case 400:
        case 401:
        case 403:
        case 404:
        case 409:
        case 422:
          console.error(message);
          break;

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

    // Replace the error message with the backend message
    error.message = message;

    return Promise.reject(error);
  }
);

export default api;