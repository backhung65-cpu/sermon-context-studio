import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { BOOKS } from '../src/reference.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(process.env.STEPBIBLE_DATA || 'C:/Temp/STEPBible-Data');
const outputRoot = join(root, 'public', 'data', 'original-language');
const sourceCommit = process.env.STEPBIBLE_COMMIT || '93ec3621485afd10fd45fcf43630d42de28d8eb8';
const strongsRoot = resolve(process.env.OPEN_SCRIPTURES_STRONGS || 'C:/Temp/openscriptures-strongs');
const strongsCommit = process.env.OPEN_SCRIPTURES_STRONGS_COMMIT || '0acd2f251c2d35ff8db2dece4e0593979d3ac223';

if (!existsSync(sourceRoot)) {
  throw new Error(`STEPBible-Data source not found: ${sourceRoot}`);
}

const stepToCode = Object.fromEntries([
  ['Gen', 'GEN'], ['Exo', 'EXO'], ['Lev', 'LEV'], ['Num', 'NUM'], ['Deu', 'DEU'], ['Jos', 'JOS'], ['Jdg', 'JDG'], ['Rut', 'RUT'],
  ['1Sa', '1SA'], ['2Sa', '2SA'], ['1Ki', '1KI'], ['2Ki', '2KI'], ['1Ch', '1CH'], ['2Ch', '2CH'], ['Ezr', 'EZR'], ['Neh', 'NEH'],
  ['Est', 'EST'], ['Job', 'JOB'], ['Psa', 'PSA'], ['Pro', 'PRO'], ['Ecc', 'ECC'], ['Sng', 'SNG'], ['Isa', 'ISA'], ['Jer', 'JER'],
  ['Lam', 'LAM'], ['Ezk', 'EZK'], ['Dan', 'DAN'], ['Hos', 'HOS'], ['Jol', 'JOL'], ['Amo', 'AMO'], ['Oba', 'OBA'], ['Jon', 'JON'],
  ['Mic', 'MIC'], ['Nam', 'NAM'], ['Hab', 'HAB'], ['Zep', 'ZEP'], ['Hag', 'HAG'], ['Zec', 'ZEC'], ['Mal', 'MAL'],
  ['Mat', 'MAT'], ['Mrk', 'MRK'], ['Luk', 'LUK'], ['Jhn', 'JHN'], ['Act', 'ACT'], ['Rom', 'ROM'], ['1Co', '1CO'], ['2Co', '2CO'],
  ['Gal', 'GAL'], ['Eph', 'EPH'], ['Php', 'PHP'], ['Col', 'COL'], ['1Th', '1TH'], ['2Th', '2TH'], ['1Ti', '1TI'], ['2Ti', '2TI'],
  ['Tit', 'TIT'], ['Phm', 'PHM'], ['Heb', 'HEB'], ['Jas', 'JAS'], ['1Pe', '1PE'], ['2Pe', '2PE'], ['1Jn', '1JN'], ['2Jn', '2JN'],
  ['3Jn', '3JN'], ['Jud', 'JUD'], ['Rev', 'REV'],
]);

const sourceDir = join(sourceRoot, 'Translators Amalgamated OT+NT');
const sourceFiles = [
  'TAHOT Gen-Deu - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt',
  'TAHOT Jos-Est - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt',
  'TAHOT Job-Sng - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt',
  'TAHOT Isa-Mal - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt',
  'TAGNT Mat-Jhn - Translators Amalgamated Greek NT - STEPBible.org CC-BY.txt',
  'TAGNT Act-Rev - Translators Amalgamated Greek NT - STEPBible.org CC-BY.txt',
];

const morphologyFiles = {
  H: join(sourceRoot, 'Morphology codes', 'TEHMC - Translators Expansion of Hebrew Morphology Codes - STEPBible.org CC BY.txt'),
  G: join(sourceRoot, 'Morphology codes', 'TEGMC - Translators Expansion of Greek Morphhology Codes - STEPBible.org CC BY.txt'),
};

const lexiconFiles = {
  H: join(sourceRoot, 'Lexicons', 'TBESH - Translators Brief lexicon of Extended Strongs for Hebrew - STEPBible.org CC BY.txt'),
  G: join(sourceRoot, 'Lexicons', 'TBESG - Translators Brief lexicon of Extended Strongs for Greek - STEPBible.org CC BY.txt'),
};

