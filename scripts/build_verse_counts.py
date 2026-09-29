"""Keep only chapter verse counts from the public KJV metadata API.

Run: python scripts/build_verse_counts.py [path/to/eng_kjv_complete.json]
Source: https://bible.helloao.org/api/eng_kjv/complete.json
No Bible text is written into the app.
"""

from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path


SOURCE = "https://bible.helloao.org/api/eng_kjv/complete.json"
OUTPUT = Path(__file__).resolve().parents[1] / "src" / "verse-counts.js"


def main() -> None:
    if len(sys.argv) > 1:
        payload = Path(sys.argv[1]).read_text(encoding="utf-8")
    else:
        with urllib.request.urlopen(SOURCE, timeout=45) as response:
            payload = response.read().decode("utf-8")
    books = json.loads(payload)["books"]
    counts = {}
    for book in books:
        chapters = sorted(book["chapters"], key=lambda item: item["chapter"]["number"])
        values = [int(item["numberOfVerses"]) for item in chapters]
        if len(values) != book["numberOfChapters"] or min(values) < 1:
            raise ValueError(f"Unexpected chapter counts for {book['id']}")
        counts[book["id"]] = values
    if len(counts) != 66 or sum(map(len, counts.values())) != 1189 or sum(map(sum, counts.values())) != 31102:
        raise ValueError("Unexpected 66-book KJV counts")

    lines = [
        "// Chapter verse counts from the public KJV catalog at bible.helloao.org.",
        "// Used only for reference validation; no Bible text is included.",
        "export const VERSE_COUNTS = {",
    ]
    for code, values in counts.items():
        lines.append(f"  {json.dumps(code)}: [{', '.join(map(str, values))}],")
    lines.append("};")
    OUTPUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {len(counts)} books and {sum(map(len, counts.values()))} chapters to {OUTPUT}")


if __name__ == "__main__":
    main()
