"""Import eBible.org's public-domain Korean Bible 1910 VPL into lazy book files.

Download https://ebible.org/Scriptures/kor_vpl.zip and run:
    python scripts/import_kor1910.py PATH_TO_ZIP

The generated files contain the source's text verbatim. The app labels this
historical translation separately from the copyrighted 개역개정 reading link.
"""

from collections import defaultdict
from hashlib import sha256
from pathlib import Path
import json
import re
import sys
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "data" / "kor1910"
SOURCE = "https://ebible.org/Scriptures/kor_vpl.zip"
LINE = re.compile(r"^([A-Z0-9]{3}) (\d+):(\d+) (.*)$")
BOOK_CODES = {
    "SOL": "SNG", "EZE": "EZK", "JOE": "JOL", "NAH": "NAM",
    "MAR": "MRK", "JOH": "JHN", "PHI": "PHP", "JAM": "JAS",
    "1JO": "1JN", "2JO": "2JN", "3JO": "3JN",
}


def main(zip_path: Path) -> None:
    with ZipFile(zip_path) as archive:
        raw = archive.read("kor_vpl.txt")
    verses = defaultdict(lambda: defaultdict(dict))
    for line_number, line in enumerate(raw.decode("utf-8-sig").splitlines(), 1):
        match = LINE.fullmatch(line)
        if not match:
            raise ValueError(f"Unrecognized VPL row {line_number}: {line[:50]}")
        source_code, chapter, verse, text = match.groups()
        code = BOOK_CODES.get(source_code, source_code)
        chapter, verse = int(chapter), int(verse)
        if verse in verses[code][chapter] or not text.strip():
            raise ValueError(f"Duplicate or blank text: {code} {chapter}:{verse}")
        verses[code][chapter][verse] = text
    if len(verses) != 66:
        raise ValueError(f"Expected 66 books, found {len(verses)}")

    OUT.mkdir(parents=True, exist_ok=True)
    for old_file in OUT.glob("*.json"):
        old_file.unlink()
    for code, chapters in verses.items():
        book = {
            str(chapter): {str(verse): text for verse, text in sorted(rows.items())}
            for chapter, rows in sorted(chapters.items())
        }
        (OUT / f"{code}.json").write_text(
            json.dumps(book, ensure_ascii=False, separators=(",", ":")) + "\n",
            encoding="utf-8",
        )
    manifest = {
        "title": "한국어 성경 · Korean Bible 1910",
        "source": SOURCE,
        "source_sha256": sha256(zip_path.read_bytes()).hexdigest(),
        "vpl_sha256": sha256(raw).hexdigest(),
        "license": "Public Domain (as stated by eBible.org)",
        "books": len(verses),
        "chapters": sum(len(chapters) for chapters in verses.values()),
        "verses": sum(len(rows) for chapters in verses.values() for rows in chapters.values()),
    }
    (OUT / "source.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/import_kor1910.py kor_vpl.zip")
    main(Path(sys.argv[1]))
