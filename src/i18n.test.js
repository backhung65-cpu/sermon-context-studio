import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BOOK_NAMES } from './book-names.js';
import { LOCALES, MESSAGES, t } from './i18n.js';
import { formatReference, parseReference } from './reference.js';

test('all interface languages have complete translated messages and intact variables', () => {
  const source = JSON.parse(readFileSync(new URL('./i18n-source.json', import.meta.url), 'utf8'));
  const keys = Object.keys(source.en).sort();
  assert.deepEqual(Object.keys(LOCALES).sort(), Object.keys(MESSAGES).sort());
  for (const locale of Object.keys(LOCALES)) {
    assert.deepEqual(Object.keys(MESSAGES[locale]).sort(), keys, locale);
    for (const key of keys) {
      const variables = (value) => [...value.matchAll(/\{([a-z]+)\}/g)].map((match) => match[1]).sort();
      assert.deepEqual(variables(MESSAGES[locale][key]), variables(source.en[key]), `${locale}.${key}`);
      assert.ok(MESSAGES[locale][key].trim(), `${locale}.${key}`);
    }
  }
  assert.equal(t('fr', 'resultsFound', { reference: 'Actes 16', count: 3, mapped: 2 }).includes('Actes 16'), true);
});

test('all 66 displayed book names in each new language resolve to the same passage and note key', () => {
  for (const [locale, books] of Object.entries(BOOK_NAMES)) {
    assert.equal(Object.keys(books).length, 66, locale);
    for (const [code, book] of Object.entries(books)) {
      const parsed = parseReference(`${book.name} 1:1`);
      assert.equal(parsed.code, code, `${locale}: ${book.name}`);
      assert.equal(parseReference(formatReference(parsed, locale)).label, parsed.label, `${locale}: ${book.name}`);
    }
  }
});
