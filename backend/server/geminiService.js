
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

  // 1. Gather data
  const contents = await Promise.all(links.map(link => fetchPageContent(link)));
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

  // 3. Call Gemini
  let text;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    text = response.text();
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

  return validation.data;
}