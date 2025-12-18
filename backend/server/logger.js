import pino from 'pino';
import pinoHttp from 'pino-http';

// Try to use pino-pretty in dev if available, but fail gracefully
let transport;
if (process.env.NODE_ENV !== 'production') {
  try {
    // top-level await is allowed in modern Node; dynamic import to check availability
    await import('pino-pretty');
    transport = { target: 'pino-pretty' };
  } catch (err) {
    transport = undefined; // pino-pretty not installed, use default transport
  }
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport
});

// HTTP middleware that attaches req.log and a stable req.id
export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers['x-request-id'] || req.headers['x-correlation-id'] || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`
});

export default logger;