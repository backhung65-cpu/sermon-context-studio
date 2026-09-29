"""Create a compact verse-to-place index from OpenBible.info's CC BY 4.0 data.

Run: python scripts/build_openbible_data.py [ancient.jsonl] [modern.jsonl] [image.jsonl]
Missing source files are downloaded from the project's public repository.
"""

from __future__ import annotations

import json
import html
import re
import sys
import urllib.request
from pathlib import Path


SOURCE_URL = "https://raw.githubusercontent.com/openbibleinfo/Bible-Geocoding-Data/main/data/ancient.jsonl"
MODERN_URL = "https://raw.githubusercontent.com/openbibleinfo/Bible-Geocoding-Data/main/data/modern.jsonl"
IMAGE_URL = "https://raw.githubusercontent.com/openbibleinfo/Bible-Geocoding-Data/main/data/image.jsonl"
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "data" / "openbible-places.json"


def read_jsonl(path_arg: str | None, url: str) -> list[dict]:
    if path_arg:
        lines = Path(path_arg).read_text(encoding="utf-8").splitlines()
    else:
        with urllib.request.urlopen(url, timeout=45) as response:
            lines = response.read().decode("utf-8").splitlines()
    return [json.loads(line) for line in lines if line.strip()]


def license_link(name: str) -> str | None:
    match = re.fullmatch(r"CC-(BY|BY-SA)-(\d\.\d)", name)
    if match:
        family = "by-sa" if match.group(1) == "BY-SA" else "by"
        return f"https://creativecommons.org/licenses/{family}/{match.group(2)}/"
    if name == "CC-Zero":
        return "https://creativecommons.org/publicdomain/zero/1.0/"
    if name in {"PD", "CC-PD-Mark"}:
        return "https://creativecommons.org/publicdomain/mark/1.0/"
    return None


def photo_from_media(media: dict | None, images: dict[str, dict]) -> dict | None:
    thumbnail = (media or {}).get("thumbnail") or {}
    image = images.get(thumbnail.get("image_id"))
    if not image or thumbnail.get("quality") == "low":
        return None
    license_url = license_link(image.get("license", ""))
    source_url = image.get("credit_url", "")
    filename = thumbnail.get("file", "")
    if not license_url or not source_url.startswith("https://commons.wikimedia.org/wiki/File:"):
        return None
    if not re.fullmatch(r"[A-Za-z0-9.\-_]+\.jpe?g", filename):
        return None
    description = html.unescape(re.sub(r"<[^>]+>", "", thumbnail.get("description", "")))
    modern_id = filename.split(".", 1)[0]
    edits = (image.get("thumbnails") or {}).get(modern_id, {}).get("edits") or []
    return {
        "url": f"https://a.openbible.info/geo/images/512/{filename}",
        "alt": description or "현재 지역 현장 사진",
        "credit": image.get("credit") or image.get("author") or thumbnail.get("credit") or "원본 제공자",
        "sourceUrl": source_url,
        "license": image["license"],
        "licenseUrl": license_url,
        "edited": bool(edits),
    }


def photo_for_place(row: dict, modern: dict[str, dict], images: dict[str, dict]) -> dict | None:
    photo = photo_from_media(row.get("media"), images)
    if photo:
        return photo
    associations = sorted(
        (row.get("modern_associations") or {}).items(),
        key=lambda item: item[1].get("score", 0),
        reverse=True,
    )
    if associations:
        return photo_from_media((modern.get(associations[0][0]) or {}).get("media"), images)
    return None


def lonlat_from_resolution(resolution: dict) -> list[float] | None:
    raw = resolution.get("lonlat")
    if not raw:
        return None
    try:
        lon, lat = (float(value) for value in raw.split(",", 1))
    except (TypeError, ValueError):
        return None
    if -180 <= lon <= 180 and -90 <= lat <= 90:
        return [round(lon, 6), round(lat, 6)]
    return None


def locations_for(row: dict) -> tuple[list[float] | None, int]:
    identifications = row.get("identifications", [])
    candidates: list[tuple[int, list[float]]] = []
    for association in row.get("modern_associations", {}).values():
        score = association.get("score", 0)
        for identification_i, resolution_i in association.get("identification_ids", []):
            try:
                resolution = identifications[identification_i]["resolutions"][resolution_i]
            except (IndexError, KeyError, TypeError):
                continue
            coordinate = lonlat_from_resolution(resolution)
            if coordinate:
                candidates.append((score, coordinate))

    if not candidates:
        for identification in identifications:
            for resolution in identification.get("resolutions", []):
                coordinate = lonlat_from_resolution(resolution)
                if coordinate:
                    candidates.append((0, coordinate))

    if not candidates:
        return None, 0
    candidates.sort(key=lambda item: item[0], reverse=True)
    unique = {(lon, lat) for _, (lon, lat) in candidates}
    return candidates[0][1], len(unique)


def main() -> None:
    ancient_rows = read_jsonl(sys.argv[1] if len(sys.argv) > 1 else None, SOURCE_URL)
    modern_rows = read_jsonl(sys.argv[2] if len(sys.argv) > 2 else None, MODERN_URL)
    image_rows = read_jsonl(sys.argv[3] if len(sys.argv) > 3 else None, IMAGE_URL)
    modern = {row["id"]: row for row in modern_rows}
    images = {row["id"]: row for row in image_rows}

    places: list[dict] = []
    index: dict[str, dict[str, list[int]]] = {}
    for row in ancient_rows:
        verses = row.get("verses") or []
        if not verses:
            continue
        coordinate, candidate_count = locations_for(row)
        place_i = len(places)
        places.append({
            "id": row["id"],
            "name": row.get("friendly_id", ""),
            "type": (row.get("types") or ["place"])[0],
            "coordinate": coordinate,
            "candidateCount": candidate_count,
            "sourceUrl": f"https://www.openbible.info/geo/ancient/{row['id']}/{row['url_slug']}",
            "photo": photo_for_place(row, modern, images),
        })
        for verse in verses:
            # Keep place mentions shared by at least half of the ten English
            # translations indexed upstream; single-translation wording can
            # otherwise appear as a second place in a Korean passage.
            if len(verse.get("translations") or []) < 5:
                continue
            match = re.fullmatch(r"([1-3]?[A-Z]{2,3}) (\d+):(\d+)", verse.get("usx", ""))
            if match:
                chapter = f"{match.group(1)} {match.group(2)}"
                number = match.group(3)
                index.setdefault(chapter, {}).setdefault(number, []).append(place_i)

    payload = {
        "source": "OpenBible.info Bible Geocoding Data",
        "sourceUrl": "https://github.com/openbibleinfo/Bible-Geocoding-Data",
        "license": "CC BY 4.0",
        "places": places,
        "index": index,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {len(places)} places, {sum(bool(place['photo']) for place in places)} credited photos, "
          f"and {sum(len(v) for v in index.values())} indexed verses to {OUTPUT}")


if __name__ == "__main__":
    main()
