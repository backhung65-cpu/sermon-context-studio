"""Snapshot names from OpenBible.info's MIT-licensed passage parser language data."""

import json
import re
import urllib.request
from pathlib import Path
import yaml


ROOT = Path(__file__).resolve().parents[1]
SOURCE = "https://raw.githubusercontent.com/openbibleinfo/Bible-Passage-Reference-Parser-Languages/main/data/"
LANGUAGES = {"en": "eng", "ja": "jpn", "zh-CN": "zho", "es": "spa", "th": "tha", "hi": "hin", "fr": "fra", "de": "deu"}
CODES = dict(zip(
    "GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV".split(),
    "Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps Prov Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal Matt Mark Luke John Acts Rom 1Cor 2Cor Gal Eph Phil Col 1Thess 2Thess 1Tim 2Tim Titus Phlm Heb Jas 1Pet 2Pet 1John 2John 3John Jude Rev".split(),
))
ENGLISH_NAMES = dict(zip(CODES, "Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms|Proverbs|Ecclesiastes|Song of Songs|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation".split("|")))


def extract(raw):
    books = {}
    for entry in yaml.safe_load(raw)["books"]:
        codes = entry.get("osis")
        codes = [codes] if isinstance(codes, str) else [item if isinstance(item, str) else item.get("osis") for item in (codes or [])]
        texts = [item for item in entry.get("texts", []) if isinstance(item, str)]
        for osis in codes:
            books.setdefault(osis, [])
            books[osis].extend(text for text in texts if text not in books[osis])
    return books


def preferred(locale, osis, texts):
    if locale in ("ja", "zh-CN", "th", "hi"):
        pattern = {"ja": r"[\u3040-\u30ff\u3400-\u9fff]", "zh-CN": r"[\u3400-\u9fff]", "th": r"[\u0e00-\u0e7f]", "hi": r"[\u0900-\u097f]"}[locale]
        candidates = [text for text in texts if re.search(pattern, text)]
    else:
        candidates = [text for text in texts if text.casefold() != osis.casefold() and re.search(r"[a-zA-ZÀ-ÿ]", text)]
    if not candidates:
        candidates = texts
    overrides = {
        "en": {"Gen": "Genesis", "Matt": "Matthew", "Mark": "Mark", "Luke": "Luke", "Acts": "Acts", "Rev": "Revelation"},
        "ja": {"Acts": "使徒言行録", "Rev": "ヨハネの黙示録"},
        "zh-CN": {"Gen": "创世记", "Exod": "出埃及记", "Matt": "马太福音", "Mark": "马可福音", "Acts": "使徒行传", "Rev": "启示录"},
        "es": {"Matt": "Mateo", "Mark": "Marcos", "Acts": "Hechos", "Rev": "Apocalipsis"},
        "th": {"Matt": "มัทธิว", "Mark": "มาระโก", "Acts": "กิจการ"},
        "hi": {"Matt": "मत्ती", "Mark": "मरकुस", "Acts": "प्रेरितों के काम", "Rev": "प्रकाशित वाक्य"},
        "fr": {"Acts": "Actes", "Rev": "Apocalypse", "Jude": "Jude"},
        "de": {"Gen": "1. Mose", "Exod": "2. Mose", "Lev": "3. Mose", "Num": "4. Mose", "Deut": "5. Mose", "Matt": "Matthäus", "Mark": "Markus"},
    }
    return overrides.get(locale, {}).get(osis, candidates[0])


output = {}
for locale, language in LANGUAGES.items():
    with urllib.request.urlopen(SOURCE + language + ".yaml", timeout=30) as response:
        books = extract(response.read().decode("utf-8"))
    output[locale] = {}
    for code, osis in CODES.items():
        texts = books.get(osis)
        if not texts:
            raise ValueError(f"Missing {locale} {osis}")
        name = ENGLISH_NAMES[code] if locale == "en" else preferred(locale, osis, texts)
        if code[0] in "123" and locale not in ("en", "ja", "zh-CN") and not re.match(r"^[1-3]", name):
            name = code[0] + " " + name
        aliases = [name] + [text for text in texts if text != name]
        output[locale][code] = {"name": name, "aliases": aliases}

target = ROOT / "src" / "book-names.js"
target.write_text("// Names and aliases from OpenBible.info Bible-Passage-Reference-Parser-Languages (MIT).\n"
                  + "export const BOOK_NAMES = " + json.dumps(output, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
print(f"Wrote {target} ({target.stat().st_size} bytes)")
