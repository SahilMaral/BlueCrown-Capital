import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response.data; // Return only the data portion defined by the backend ApiResponse
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout if 401 response returned from api
      localStorage.removeItem('token');
      // Redux dispatch logout could go here
    }
    
    // Check if the server returned a JSON error message
    if (error.response && error.response.data && error.response.data.message) {
        return Promise.reject(error.response.data.message);
    }
    
    // Network errors or Vite proxy HTML error pages
    if (error.message === 'Network Error') {
        return Promise.reject('Network connection lost. The server might be restarting.');
    }
    
    return Promise.reject(error.message || 'We encountered an unexpected server error.');
  }
);

export default api;
