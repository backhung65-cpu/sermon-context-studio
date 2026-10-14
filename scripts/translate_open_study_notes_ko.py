"""Build a complete Korean machine-translation draft of Aquifer study notes.

This is an offline content build step. The deployed app reads static JSON and
never calls an AI or translation service. Every Korean row retains the exact
English source text for review.

Required local packages: ctranslate2, sentencepiece
Model: skywood/NHNDQ-nllb-finetuned-en2ko-ct2-float16 (CC BY 4.0)
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path

import ctranslate2
import sentencepiece as spm


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "public" / "data" / "open-study-notes"
TARGET = DATA / "ko"
SOURCE_COMMIT = "bbb3f86016cd20913f410a95af63d9f7ff9a71d6"
MODEL_ID = "skywood/NHNDQ-nllb-finetuned-en2ko-ct2-float16"
BOOK_CODES = [
    "GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT", "1SA", "2SA",
    "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST", "JOB", "PSA", "PRO",
    "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO",
    "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL", "MAT",
    "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO", "GAL", "EPH", "PHP",
    "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM", "HEB", "JAS", "1PE",
    "2PE", "1JN", "2JN", "3JN", "JUD", "REV",
]
BOOK_NAMES = {
    "Genesis": "창세기", "Exodus": "출애굽기", "Leviticus": "레위기", "Numbers": "민수기", "Deuteronomy": "신명기",
    "Joshua": "여호수아", "Judges": "사사기", "Ruth": "룻기", "1 Samuel": "사무엘상", "2 Samuel": "사무엘하",
    "1 Kings": "열왕기상", "2 Kings": "열왕기하", "1 Chronicles": "역대상", "2 Chronicles": "역대하", "Ezra": "에스라",
    "Nehemiah": "느헤미야", "Esther": "에스더", "Job": "욥기", "Psalms": "시편", "Psalm": "시편", "Proverbs": "잠언",
    "Ecclesiastes": "전도서", "Song of Songs": "아가", "Song of Solomon": "아가", "Isaiah": "이사야", "Jeremiah": "예레미야",
    "Lamentations": "예레미야애가", "Ezekiel": "에스겔", "Daniel": "다니엘", "Hosea": "호세아", "Joel": "요엘", "Amos": "아모스",
    "Obadiah": "오바댜", "Jonah": "요나", "Micah": "미가", "Nahum": "나훔", "Habakkuk": "하박국", "Zephaniah": "스바냐",
    "Haggai": "학개", "Zechariah": "스가랴", "Malachi": "말라기", "Matthew": "마태복음", "Mark": "마가복음", "Luke": "누가복음",
    "John": "요한복음", "Acts": "사도행전", "Romans": "로마서", "1 Corinthians": "고린도전서", "2 Corinthians": "고린도후서",
    "Galatians": "갈라디아서", "Ephesians": "에베소서", "Philippians": "빌립보서", "Colossians": "골로새서",
    "1 Thessalonians": "데살로니가전서", "2 Thessalonians": "데살로니가후서", "1 Timothy": "디모데전서", "2 Timothy": "디모데후서",
    "Titus": "디도서", "Philemon": "빌레몬서", "Hebrews": "히브리서", "James": "야고보서", "1 Peter": "베드로전서",
    "2 Peter": "베드로후서", "1 John": "요한일서", "2 John": "요한이서", "3 John": "요한삼서", "Jude": "유다서",
    "Revelation": "요한계시록",
}
BOOK_REFERENCE = re.compile(
    r"\b(" + "|".join(sorted((re.escape(name) for name in BOOK_NAMES), key=len, reverse=True))
    + r")\s+(\d+(?::\d+(?:[–—-]\d+)?)?(?:\s*[,;]\s*\d+(?::\d+(?:[–—-]\d+)?)?)*)",
    re.IGNORECASE,
)
BARE_REFERENCE = re.compile(r"\b\d+:\d+(?:[–—-]\d+)?(?:\s*[,;]\s*\d+(?::\d+(?:[–—-]\d+)?)?)*")
PERSON_NAMES = {
    "Jesus Christ": "예수 그리스도", "John the Baptist": "세례 요한",
    "Abraham": "아브라함", "Sarah": "사라", "Isaac": "이삭", "Rebekah": "리브가", "Jacob": "야곱",
    "Rachel": "라헬", "Leah": "레아", "Joseph": "요셉", "Benjamin": "베냐민", "Adam": "아담", "Eve": "하와",
    "Noah": "노아", "Shem": "셈", "Ham": "함", "Japheth": "야벳", "Lot": "롯", "Hagar": "하갈",
    "Ishmael": "이스마엘", "Esau": "에서", "Laban": "라반", "Judah": "유다", "Moses": "모세", "Aaron": "아론",
    "Miriam": "미리암", "Joshua": "여호수아", "Caleb": "갈렙", "David": "다윗", "Solomon": "솔로몬",
    "Samuel": "사무엘", "Saul": "사울", "Elijah": "엘리야", "Elisha": "엘리사", "Isaiah": "이사야",
    "Jeremiah": "예레미야", "Ezekiel": "에스겔", "Daniel": "다니엘", "Hosea": "호세아", "Jonah": "요나",
    "Esther": "에스더", "Ruth": "룻", "Naomi": "나오미", "Boaz": "보아스", "Jesus": "예수", "Mary": "마리아",
    "Peter": "베드로", "Paul": "바울", "John": "요한", "James": "야고보", "Barnabas": "바나바",
    "Timothy": "디모데", "Titus": "디도", "Stephen": "스데반", "Philip": "빌립", "Matthew": "마태",
    "Mark": "마가", "Luke": "누가", "Martha": "마르다", "Lazarus": "나사로", "Nicodemus": "니고데모",
    "Job": "욥", "Eliphaz": "엘리바스", "Bildad": "빌닷", "Zophar": "소발", "Elihu": "엘리후",
}


def split_text(text: str, limit: int = 650) -> list[str]:
    pieces: list[str] = []
    for paragraph in re.split(r"\n\s*\n", text.strip()):
        paragraph = paragraph.strip()
        if not paragraph:
            continue
        current = ""
        for sentence in re.split(r"(?<=[.!?])\s+", paragraph):
            remainder = sentence.strip()
            long_parts: list[str] = []
            while len(remainder) > limit:
                split_at = max(remainder.rfind(delimiter, 0, limit) for delimiter in ("; ", ", ", " "))
                split_at = split_at + 1 if split_at > limit // 2 else limit
                long_parts.append(remainder[:split_at].strip())
                remainder = remainder[split_at:].strip()
            if remainder:
                long_parts.append(remainder)
            for part in long_parts:
                candidate = f"{current} {part}".strip()
                if current and len(candidate) > limit:
                    pieces.append(current)
                    current = part
                else:
                    current = candidate
        if current:
            pieces.append(current)
    return pieces


def split_retry_text(text: str, limit: int = 260) -> list[str]:
    pieces: list[str] = []
    for clause in re.split(r"(?<=[.!?;])\s+", text.strip()):
        remainder = clause.strip()
        while len(remainder) > limit:
            split_at = max(remainder.rfind(delimiter, 0, limit) for delimiter in (", ", "; ", " "))
            split_at = split_at + 1 if split_at > limit // 2 else limit
            pieces.append(remainder[:split_at].strip())
            remainder = remainder[split_at:].strip()
        if remainder:
            pieces.append(remainder)
    return pieces


def protect_references(text: str) -> tuple[str, dict[str, str]]:
    references: dict[str, str] = {}

    def token(value: str) -> str:
        marker = f"XREF{len(references)}X"
        references[marker] = value
        return marker

    def localized_book(match: re.Match) -> str:
        english_book = next(name for name in BOOK_NAMES if name.lower() == match.group(1).lower())
        return f"{BOOK_NAMES[english_book]} {match.group(2)}"

    def replace_parenthetical(match: re.Match) -> str:
        value = match.group(0)
        if not BOOK_REFERENCE.search(value) and not BARE_REFERENCE.search(value):
            return value
        value = BOOK_REFERENCE.sub(localized_book, value)
        value = re.sub(r"\bfor example,?", "예:", value, flags=re.IGNORECASE)
        value = re.sub(r"\bcompare\b", "비교:", value, flags=re.IGNORECASE)
        value = re.sub(r"\bsee\b", "참조:", value, flags=re.IGNORECASE)
        return token(value)

    protected = re.sub(r"\([^()]*\)", replace_parenthetical, text)
    protected = BOOK_REFERENCE.sub(lambda match: token(localized_book(match)), protected)
    protected = BARE_REFERENCE.sub(lambda match: token(match.group(0)), protected)
    return protected, references


def restore_references(text: str, references: dict[str, str]) -> str:
    result = text
    missing: list[str] = []
    for marker, reference in references.items():
        if marker in result:
            result = result.replace(marker, reference)
        else:
            missing.append(reference.strip().strip("()"))
    if missing:
        result = f"{result.rstrip()} (참고: {'; '.join(missing)})"
    return result


def translation_is_complete(source: str, translated: str) -> bool:
    if re.search(r"[A-Za-z]", source) and not re.search(r"[가-힣]", translated):
        return False
    if source.count("•") != translated.count("•"):
        return False
    source_compact = len(re.sub(r"\s+", "", source))
    translated_compact = len(re.sub(r"\s+", "", translated))
    return source_compact == 0 or translated_compact >= source_compact * 0.18


def polish_bible_terms(source: str, translated: str) -> str:
    result = translated.strip()
    if source.lstrip().startswith("•") and not result.startswith("•"):
        result = f"• {result}"
    replacements = {
        "하느님": "하나님", "이집트": "애굽", "파라오": "바로", "시나이 산": "시내산",
        "시나이산": "시내산", "시나이": "시내산", "호렙 산": "호렙산", "에제키엘": "에스겔",
        "오바디야": "오바댜", "요한 계시록": "요한계시록", "코린토": "고린도",
        "테살로니카": "데살로니가", "필리피": "빌립보", "갈라티아": "갈라디아",
        "경전": "성경", "구원(salvation)": "구원",
    }
    for before, after in replacements.items():
        result = result.replace(before, after)
    phrase_replacements = (
        (r"\bsee also\b", "또한 참조"),
        (r"\bstudy notes? on\b", "연구 노트"),
        (r"\btheme note\b", "주제 노트"),
        (r"\balso\b", "또한"),
        (r"\bliterally\b", "직역하면"),
        (r"\bHebrew\b", "히브리어"),
        (r"\bGreek\b", "헬라어"),
    )
    for pattern, replacement in phrase_replacements:
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    for english, korean in sorted(BOOK_NAMES.items(), key=lambda item: len(item[0]), reverse=True):
        result = re.sub(rf"\b{re.escape(english)}\b", korean, result, flags=re.IGNORECASE)
    for english, korean in sorted(PERSON_NAMES.items(), key=lambda item: len(item[0]), reverse=True):
        result = re.sub(rf"\b{re.escape(english)}\b", korean, result)
    if re.search(r"\bGod\b", source):
        for before, after in {
            "신께서": "하나님께서", "신은": "하나님은", "신이": "하나님이", "신의": "하나님의",
            "신을": "하나님을", "신에게": "하나님께", "신과": "하나님과", "신만": "하나님만",
        }.items():
            result = result.replace(before, after)
    if re.search(r"\bcovenants?\b", source, re.IGNORECASE):
        result = result.replace("계약", "언약").replace("신약에서", "언약에서")
    if re.search(r"\bholy|holiness\b", source, re.IGNORECASE):
        result = result.replace("성실", "거룩").replace("신성해야", "거룩해야")
    if re.search(r"\bexodus\b", source, re.IGNORECASE):
        result = result.replace("출신", "출애굽").replace("대피", "출애굽").replace("탈출", "출애굽")
    if re.search(r"\bIsraelites?\b", source, re.IGNORECASE):
        result = result.replace("이스라엘 사람들", "이스라엘 백성").replace("이스라엘인", "이스라엘 백성")
    if re.search(r"\bthe angel of the LORD\b", source, re.IGNORECASE):
        result = result.replace("여호와의 천사", "여호와의 사자")
    return result


class LocalTranslator:
    def __init__(self, model_dir: Path, device: str, compute_type: str, beam_size: int = 4):
        self.processor = spm.SentencePieceProcessor(model_file=str(model_dir / "sentencepiece.bpe.model"))
        self.beam_size = beam_size
        self.translator = ctranslate2.Translator(
            str(model_dir), device=device, compute_type=compute_type,
            inter_threads=2, intra_threads=8,
        )

    def translate(self, texts: list[str]) -> list[str]:
        if not texts:
            return []
        sources = [["eng_Latn"] + self.processor.encode_as_pieces(text) + ["</s>"] for text in texts]
        results = self.translator.translate_batch(
            sources,
            target_prefix=[["kor_Hang"]] * len(sources),
            beam_size=self.beam_size,
            max_batch_size=4096,
            batch_type="tokens",
        )
        outputs = []
        for result in results:
            tokens = result.hypotheses[0]
            if tokens and tokens[0] == "kor_Hang":
                tokens = tokens[1:]
            outputs.append(self.processor.decode(tokens).strip())
        return outputs


def translate_segments(engine: LocalTranslator, fallback_engine: LocalTranslator | None, segments: list[dict], cache_path: Path) -> dict[str, str]:
    translated: dict[str, str] = json.loads(cache_path.read_text(encoding="utf-8")) if cache_path.exists() else {}
    pending = [segment for segment in segments if segment["key"] not in translated]
    batch_size = 192
    for offset in range(0, len(pending), batch_size):
        batch = pending[offset:offset + batch_size]
        prepared = [protect_references(row["text"]) for row in batch]
        candidates = engine.translate([text for text, _ in prepared])
        retry_rows: list[dict] = []
        for row, candidate, (_, references) in zip(batch, candidates, prepared):
            candidate = restore_references(candidate, references)
            candidate = polish_bible_terms(row["text"], candidate)
            if translation_is_complete(row["text"], candidate):
                translated[row["key"]] = candidate
            else:
                retry_rows.append(row)
        for row in retry_rows:
            pieces = split_retry_text(row["text"])
            protected_pieces = [protect_references(piece) for piece in pieces]
            piece_outputs = engine.translate([text for text, _ in protected_pieces])
            candidate = " ".join(
                polish_bible_terms(source, restore_references(output, references))
                for source, output, (_, references) in zip(pieces, piece_outputs, protected_pieces)
            )
            if not translation_is_complete(row["text"], candidate) and fallback_engine:
                protected, references = protect_references(row["text"])
                candidate = fallback_engine.translate([protected])[0]
                candidate = polish_bible_terms(row["text"], restore_references(candidate, references))
            if not translation_is_complete(row["text"], candidate):
                missing = sorted(set(re.findall(r"\d+", row["text"])) - set(re.findall(r"\d+", candidate)))
                print(f"  failed source: {row['text']}", flush=True)
                print(f"  failed output: {candidate}", flush=True)
                raise RuntimeError(f"Translation validation failed: {row['key']} missing numbers {missing}")
            translated[row["key"]] = candidate
        cache_path.write_text(json.dumps(translated, ensure_ascii=False), encoding="utf-8")
        completed = min(offset + len(batch), len(pending))
        print(f"  segments {completed:,}/{len(pending):,} · cached {len(translated):,}/{len(segments):,}", flush=True)
    return translated


def translate_book(engine: LocalTranslator, fallback_engine: LocalTranslator | None, code: str) -> dict:
    rows = json.loads((DATA / f"{code}.json").read_text(encoding="utf-8"))
    segments: list[dict] = []
    plans: list[list[str]] = []
    for row in rows:
        keys = []
        for part_index, part in enumerate(split_text(row["text"])):
            key = f"{row['id']}_{part_index}"
            keys.append(key)
            segments.append({"key": key, "text": part})
        plans.append(keys)
    print(f"{code}: {len(rows):,} notes / {len(segments):,} segments", flush=True)
    cache_path = TARGET / f".cache-nllb-{code}.json"
    outputs = translate_segments(engine, fallback_engine, segments, cache_path)
    translated_rows = []
    for row, keys in zip(rows, plans):
        text = "\n\n".join(outputs[key] for key in keys).strip()
        if not re.search(r"[가-힣]", text):
            raise RuntimeError(f"No Korean text produced for {code}/{row['id']}")
        translated_rows.append({
            "id": row["id"], "title": row["title"], "start": row["start"], "end": row["end"],
            "text": text, "sourceText": row["text"],
        })
    (TARGET / f"{code}.json").write_text(
        json.dumps(translated_rows, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    cache_path.unlink(missing_ok=True)
    return {"code": code, "records": len(translated_rows), "available": True}


def write_metadata(per_book: list[dict]) -> None:
    existing = {row["code"]: row for row in per_book}
    complete = [existing.get(code, {"code": code, "records": 0, "available": False}) for code in BOOK_CODES]
    records = sum(row["records"] for row in complete if row["available"])
    metadata = {
        "source": "Aquifer Open Study Notes", "repository": "https://github.com/BibleAquifer/AquiferOpenStudyNotes",
        "commit": SOURCE_COMMIT, "license": "CC BY-SA 4.0", "locale": "ko", "sourceLanguage": "eng",
        "language": "한국어", "reviewPolicy": "Machine-translation draft; compare every claim with the retained English source and Bible passage",
        "reviewLevels": {"Machine translation draft": records},
        "adaptation": "Aquifer English source converted to a Korean machine-translation draft. English source retained per record.",
        "translationProvider": "Mixed build-time machine translation",
        "translationProviders": [
            {"name": "Google Translate", "books": ["EXO"]},
            {"name": MODEL_ID, "license": "CC BY 4.0", "books": [code for code in BOOK_CODES if code != "EXO"]},
            {"name": "Adom4600/nllb-200-distilled-600M-ct2-int8", "baseLicense": "CC BY-NC 4.0", "use": "repair of drafts with excessive English"},
        ],
        "translationModelLicense": "CC BY 4.0 (NHNDQ model); CC BY-NC 4.0 (NLLB repair model); Google Translate terms apply to the EXO draft",
        "credits": "Adapted by Mission Mutual from Tyndale Open Study Notes", "importedAt": str(date.today()),
        "books": sum(1 for row in complete if row["available"]), "records": records, "sourceRecords": records,
        "professionalSourceRecords": None, "excludedRecords": [], "normalizedChapterEnds": 0, "perBook": complete,
    }
    (TARGET / "source.json").write_text(json.dumps(metadata, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    index_path = DATA / "locales.json"
    index = json.loads(index_path.read_text(encoding="utf-8"))
    edition = {
        "locale": "ko", "sourceLanguage": "eng", "language": "한국어", "books": metadata["books"],
        "records": records, "reviewLevels": metadata["reviewLevels"], "adaptation": metadata["adaptation"],
        "availableBooks": [row["code"] for row in complete if row["available"]],
    }
    index["locales"] = [row for row in index["locales"] if row["locale"] != "ko"] + [edition]
    index_path.write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-dir", type=Path, required=True)
    parser.add_argument("--fallback-model-dir", type=Path)
    parser.add_argument("--device", choices=["cuda", "cpu"], default="cuda")
    parser.add_argument("--compute-type", default="float16")
    parser.add_argument("--books", nargs="*", choices=BOOK_CODES)
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    TARGET.mkdir(parents=True, exist_ok=True)
    engine = LocalTranslator(args.model_dir, args.device, args.compute_type)
    fallback_engine = LocalTranslator(args.fallback_model_dir, args.device, "int8_float16") if args.fallback_model_dir else None
    requested = args.books or BOOK_CODES
    translated: dict[str, dict] = {}
    source_meta = TARGET / "source.json"
    if source_meta.exists():
        for row in json.loads(source_meta.read_text(encoding="utf-8")).get("perBook", []):
            if row.get("available") and (TARGET / f"{row['code']}.json").exists():
                translated[row["code"]] = row
    for code in requested:
        if code in translated and not args.overwrite:
            print(f"{code}: already translated", flush=True)
            continue
        translated[code] = translate_book(engine, fallback_engine, code)
        write_metadata(list(translated.values()))
    write_metadata(list(translated.values()))
    print(f"Korean draft complete: {len(translated)}/66 books", flush=True)


if __name__ == "__main__":
    main()
