/**
 * Token utility functions for JWT validation and decoding
 */

const TOKEN_KEY = 'authToken';

/**
 * Decodes a JWT token without verification (client-side only)
 * @param {string} token - JWT token string
 * @returns {object|null} - Decoded payload or null if invalid
 */
function decodeToken(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    // Replace URL-safe base64 characters and add padding if needed
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch (err) {
    console.error('Failed to decode token:', err);
    return null;
  }
}

/**
 * Checks if a token is valid and not expired
 * @param {string} token - JWT token string
 * @returns {boolean} - True if token is valid and not expired
 */
function isTokenValid(token) {
  if (!token) {
    return false;
  }

  const decoded = decodeToken(token);
  if (!decoded) {
    return false;
  }

  // Check expiration (exp is in seconds, Date.now() is in milliseconds)
  if (decoded.exp) {
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      return false;
    }
  }

  return true;
}

/**
 * Validates the stored token and removes it if invalid/expired
 * Redirects to login if token is invalid
 * @param {Function} navigate - React Router navigate function (optional, for redirect)
 * @returns {boolean} - True if token is valid, false otherwise
 */
export function validateAndCleanToken(navigate = null) {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token || !isTokenValid(token)) {
    // Remove invalid token
    localStorage.removeItem(TOKEN_KEY);
    
    // Redirect to login if navigate function is provided
    if (navigate && typeof navigate === 'function') {
      navigate('/login', { replace: true });
    } else if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
      // Fallback: use window.location if navigate is not available
      window.location.href = '/login';
    }
    
    return false;
  }

  return true;
}

/**
 * Decodes the token and returns its payload data
 * Also validates the token and redirects to login if invalid
 * @param {Function} navigate - React Router navigate function (optional, for redirect)
 * @returns {object|null} - Decoded token payload or null if invalid
 */
export function decodeAndStoreToken(navigate = null) {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    if (navigate && typeof navigate === 'function') {
      navigate('/login', { replace: true });
    } else if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
      window.location.href = '/login';
    }
    return null;
  }

  // Validate token first
  if (!isTokenValid(token)) {
    localStorage.removeItem(TOKEN_KEY);
    if (navigate && typeof navigate === 'function') {
      navigate('/login', { replace: true });
    } else if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
      window.location.href = '/login';
    }
    return null;
  }

  // Decode and return token data
  const decoded = decodeToken(token);
  return decoded;
}

/**
 * Gets the raw token from localStorage
 * @returns {string|null} - Token string or null
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Sets the token in localStorage
 * @param {string} token - JWT token string
 */
export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Removes the token from localStorage
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

