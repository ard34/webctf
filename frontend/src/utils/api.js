import axios from 'axios';
import { tokenStorage } from './security';
import toast from 'react-hot-toast';

/* Determine API base URL:
 * - Use VITE_API_BASE if provided (Docker compose sets this for frontend)
 * - Otherwise fallback to '/api' (will be proxied by Vite in dev)
 */
const API_BASE = import.meta.env?.VITE_API_BASE || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env?.DEV) {
      // Simple dev log for debugging baseURL and endpoint
      // console.debug(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response.data; // Return data directly
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - Clear token and redirect to login
          tokenStorage.remove();
          if (window.location.pathname !== '/login') {
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
          break;

        case 403:
          toast.error('You do not have permission to perform this action.');
          break;

        case 404:
          toast.error('Resource not found.');
          break;

        case 409:
          toast.error(data?.message || 'Conflict: Resource already exists.');
          break;

        case 422:
          // Validation errors
          const errors = data?.errors || {};
          const errorMessages = Object.values(errors).flat();
          errorMessages.forEach((msg) => toast.error(msg));
          break;

        case 500:
          toast.error('Server error. Please try again later.');
          break;

        default:
          toast.error(data?.message || 'An error occurred. Please try again.');
      }
    } else if (error.request) {
      // Request made but no response
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

// API Methods
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const challengeAPI = {
  getAll: (params) => api.get('/challenges', { params }),
  getById: (id) => api.get(`/challenges/${id}`),
  create: (data) => api.post('/challenges', data),
  update: (id, data) => api.put(`/challenges/${id}`, data),
  delete: (id) => api.delete(`/challenges/${id}`),
};

export const submissionAPI = {
  submit: (data) => api.post('/submissions', data),
  getMy: (params) => api.get('/submissions/my', { params }),
  getAll: (params) => api.get('/submissions', { params }),
};

export const scoreboardAPI = {
  getScoreboard: (params) => api.get('/scoreboard', { params }),
  getMyScore: () => api.get('/scoreboard/me'),
  getUserScore: (id) => api.get(`/scoreboard/${id}`),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;

