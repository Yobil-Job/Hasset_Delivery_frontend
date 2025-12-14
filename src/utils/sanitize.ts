/**
 * Input Sanitization Utilities
 * 
 * Prevents XSS attacks by sanitizing user input before rendering
 */

/**
 * Escapes HTML special characters to prevent XSS
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
  };
  
  return String(text).replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Sanitizes text input by removing potentially dangerous characters
 */
export function sanitizeTextInput(input: string): string {
  if (!input) return '';
  
  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length to prevent DoS
  const MAX_LENGTH = 10000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }
  
  return sanitized;
}

/**
 * Sanitizes email input
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  // Remove whitespace and convert to lowercase
  let sanitized = email.trim().toLowerCase();
  
  // Basic email validation pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // If email doesn't match pattern, return empty string
  if (!emailPattern.test(sanitized)) {
    return '';
  }
  
  // Limit length
  const MAX_EMAIL_LENGTH = 254;
  if (sanitized.length > MAX_EMAIL_LENGTH) {
    sanitized = sanitized.substring(0, MAX_EMAIL_LENGTH);
  }
  
  return sanitized;
}

/**
 * Sanitizes URL input - only allows http, https, mailto, tel
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null;
  
  const trimmed = url.trim();
  
  // Whitelist allowed URL schemes
  const allowedSchemes = ['http:', 'https:', 'mailto:', 'tel:'];
  try {
    const urlObj = new URL(trimmed);
    if (!allowedSchemes.includes(urlObj.protocol)) {
      return null;
    }
    return trimmed;
  } catch {
    // If URL parsing fails, return null
    return null;
  }
}

/**
 * Sanitizes name input (removes special characters except spaces, hyphens, apostrophes)
 */
export function sanitizeName(name: string): string {
  if (!name) return '';
  
  // Allow letters, spaces, hyphens, apostrophes, and common international characters
  let sanitized = name.replace(/[^a-zA-Z\s\-'àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]/g, '');
  
  // Remove multiple consecutive spaces
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Limit length
  const MAX_NAME_LENGTH = 100;
  if (sanitized.length > MAX_NAME_LENGTH) {
    sanitized = sanitized.substring(0, MAX_NAME_LENGTH);
  }
  
  return sanitized;
}

/**
 * Sanitizes phone number input
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters except + at the start
  let sanitized = phone.trim();
  if (sanitized.startsWith('+')) {
    sanitized = '+' + sanitized.substring(1).replace(/\D/g, '');
  } else {
    sanitized = sanitized.replace(/\D/g, '');
  }
  
  // Limit length (E.164 format allows up to 15 digits after +)
  const MAX_PHONE_LENGTH = 16; // + and 15 digits
  if (sanitized.length > MAX_PHONE_LENGTH) {
    sanitized = sanitized.substring(0, MAX_PHONE_LENGTH);
  }
  
  return sanitized;
}

/**
 * Sanitizes numeric input
 */
export function sanitizeNumber(input: string | number): number | null {
  if (typeof input === 'number') {
    // Check for NaN or Infinity
    if (!isFinite(input)) return null;
    return input;
  }
  
  if (!input) return null;
  
  // Remove non-numeric characters except decimal point and minus sign
  const cleaned = String(input).replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed) || !isFinite(parsed)) {
    return null;
  }
  
  return parsed;
}

