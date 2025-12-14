/**
 * Input Validation Utilities
 * 
 * Provides strict client-side validation for all form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const trimmed = email.trim().toLowerCase();
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  if (trimmed.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }
  
  return { isValid: true };
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }
  
  return { isValid: true };
}

/**
 * Validates name (first name, last name, full name)
 */
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters long` };
  }
  
  if (trimmed.length > 100) {
    return { isValid: false, error: `${fieldName} is too long` };
  }
  
  // Allow letters, spaces, hyphens, apostrophes, and common international characters
  const nameRegex = /^[a-zA-Z\s\-'àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]+$/;
  
  if (!nameRegex.test(trimmed)) {
    return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
  }
  
  return { isValid: true };
}

/**
 * Validates phone number
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  const trimmed = phone.trim();
  
  // Remove all non-digit characters except + at the start
  let cleaned = trimmed;
  if (cleaned.startsWith('+')) {
    cleaned = '+' + cleaned.substring(1).replace(/\D/g, '');
  } else {
    cleaned = cleaned.replace(/\D/g, '');
  }
  
  // E.164 format: + followed by 1-15 digits
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  
  if (!phoneRegex.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  if (cleaned.length > 16) {
    return { isValid: false, error: 'Phone number is too long' };
  }
  
  return { isValid: true };
}

/**
 * Validates numeric input with min/max constraints
 */
export function validateNumber(
  value: string | number,
  min?: number,
  max?: number,
  fieldName: string = 'Number'
): ValidationResult {
  let num: number;
  
  if (typeof value === 'string') {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    
    num = parseFloat(value);
    if (isNaN(num) || !isFinite(num)) {
      return { isValid: false, error: `${fieldName} must be a valid number` };
    }
  } else {
    num = value;
    if (isNaN(num) || !isFinite(num)) {
      return { isValid: false, error: `${fieldName} must be a valid number` };
    }
  }
  
  if (min !== undefined && num < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }
  
  if (max !== undefined && num > max) {
    return { isValid: false, error: `${fieldName} must be at most ${max}` };
  }
  
  return { isValid: true };
}

/**
 * Validates text input with length constraints
 */
export function validateText(
  text: string,
  minLength?: number,
  maxLength?: number,
  fieldName: string = 'Text',
  required: boolean = true
): ValidationResult {
  if (required && (!text || text.trim().length === 0)) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (!text) {
    return { isValid: true }; // Empty text is valid if not required
  }
  
  const trimmed = text.trim();
  
  if (minLength !== undefined && trimmed.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters long` };
  }
  
  if (maxLength !== undefined && trimmed.length > maxLength) {
    return { isValid: false, error: `${fieldName} must be at most ${maxLength} characters long` };
  }
  
  return { isValid: true };
}

/**
 * Validates URL
 */
export function validateUrl(url: string, required: boolean = false): ValidationResult {
  if (!url || url.trim().length === 0) {
    if (required) {
      return { isValid: false, error: 'URL is required' };
    }
    return { isValid: true };
  }
  
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'URL must use http or https protocol' };
    }
    
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
}

