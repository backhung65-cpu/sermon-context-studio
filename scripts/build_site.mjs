import { cp, copyFile, mkdir, rm } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
if (relative(root, output) !== 'dist') throw new Error('Unexpected build target');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await mkdir(join(output, 'src'), { recursive: true });
await copyFile(join(root, 'index.html'), join(output, 'index.html'));
for (const file of ['main.js', 'reference.js', 'book-names.js', 'i18n.js', 'i18n-overrides.js', 'enrichment-i18n.js', 'journeys.js', 'journey-expansion.js', 'person-explorer.js', 'person-route-map.js', 'route-stop-candidates.js', 'verse-counts.js', 'notes.js', 'style.css']) {
  await copyFile(join(root, 'src', file), join(output, 'src', file));
}
await cp(join(root, 'public'), join(output, 'public'), { recursive: true, force: true });
console.log(`Built static site at ${output}`);
