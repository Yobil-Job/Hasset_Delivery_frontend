/**
 * Password validation utility matching backend requirements
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number; // 0-4
}

const MIN_LENGTH = 8;
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const DIGIT_REGEX = /[0-9]/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/;

/**
 * Validates password strength and returns detailed feedback
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  if (!password || password.length < MIN_LENGTH) {
    errors.push(`Password must be at least ${MIN_LENGTH} characters long`);
  } else {
    score++;
  }

  if (!UPPERCASE_REGEX.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score++;
  }

  if (!LOWERCASE_REGEX.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score++;
  }

  if (!DIGIT_REGEX.test(password)) {
    errors.push('Password must contain at least one digit');
  } else {
    score++;
  }

  if (!SPECIAL_CHAR_REGEX.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;\':",./<>?)');
  } else {
    score++;
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  if (score === 5 && password.length >= 12) {
    strength = 'very-strong';
  } else if (score === 5) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score,
  };
}

/**
 * Quick validation check (returns boolean)
 */
export function isPasswordValid(password: string): boolean {
  return validatePassword(password).isValid;
}

