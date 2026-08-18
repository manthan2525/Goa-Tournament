import axios from 'axios';

const backendBase = import.meta.env.VITE_API_URL || '';
const apiBase = backendBase ? `${backendBase.replace(/\/$/, '')}/api` : '/api';

const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for clear error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(customError));
  }
);

export default api;
