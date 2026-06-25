import axios from 'axios';

// Base Axios client for connection to our backend
const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// Interceptor to inject multi-tenant and role headers automatically
api.interceptors.request.use(
  (config) => {
    // Try to get user details from localStorage
    const storedUser = localStorage.getItem('lms_user');
    let role = 'ADMIN'; // Default fallback role
    let userId = 'admin-user';

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role) {
          role = user.role.toUpperCase(); // Map 'Admin' to 'ADMIN', etc.
        }
        if (user.email) {
          userId = user.email;
        }
      } catch (e) {
        console.error('Failed to parse user details', e);
      }
    }

    // Set the three required headers for our backend tenant isolation & security
    config.headers['X-Organization-ID'] = '123e4567-e89b-12d3-a456-426614174000'; // Default Tenant UUID
    config.headers['X-User-Id'] = userId;
    config.headers['X-User-Role'] = role;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const handleApiError = (error) => {
  console.error('API Error:', error);
  const message = error.response?.data?.message || error.message || 'An error occurred in backend API connection.';
  throw new Error(message);
};

export default api;
