// API Service for backend communication
// Consolidates all backend API calls

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface ApiConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

async function fetchAPI(endpoint: string, config?: ApiConfig) {
  const { method = 'GET', headers = {}, body } = config || {};

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// User API
export const userApi = {
  async getProfile(userId: string) {
    return fetchAPI(`/user/${userId}/profile`);
  },

  async getPreferences(userId: string) {
    return fetchAPI(`/user/${userId}/preferences`);
  },

  async setPreferences(userId: string, preferences: any) {
    return fetchAPI(`/user/${userId}/preferences`, {
      method: 'POST',
      body: { preferences },
    });
  },

  async setOnboarded(userId: string) {
    return fetchAPI(`/user/${userId}/onboarded`, {
      method: 'POST',
    });
  },
};

// Chat API
export const chatApi = {
  async sendMessage(userId: string, text: string, language: string = 'en') {
    return fetchAPI('/ai_chat', {
      method: 'POST',
      body: {
        user_id: userId,
        text,
        language,
      },
    });
  },
};

// Auth API
export const authApi = {
  async login(username: string, password: string) {
    return fetchAPI('/login', {
      method: 'POST',
      body: { username, password },
    });
  },

  async refresh(refreshToken: string) {
    return fetchAPI('/refresh', {
      method: 'POST',
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
      },
    });
  },

  async logout() {
    return fetchAPI('/logout', {
      method: 'POST',
    });
  },
};

// Integration APIs
export const integrationApi = {
  async connectGoogle(userId: string) {
    return fetchAPI(`/auth/google?user_id=${userId}`);
  },

  async connectMicrosoft(userId: string) {
    return fetchAPI(`/auth/microsoft?user_id=${userId}`);
  },

  async connectNotion(userId: string) {
    return fetchAPI(`/auth/notion?user_id=${userId}`);
  },

  async getGoogleCalendar(userId: string) {
    return fetchAPI(`/user/${userId}/google/calendar`);
  },

  async getGmail(userId: string) {
    return fetchAPI(`/user/${userId}/google/gmail`);
  },

  async getMicrosoftCalendar(userId: string) {
    return fetchAPI(`/user/${userId}/microsoft/calendar`);
  },

  async getNotionPages(userId: string) {
    return fetchAPI(`/user/${userId}/notion/pages`);
  },
};

export default {
  user: userApi,
  chat: chatApi,
  auth: authApi,
  integration: integrationApi,
};

