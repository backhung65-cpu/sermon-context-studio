import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { BOOKS, formatReference, parseReference } from '../src/reference.js';
import { VERSE_COUNTS } from '../src/verse-counts.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const inputRoot = join(root, 'content', 'commentaries', 'library');
const outputRoot = join(root, 'public', 'data', 'commentaries');
const checkOnly = process.argv.includes('--check');
const supported = new Set(['.md', '.pdf']);

function cleanScalar(value = '') {
  return String(value).trim().replace(/^['"]|['"]$/g, '');
}

function parseFrontMatter(text) {
  if (!text.startsWith('---')) return { metadata: {}, body: text };
  const end = text.indexOf('\n---', 3);
  if (end < 0) return { metadata: {}, body: text };
  const metadata = {};
  for (const line of text.slice(3, end).split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (match) metadata[match[1]] = cleanScalar(match[2]);
  }
  return { metadata, body: text.slice(end + 4).replace(/^\s+/, '') };
}

function plainMarkdown(text = '') {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function metadataReferences(metadata) {
  return String(metadata.references || metadata.reference || '').split(';').map((value) => value.trim()).filter(Boolean);
}

function filenameReference(path) {
  const candidate = basename(path, extname(path)).split('__')[0].replaceAll('_', ' ').trim();
  const parsed = parseReference(candidate);
  return parsed.error ? null : candidate;
}

function normalizedRange(input, context) {
  const parsed = parseReference(input);
  if (parsed.error) throw new Error(`${context}: 장절을 읽을 수 없습니다 (${input})`);
  const lastVerse = (chapter) => VERSE_COUNTS[parsed.code]?.[chapter - 1] || 0;
  const startVerse = parsed.startVerse || 1;
  const endVerse = parsed.endVerse || lastVerse(parsed.endChapter);
  if (!lastVerse(parsed.chapter)
    || !lastVerse(parsed.endChapter)
    || startVerse < 1
    || startVerse > lastVerse(parsed.chapter)
    || endVerse < 1
    || endVerse > lastVerse(parsed.endChapter)
    || parsed.endChapter < parsed.chapter
    || (parsed.endChapter === parsed.chapter && endVerse < startVerse)) {
    throw new Error(`${context}: 장절 범위를 벗어났습니다 (${input})`);
  }
  return { code: parsed.code, chapter: parsed.chapter, startVerse, endChapter: parsed.endChapter, endVerse, label: formatReference(parsed, 'ko') };
}

function sectionMarkers(body) {
  const regex = /^#{1,6}\s*\[([^\]]+)\]\s*(.*)$/gm;
  const matches = [...body.matchAll(regex)];
  return matches.map((match, index) => ({
    reference: match[1].trim(), title: match[2].trim(),
    body: body.slice(match.index + match[0].length, matches[index + 1]?.index ?? body.length).trim(),
  }));
}

async function pdfPages(path) {
  const bytes = new Uint8Array(await readFile(path));
  const document = await getDocument({ data: bytes, useWorkerFetch: false, isEvalSupported: false }).promise;
  const pages = [];
  for (let number = 1; number <= document.numPages; number += 1) {
    const page = await document.getPage(number);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(' ').replace(/\s+/g, ' ').trim();
    pages.push(text);
  }
  await document.destroy();
  return pages;
}

function pageNumbers(value, total) {
  if (!value) return Array.from({ length: total }, (_, index) => index + 1);
  const result = new Set();
  for (const part of String(value).split(',')) {
    const match = part.trim().match(/^(\d+)(?:-(\d+))?$/);
    if (!match) throw new Error(`PDF 페이지 표기가 잘못되었습니다 (${value})`);
    const start = Number(match[1]);
    const end = Number(match[2] || match[1]);
    if (start < 1 || end < start || end > total) throw new Error(`PDF 페이지 범위를 벗어났습니다 (${value}, 전체 ${total}쪽)`);
    for (let page = start; page <= end; page += 1) result.add(page);
  }
  return [...result].sort((a, b) => a - b);
}

async function optionalJson(path) {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

async function walk(directory) {
  const result = [];
  try {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) result.push(...await walk(path));
      else if (supported.has(extname(entry.name).toLowerCase())) result.push(path);
    }
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  return result;
}

function baseMetadata(path, metadata = {}) {
  const fallbackTitle = basename(path, extname(path)).split('__').slice(1).join(' ') || basename(path, extname(path));
  return {
    title: metadata.title || fallbackTitle,
    author: metadata.author || '저자 미기재', source: metadata.source || '',
    license: metadata.license || '이용 조건 미기재', language: metadata.language || 'ko',
    publisher: metadata.publisher || '', year: metadata.year || '',
  };
}

function makeRecord(path, metadata, section, index, extra = {}) {
  const range = normalizedRange(section.reference, relative(root, path));
  const id = createHash('sha256').update(`${relative(root, path)}:${index}:${section.reference}`).digest('hex').slice(0, 16);
  return { id, ...baseMetadata(path, metadata), ...range, sectionTitle: section.title || '', text: section.body.trim(), fileType: extname(path).slice(1).toLowerCase(), sourceFile: relative(inputRoot, path).replaceAll('\\', '/'), ...extra };
}

async function importMarkdown(path) {
  const { metadata, body } = parseFrontMatter(await readFile(path, 'utf8'));
  const markers = sectionMarkers(body);
  const refs = metadataReferences(metadata);
  const fallback = filenameReference(path);
  const sections = markers.length ? markers : (refs.length ? refs : fallback ? [fallback] : []).map((reference) => ({ reference, title: '', body }));
  if (!sections.length) throw new Error(`${relative(root, path)}: [장절] 머리말, front matter reference, 또는 파일명 장절이 필요합니다.`);
  return sections.map((section, index) => makeRecord(path, metadata, { ...section, body: plainMarkdown(section.body) }, index));
}

async function importPdf(path) {
  const pages = await pdfPages(path);
  if (!pages.some(Boolean)) throw new Error(`${relative(root, path)}: 글자층이 없는 PDF입니다. OCR 후 다시 넣어 주세요.`);
  const sidecar = await optionalJson(`${path}.index.json`) || await optionalJson(path.replace(/\.pdf$/i, '.index.json'));
  const metadata = sidecar || {};
  const fallback = filenameReference(path);
  const sections = sidecar?.sections?.length ? sidecar.sections : fallback ? [{ reference: fallback, pages: `1-${pages.length}` }] : [];
  if (!sections.length) throw new Error(`${relative(root, path)}: 같은 이름의 .index.json 또는 파일명 장절이 필요합니다.`);
  return sections.map((section, index) => {
    const selected = pageNumbers(section.pages, pages.length);
    if (!selected.length) throw new Error(`${relative(root, path)}: PDF 페이지 범위가 비었습니다 (${section.pages})`);
    return makeRecord(path, metadata, { reference: section.reference, title: section.title || '', body: selected.map((page) => pages[page - 1]).join('\n\n') }, index, { pages: selected });
  });
}

const paths = await walk(inputRoot);
const records = [];
const errors = [];
for (const path of paths) {
  try { records.push(...(extname(path).toLowerCase() === '.md' ? await importMarkdown(path) : await importPdf(path))); }
  catch (error) { errors.push(error.message); }
}

records.sort((a, b) => a.code.localeCompare(b.code) || a.chapter - b.chapter || a.startVerse - b.startVerse || a.title.localeCompare(b.title));
const byBook = Object.fromEntries(BOOKS.map((book) => [book.code, []]));
for (const record of records) byBook[record.code].push(record);
const manifest = {
  generatedAt: new Date().toISOString(), importer: 'deterministic-no-ai',
  bookCodes: Object.entries(byBook).filter(([, rows]) => rows.length).map(([code]) => code),
  totals: {
    scannedFiles: paths.length,
    files: new Set(records.map((record) => record.sourceFile)).size,
    records: records.length,
    books: Object.values(byBook).filter((rows) => rows.length).length,
    errors: errors.length,
  },
  errors,
};

if (!checkOnly) {
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(join(outputRoot, 'books'), { recursive: true });
  for (const [code, rows] of Object.entries(byBook)) {
    if (rows.length) await writeFile(join(outputRoot, 'books', `${code}.json`), JSON.stringify(rows));
  }
  await writeFile(join(outputRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));
  const audit = `# 사용자 주석 자료 색인 보고서\n\n- 처리 방식: AI를 사용하지 않는 파일 추출·장절 색인\n- 발견한 MD·PDF: ${manifest.totals.scannedFiles}개\n- 색인 성공 파일: ${manifest.totals.files}개\n- 장절 연결 주석: ${manifest.totals.records}건\n- 연결 성경: ${manifest.totals.books}권\n- 오류: ${manifest.totals.errors}건\n\n## 오류\n\n${errors.length ? errors.map((error) => `- ${error}`).join('\n') : '- 없음'}\n`;
  await writeFile(join(root, 'COMMENTARY_LIBRARY_AUDIT.md'), audit);
}
console.log(JSON.stringify(manifest, null, 2));
if (errors.length) process.exitCode = 1;
