import test from 'node:test';
import assert from 'node:assert/strict';
import { dictionaryPlainText, geographyNoteCopy, noteForPlace } from './geography-notes.js';

test('dictionary note requires the same pinned atlas version and a linked verse', () => {
  const payload = { placeSourceCommit: 'atlas-a', notes: {
    horeb: { sourceName: 'Horeb', sharedVerses: 16, paragraphs: ['Historical text'] },
    unlinked: { sourceName: 'Unlinked', sharedVerses: 0, paragraphs: ['Text'] },
  } };
  assert.equal(noteForPlace(payload, 'atlas-a', 'horeb')?.sourceName, 'Horeb');
  assert.equal(noteForPlace(payload, 'atlas-b', 'horeb'), null);
  assert.equal(noteForPlace(payload, 'atlas-a', 'unlinked'), null);
});

test('dictionary cross references display as readable text without source markdown links', () => {
  assert.equal(dictionaryPlainText('near [Ex. 3:1](/exod#Exod.3.1)  and Sinai.'), 'near Ex. 3:1 and Sinai.');
});

test('historical dictionary warnings appear in every interface language', () => {
  for (const locale of ['ko', 'en', 'ja', 'zh-CN', 'es', 'th', 'hi', 'fr', 'de']) {
    const copy = geographyNoteCopy(locale);
    assert.ok(copy.title && copy.original && copy.caution && copy.source && copy.data, locale);
  }
});
