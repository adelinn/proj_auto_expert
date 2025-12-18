import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Helper to scrape basics (Title/Meta) to give Gemini context
// Real-world apps would use a more robust scraper (Puppeteer/Playwright)
async function fetchPageContent(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
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

function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return { error: 'GEMINI_API_KEY is missing on the server.' };
  }
  const modelId = DEFAULT_MODEL;
  const genAI = new GoogleGenerativeAI(key);
  return { model: genAI.getGenerativeModel({ model: modelId }), modelId };
}

export async function analyzeLinks(links) {
  const { model, modelId, error: modelError } = getModel();
  if (modelError) {
    return {
      topics: [],
      comparison: [],
      error: modelError
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
    console.error(`Gemini generateContent failed (model: ${modelId || 'unknown'})`, error?.response?.data || error?.message || error);
    return {
      topics: [],
      comparison: [],
      error: `Gemini request failed for model ${modelId || 'unknown'}. ${error?.message || 'Please retry.'}`
    };
  }
  
  // Clean markdown if Gemini adds it (```json ...)
  const cleanJson = text.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleanJson);
  } catch (error) {
    // Guard against malformed responses so the API still returns something usable
    return {
      topics: [],
      comparison: [],
      raw: cleanJson,
      error: 'Analysis returned invalid JSON.'
    };
  }
}