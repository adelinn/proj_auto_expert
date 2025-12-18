import assert from 'assert';
import { validateLinks } from '../server/urlValidator.js';

async function run() {
  // Good link should pass
  const { valid: v1, invalid: i1 } = await validateLinks(['https://example.com']);
  assert.strictEqual(v1.length, 1);
  assert.strictEqual(i1.length, 0);
  console.log('Public domain validated');

  // Localhost and IPs should be rejected
  const { valid: v2, invalid: i2 } = await validateLinks(['http://127.0.0.1', 'http://192.168.1.1']);
  assert.strictEqual(v2.length, 0);
  assert.ok(i2.length >= 1);
  console.log('Local/private IPs rejected');

  // Malformed entry rejected
  const { valid: v3, invalid: i3 } = await validateLinks(['not-a-url']);
  assert.strictEqual(v3.length, 0);
  assert.strictEqual(i3.length, 1);
  console.log('Malformed URL rejected');

  // Too many links
  const many = Array.from({ length: 12 }, (_,i) => `https://example.com/${i}`);
  const { valid: v4, invalid: i4 } = await validateLinks(many, { maxLinks: 10 });
  assert.strictEqual(v4.length, 0);
  assert.strictEqual(i4.length, 1);
  console.log('Excess links rejected');
}

run().catch(err => { console.error(err); process.exit(1); });