import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://to-do-list-1-qycz.onrender.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials might cause CORS issues if not properly configured
  // Only enable if backend explicitly requires it
  withCredentials: false,
  timeout: 30000, // 30 seconds timeout
});

// Test API connection on load
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const baseUrl = API_BASE_URL.replace('/api', '');
    const response = await axios.get(`${baseUrl}/health`, { timeout: 10000 });
    console.log('✅ API connection test successful:', response.data);
    return true;
  } catch (error: any) {
    console.error('❌ API connection test failed:', {
      message: error.message,
      url: API_BASE_URL.replace('/api', '/health'),
      possibleIssues: [
        'Backend server might be sleeping (Render free tier)',
        'CORS configuration issue - add Netlify URL to CORS_ORIGIN in Render',
        'Backend URL might be incorrect',
        'Network connectivity issue',
      ],
    });
    return false;
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      console.error('API Request Error:', {
        message: 'No response received from server',
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
      });
      // Check if it's a CORS or network issue
      if (!error.response && error.request) {
        console.error('Possible issues:');
        console.error('1. Backend server might be down or sleeping (Render free tier)');
        console.error('2. CORS configuration issue - check CORS_ORIGIN in Render');
        console.error('3. Network connectivity issue');
        console.error('4. Backend URL might be incorrect:', API_BASE_URL);
      }
    } else {
      console.error('API Error:', error.message);
    }

    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

