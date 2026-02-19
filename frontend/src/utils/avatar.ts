/**
 * Avatar utility functions
 */

import { API_CONFIG } from '../config/api.config';

/**
 * Get full URL for avatar
 * Converts relative paths to absolute URLs
 * @param avatarUrl - Avatar URL from backend (could be relative or absolute)
 * @returns Full avatar URL or empty string
 */
export function getAvatarUrl(avatarUrl?: string | null): string {
  if (!avatarUrl) return '';

  // If already a full URL (http:// or https://), return as is with cache buster
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    // For external URLs (DiceBear), no cache busting needed
    if (avatarUrl.includes('dicebear.com')) {
      return avatarUrl;
    }
    // For uploaded images, add cache buster
    const separator = avatarUrl.includes('?') ? '&' : '?';
    return `${avatarUrl}${separator}t=${Date.now()}`;
  }

  // For relative paths, prepend base URL
  const baseUrl = API_CONFIG.BASE_URL || 'http://localhost:5000';

  // Remove leading slash if present to avoid double slashes
  const path = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;

  // Add cache-busting timestamp to force browser reload
  return `${baseUrl}${path}?t=${Date.now()}`;
}
