import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
let firebaseConfig;
try{
  firebaseConfig = import.meta.env.VITE_FIREBASE_CONFIG ? JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG) : {};
} catch(err) {
  firebaseConfig = {};
  console.error("Failed to load Firebase Config: ", err);
}

// Validate required config
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
if (missingFields.length > 0 && typeof window !== 'undefined') {
  console.warn('Firebase configuration incomplete. Missing:', missingFields);
}

// Initialize Firebase app (only if not already initialized)
let app = null;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Analytics instance (will be initialized when consent is given)
let analyticsInstance = null;

/**
 * Initialize Firebase Analytics (only if consent is given and browser supports it)
 * @returns {Promise<object|null>} - Analytics instance or null
 */
export async function initAnalytics() {
  if (analyticsInstance) {
    return analyticsInstance;
  }

  // Check if Analytics is supported in this environment
  const supported = await isSupported();
  if (!supported) {
    console.warn('Firebase Analytics is not supported in this environment');
    return null;
  }

  try {
    analyticsInstance = getAnalytics(app);
    return analyticsInstance;
  } catch (err) {
    console.error('Failed to initialize Firebase Analytics:', err);
    return null;
  }
}

/**
 * Get the current Analytics instance
 * @returns {object|null}
 */
export function getAnalyticsInstance() {
  return analyticsInstance;
}

/**
 * Disable Analytics (for when consent is revoked)
 */
export function disableAnalytics() {
  if (analyticsInstance) {
    // Firebase Analytics doesn't have a direct disable method,
    // but we can set the instance to null to prevent further tracking
    analyticsInstance = null;
  }
}

export default app;

