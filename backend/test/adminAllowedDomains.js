import assert from 'assert';
import { addAllowedDomain, getAllowedDomains, removeAllowedDomain } from '../server/allowedDomainsService.js';

async function run() {
  // This test requires a local DB and the migrations applied. If DB isn't configured, it will fail.
  console.log('Note: this test requires DB (knex config) and that migrations have been run.');

  const domain = `test-allowed-${Date.now()}.example`;
  const added = await addAllowedDomain(domain);
  assert.ok(added.id, 'Should return id');

  const all = await getAllowedDomains();
  const found = all.find(r => r.domain === domain);
  assert.ok(found, 'Domain should be present in DB');

  await removeAllowedDomain(added.id);
  const after = await getAllowedDomains();
  const notFound = after.find(r => r.domain === domain);
  assert.ok(!notFound, 'Domain should be removed');

  console.log('Allowed domains DB test passed');
}

run().catch(err => { console.error(err); process.exit(1); });