import { readFileSync } from 'node:fs';
import { VERSE_COUNTS } from '../src/verse-counts.js';

const root = new URL('../public/data/kor1910/', import.meta.url);
const issues = [];
let chapterIssues = 0;
let matchingVerses = 0;
for (const [code, chapterCounts] of Object.entries(VERSE_COUNTS)) {
  const book = JSON.parse(readFileSync(new URL(`${code}.json`, root), 'utf8'));
  if (Object.keys(book).length !== chapterCounts.length) {
    issues.push(`${code}: ${Object.keys(book).length} chapters vs ${chapterCounts.length} KJV chapters`);
  }
  for (let chapter = 1; chapter <= chapterCounts.length; chapter += 1) {
    const rows = book[chapter] || {};
    const expected = chapterCounts[chapter - 1];
    if (Object.keys(rows).length !== expected) {
      chapterIssues += 1;
      const missing = Array.from({ length: expected }, (_, index) => index + 1).filter((verse) => !rows[verse]);
      issues.push(`${code} ${chapter}: ${Object.keys(rows).length}/${expected} verses; missing KJV numbers ${missing.join(',') || '(different numbering)'}`);
    } else matchingVerses += expected;
  }
}
console.log(`KJV-number-aligned chapters: ${matchingVerses} verses`);
console.log(`Chapters with numbering/coverage differences: ${chapterIssues}`);
issues.forEach((issue) => console.log(issue));
