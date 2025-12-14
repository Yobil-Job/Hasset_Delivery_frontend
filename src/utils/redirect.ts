/**
 * Safe Redirect Utilities
 * 
 * Prevents open redirect vulnerabilities by whitelisting allowed routes
 */

/**
 * List of allowed internal routes that can be used for redirects
 */
const ALLOWED_REDIRECT_ROUTES = [
  '/',
  '/home',
  '/about',
  '/services',
  '/pricing',
  '/contact',
  '/faq',
  '/login',
  '/signup',
  '/profile',
  '/orders',
  '/order/create',
  '/track-order',
  '/addresses',
  '/analytics',
  '/driver/dashboard',
  '/admin/dashboard',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/payment',
  '/payments/result',
];

/**
 * Validates if a redirect URL is safe (internal and whitelisted)
 */
export function isValidRedirectUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  try {
    // Parse the URL
    const urlObj = new URL(url, window.location.origin);
    
    // Only allow same-origin redirects
    if (urlObj.origin !== window.location.origin) {
      return false;
    }
    
    // Check if the pathname is in the whitelist
    const pathname = urlObj.pathname;
    return ALLOWED_REDIRECT_ROUTES.includes(pathname);
  } catch {
    // If URL parsing fails, treat as invalid
    return false;
  }
}

/**
 * Gets a safe redirect URL from query parameters or returns default
 */
export function getSafeRedirectUrl(
  searchParams: URLSearchParams | string,
  defaultUrl: string = '/'
): string {
  let redirectUrl: string | null = null;
  
  if (typeof searchParams === 'string') {
    const params = new URLSearchParams(searchParams);
    redirectUrl = params.get('redirect');
  } else {
    redirectUrl = searchParams.get('redirect');
  }
  
  // Validate redirect URL
  if (redirectUrl && isValidRedirectUrl(redirectUrl)) {
    try {
      const urlObj = new URL(redirectUrl, window.location.origin);
      return urlObj.pathname;
    } catch {
      return defaultUrl;
    }
  }
  
  return defaultUrl;
}

/**
 * Sanitizes redirect URL from user input
 */
export function sanitizeRedirectUrl(url: string | null | undefined): string {
  if (!url) return '/';
  
  // If it's already a valid redirect, return it
  if (isValidRedirectUrl(url)) {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname;
    } catch {
      return '/';
    }
  }
  
  // Otherwise return default
  return '/';
}

