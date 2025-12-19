/**
 * Cookie consent utility functions
 */

const CONSENT_KEY = 'cookieConsent';
const CONSENT_EXPIRY_DAYS = 365;

/**
 * Get the current cookie consent status
 * @returns {string|null} - 'accepted', 'declined', or null if not set
 */
export function getCookieConsent() {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    
    const consent = JSON.parse(stored);
    
    // Check if consent has expired (older than CONSENT_EXPIRY_DAYS)
    const now = Date.now();
    if (consent.expiry && consent.expiry < now) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    
    return consent.status;
  } catch (err) {
    console.error('Error reading cookie consent:', err);
    return null;
  }
}

/**
 * Set cookie consent status
 * @param {string} status - 'accepted' or 'declined'
 */
export function setCookieConsent(status) {
  if (typeof window === 'undefined') return;
  
  if (status !== 'accepted' && status !== 'declined') {
    console.error('Invalid consent status:', status);
    return;
  }
  
  const expiry = Date.now() + (CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      status,
      timestamp: Date.now(),
      expiry
    }));
  } catch (err) {
    console.error('Error saving cookie consent:', err);
  }
}

/**
 * Check if analytics cookies are accepted
 * @returns {boolean}
 */
export function hasAnalyticsConsent() {
  return getCookieConsent() === 'accepted';
}

