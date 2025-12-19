import rateLimit from 'express-rate-limit';

const toNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

// Global defaults
const WINDOW_MS = toNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000); // 15 minutes
const MAX_REQUESTS = toNumber(process.env.RATE_LIMIT_MAX, 200);

// Auth-specific (stricter)
const AUTH_WINDOW_MS = toNumber(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 15 * 60 * 1000);
const AUTH_MAX = toNumber(process.env.RATE_LIMIT_AUTH_MAX, 50);

export const generalLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false
});

export const authLimiter = rateLimit({
  windowMs: AUTH_WINDOW_MS,
  max: AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later.' }
});
