import test from 'node:test';
import assert from 'node:assert/strict';
import { ERA_LOCALES, ERA_MESSAGES, eraText } from './era-i18n.js';

const REQUIRED_KEYS = [
  'title', 'navPlaces', 'navJourneys', 'navEra', 'hero1', 'hero2', 'lead',
  'search', 'sectionTitle', 'readerTitle', 'notesTitle', 'sourcesTitle',
  'memoTitle', 'koreanGuideNotice', 'bibleTextLanguage', 'bookGuideSourceLanguage',
];

test('time-and-setting page supports the same nine interface languages', () => {
  assert.deepEqual(Object.keys(ERA_LOCALES), ['ko', 'en', 'ja', 'zh-CN', 'es', 'th', 'hi', 'fr', 'de']);
  for (const locale of Object.keys(ERA_LOCALES)) {
    assert.ok(ERA_MESSAGES[locale], `${locale} message catalog is missing`);
    for (const key of REQUIRED_KEYS) {
      assert.equal(typeof ERA_MESSAGES[locale][key], 'string', `${locale}.${key} is missing`);
      if (!(locale === 'ko' && key === 'koreanGuideNotice')) assert.ok(ERA_MESSAGES[locale][key].trim(), `${locale}.${key} is empty`);
    }
  }
});

test('time-and-setting messages preserve interpolation values', () => {
  assert.equal(eraText('en', 'curatedSubtitle', { reference: 'Exodus 3', count: 4 }), 'Exodus 3 · 4 scene summaries');
  assert.match(eraText('ko', 'sourceRangeLinkNote', { count: 8 }), /8장/);
});

test('non-Korean interfaces disclose the source language of Korean editorial drafts', () => {
  for (const locale of Object.keys(ERA_LOCALES).filter((code) => code !== 'ko')) {
    assert.ok(eraText(locale, 'koreanGuideNotice').trim(), `${locale} source-language notice is missing`);
  }
});
