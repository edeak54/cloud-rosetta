#!/usr/bin/env node
/** Cloud Rosetta build: assemble src/ + data/ into a single-file dist/index.html. */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const entries = JSON.parse(read('data/entries.json'));
const styles = read('src/styles.css');
const app = read('src/app.js');
const template = read('src/template.html');

// sanity: fail the build on malformed data, never ship a broken dictionary
for (const [i, e] of entries.entries()) {
  for (const key of ['uni', 'pos', 'cat', 'aws', 'azure', 'gcp', 'usage', 'tf']) {
    if (!(key in e)) throw new Error(`entry ${i} ("${e.uni || '?'}") missing "${key}"`);
  }
}

const dataJs = `const DATA = ${JSON.stringify(entries)};`;
const html = template
  .replace('/*__STYLES__*/', () => styles)
  .replace('/*__DATA__*/', () => dataJs)
  .replace('/*__APP__*/', () => app);

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'index.html'), html);
console.log(`built dist/index.html — ${entries.length} entries, ${(html.length / 1024).toFixed(1)} KB, zero runtime dependencies`);
