const REQUIRED_SECTIONS = ['읽기 방향', '큰 흐름', '설교 준비 질문', '해석 주의'];
const REQUIRED_FIELDS = ['testament', 'genre', 'status', 'review'];

function parseFrontmatter(lines) {
  if (lines[0] !== '---') throw new Error('Markdown frontmatter must start with ---');
  const end = lines.indexOf('---', 1);
  if (end < 0) throw new Error('Markdown frontmatter is not closed');
  const meta = {};
  for (const line of lines.slice(1, end)) {
    const match = line.match(/^([a-z_]+):\s*(.+)$/);
    if (!match) throw new Error(`Invalid frontmatter line: ${line}`);
    meta[match[1]] = match[2].trim();
  }
  return { meta, bodyStart: end + 1 };
}

export function parsePastoralBooksMarkdown(markdown) {
  const lines = markdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  const { meta, bodyStart } = parseFrontmatter(lines);
  const books = [];
  let book = null;
  let section = null;

  const flushSection = () => {
    if (!book || !section) return;
    book.sections[section.name] = section.lines.join('\n').trim();
    section = null;
  };
  const flushBook = () => {
    flushSection();
    if (book) books.push(book);
    book = null;
  };

  for (const rawLine of lines.slice(bodyStart)) {
    const bookHeading = rawLine.match(/^##\s+([1-3A-Z]{3})\s+\|\s+(.+)$/);
    if (bookHeading) {
      flushBook();
      book = { code: bookHeading[1], name: bookHeading[2].trim(), fields: {}, sections: {} };
      continue;
    }
    if (!book) continue;

    const sectionHeading = rawLine.match(/^###\s+(.+)$/);
    if (sectionHeading) {
      flushSection();
      section = { name: sectionHeading[1].trim(), lines: [] };
      continue;
    }

    if (!section) {
      const field = rawLine.match(/^-\s+([a-z_]+):\s*(.+)$/);
      if (field) book.fields[field[1]] = field[2].trim();
      else if (rawLine.trim()) throw new Error(`${book.code}: unexpected line before sections: ${rawLine}`);
      continue;
    }
    section.lines.push(rawLine);
  }
  flushBook();
  return { meta, books };
}

export function validatePastoralBooks(parsed, canonicalBooks, verseCounts) {
  const errors = [];
  const expectedMeta = {
    schema: 'pastoral-books/v1', language: 'ko', status: 'editorial-draft', review: 'pending',
  };
  for (const [key, value] of Object.entries(expectedMeta)) {
    if (parsed.meta[key] !== value) errors.push(`frontmatter ${key} must be ${value}`);
  }

  const expectedCodes = canonicalBooks.map(({ code }) => code);
  const actualCodes = parsed.books.map(({ code }) => code);
  if (new Set(actualCodes).size !== actualCodes.length) errors.push('duplicate Bible book code');
  if (actualCodes.join(',') !== expectedCodes.join(',')) errors.push('book order or 66-book coverage does not match the canonical app order');

  for (const item of parsed.books) {
    const canonical = canonicalBooks.find(({ code }) => code === item.code);
    if (!canonical) {
      errors.push(`${item.code}: unknown book code`);
      continue;
    }
    if (item.name !== canonical.name) errors.push(`${item.code}: expected Korean name ${canonical.name}, got ${item.name}`);
    for (const field of REQUIRED_FIELDS) {
      if (!item.fields[field]) errors.push(`${item.code}: missing ${field}`);
    }
    if (item.fields.testament !== (expectedCodes.indexOf(item.code) < 39 ? 'OT' : 'NT')) {
      errors.push(`${item.code}: incorrect testament`);
    }
    if (item.fields.status !== 'editorial-draft') errors.push(`${item.code}: status must remain editorial-draft until reviewed`);
    if (item.fields.review !== 'pending') errors.push(`${item.code}: review must remain pending until reviewed`);
    for (const name of REQUIRED_SECTIONS) {
      const value = item.sections[name] || '';
      if (value.length < 20) errors.push(`${item.code}: ${name} is missing or too short`);
      if (/TODO|TBD|작성\s*대기|나중에/i.test(value)) errors.push(`${item.code}: ${name} contains a placeholder`);
    }
    const extraSections = Object.keys(item.sections).filter((name) => !REQUIRED_SECTIONS.includes(name));
    if (extraSections.length) errors.push(`${item.code}: unknown sections ${extraSections.join(', ')}`);
    if (!Array.isArray(verseCounts[item.code]) || verseCounts[item.code].length < 1) {
      errors.push(`${item.code}: chapter metadata is unavailable`);
    }
  }
  return errors;
}

export function toPastoralBooksData(parsed, canonicalBooks, verseCounts, sourceHash) {
  const byCode = new Map(parsed.books.map((item) => [item.code, item]));
  const books = canonicalBooks.map(({ code, name }) => {
    const item = byCode.get(code);
    return {
      code,
      name,
      chapterCount: verseCounts[code].length,
      testament: item.fields.testament,
      genre: item.fields.genre,
      status: item.fields.status,
      review: item.fields.review,
      readingDirection: item.sections['읽기 방향'],
      bigFlow: item.sections['큰 흐름'],
      sermonQuestion: item.sections['설교 준비 질문'],
      interpretationCaution: item.sections['해석 주의'],
    };
  });
  return {
    schema: parsed.meta.schema,
    language: parsed.meta.language,
    sourceBasis: parsed.meta.source_basis,
    sourceFile: 'content/bible-study/books.ko.md',
    sourceSha256: sourceHash,
    coverage: {
      books: books.length,
      chapters: books.reduce((sum, item) => sum + item.chapterCount, 0),
      completeRequiredSections: books.filter((item) => REQUIRED_SECTIONS.every((_, index) => [item.readingDirection, item.bigFlow, item.sermonQuestion, item.interpretationCaution][index])).length,
      status: 'editorial-draft',
      review: 'pending',
    },
    books,
  };
}

export function pastoralBooksAuditMarkdown(data) {
  const ot = data.books.filter(({ testament }) => testament === 'OT').length;
  const nt = data.books.filter(({ testament }) => testament === 'NT').length;
  return `# 66권 한국어 연구 안내 원고 검사\n\n- 원고: \`${data.sourceFile}\`\n- 성경 책: ${data.coverage.books}/66 (구약 ${ot}, 신약 ${nt})\n- 장 메타데이터 연결: ${data.coverage.chapters}/1,189\n- 필수 원고 항목 완비: ${data.coverage.completeRequiredSections}/66\n- 편집 상태: ${data.coverage.status}\n- 전문 검수: ${data.coverage.review}\n- 원고 SHA-256: \`${data.sourceSha256}\`\n\n## 판정\n\n66권 모두 앱에서 불러올 수 있는 원고 구조와 네 개의 필수 안내 문장을 갖추었습니다. 이 검사는 구조·누락·표시 상태 검사이며 신학적 전문 검수 완료를 뜻하지 않습니다.\n`;
}

