"""Repair Korean study-note drafts that still contain excessive English.

This build-time script reads the retained Aquifer English source, retranslates
only weak Korean drafts with a second local model, and keeps the better result.
The deployed application never invokes a translation service.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from translate_open_study_notes_ko import (
    BARE_REFERENCE,
    BOOK_NAMES,
    BOOK_REFERENCE,
    BOOK_CODES,
    LocalTranslator,
    polish_bible_terms,
    restore_references,
    split_text,
)


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "public" / "data" / "open-study-notes" / "ko"

FINAL_OVERRIDES = {
    ("2CH", "2 Chronicles 29:3–4"): "히스기야가 왕이 된 뒤 처음 한 일은 성전 문을 수리하는 것이었습니다(역대하 29:3). 여기서 사용된 동사 예하제켐(‘그가 그것들을 튼튼하게 했다’)은 히스기야의 히브리어 이름 예히즈키야후(‘여호와께서 강하게 하신다’)와 소리가 비슷한 말장난입니다. 이 행동은 왕이 제사장들과 레위인들에게 연설할 무대를 마련했습니다(역대하 29:5–11).",
    ("PSA", "Psalms 31:17"): "수치를 당할 이유가 없었던 시편 기자는 보응의 원리를 호소합니다(시편 1:6 연구 노트 및 ‘복수를 구하는 기도’ 주제 노트 참조).",
    ("JDG", "Judges 18:25"): "분노한 사람들(직역하면 ‘마음이 쓰라린 사람들’. 사무엘상 1:10에서는 ‘마음이 괴로워서’, 사무엘상 22:2에서는 ‘마음이 원통한’, 사무엘하 17:8에서는 ‘사나운’으로 번역됨): 이 표현은 삶에 대한 깊은 좌절 때문에 행동을 예측하기 어려운 사람들을 가리킵니다.",
    ("PRO", "Proverbs 5:19"): "어린 암사슴: 아가 4:5와 비교해 보십시오.",
    ("REV", "Revelation 19:16"): "왕 중의 왕, 주 중의 주: 요한계시록 1:5, 15:3, 17:14를 보십시오.",
    ("AMO", "Amos 8:2"): "끝이 이르렀다: 아모스는 여름 과일을 뜻하는 히브리어 ‘카이츠’와 끝이 이르렀다는 표현의 히브리어 ‘바 하케츠’ 사이의 말장난을 사용합니다. 하나님의 백성 이스라엘은 심판의 추수를 앞둔 익은 과일과 같았으므로 끝이 이르렀습니다.",
    ("EPH", "Ephesians 2:7"): "은혜: 에베소서 1:2 연구 노트를 보십시오.",
    ("JOB", "Job 9:17"): "폭풍으로: ‘폭풍으로’라고 번역된 히브리어 표현 비스아라는 베사아라(‘머리카락 하나 때문에’, 곧 ‘아주 작은 일 때문에’)라는 뜻으로도 읽힐 수 있습니다. 이는 ‘까닭 없이’라는 표현과 나란히 놓입니다.",
    ("PSA", "Psalms 18:10"): "그룹: 역대상 28:18과 역대하 3:10–13의 연구 노트를 보십시오.",
    ("MAT", "Matthew 13:55–56"): "목수의 아들: 목수(직역하면 기술자)는 나무나 금속이나 돌을 손으로 다루어 일했습니다.",
    ("1SA", "1 Samuel 15:4"): "델라임: 여호수아 15:24의 델렘과 같은 곳일 수 있습니다.",
    ("RUT", "Ruth 2:20"): "기업 무를 자(히브리어 고엘): 율법은 가장 가까운 남자 친족인 고엘이 경제적 어려움에 놓인 가족을 돕도록 규정했습니다(‘가족의 기업 무를 자’ 주제 노트와 레위기 25:25 연구 노트 참조).",
    ("2PE", "2 Peter 2:15"): "불의의 삯을 사랑한 자: 발람은 하나님께 길을 물었지만 발락의 돈을 받으려고 자기 뜻대로 가고 싶어 했습니다(민수기 22–24장 참조). 구약 기록은 발람이 탐욕스러웠음을 암시합니다. 후대 유대 전승은 이 생각을 더 확장했습니다(민수기 랍바 20:10, 미쉬나 아봇 5:22, 필론의 『모세의 생애』 1:266–268 참조).",
}


def latin_ratio(text: str) -> float:
    latin = len(re.findall(r"[A-Za-z]", text))
    letters = len(re.findall(r"[A-Za-z가-힣]", text))
    return latin / letters if letters else 0.0


def needs_repair(text: str, threshold: float) -> bool:
    return latin_ratio(text) > threshold or bool(re.search(r"[�⁇]|\bXREF\d*\b", text, re.IGNORECASE))


def protect_reference_tokens(text: str) -> tuple[str, dict[str, str]]:
    """Protect only verse tokens so surrounding parenthetical prose is translated."""
    references: dict[str, str] = {}

    def token(value: str) -> str:
        marker = f"XREF{len(references)}X"
        references[marker] = value
        return marker

    def localized_book(match: re.Match) -> str:
        english_book = next(name for name in BOOK_NAMES if name.lower() == match.group(1).lower())
        return f"{BOOK_NAMES[english_book]} {match.group(2)}"

    protected = BOOK_REFERENCE.sub(lambda match: token(localized_book(match)), text)
    protected = BARE_REFERENCE.sub(lambda match: token(match.group(0)), protected)
    return protected, references


def translate_rows(engine: LocalTranslator, rows: list[dict]) -> list[str]:
    plans: list[list[int]] = []
    protected_segments: list[tuple[str, dict[str, str], str]] = []
    for row in rows:
        indexes: list[int] = []
        for part in split_text(row["sourceText"], limit=480):
            protected, references = protect_reference_tokens(part)
            indexes.append(len(protected_segments))
            protected_segments.append((protected, references, part))
        plans.append(indexes)

    outputs: list[str] = [""] * len(protected_segments)
    batch_size = 96
    for offset in range(0, len(protected_segments), batch_size):
        batch = protected_segments[offset:offset + batch_size]
        translated = engine.translate([part[0] for part in batch])
        for index, (candidate, (_, references, source)) in enumerate(zip(translated, batch), start=offset):
            candidate = restore_references(candidate, references)
            outputs[index] = polish_bible_terms(source, candidate).replace("⁇", "").replace("�", "")
        print(f"segments {min(offset + len(batch), len(protected_segments)):,}/{len(protected_segments):,}", flush=True)

    return ["\n\n".join(outputs[index] for index in indexes).strip() for indexes in plans]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-dir", type=Path, required=True)
    parser.add_argument("--threshold", type=float, default=0.20)
    parser.add_argument("--device", choices=["cuda", "cpu"], default="cpu")
    parser.add_argument("--compute-type", default="int8")
    parser.add_argument("--overrides-only", action="store_true")
    parser.add_argument("--polish-only", action="store_true")
    args = parser.parse_args()

    candidates: list[tuple[str, int, dict]] = []
    books: dict[str, list[dict]] = {}
    for code in BOOK_CODES:
        path = TARGET / f"{code}.json"
        rows = json.loads(path.read_text(encoding="utf-8"))
        books[code] = rows
        for index, row in enumerate(rows):
            if needs_repair(row["text"], args.threshold):
                candidates.append((code, index, row))

    print(f"repair candidates: {len(candidates):,}", flush=True)
    repaired = []
    if not (args.overrides_only or args.polish_only):
        engine = LocalTranslator(args.model_dir, args.device, args.compute_type, beam_size=1)
        repaired = translate_rows(engine, [row for _, _, row in candidates])

    improved = 0
    unresolved = 0
    touched: set[str] = set()
    for (code, index, row), candidate in zip(candidates, repaired):
        old_ratio = latin_ratio(row["text"])
        new_ratio = latin_ratio(candidate)
        old_bad = bool(re.search(r"[�⁇]", row["text"]))
        new_bad = bool(re.search(r"[�⁇]", candidate))
        if re.search(r"[가-힣]", candidate) and (new_ratio < old_ratio or (old_bad and not new_bad)):
            books[code][index]["text"] = candidate
            improved += 1
            touched.add(code)
        if needs_repair(books[code][index]["text"], args.threshold):
            unresolved += 1

    if args.polish_only:
        for code, rows in books.items():
            for row in rows:
                polished = polish_bible_terms(row["sourceText"], row["text"])
                if polished != row["text"]:
                    row["text"] = polished
                    touched.add(code)

    for (code, title), text in FINAL_OVERRIDES.items():
        for row in books[code]:
            if row["title"] == title:
                row["text"] = text
                touched.add(code)
                break

    for code in touched:
        (TARGET / f"{code}.json").write_text(
            json.dumps(books[code], ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
        )
    print(f"improved: {improved:,}; unresolved at threshold {args.threshold:.2f}: {unresolved:,}", flush=True)


if __name__ == "__main__":
    main()
