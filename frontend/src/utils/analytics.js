/**
 * Google Analytics utility
 * Only loads and initializes GA if user has given consent
 */

let gtagLoaded = false;
let measurementId = null;

/**
 * Remove Google Analytics (for when consent is revoked)
 */
export function removeGoogleAnalytics() {
  if (typeof window === 'undefined') return;
  
  // Remove gtag script
  const scripts = document.querySelectorAll('script[src*="googletagmanager.com"]');
  scripts.forEach(script => script.remove());
  
  // Clear dataLayer
  if (window.dataLayer) {
    window.dataLayer = [];
  }
  
  // Remove gtag function
  if (window.gtag) {
    delete window.gtag;
  }
  
  gtagLoaded = false;
  measurementId = null;
}

/**
 * Load Google Analytics script
 * @param {string} id - Google Analytics Measurement ID (G-XXXXXXXXXX)
 */
export function loadGoogleAnalytics(id) {
  if (typeof window === 'undefined' || gtagLoaded) return;
  
  measurementId = id;
  
  // Load gtag.js script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script1);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', id, {
    anonymize_ip: true, // GDPR compliance
    cookie_flags: 'SameSite=None;Secure',
  });

  gtagLoaded = true;
}

/**
 * Track a page view
 * @param {string} path - Page path
 * @param {string} title - Page title (optional)
 */
export function trackPageView(path, title = null) {
  if (!gtagLoaded || !window.gtag) return;
  
  window.gtag('config', measurementId, {
    page_path: path,
    ...(title && { page_title: title })
  });
}

/**
 * Track an event
 * @param {string} eventName - Event name
 * @param {object} eventParams - Event parameters (optional)
 */
export function trackEvent(eventName, eventParams = {}) {
  if (!gtagLoaded || !window.gtag) return;
  
  window.gtag('event', eventName, eventParams);
}

/**
 * Check if Google Analytics is loaded
 * @returns {boolean}
 */
export function isAnalyticsLoaded() {
  return gtagLoaded && typeof window !== 'undefined' && window.gtag;
}

