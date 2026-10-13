"""Import only the verses missing from the pinned Korean 1910 source.

Download https://ebible.org/Scriptures/eng-kjv2006_vpl.zip and run:
    python scripts/import_kjv_fallback.py PATH_TO_ZIP
"""

from hashlib import sha256
from pathlib import Path
import json
import re
import sys
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "public" / "data" / "kor1910-audit.json"
OUT = ROOT / "public" / "data" / "kjv-fallback.json"
SOURCE = "https://ebible.org/Scriptures/eng-kjv2006_vpl.zip"
LINE = re.compile(r"^([A-Z0-9]{3}) (\d+):(\d+) (.*)$")
BOOK_CODES = {
    "SOL": "SNG", "EZE": "EZK", "JOE": "JOL", "NAH": "NAM",
    "MAR": "MRK", "JOH": "JHN", "PHI": "PHP", "JAM": "JAS",
    "1JO": "1JN", "2JO": "2JN", "3JO": "3JN",
}


def main(zip_path: Path) -> None:
    audit = json.loads(AUDIT.read_text(encoding="utf-8"))
    missing = set(audit["missingReferences"])
    with ZipFile(zip_path) as archive:
        raw = archive.read("eng-kjv2006_vpl.txt")
    verses = {}
    for line_number, line in enumerate(raw.decode("utf-8-sig").splitlines(), 1):
        match = LINE.fullmatch(line)
        if not match:
            raise ValueError(f"Unrecognized VPL row {line_number}: {line[:50]}")
        source_code, chapter, verse, text = match.groups()
        code = BOOK_CODES.get(source_code, source_code)
        reference = f"{code} {int(chapter)}:{int(verse)}"
        if reference in missing:
            if reference in verses or not text.strip():
                raise ValueError(f"Duplicate or blank fallback: {reference}")
            verses[reference] = text
    unresolved = sorted(missing - verses.keys())
    if unresolved:
        raise ValueError(f"Missing KJV fallback verses: {', '.join(unresolved)}")
    result = {
        "title": "King James Version 1769 · Korean 1910 source-gap fallback",
        "source": SOURCE,
        "source_sha256": sha256(zip_path.read_bytes()).hexdigest(),
        "vpl_sha256": sha256(raw).hexdigest(),
        "license": "Public Domain outside the United Kingdom (as stated by eBible.org)",
        "purpose": "Only verses absent from the Korean 1910 source; never labelled as Korean",
        "verses": dict(sorted(verses.items())),
    }
    OUT.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Imported {len(verses)} KJV fallback verses.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/import_kjv_fallback.py eng-kjv2006_vpl.zip")
    main(Path(sys.argv[1]))
