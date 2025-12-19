
// Helper to scrape basics (Title/Meta) to give Gemini context
// Real-world apps would use a more robust scraper (Puppeteer/Playwright)
async function fetchPageContent(url) {
  try {
    const axios = (await import('axios')).default;
    const { load } = await import('cheerio');
    const { data } = await axios.get(url);
    const $ = load(data);
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content') || '';
    // Grabbing first few paragraphs to save token usage/complexity
    // Cheerio collections don't expose .limit(), so use slice to cap paragraphs
    const body = $('p').slice(0, 5).map((i, el) => $(el).text()).get().join(' '); 
    return `Source: ${url}\nTitle: ${title}\nContext: ${description}\nSnippet: ${body}\n---\n`;
  } catch (error) {
    return `Source: ${url} (Could not scrape content, analyze based on URL pattern)\n---\n`;
  }
}

// Default to gemini-2.5-flash as requested, but can be overridden via GEMINI_MODEL env var
// If gemini-2.5-flash doesn't work, try: gemini-1.5-flash-latest, gemini-1.5-pro-latest, or gemini-2.0-flash-exp
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export function validateGeminiConfig() {
  const missing = [];
  if (!process.env.GEMINI_API_KEY) missing.push('GEMINI_API_KEY');
  if (missing.length) {
    throw new Error(`Missing required env vars for Gemini: ${missing.join(', ')}`);
  }
}

import logger from '../server/logger.js';
import { z } from 'zod';
import crypto from 'crypto';
import { getCachedAnalysis, setCachedAnalysis } from './cache.js';

// Zod schema for Gemini analysis output
const SentimentEnum = z.enum(['positive', 'negative', 'neutral']);
const SentimentSchema = z.object({
  source: z.string(),
  sentiment: SentimentEnum,
  perspective: z.string().optional()
});
const ComparisonItemSchema = z.object({
  topic: z.string(),
  sentiments: z.array(SentimentSchema)
});
const GeminiOutputSchema = z.object({
  topics: z.array(z.string()),
  comparison: z.array(ComparisonItemSchema)
});

export function validateGeminiOutput(obj) {
  try {
    const data = GeminiOutputSchema.parse(obj);
    return { success: true, data };
  } catch (err) {
    // ZodError has .errors with details
    const errors = err.errors || [{ message: err.message }];
    logger.warn({ errors }, 'Gemini response failed schema validation');
    return { success: false, errors };
  }
}

async function getModel() {
  // Fail fast if config is invalid
  validateGeminiConfig();
  const modelId = DEFAULT_MODEL;
  // Lazy import so the module can be imported in test environments that don't install the SDK
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return { model: genAI.getGenerativeModel({ model: modelId }), modelId };
}  

