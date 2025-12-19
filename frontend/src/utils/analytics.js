/**
 * Firebase Analytics utility
 * Only initializes and tracks if user has given consent
 */

import { initAnalytics, getAnalyticsInstance, disableAnalytics } from '../config/firebase.js';
import { logEvent, setAnalyticsCollectionEnabled } from 'firebase/analytics';

let analyticsInitialized = false;

/**
 * Initialize Firebase Analytics (only if consent is given)
 * @returns {Promise<boolean>} - True if initialized successfully
 */
export async function loadFirebaseAnalytics() {
  if (analyticsInitialized) {
    return true;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const analytics = await initAnalytics();
    if (analytics) {
      // Enable analytics collection
      await setAnalyticsCollectionEnabled(analytics, true);
      analyticsInitialized = true;
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to load Firebase Analytics:', err);
    return false;
  }
}

/**
 * Remove/Disable Firebase Analytics (for when consent is revoked)
 */
export function removeFirebaseAnalytics() {
  if (typeof window === 'undefined') return;
  
  try {
    const analytics = getAnalyticsInstance();
    if (analytics) {
      // Disable analytics collection
      setAnalyticsCollectionEnabled(analytics, false).catch(err => {
        console.error('Failed to disable analytics:', err);
      });
    }
    disableAnalytics();
    analyticsInitialized = false;
  } catch (err) {
    console.error('Error removing Firebase Analytics:', err);
  }
}

/**
 * Track a page view
 * @param {string} path - Page path
 * @param {string} title - Page title (optional)
 */
export function trackPageView(path, title = null) {
  if (!analyticsInitialized) return;
  
  try {
    const analytics = getAnalyticsInstance();
    if (!analytics) return;

    // Firebase Analytics automatically tracks page views, but we can log a custom event
    logEvent(analytics, 'page_view', {
      page_path: path,
      ...(title && { page_title: title })
    }).catch(err => {
      console.error('Error tracking page view:', err);
    });
  } catch (err) {
    console.error('Error tracking page view:', err);
  }
}

/**
 * Track an event
 * @param {string} eventName - Event name
 * @param {object} eventParams - Event parameters (optional)
 */
export function trackEvent(eventName, eventParams = {}) {
  if (!analyticsInitialized) return;
  
  try {
    const analytics = getAnalyticsInstance();
    if (!analytics) return;

    logEvent(analytics, eventName, eventParams).catch(err => {
      console.error('Error tracking event:', err);
    });
  } catch (err) {
    console.error('Error tracking event:', err);
  }
}

/**
 * Check if Firebase Analytics is loaded
 * @returns {boolean}
 */
export function isAnalyticsLoaded() {
  return analyticsInitialized && getAnalyticsInstance() !== null;
}

// Legacy function names for backward compatibility
export const loadGoogleAnalytics = loadFirebaseAnalytics;
export const removeGoogleAnalytics = removeFirebaseAnalytics;

