import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOKS } from '../src/reference.js';
import { VERSE_COUNTS } from '../src/verse-counts.js';
import {
  parsePastoralBooksMarkdown,
  pastoralBooksAuditMarkdown,
  toPastoralBooksData,
  validatePastoralBooks,
} from './pastoral_books_parser.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(root, 'content/bible-study/books.ko.md');
const outputPath = resolve(root, 'public/data/pastoral-books.json');
const auditPath = resolve(root, 'PASTORAL_BOOKS_AUDIT.md');
const checking = process.argv.includes('--check');

const markdown = await readFile(sourcePath, 'utf8');
const parsed = parsePastoralBooksMarkdown(markdown);
const errors = validatePastoralBooks(parsed, BOOKS, VERSE_COUNTS);
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  const sourceHash = createHash('sha256').update(markdown).digest('hex');
  const data = toPastoralBooksData(parsed, BOOKS, VERSE_COUNTS, sourceHash);
  const json = `${JSON.stringify(data, null, 2)}\n`;
  const audit = pastoralBooksAuditMarkdown(data);

  if (checking) {
    const [existingJson, existingAudit] = await Promise.all([
      readFile(outputPath, 'utf8').catch(() => ''),
      readFile(auditPath, 'utf8').catch(() => ''),
    ]);
    if (existingJson !== json || existingAudit !== audit) {
      console.error('Pastoral book output is stale. Run npm run build:pastoral-books.');
      process.exitCode = 1;
    } else {
      console.log(`Pastoral books: ${data.coverage.books}/66, chapters ${data.coverage.chapters}/1189, required sections ${data.coverage.completeRequiredSections}/66`);
    }
  } else {
    await Promise.all([
      writeFile(outputPath, json, 'utf8'),
      writeFile(auditPath, audit, 'utf8'),
    ]);
    console.log(`Built ${outputPath} from ${sourcePath}`);
  }
}

