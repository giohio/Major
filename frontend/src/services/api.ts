/**
 * Main API Service Export
 * Re-exports apiClient and API_ENDPOINTS for easy import
 */

// Export API client instance
export { apiClient } from './api.client';

// Export API endpoints and configuration
export { API_ENDPOINTS, API_CONFIG, STORAGE_KEYS } from '../config/api.config';

// Re-export types for convenience
export type { ApiError, ApiResponse, PaginatedResponse } from '../types/api.types';
