import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agri_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        localStorage.removeItem('agri_token');
        localStorage.removeItem('agri_user');
      }
    }
    return Promise.reject(error);
  }
);

// AUTH APIS
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data)
};

// FARMER PROFILE APIS
export const farmerAPI = {
  getProfile: (farmerId) => api.get(`/farmers/profile${farmerId ? `?farmerId=${farmerId}` : ''}`),
  updateProfile: (data) => api.put('/farmers/profile', data),
  getAllFarmers: (params) => api.get('/farmers', { params })
};

// CROP APIS
export const cropAPI = {
  getCrops: (params) => api.get('/crops', { params }),
  getCropById: (id) => api.get(`/crops/${id}`),
  createCrop: (data) => api.post('/crops', data),
  updateCrop: (id, data) => api.put(`/crops/${id}`, data),
  deleteCrop: (id) => api.delete(`/crops/${id}`)
};

// WEATHER APIS
export const weatherAPI = {
  getCurrent: (params) => api.get('/weather/current', { params }),
  getForecast: (params) => api.get('/weather/forecast', { params }),
  getHistory: (params) => api.get('/weather/history', { params }),
  searchLocations: (q) => api.get(`/weather/locations?q=${encodeURIComponent(q)}`)
};

// ADVISORY APIS
export const advisoryAPI = {
  getAdvisories: (params) => api.get('/advisories', { params }),
  generateAdvisory: (data) => api.post('/advisories/generate', data),
  getHistory: (params) => api.get('/advisories/history', { params }),
  updateStatus: (id, status) => api.put(`/advisories/${id}/status`, { status })
};

// ALERT APIS
export const alertAPI = {
  getAlerts: (params) => api.get('/alerts', { params }),
  markRead: (id) => api.put(`/alerts/${id}/read`),
  createAlert: (data) => api.post('/alerts', data),
  deactivateAlert: (id) => api.put(`/alerts/${id}/deactivate`)
};

// QUERY APIS
export const queryAPI = {
  submitQuery: (data) => api.post('/queries', data),
  getQueries: (params) => api.get('/queries', { params }),
  getQueryById: (id) => api.get(`/queries/${id}`),
  updateStatus: (id, status) => api.put(`/queries/${id}/status`, { status })
};

// EXPERT APIS
export const expertAPI = {
  getQueries: (params) => api.get('/expert/queries', { params }),
  submitResponse: (data) => api.post('/expert/responses', data),
  getStats: () => api.get('/expert/stats')
};

// REPORT APIS
export const reportAPI = {
  getWeatherHistory: (params) => api.get('/reports/weather-history', { params }),
  getForecastSummary: (params) => api.get('/reports/forecast-summary', { params }),
  getCropAdvisory: (params) => api.get('/reports/crop-advisory', { params }),
  getFarmerQueries: (params) => api.get('/reports/farmer-queries', { params })
};

// ADMIN APIS
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getAnalytics: () => api.get('/admin/analytics'),
  getLogs: (params) => api.get('/admin/logs', { params })
};

export default api;
