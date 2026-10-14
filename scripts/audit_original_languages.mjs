import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOKS } from '../src/reference.js';
import { VERSE_COUNTS } from '../src/verse-counts.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataRoot = join(root, 'public', 'data', 'original-language');
const checkOnly = process.argv.includes('--check');
const manifest = JSON.parse(await readFile(join(dataRoot, 'manifest.json'), 'utf8'));
const morphology = JSON.parse(await readFile(join(dataRoot, 'morphology.json'), 'utf8'));
const shards = {};
const errors = [];
const missingVerses = [];
const emptyBooks = [];
let tokenCount = 0;
let mappedTokens = 0;
let canonicalVerseRows = 0;

function hasMorphology(prefix, code) {
  if (morphology[`${prefix}:${code}`]) return true;
  return prefix === 'H' && code.includes('/') && code.split('/').every((part) => morphology[`H:${part.startsWith('H') ? part : `H${part}`}`]);
}

async function lemmaFor(strong) {
  const shard = `${strong[0]}${strong[1]}`;
  shards[shard] ||= JSON.parse(await readFile(join(dataRoot, 'lemmas', `${shard}.json`), 'utf8'));
  return shards[shard][strong];
}

for (const book of BOOKS) {
  const data = JSON.parse(await readFile(join(dataRoot, 'books', `${book.code}.json`), 'utf8'));
  if (!Object.keys(data.chapters).length) emptyBooks.push(book.code);
  const prefix = data.language === 'hebrew' ? 'H' : 'G';
  for (const [chapterText, chapterData] of Object.entries(data.chapters)) for (const [verseText, tokens] of Object.entries(chapterData)) {
    for (const token of tokens) {
      tokenCount += 1;
      if (!token.w || !token.s || !token.m) errors.push(`${book.code} ${chapterText}:${verseText} has incomplete token`);
      const lemma = await lemmaFor(token.s);
      if (!lemma) errors.push(`${book.code} ${chapterText}:${verseText} missing lemma ${token.s}`);
      if (hasMorphology(prefix, token.m)) mappedTokens += 1;
    }
  }
  for (let chapter = 1; chapter <= VERSE_COUNTS[book.code].length; chapter += 1) {
    const chapterData = data.chapters[chapter] || {};
    for (let verse = 1; verse <= VERSE_COUNTS[book.code][chapter - 1]; verse += 1) {
      const tokens = chapterData[verse] || [];
      if (!tokens.length) { missingVerses.push(`${book.code} ${chapter}:${verse}`); continue; }
      canonicalVerseRows += 1;
    }
  }
}

let indexedTokenCount = 0;
for (const shard of Object.values(shards)) for (const lemma of Object.values(shard)) {
  const referenceTotal = lemma.references.reduce((sum, ref) => sum + Number(ref[3]), 0);
  if (referenceTotal !== lemma.count) errors.push(`lemma count mismatch: ${lemma.lemma || 'unknown'}`);
  indexedTokenCount += lemma.count;
}

for (const sample of [
  ['GEN', 1, 1, 'בְּ/רֵאשִׁ֖ית'], ['JHN', 1, 1, 'Ἐν'],
]) {
  const [code, chapter, verse, word] = sample;
  const data = JSON.parse(await readFile(join(dataRoot, 'books', `${code}.json`), 'utf8'));
  if (data.chapters[chapter]?.[verse]?.[0]?.w !== word) errors.push(`sample mismatch: ${code} ${chapter}:${verse}`);
}

if (emptyBooks.length) errors.push(`empty books: ${emptyBooks.join(', ')}`);
if (manifest.totals.books !== 66) errors.push(`manifest books: ${manifest.totals.books}`);
if (manifest.totals.tokens !== tokenCount) errors.push(`token count: manifest ${manifest.totals.tokens}, audit ${tokenCount}`);
if (indexedTokenCount !== tokenCount) errors.push(`lemma index total: ${indexedTokenCount}, tokens ${tokenCount}`);

const report = `# 원어의 시대 데이터 감사\n\n- 원자료: STEPBible-Data \`${manifest.source.commit}\`\n- 이용 조건: ${manifest.source.license}\n- 성경 책: ${manifest.totals.books}권\n- 원어 단어: ${tokenCount.toLocaleString('en-US')}개\n- 표제어: ${manifest.totals.lemmas.toLocaleString('en-US')}개\n- 형태 코드 직접 대조: ${mappedTokens.toLocaleString('en-US')}개 (${(mappedTokens / tokenCount * 100).toFixed(2)}%)\n- 한국어 성경 장절 체계에서 원어 단어가 있는 절: ${canonicalVerseRows.toLocaleString('en-US')}절\n- 해당 체계에서 원어 단어가 없는 절: ${missingVerses.length}절\n- 신약 집계에서 제외한 TR 전용·기타 이문 단어 행: ${manifest.totals.skippedGreekVariantRows.toLocaleString('en-US')}개\n\n## 집계 기준\n\n- 구약은 TAHOT 레닌그라드 본문의 단어 행을 확장 Strong 표제어별로 셉니다.\n- 신약은 TAGNT 중 Nestle–Aland 계열을 뜻하는 N 또는 n 표지가 있는 단어만 셉니다.\n- 같은 표제어가 같은 절에 두 번 나오면 2회로 셉니다.\n- 시편의 표제 행(0절)은 원자료에는 보존하지만 한국어 성경 31,102절 대조 수치에서는 제외합니다.\n\n## 한국어 장절 체계와 다른 절\n\n${missingVerses.map((reference) => `- ${reference}`).join('\n')}\n\n## 판정\n\n${errors.length ? `실패: ${errors.join('; ')}` : '통과: 66권 파일, 단어→표제어 연결, 표제어 횟수 합계, 대표 원문을 확인했습니다.'}\n`;
if (!checkOnly) await writeFile(join(root, 'ORIGINAL_LANGUAGE_AUDIT.md'), report);
console.log(JSON.stringify({ books: manifest.totals.books, tokens: tokenCount, lemmas: manifest.totals.lemmas, canonicalVerseRows, missingVerses: missingVerses.length, mappedTokens, errors: errors.length }, null, 2));
if (errors.length) process.exitCode = 1;
