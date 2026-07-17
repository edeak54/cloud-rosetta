const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const entries = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'entries.json'), 'utf8'));
const PREFIX = { aws: 'aws_', azure: 'azurerm_', gcp: 'google_' };

test('dictionary is non-trivial', () => {
  assert.ok(entries.length >= 40, `expected 40+ entries, got ${entries.length}`);
});

test('every entry is fully trilingual', () => {
  for (const e of entries) {
    for (const cloud of ['aws', 'azure', 'gcp']) {
      assert.ok(e[cloud]?.n, `${e.uni}: missing ${cloud} name`);
      assert.ok(e[cloud]?.d, `${e.uni}: missing ${cloud} description`);
    }
  }
});

test('every entry documents where the analogy breaks', () => {
  for (const e of entries) {
    assert.ok(e.usage && e.usage.length > 30, `${e.uni}: usage note missing or too thin`);
  }
});

test('terraform resource names carry the right provider prefix', () => {
  for (const e of entries) {
    for (const cloud of ['aws', 'azure', 'gcp']) {
      const r = e.tf[cloud];
      if (!r || r === '\u2014') continue;
      const clean = r.replace(/\s*\([^)]*\)/g, '').trim();
      assert.ok(clean.startsWith(PREFIX[cloud]),
        `${e.uni}: tf.${cloud} "${r}" does not start with ${PREFIX[cloud]}`);
    }
  }
});

test('no duplicate universal terms', () => {
  const seen = new Set();
  for (const e of entries) {
    assert.ok(!seen.has(e.uni), `duplicate: ${e.uni}`);
    seen.add(e.uni);
  }
});

test('every entry belongs to a category', () => {
  for (const e of entries) assert.ok(e.cat && e.pos, `${e.uni}: missing cat/pos`);
});
