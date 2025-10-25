/**
 * API Configuration
 * Centralized API endpoints and configuration
 */

// API Base URLs
const API_URLS = {
  development: 'http://localhost:8000',  // Local FastAPI
  production: 'https://your-api.com',    // Your production API
};

// Get current environment
const ENV = __DEV__ ? 'development' : 'production';

// Export API config
export const API_CONFIG = {
  baseURL: API_URLS[ENV],
  timeout: 30000, // 30 seconds
  retries: 3,
  
  endpoints: {
    // AI Chat
    chat: '/api/chat',
    chatStream: '/api/chat/stream',
    
    // User Management
    users: '/api/users',
    userProfile: '/api/users/profile',
    
    // Learning
    learning: '/api/learning',
    
    // Multilingual
    translate: '/api/translate',
    detectLanguage: '/api/detect-language',
    
    // Context
    context: '/api/context',
    
    // Health
    health: '/api/health',
  },
};

/**
 * API Client with error handling
 */
export class APIClient {
  private static baseURL = API_CONFIG.baseURL;
  private static timeout = API_CONFIG.timeout;

  /**
   * Make API request with error handling
   */
  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  /**
   * POST request
   */
  static async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * GET request
   */
  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * PUT request
   */
  static async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Check API health
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await this.get<{ status: string }>(API_CONFIG.endpoints.health);
      return response.status === 'healthy';
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
}

export default APIClient;
