import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'hhttps://your-backend.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor (AUTH TOKEN)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (ERROR HANDLING)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      'API Error:',
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      // Optional: logout / redirect
      // localStorage.removeItem('token');
      // window.location.href = '/auth';
    }

    return Promise.reject(error);
  }
);

export default api;
