// Builds the single-file Claude Artifact page from artifact/template.html by
// substituting the phrase data inline (the artifact sandbox cannot fetch a
// sibling JSON file). Usage: node tools/build-artifact.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const template = readFileSync(join(root, 'artifact/template.html'), 'utf8');
const data = JSON.parse(readFileSync(join(root, 'phrases.json'), 'utf8'));

writeFileSync(
  join(root, 'artifact/mandarin-drill.html'),
  template.replace('__PHRASE_DATA__', JSON.stringify(data, null, 2))
);
console.log('Wrote artifact/mandarin-drill.html');
