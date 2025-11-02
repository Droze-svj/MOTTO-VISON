/**
 * API Configuration
 * Centralized API configuration for different environments
 */

// Get API URL from environment or default to local
const getApiBaseUrl = (): string => {
  // Check for explicit API URL in environment
  if (typeof process !== 'undefined' && process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }
  
  // Check for React Native config
  if (typeof process !== 'undefined' && process.env.REACT_NATIVE_API_URL) {
    return process.env.REACT_NATIVE_API_URL;
  }
  
  // Default to Render for production, localhost for development
  return __DEV__ 
    ? 'http://localhost:8000' 
    : process.env.RENDER_API_URL || 'https://motto-backend.onrender.com';
};

export const API_CONFIG = {
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Health
  health: '/health',
  healthLive: '/health/live',
  healthReady: '/health/ready',
  
  // Chat
  chat: '/api/chat',
  chatHistory: '/api/chat/history',
  
  // User
  userProfile: '/api/user/profile',
  userLearning: '/api/user/learning',
  
  // Analytics
  analytics: '/api/analytics',
  
  // Authentication (if needed)
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
  },
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.baseURL.replace(/\/$/, ''); // Remove trailing slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

// Export for use in services
export default API_CONFIG;
