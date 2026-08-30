// Regenerates phrases.js from phrases.json so the app can run straight from
// the filesystem (a plain fetch() of phrases.json is blocked under file://).
// Usage: node tools/build-phrases.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = readFileSync(join(root, 'phrases.json'), 'utf8').trimEnd();

writeFileSync(
  join(root, 'phrases.js'),
  `// GENERATED FILE - edit phrases.json, then run: node tools/build-phrases.mjs\nconst PHRASE_DATA = ${data};\n`
);
console.log('Wrote phrases.js');
