import Redis from 'ioredis';
import logger from './logger.js';

let client;

function getRedis() {
  if (client) return client;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 2 });
  client.on('error', (err) => logger.warn({ err }, 'Redis client error'));
  client.connect().catch(err => logger.warn({ err }, 'Redis initial connect failed'));
  return client;
}

const toNumber = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const ANALYSIS_TTL = toNumber(process.env.CACHE_ANALYSIS_TTL_SECONDS, 3600); // 1h default

export async function getCachedAnalysis(cacheKey) {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const data = await redis.get(cacheKey);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    logger.warn({ err }, 'Failed to read from Redis cache');
    return null;
  }
}

export async function setCachedAnalysis(cacheKey, value) {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(cacheKey, JSON.stringify(value), 'EX', ANALYSIS_TTL);
  } catch (err) {
    logger.warn({ err }, 'Failed to write to Redis cache');
  }
}