function cleanHtml(value = '') {
  return value.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function stripHebrewPunctuation(value = '') {
  return value.replace(/[׃־]/g, '').trim();
}

function normalizeStrong(value = '') {
  return value.match(/[HG]\d{4}[A-Z]?/)?.[0] || '';
}

function canonicalBaseStrong(value = '') {
  const match = String(value).match(/([HG])0*(\d{1,5})/i);
  return match ? `${match[1].toUpperCase()}${Number(match[2])}` : '';
}

function strongReferences(value = '') {
  return [...new Set([...String(value).matchAll(/\b([HG])0*(\d{1,5})\b/gi)].map((match) => `${match[1].toUpperCase()}${Number(match[2])}`))];
}

function loadStrongsRelations() {
  if (!existsSync(strongsRoot)) return { dictionary: {}, reverse: {} };
  const require = createRequire(import.meta.url);
  const hebrew = require(join(strongsRoot, 'hebrew', 'strongs-hebrew-dictionary.js'));
  const greek = require(join(strongsRoot, 'greek', 'strongs-greek-dictionary.js'));
  const dictionary = {};
  const reverse = {};
  for (const [rawStrong, entry] of Object.entries({ ...hebrew, ...greek })) {
    const strong = canonicalBaseStrong(rawStrong);
    if (!strong) continue;
    const parents = strongReferences(entry.derivation).filter((id) => id !== strong);
    dictionary[strong] = {
      lemma: entry.lemma || '', transliteration: entry.xlit || entry.translit || '', pronunciation: entry.pron || '',
      derivation: entry.derivation || '', definition: entry.strongs_def?.trim() || '', kjv: entry.kjv_def || '', parents,
    };
    for (const parent of parents) {
      reverse[parent] ||= [];
      reverse[parent].push(strong);
    }
  }
  for (const children of Object.values(reverse)) children.sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  return { dictionary, reverse };
}

async function parseMorphologies() {
  const result = {};
  for (const [language, file] of Object.entries(morphologyFiles)) {
    const lines = (await readFile(file, 'utf8')).split(/\r?\n/);
    for (const line of lines) {
      const fields = line.split('\t');
      const code = fields[0]?.trim();
      const expansion = (fields[1]?.includes('=') ? fields[1] : fields[2])?.trim();
      const gloss = fields[1]?.includes('=') ? '' : fields[1]?.trim();
      if (!code || !expansion || (!code.startsWith('H') && language === 'H')) continue;
      result[`${language}:${code}`] = { gloss: gloss || '', expansion };
    }
  }
  return result;
}

async function parseLexicons() {
  const result = {};
  for (const [language, file] of Object.entries(lexiconFiles)) {
    const lines = (await readFile(file, 'utf8')).split(/\r?\n/);
    for (const line of lines) {
      const fields = line.split('\t');
      if (!new RegExp(`^${language}\\d{4}`).test(fields[0] || '')) continue;
      if (language === 'H') {
        const [eStrong, dStrongText, , lemma, transliteration, morph, gloss] = fields;
        const ids = new Set([normalizeStrong(eStrong), ...(dStrongText?.match(/H\d{4}[A-Z]?/g) || [])]);
        for (const id of ids) if (id) result[id] = {
          lemma: stripHebrewPunctuation(lemma), transliteration: transliteration?.trim() || '', morph: morph?.trim() || '',
          gloss: gloss?.trim() || '',
        };
      } else {
        // The Greek lexicon is wide and occasionally contains metadata rows. Locate stable fields from its header.
        const eStrong = normalizeStrong(fields[0]);
        const dStrongText = fields[1] || '';
        const ids = new Set([eStrong, ...(dStrongText.match(/G\d{4}[A-Z]?/g) || [])]);
        const lemmaIndex = fields.findIndex((value) => /[\u0370-\u03ff]/.test(value || ''));
        const lemma = lemmaIndex >= 0 ? fields[lemmaIndex].trim() : '';
        const transliteration = lemmaIndex >= 0 ? (fields[lemmaIndex + 1] || '').trim() : '';
        const gloss = lemmaIndex >= 0 ? (fields[lemmaIndex + 3] || fields[lemmaIndex + 2] || '').trim() : '';
        for (const id of ids) if (id) result[id] = { lemma, transliteration, gloss };
      }
    }
  }
  return result;
}

const morphologies = await parseMorphologies();
const lexicons = await parseLexicons();
const strongsRelations = loadStrongsRelations();
const books = Object.fromEntries(BOOKS.map((book) => [book.code, { code: book.code, name: book.name, language: BOOKS.findIndex((b) => b.code === book.code) < 39 ? 'hebrew' : 'greek', chapters: {} }]));
const lemmaIndex = {};
const verseSeen = new Map();
let tokenCount = 0;
let skippedVariants = 0;

function addOccurrence(strong, code, chapter, verse, token) {
  if (!strong) return;
  if (!lemmaIndex[strong]) lemmaIndex[strong] = { count: 0, verses: new Map(), forms: new Map(), morphologies: new Map() };
  lemmaIndex[strong].count += 1;
  const key = `${code}.${chapter}.${verse}`;
  lemmaIndex[strong].verses.set(key, (lemmaIndex[strong].verses.get(key) || 0) + 1);
  const formKey = `${token.w}\u0001${token.t || ''}\u0001${token.m || ''}`;
  lemmaIndex[strong].forms.set(formKey, (lemmaIndex[strong].forms.get(formKey) || 0) + 1);
  lemmaIndex[strong].morphologies.set(token.m || '', (lemmaIndex[strong].morphologies.get(token.m || '') || 0) + 1);
}

for (const filename of sourceFiles) {
  const isHebrew = filename.startsWith('TAHOT');
  const lines = (await readFile(join(sourceDir, filename), 'utf8')).split(/\r?\n/);
  for (const line of lines) {
    if (!/^[123]?[A-Z][a-z]{1,2}\.\d+\.\d+(?:\([^)]*\))?#\d+=/.test(line)) continue;
    const fields = line.split('\t');
    const match = fields[0].match(/^([123]?[A-Za-z]{2,3})\.(\d+)\.(\d+)(?:\([^)]*\))?#(\d+)=([^\s\[]+)/);
    if (!match) continue;
    const [, stepBook, chapterText, verseText, wordText, wordType] = match;
    const code = stepToCode[stepBook];
    if (!code) throw new Error(`Unknown STEPBible book code: ${stepBook}`);
    if (!isHebrew && !/[Nn]/.test(wordType)) {
      skippedVariants += 1;
      continue;
    }
    const chapter = Number(chapterText);
    const verse = Number(verseText);
    const word = Number(wordText);
    let token;
    if (isHebrew) {
      const strong = normalizeStrong(fields[8] || fields[4]);
      const lexicon = lexicons[strong] || {};
      token = {
        n: word, w: fields[1]?.replace(/\\/g, '').trim() || '', t: fields[2]?.trim() || '', x: fields[3]?.trim() || '',
        s: strong, l: lexicon.lemma || '', m: fields[5]?.trim() || '',
      };
    } else {
      const [strongPart, ...grammarParts] = (fields[3] || '').split('=');
      const strong = normalizeStrong(strongPart);
      const surfaceMatch = (fields[1] || '').trim().match(/^(.*?)\s+\(([^()]*)\)$/);
      const [lemma = '', dictionaryGloss = ''] = (fields[4] || '').split(/=(.*)/s);
      token = {
        n: word, w: surfaceMatch?.[1] || (fields[1]?.trim() || ''), t: surfaceMatch?.[2] || '', x: fields[2]?.trim() || '',
        s: strong, l: lemma.trim(), m: grammarParts.join('=').trim(), d: dictionaryGloss.trim(),
      };
    }
    if (!token.s) continue;
    books[code].chapters[chapter] ||= {};
    books[code].chapters[chapter][verse] ||= [];
    books[code].chapters[chapter][verse].push(token);
    tokenCount += 1;
    addOccurrence(token.s, code, chapter, verse, token);
    verseSeen.set(`${code}.${chapter}.${verse}`, true);
  }
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(join(outputRoot, 'books'), { recursive: true });
await mkdir(join(outputRoot, 'lemmas'), { recursive: true });
await mkdir(join(outputRoot, 'strongs'), { recursive: true });

for (const book of Object.values(books)) {
  await writeFile(join(outputRoot, 'books', `${book.code}.json`), JSON.stringify(book));
}

const shards = {};
for (const [strong, occurrence] of Object.entries(lemmaIndex)) {
  const lexicon = lexicons[strong] || {};
  const shard = `${strong[0]}${strong.slice(1, 2)}`;
  shards[shard] ||= {};
  shards[shard][strong] = {
    ...lexicon,
    count: occurrence.count,
    references: [...occurrence.verses.entries()].map(([reference, count]) => [...reference.split('.'), count]),
    forms: [...occurrence.forms.entries()].map(([form, count]) => [...form.split('\u0001'), count]).sort((a, b) => b[3] - a[3] || a[0].localeCompare(b[0])),
    morphologyCounts: [...occurrence.morphologies.entries()].sort((a, b) => b[1] - a[1]),
  };
}
for (const [shard, data] of Object.entries(shards)) {
  await writeFile(join(outputRoot, 'lemmas', `${shard}.json`), JSON.stringify(data));
}

for (const prefix of ['H', 'G']) {
  const data = {};
  for (const [strong, entry] of Object.entries(strongsRelations.dictionary)) {
    if (!strong.startsWith(prefix)) continue;
    data[strong] = { ...entry, children: strongsRelations.reverse[strong] || [] };
  }
  await writeFile(join(outputRoot, 'strongs', `${prefix}.json`), JSON.stringify(data));
}

const usedMorphologies = {};
let mappedMorphologyTokens = 0;
function morphologyParts(prefix, code) {
  if (morphologies[`${prefix}:${code}`]) return [code];
  if (prefix === 'H' && code.includes('/')) return code.split('/').map((part) => part.startsWith('H') ? part : `H${part}`);
  return [code];
}
for (const book of Object.values(books)) {
  const prefix = book.language === 'hebrew' ? 'H' : 'G';
  for (const chapter of Object.values(book.chapters)) for (const verse of Object.values(chapter)) for (const token of verse) {
    const parts = morphologyParts(prefix, token.m);
    const infos = parts.map((part) => [part, morphologies[`${prefix}:${part}`]]);
    if (infos.every(([, info]) => info)) {
      for (const [part, info] of infos) usedMorphologies[`${prefix}:${part}`] = info;
      mappedMorphologyTokens += 1;
    }
  }
}
await writeFile(join(outputRoot, 'morphology.json'), JSON.stringify(usedMorphologies));

const generatedAt = new Date().toISOString();
const manifest = {
  title: '원어의 시대 데이터 매니페스트',
  generatedAt,
  source: {
    name: 'STEPBible-Data', repository: 'https://github.com/STEPBible/STEPBible-Data', commit: sourceCommit,
    license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    datasets: ['TAHOT', 'TAGNT', 'TEHMC', 'TEGMC', 'TBESH', 'TBESG'],
  },
  derivationSource: existsSync(strongsRoot) ? {
    name: "Open Scriptures Strong's Dictionaries", repository: 'https://github.com/openscriptures/strongs', commit: strongsCommit,
    license: 'CC BY-SA', note: '1890/1894 Strong 사전의 Open Scriptures 교정 JSON 판. 파생 설명은 역사적 사전 원문이며 현대 어원 연구의 최종 결론으로 사용하지 않습니다.',
  } : null,
  countPolicy: {
    hebrew: 'TAHOT의 레닌그라드 본문 단어 행을 집계합니다.',
    greek: 'TAGNT에서 Nestle-Aland 계열(N 또는 n 표지)에 포함된 단어만 집계합니다. KJV/TR 전용 및 기타 이문은 제외합니다.',
    unit: '같은 어휘 표제어(확장 Strong 식별자)의 출현 단어 수입니다. 같은 절에 두 번 나오면 2회로 셉니다.',
  },
  totals: { books: Object.values(books).filter((book) => Object.keys(book.chapters).length).length, verseRows: verseSeen.size, canonicalVerseRows: [...verseSeen.keys()].filter((key) => !key.endsWith('.0')).length, tokens: tokenCount, lemmas: Object.keys(lemmaIndex).length, morphologyMappedTokens: mappedMorphologyTokens, skippedGreekVariantRows: skippedVariants, strongsDictionaryEntries: Object.keys(strongsRelations.dictionary).length },
  files: sourceFiles.map((name) => basename(name)),
};
await writeFile(join(outputRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify(manifest.totals, null, 2));
