import { Platform } from 'react-native';

export const API_URL = Platform.select({
  ios: 'http://localhost:8000/chat',
  android: 'http://10.0.2.2:8000/chat',
  default: 'http://localhost:8000/chat'
});

export const BOT_AVATAR = 'https://i.imgur.com/JR6qZJN.png';
export const USER_AVATAR = 'https://i.imgur.com/1bX5QH6.png';

export const KEYWORD_PATHS = Platform.select({
  ios: [
    'hey-motto_en_ios_v2_2_0.ppn',
    'hola-motto_es_ios_v2_2_0.ppn',
    'salut-motto_fr_ios_v2_2_0.ppn'
  ],
  android: [
    'hey-motto_en_android_v2_2_0.ppn',
    'hola-motto_es_android_v2_2_0.ppn',
    'salut-motto_fr_android_v2_2_0.ppn'
  ]
});

export const ACCESS_KEY = 'YOUR_PICOVOICE_ACCESS_KEY';

// Fixed OpenAI API key for the entire app. Leave empty to allow secure storage.
export const OPENAI_API_KEY = '';

// DeepSeek API configuration
export const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';
export const DEEPSEEK_MODEL = 'deepseek-reasoner';
// Fixed DeepSeek API key for the entire app. Leave empty to allow secure storage.
export const DEEPSEEK_API_KEY = '';

// OpenRouter Configuration - Using Llama 3.3 70B Instruct
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
export const OPENROUTER_MODEL = 'meta-llama/llama-3.3-70b-instruct';
export const OPENROUTER_APP_NAME = 'MOTTO';
export const OPENROUTER_REFERER_URL = 'https://motto.app';
export const OPENROUTER_API_KEY = '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';

// Enhanced fallback models for when credits are insufficient
export const FALLBACK_MODELS = [
  // Free models (no credits required)
  'deepseek/deepseek-r1:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'microsoft/phi-3.5-mini:free',
  'google/gemma-2-9b-it:free',
  'mistralai/mistral-7b-instruct:free',
  'nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free',
  'openchat/openchat-3.5:free',
  'anthropic/claude-3-haiku:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'google/gemma-2-9b-it:free',
  // Low-cost models (minimal credits)
  'meta-llama/llama-3.1-8b-instruct',
  'google/gemma-2-9b-it',
  'microsoft/phi-3.5-mini',
  'deepseek/deepseek-r1',
];

// Unlimited mode configuration
export const UNLIMITED_CONFIG = {
  maxTokens: 8000,
  contextWindow: 32768,
  maxRetries: 10,
  timeout: 120000, // 2 minutes
  streaming: true,
  advancedFeatures: true,
  unlimitedMode: true,
  premiumModels: [
    'meta-llama/llama-3.3-70b-instruct',
    'anthropic/claude-3.5-sonnet',
    'openai/gpt-4o',
    'deepseek/deepseek-coder',
    'meta-llama/llama-3.1-405b-instruct'
  ]
};

// API Connection Settings
export const API_CONNECTION_CONFIG = {
  // Retry configuration
  maxRetries: 5,
  retryDelay: 1000, // 1 second
  timeout: 30000, // 30 seconds
  
  // Fallback configuration
  enableFallback: true,
  fallbackDelay: 500, // 500ms between fallback attempts
  
  // Error handling
  handle402Error: true, // Handle insufficient credits
  handle429Error: true, // Handle rate limiting
  handle500Error: true, // Handle server errors
  
  // Connection settings
  keepAlive: true,
  connectionTimeout: 10000, // 10 seconds
};

// Private Search configuration (privacy-first providers)
// Provider can be 'brave', 'kagi', or 'searxng'
export const PRIVATE_SEARCH_PROVIDER = 'brave';
export const BRAVE_SEARCH_ENDPOINT = 'https://api.search.brave.com/res/v1/web/search';
export const BRAVE_SEARCH_API_KEY = '';
export const KAGI_SEARCH_ENDPOINT = 'https://kagi.com/api/v0/search';
export const KAGI_SEARCH_API_KEY = '';
// If you self-host SearxNG, set your instance URL here (no trailing slash)
export const SEARXNG_SEARCH_ENDPOINT = '';

// Privacy controls
export const PRIVACY_SETTINGS = {
  enableRemoteAI: true,
  enablePrivateSearch: true,
  redactLogs: true,
};