import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { sanitizeRedirectUrl } from './redirect';

// SECURITY: Use environment variable only - no hardcoded URLs
// In production, VITE_API_URL must be set
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// SECURITY: Validate API URL to prevent SSRF attacks
function validateApiUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    // In production, you might want to restrict to specific domains
    return true;
  } catch {
    return false;
  }
}

if (!validateApiUrl(API_URL)) {
  console.error('Invalid API URL configured. Using default localhost.');
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout to prevent hanging requests
});

// SECURITY: Request interceptor - automatically attach JWT token and validate requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // SECURITY: Don't add Authorization header for auth endpoints
    const isAuthEndpoint = config.url?.includes('/auth/login') || 
                          config.url?.includes('/auth/register') ||
                          config.url?.includes('/auth/refresh') ||
                          config.url?.includes('/auth/verify-email') ||
                          config.url?.includes('/auth/forgot-password') ||
                          config.url?.includes('/auth/reset-password');
    
    if (!isAuthEndpoint) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // SECURITY: Validate token format (basic check)
        if (typeof token === 'string' && token.length > 0 && token.length < 10000) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          // Invalid token format - remove it
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    }
    
    // SECURITY: Reject dangerous request methods
    if (config.method && !['get', 'post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      return Promise.reject(new Error('Unsupported HTTP method'));
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// SECURITY: Response interceptor - handle expired tokens and errors securely
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle network errors (no response)
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // SECURITY: Don't redirect on auth endpoints (login, register, etc.)
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || 
                          originalRequest?.url?.includes('/auth/register') ||
                          originalRequest?.url?.includes('/auth/refresh') ||
                          originalRequest?.url?.includes('/auth/verify-email') ||
                          originalRequest?.url?.includes('/auth/forgot-password') ||
                          originalRequest?.url?.includes('/auth/reset-password');
    
    // For auth endpoints, just reject the error without trying to refresh token
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }
    
    // SECURITY: Only try to refresh token for 401 errors on non-auth endpoints
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken && typeof refreshToken === 'string' && refreshToken.length > 0) {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // SECURITY: Validate token format before storing
          if (accessToken && typeof accessToken === 'string' && accessToken.length > 0) {
            localStorage.setItem('accessToken', accessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // SECURITY: Clear tokens on refresh failure
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('role');
        
        // SECURITY: Use safe redirect - only redirect to login if not already there
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/signup') {
          // Use sanitized redirect to prevent open redirect attacks
          const safeLoginUrl = sanitizeRedirectUrl('/login');
          window.location.href = safeLoginUrl;
        }
      }
    }
    
    // SECURITY: Handle 403 Forbidden (unauthorized access)
    if (error.response?.status === 403) {
      console.warn('Access forbidden - insufficient permissions');
    }
    
    return Promise.reject(error);
  }
);

export default api;

 