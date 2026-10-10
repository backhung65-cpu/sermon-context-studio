import { readFileSync } from 'node:fs';

const atlas = JSON.parse(readFileSync(new URL('../public/data/openbible-places.json', import.meta.url), 'utf8'));
const notes = JSON.parse(readFileSync(new URL('../public/data/geography-notes.json', import.meta.url), 'utf8'));
const byId = new Map(atlas.places.map((place) => [place.id, place]));
const normalize = (value) => String(value || '').toLowerCase().replace(/\s+\d+$/, '').replace(/[^a-z0-9]/g, '');
const seenSources = new Set();
const seenTexts = new Set();
const errors = [];

if (notes.placeSourceCommit !== atlas.sourceCommit) errors.push('Atlas version mismatch');
if (notes.sourceCommit !== 'cfb1c485d4da6fb63a69cb3b7f5b0752792f46bc') errors.push('Theographic version mismatch');
for (const [placeId, note] of Object.entries(notes.notes)) {
  const place = byId.get(placeId);
  if (!place) { errors.push(`Unknown place ${placeId}`); continue; }
  const exactName = normalize(note.sourceName) === normalize(place.name);
  const qualifiedName = normalize(note.sourceName) === normalize(place.name.replace(/^(mount|mt\.?|sea of|river|brook of)\s+/i, ''));
  if (!exactName && !qualifiedName) errors.push(`Name mismatch ${placeId}: ${note.sourceName} / ${place.name}`);
  if (!Number.isInteger(note.sharedVerses) || note.sharedVerses < 1) errors.push(`No shared verses ${placeId}`);
  if (!Array.isArray(note.paragraphs) || !note.paragraphs.length || note.paragraphs.some((text) => !text.trim())) errors.push(`Empty text ${placeId}`);
  const dictionaryText = note.paragraphs.join('\n').trim();
  if (seenTexts.has(dictionaryText)) errors.push(`Reused dictionary text ${placeId}`);
  seenTexts.add(dictionaryText);
  if (/\brace\b|nigrit|low-class population|mohammedan|\bheathen\b/i.test(dictionaryText)) errors.push(`Obsolete classification ${placeId}`);
  if (seenSources.has(note.sourcePlaceId)) errors.push(`Reused dictionary place ${note.sourcePlaceId}`);
  seenSources.add(note.sourcePlaceId);
}
if (Object.keys(notes.notes).length !== notes.audit.matchedNotes || notes.audit.matchedNotes < 650) errors.push('Coverage changed unexpectedly');
const horeb = atlas.places.find((place) => place.name === 'Mount Horeb');
if (!horeb || notes.notes[horeb.id]?.sourceName !== 'Horeb') errors.push('Horeb dictionary linkage missing');
if (notes.notes[atlas.places.find((place) => place.name === 'Gilgal 2')?.id]) errors.push('Ambiguous Gilgal 2 note should remain unlinked');
if (notes.notes[atlas.places.find((place) => place.name === 'Egypt')?.id]) errors.push('Unreviewed 19th-century Egypt article should remain unlinked');

if (errors.length) {
  console.error(errors.slice(0, 20).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Geography notes: ${notes.audit.matchedNotes}/${atlas.places.length} atlas places; ${notes.audit.ambiguousNotes} ambiguous joins excluded`);
}
