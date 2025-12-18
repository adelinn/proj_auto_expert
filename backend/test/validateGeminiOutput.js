import assert from 'assert';
import { validateGeminiOutput } from '../server/geminiService.js';

function run() {
  // Good payload
  const good = {
    topics: ['economy', 'sport'],
    comparison: [
      {
        topic: 'economy',
        sentiments: [
          { source: 'https://news.example/article1', sentiment: 'positive', perspective: 'Growth expected' }
        ]
      }
    ]
  };

  const goodRes = validateGeminiOutput(good);
  assert.strictEqual(goodRes.success, true, 'Good payload should validate');
  console.log('Good payload validated');

  // Bad payload
  const bad = { topics: 'not-an-array' };
  const badRes = validateGeminiOutput(bad);
  assert.strictEqual(badRes.success, false, 'Bad payload should fail validation');
  console.log('Bad payload failed validation as expected');
}

run();