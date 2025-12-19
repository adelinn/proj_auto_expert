import assert from 'assert';
import { enqueueAnalysis } from '../server/analysisQueue.js';
import { getJobStatus } from '../server/queueStatus.js';
import { __resetGeminiCircuit } from '../server/geminiService.js';

async function run() {
  __resetGeminiCircuit();

  // enqueue a dummy job (links empty to avoid real call); in real tests, mock analyzeLinks but here we rely on queue behavior
  const job = await enqueueAnalysis({ links: ['https://example.com'], userId: 'user1', projectId: null });

  // Immediately fetch status (likely waiting or active)
  const status = await getJobStatus(job.id, 'user1');
  assert.ok(status, 'Status should exist');
  assert.strictEqual(status.unauthorized, undefined, 'Should not be unauthorized for owner');

  // Unauthorized user should be blocked
  const statusUnauthorized = await getJobStatus(job.id, 'another-user');
  assert.ok(statusUnauthorized?.unauthorized, 'Should block unauthorized user');

  console.log('Queue status basic test passed (ownership checks). Note: job may still be running.');
}

run().catch(err => { console.error(err); process.exit(1); });
