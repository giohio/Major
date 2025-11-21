// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  API_PREFIX: '/api',
  TIMEOUT: 30000,
  // Expose endpoints
  API_ENDPOINTS: {} as typeof API_ENDPOINTS,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  
  // Users
  USERS: {
    ME: '/users/me',
    SUBSCRIPTION: '/users/subscription',
    EMOTIONS: '/users/emotions',
    HISTORY: '/users/history',
    STATS: '/users/stats',
  },
  
  // Chat
  CHAT: {
    SEND: '/chat/send',
    SESSION: (id: number) => `/chat/session/${id}`,
    RECENT: '/chat/recent',
    DELETE_SESSION: (id: number) => `/chat/session/${id}`,
    ARCHIVE_SESSION: (id: number) => `/chat/session/${id}/archive`,
    FEEDBACK: '/chat/feedback',
  },
  
  // Plans
  PLANS: {
    LIST: '/plans',
    GET: (id: number) => `/plans/${id}`,
    CURRENT: '/plans/current',
    SUBSCRIBE: '/plans/subscribe',
    CREATE: '/plans',
    UPDATE: (id: number) => `/plans/${id}`,
  },
  
  // Doctor
  DOCTOR: {
    DASHBOARD: '/doctors/dashboard',
    PATIENTS: '/doctors/patients',
    ADD_PATIENT: '/doctors/patients/add',
    GET_PATIENT: (id: number) => `/doctors/patients/${id}`,
    NOTES: '/doctors/notes',
    TASKS: '/doctors/tasks',
    SESSIONS: '/doctors/sessions',
    APPOINTMENTS: '/doctors/appointments',
    ALERTS: '/doctors/alerts',
    START_SESSION: '/doctors/session/start',
    END_SESSION: (id: number) => `/doctors/session/${id}/end`,
  },
  
  // Admin
  ADMIN: {
    USERS: '/admin/users',
    USER: (id: number) => `/admin/users/${id}`,
    DOCTORS: '/admin/doctors',
    PLANS: '/admin/plans',
    MODELS: '/admin/models',
    USAGE_STATS: '/admin/usage-stats',
    REVENUE: '/admin/revenue',
    LOGS: '/admin/logs',
    OVERVIEW: '/admin/overview',
  },

  // Payment
  PAYMENT: {
    CREATE: '/payment/create',
    VERIFY: '/payment/verify',
    HISTORY: '/payment/history',
    GET: (id: number) => `/payment/${id}`,
    REFUND: (id: number) => `/payment/${id}/refund`,
    STATS: '/payment/stats',
  },

  // Emotion
  EMOTION: {
    ANALYZE: '/emotion/analyze',
    LOGS: '/emotion/logs',
    STATS: '/emotion/stats',
    TRENDS: '/emotion/trends',
    INSIGHTS: '/emotion/insights',
  },

  // Alert
  ALERT: {
    LIST: '/alert',
    GET: (id: number) => `/alert/${id}`,
    RESOLVE: (id: number) => `/alert/${id}/resolve`,
    DISMISS: (id: number) => `/alert/${id}/dismiss`,
    STATS: '/alert/stats',
    CRITICAL: '/alert/critical',
  },

  // Patient
  PATIENT: {
    RECORDS: '/patient/records',
    RECORD: (id: number) => `/patient/records/${id}`,
    TESTS: '/patient/tests',
    TEST: (id: number) => `/patient/tests/${id}`,
    SUBMIT_TEST: (id: number) => `/patient/tests/${id}/submit`,
  },
};

// Link API_ENDPOINTS to API_CONFIG
API_CONFIG.API_ENDPOINTS = API_ENDPOINTS;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};
