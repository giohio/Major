// Application Constants

// External URLs
export const EXTERNAL_URLS = {
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_OF_SERVICE: '/terms-of-service',
  SUPPORT: '/contact',
  DOCUMENTATION: '/docs',
};

// App Settings
export const APP_SETTINGS = {
  APP_NAME: 'Mental Health Platform',
  DEFAULT_LANGUAGE: 'en',
  SUPPORTED_LANGUAGES: ['en', 'vi'],
  DEFAULT_THEME: 'light' as const,
  DEFAULT_FONT_SIZE: 'medium' as const,
};

// Time Constants
export const TIME = {
  SESSION_REMINDER_MINUTES: 30,
  TOAST_DURATION: 3000,
  API_TIMEOUT: 60000,
};

// File Upload
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};
