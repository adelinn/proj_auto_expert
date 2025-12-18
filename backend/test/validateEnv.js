import assert from 'assert';

async function run() {
  // Dynamic import so the module is evaluated in current env
  const { validateGeminiConfig } = await import('../server/geminiService.js');

  const orig = process.env.GEMINI_API_KEY;

  // Ensure it throws when GEMINI_API_KEY is missing
  delete process.env.GEMINI_API_KEY;
  let threw = false;
  try {
    validateGeminiConfig();
  } catch (err) {
    threw = true;
    console.log('Expected error:', err.message);
    assert.ok(err.message.includes('Missing required env vars'));
  }
  assert.ok(threw, 'validateGeminiConfig should throw when GEMINI_API_KEY is missing');

  // Should not throw when present
  process.env.GEMINI_API_KEY = 'dummy';
  validateGeminiConfig();
  console.log('validateGeminiConfig passed with GEMINI_API_KEY set');

  // restore
  if (orig === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = orig;
}

run().catch(err => { console.error(err); process.exit(1); });