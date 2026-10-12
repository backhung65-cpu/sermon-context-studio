import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ERA_STUDIES } from './era-data.js';

test('era drafts cannot be presented as expert-reviewed without an attestation', () => {
  const html = readFileSync(new URL('../era.html', import.meta.url), 'utf8');
  const renderer = readFileSync(new URL('./era.js', import.meta.url), 'utf8');
  const signedOff = ERA_STUDIES.filter((study) => study.review?.reviewer && study.review?.reviewedAt);

  assert.equal(signedOff.length, 0, 'add a named reviewer and date before claiming expert review');
  assert.doesNotMatch(`${html}\n${renderer}`, /검수된|검수한|REVIEWED PASSAGES|본문 장면 검수/);
  assert.match(`${html}\n${renderer}`, /편집 초안/);
});
