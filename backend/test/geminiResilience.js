import assert from 'assert';
import { callGeminiWithResilience, __resetGeminiCircuit } from '../server/geminiService.js';

function makeModelWithFailures(failuresBeforeSuccess, errorStatus = 500) {
  let attempts = 0;
  return {
    attempts: () => attempts,
    async generateContent() {
      attempts += 1;
      if (attempts <= failuresBeforeSuccess) {
        const err = new Error('fail');
        err.response = { status: errorStatus };
        throw err;
      }
      return {
        response: { text: () => 'ok' }
      };
    }
  };
}

async function testRetriesThenSuccess() {
  __resetGeminiCircuit();
  const model = makeModelWithFailures(2, 500);
  const text = await callGeminiWithResilience(model, 'prompt', 'test-model', {
    maxRetries: 3,
    baseDelayMs: 1,
    circuitFailures: 10,
    circuitCooldownMs: 50
  });
  assert.strictEqual(text, 'ok');
  assert.strictEqual(model.attempts(), 3, 'Should retry twice then succeed');
  console.log('Retry success test passed');
}

async function testCircuitOpens() {
  __resetGeminiCircuit();
  const model = makeModelWithFailures(10, 500);
  let threw = false;
  try {
    await callGeminiWithResilience(model, 'prompt', 'test-model', {
      maxRetries: 1,
      baseDelayMs: 1,
      circuitFailures: 2,
      circuitCooldownMs: 50
    });
  } catch (err) {
    threw = true;
  }
  assert.ok(threw, 'First call should fail and open circuit quickly');

  // Second call should immediately fail due to circuit open
  let circuitError = false;
  try {
    await callGeminiWithResilience(model, 'prompt', 'test-model', {
      maxRetries: 0,
      baseDelayMs: 1,
      circuitFailures: 2,
      circuitCooldownMs: 50
    });
  } catch (err) {
    circuitError = err.message.includes('circuit open');
  }
  assert.ok(circuitError, 'Circuit should be open');
  console.log('Circuit open test passed');
}

async function run() {
  await testRetriesThenSuccess();
  await testCircuitOpens();
  console.log('All resilience tests passed');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
