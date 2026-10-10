import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPastoralStudy, observationLine, pastoralStudyCopy, pastoralStudyMarkdown } from './pastoral-study.js';

test('study sheet preserves exact verse order and does not turn shared verses into journeys', () => {
  const places = [
    { id: 'egypt', name: '애굽', candidateCount: 2, references: [{ chapter: 3, verse: 10 }] },
    { id: 'horeb', name: '호렙산', candidateCount: 3, references: [{ chapter: 3, verse: 1 }] },
    { id: 'midian', name: '미디안', candidateCount: 1, references: [{ chapter: 3, verse: 1 }] },
  ];
  const context = { roles: new Map([['horeb', 'scene'], ['midian', 'background'], ['egypt', 'discussed']]) };
  const study = buildPastoralStudy({ code: 'EXO' }, places, context, { scenes: [] });
  assert.deepEqual(study.verses.map(({ chapter, verse }) => `${chapter}:${verse}`), ['3:1', '3:10']);
  assert.equal(study.reviewedVerseCount, 1);
  assert.equal(study.candidatePlaceCount, 2);
  assert.equal(study.verses[0].places.find((place) => place.id === 'midian').role, 'background');
  assert.equal(study.verses[1].places[0].role, 'discussed');
});

test('only an exact reviewed scene is identified and a note keeps its verse', () => {
  const places = [{ id: 'troas', name: '드로아', references: [{ chapter: 16, verse: 8 }, { chapter: 16, verse: 11 }] }];
  const evidence = { scenes: [{ journey: { code: 'ACT' }, step: { chapter: 16, verse: 8, placeId: 'troas' } }] };
  const study = buildPastoralStudy({ code: 'ACT' }, places, null, evidence);
  assert.equal(study.verses[0].places[0].reviewed, true);
  assert.equal(study.verses[1].places[0].reviewed, false);
  assert.match(observationLine('사도행전', study.verses[0], study.verses[0].places[0], {
    reviewed: '검토된 장면', mention: '지명 언급', question: '문맥 확인',
  }), /사도행전 16:8 · 드로아 — 검토된 장면/);
  assert.deepEqual(buildPastoralStudy({ code: 'PSA' }, [], null, null).verses, []);
});

test('download includes every verse, source links, caution, and user notes', () => {
  const places = [{ id: 'troas', name: '드로아', candidateCount: 2,
    references: [{ chapter: 16, verse: 8 }, { chapter: 16, verse: 11 }] }];
  const study = buildPastoralStudy({ code: 'ACT' }, places, null, { scenes: [] });
  const markdown = pastoralStudyMarkdown('사도행전 16:6–15', '사도행전', study, pastoralStudyCopy('ko'),
    (chapter = 16, verse = 6) => `https://example.org/${chapter}/${verse}`, '회중 질문');
  assert.match(markdown, /사도행전 16:8 · 드로아/);
  assert.match(markdown, /사도행전 16:11 · 드로아/);
  assert.match(markdown, /https:\/\/example.org\/16\/11/);
  assert.match(markdown, /회중 질문/);
  assert.match(markdown, /OpenBible.info · CC BY 4.0/);
  assert.match(markdown, /지도는 지명 색인으로만/);
});

test('pastoral observation and export labels are present in every interface language', () => {
  const keys = Object.keys(pastoralStudyCopy('ko'));
  for (const locale of ['ko', 'en', 'ja', 'zh-CN', 'es', 'th', 'hi', 'fr', 'de']) {
    const copy = pastoralStudyCopy(locale);
    for (const key of keys) assert.equal(typeof copy[key], 'string', `${locale} ${key}`);
  }
});