export async function analyzeLinks(links) {
  let model, modelId;
  try {
    ({ model, modelId } = await getModel());
  } catch (err) {
    return {
      topics: [],
      comparison: [],
      error: err.message
    };
  } 

  // Canonicalize links for consistent caching (trim, unique, sort)
  const canonicalLinks = Array.from(new Set((links || []).map(l => (l || '').trim()).filter(Boolean))).sort();

  // Cache key includes model and links
  const cacheKey = crypto
    .createHash('sha256')
    .update(JSON.stringify({ model: modelId, links: canonicalLinks }))
    .digest('hex');

  // Try cache first
  const cached = await getCachedAnalysis(cacheKey);
  if (cached) {
    return cached;
  }

  // 1. Gather data
  const contents = await Promise.all(canonicalLinks.map(link => fetchPageContent(link)));
  const joinedContent = contents.join('\n');

  // 2. Construct Prompt
  const prompt = `
    You are a media analyst. Analyze the following news articles.
    
    ${joinedContent}

    Output a JSON object ONLY (no markdown) with this structure:
    {
      "topics": ["topic1", "topic2"],
      "comparison": [
        {
          "topic": "topic1",
          "sentiments": [{"source": "url", "sentiment": "positive/negative/neutral", "perspective": "summary of perspective"}]
        }
      ]
    }
  `;

  // 3. Call Gemini with retry/backoff and circuit breaker
  let text;
  try {
    text = await callGeminiWithResilience(model, prompt, modelId);
  } catch (error) {
    logger.error({ err: error, model: modelId || 'unknown' }, 'Gemini generateContent failed');
    return {
      topics: [],
      comparison: [],
      error: `Gemini request failed for model ${modelId || 'unknown'}. ${error?.message || 'Please retry.'}`
    };
  }
  
  // Clean markdown if Gemini adds it (```json ...)
  const cleanJson = text.replace(/```json|```/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (error) {
    // Guard against malformed responses so the API still returns something usable
    logger.warn({ raw: cleanJson }, 'Gemini returned invalid JSON');
    return {
      topics: [],
      comparison: [],
      raw: cleanJson,
      error: 'Analysis returned invalid JSON.'
    };
  }

  // Validate schema
  const validation = validateGeminiOutput(parsed);
  if (!validation.success) {
    return {
      topics: [],
      comparison: [],
      raw: cleanJson,
      error: 'Analysis JSON failed schema validation.',
      validationErrors: validation.errors
    };
  }

  // Store in cache (best-effort)
  setCachedAnalysis(cacheKey, validation.data);

  return validation.data;
}

// Resilience settings (retry + circuit breaker)
const MAX_RETRIES = Number(process.env.GEMINI_MAX_RETRIES || 3);
const BASE_DELAY_MS = Number(process.env.GEMINI_RETRY_BASE_MS || 200);
const CIRCUIT_FAILURES = Number(process.env.GEMINI_CIRCUIT_FAILURES || 5);
const CIRCUIT_COOLDOWN_MS = Number(process.env.GEMINI_CIRCUIT_COOLDOWN_MS || 60000);

// Simple circuit breaker state
const circuitState = {
  openUntil: 0,
  consecutiveFailures: 0
};

function isCircuitOpen() {
  if (Date.now() < circuitState.openUntil) return true;
  return false;
}

function recordFailure(modelId, err, failureThreshold, cooldownMs) {
  circuitState.consecutiveFailures += 1;
  if (circuitState.consecutiveFailures >= failureThreshold) {
    circuitState.openUntil = Date.now() + cooldownMs;
    circuitState.consecutiveFailures = 0;
    logger.warn({ model: modelId, err }, 'Gemini circuit opened due to repeated failures');
  }
}

function recordSuccess() {
  circuitState.consecutiveFailures = 0;
  circuitState.openUntil = 0;
}

function isRetryable(error) {
  const status = error?.response?.status;
  if (!status) return true; // network/unknown
  if (status >= 500) return true;
  if (status === 429) return true;
  return false;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Exported for tests
export async function callGeminiWithResilience(model, prompt, modelId, overrides = {}) {
  const maxRetries = overrides.maxRetries ?? MAX_RETRIES;
  const baseDelay = overrides.baseDelayMs ?? BASE_DELAY_MS;
  const circuitFailures = overrides.circuitFailures ?? CIRCUIT_FAILURES;
  const circuitCooldown = overrides.circuitCooldownMs ?? CIRCUIT_COOLDOWN_MS;

  if (Date.now() < circuitState.openUntil) {
    const msLeft = circuitState.openUntil - Date.now();
    throw new Error(`Gemini temporarily unavailable (circuit open, retry in ${msLeft}ms)`);
  }

  let attempt = 0;
  let delay = baseDelay;
  while (attempt <= maxRetries) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      recordSuccess();
      return text;
    } catch (err) {
      const retryable = isRetryable(err);
      recordFailure(modelId, err, circuitFailures, circuitCooldown);

      // If circuit just opened, fail fast
      if (Date.now() < circuitState.openUntil) {
        throw new Error(`Gemini temporarily unavailable (circuit open). ${err?.message || ''}`);
      }

      if (!retryable || attempt === maxRetries) {
        throw err;
      }

      await sleep(delay);
      delay = Math.min(delay * 2, baseDelay * 8);
      attempt += 1;
    }
  }
  throw new Error('Unexpected Gemini retry loop termination');
}

// For tests to reset circuit state
export function __resetGeminiCircuit() {
  circuitState.openUntil = 0;
  circuitState.consecutiveFailures = 0;
}