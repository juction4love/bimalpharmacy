#!/usr/bin/env python3
"""Build the static, public medicine-search index from the local data catalog."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import sqlite3
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATA_DIR = ROOT / "data"
DEFAULT_OUTPUT_DIR = ROOT / "medicine-search"
SPACE_RE = re.compile(r"\s+")
NON_WORD_RE = re.compile(r"[^\w]+", re.UNICODE)
HTML_RE = re.compile(r"<[^>]+>")
UNIT_SPACE_RE = re.compile(r"(?<=\d)\s+(?=(?:mcg|mg|kg|ml|iu|units?|g|l)\b)")
RECORDS_PER_CHUNK = 64
TERM_SPLIT_BYTES = 200_000
MAX_POSTINGS_PER_TERM = 3_000
MAX_BROAD_POSTINGS = 800


def clean(value: object) -> str:
    if value is None:
        return ""
    return SPACE_RE.sub(" ", unicodedata.normalize("NFC", str(value)).strip())


def normalize(value: str) -> str:
    text = unicodedata.normalize("NFKD", clean(value).casefold())
    text = "".join(char for char in text if not unicodedata.combining(char))
    text = SPACE_RE.sub(" ", NON_WORD_RE.sub(" ", text)).strip()
    return UNIT_SPACE_RE.sub("", text)


def token_bucket(token: str) -> str:
    prefix = token[:2]
    if prefix and all("a" <= char <= "z" or "0" <= char <= "9" for char in prefix):
        return prefix + "_" * (2 - len(prefix))
    return "other"


def public_record(row: sqlite3.Row, record_id: int) -> list[object]:
    return [
        record_id,
        clean(row["name"]),
        clean(row["generic_name"]),
        clean(row["strength"]),
        clean(row["product_type"]),
        clean(row["route"]),
        clean(row["manufacturer"]),
        clean(row["pack"]),
    ]


def record_bucket(record_id: int) -> str:
    return f"{(record_id - 1) // RECORDS_PER_CHUNK:04x}"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def discover_files(data_dir: Path) -> list[dict[str, object]]:
    discovered: list[dict[str, object]] = []
    for path in sorted(item for item in data_dir.rglob("*") if item.is_file()):
        entry: dict[str, object] = {
            "path": path.relative_to(data_dir).as_posix(),
            "bytes": path.stat().st_size,
            "extension": path.suffix.lower(),
            "sha256": sha256_file(path),
        }
        if path.suffix.lower() == ".db":
            connection = sqlite3.connect(f"file:{path.resolve().as_posix()}?mode=ro", uri=True)
            integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
            tables = {row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table'")}
            meta = dict(connection.execute("SELECT key, value FROM catalog_meta")) if "catalog_meta" in tables else {}
            entry.update(
                {
                    "type": "SQLite 3 database",
                    "role": "canonical medicine catalog candidate",
                    "integrity": integrity,
                    "tables": sorted(tables),
                    "medicineColumns": [row[1] for row in connection.execute("PRAGMA table_info(medicine)")]
                    if "medicine" in tables
                    else [],
                    "catalogVersion": int(meta.get("catalog_version", 0)),
                    "canonicalRecords": connection.execute("SELECT count(*) FROM medicine").fetchone()[0]
                    if "medicine" in tables
                    else 0,
                    "provenanceRecords": connection.execute("SELECT count(*) FROM medicine_source").fetchone()[0]
                    if "medicine_source" in tables
                    else 0,
                }
            )
            connection.close()
        elif path.suffix.lower() == ".json":
            entry.update({"type": "JSON", "encoding": "UTF-8"})
            try:
                payload = json.loads(path.read_text(encoding="utf-8-sig"))
                entry["records"] = len(payload) if isinstance(payload, list) else 1
                entry["role"] = "legacy raw union" if isinstance(payload, list) else "catalog build metadata"
                if isinstance(payload, list):
                    entry["keys"] = sorted({str(key) for record in payload if isinstance(record, dict) for key in record})
                elif isinstance(payload, dict):
                    entry["keys"] = sorted(str(key) for key in payload)
            except (UnicodeError, json.JSONDecodeError) as error:
                entry.update({"valid": False, "error": type(error).__name__})
        else:
            entry["type"] = "unsupported"
        discovered.append(entry)
    return discovered


def choose_catalog(data_dir: Path) -> tuple[Path, dict[str, str]]:
    candidates: list[tuple[int, Path, dict[str, str]]] = []
    for path in sorted(data_dir.rglob("*.db")):
        connection = sqlite3.connect(f"file:{path.resolve().as_posix()}?mode=ro", uri=True)
        connection.row_factory = sqlite3.Row
        tables = {row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        if "medicine" not in tables or "catalog_meta" not in tables:
            connection.close()
            continue
        if connection.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
            connection.close()
            continue
        meta = {row["key"]: row["value"] for row in connection.execute("SELECT key, value FROM catalog_meta")}
        candidates.append((int(meta.get("catalog_version", 0)), path, meta))
        connection.close()
    if not candidates:
        raise RuntimeError("No valid canonical medicine catalog was found in the data folder")
    _, path, meta = max(candidates, key=lambda item: (item[0], item[1].name))
    return path, meta


def write_json(path: Path, value: object) -> int:
    content = json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True) + "\n"
    path.write_text(content, encoding="utf-8", newline="\n")
    return len(content.encode("utf-8"))


def encoded_json(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True) + "\n").encode("utf-8")


def posting_priority(posting: list[int]) -> tuple[int, ...]:
    record_id, _record_bucket_id, field_mask, exact_mask, prefix_mask = posting
    return (
        -bool(exact_mask & 1),
        -bool(prefix_mask & 1),
        -bool(field_mask & 1),
        -bool(exact_mask & 2),
        -bool(prefix_mask & 2),
        -bool(field_mask & 2),
        -bin(field_mask).count("1"),
        record_id,
    )


def build(data_dir: Path, output_dir: Path) -> dict[str, object]:
    discovered = discover_files(data_dir)
    catalog_path, meta = choose_catalog(data_dir)
    if output_dir.exists():
        shutil.rmtree(output_dir)
    terms_dir = output_dir / "terms"
    records_dir = output_dir / "records"
    terms_dir.mkdir(parents=True)
    records_dir.mkdir(parents=True)

    connection = sqlite3.connect(f"file:{catalog_path.resolve().as_posix()}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    rows = connection.execute(
        """
        SELECT name, generic_name, strength, product_type, route, manufacturer, pack
        FROM medicine
        ORDER BY name_normalized, generic_normalized, strength, route, manufacturer_normalized, stable_id
        """
    )

    record_chunks: dict[str, list[list[object]]] = defaultdict(list)
    record_bucket_by_id: dict[int, str] = {}
    term_postings: dict[str, dict[str, dict[int, tuple[int, int, int]]]] = defaultdict(lambda: defaultdict(dict))
    quality = Counter()
    final_count = 0
    for final_count, row in enumerate(rows, start=1):
        record = public_record(row, final_count)
        brand, generic, strength, category, dosage_form, manufacturer, pack = record[1:]
        if not brand:
            quality["emptyBrand"] += 1
            continue
        quality["emptyGeneric"] += not bool(generic)
        quality["emptyStrength"] += not bool(strength)
        quality["emptyDosageForm"] += not bool(dosage_form)
        quality["emptyManufacturer"] += not bool(manufacturer)
        quality["htmlFragments"] += any(HTML_RE.search(value) is not None for value in record[1:])
        quality["replacementCharacters"] += any("\ufffd" in value for value in record[1:])
        quality["numericOnlyBrands"] += normalize(brand).replace(" ", "").isdigit()
        quality["fieldsOver250Characters"] += any(len(value) > 250 for value in record[1:])

        detail_bucket = record_bucket(final_count)
        record_chunks[detail_bucket].append(record)
        record_bucket_by_id[final_count] = detail_bucket
        fields = (brand, generic, strength, category, dosage_form, manufacturer, pack)
        for field_index, field_value in enumerate(fields):
            field_mask = 1 << field_index
            normalized_field = normalize(field_value)
            for term in set(normalized_field.split()):
                if not term:
                    continue
                bucket = token_bucket(term)
                previous = term_postings[bucket][term].get(final_count, (0, 0, 0))
                term_postings[bucket][term][final_count] = (
                    previous[0] | field_mask,
                    previous[1] | (field_mask if normalized_field == term else 0),
                    previous[2] | (field_mask if normalized_field.startswith(term) else 0),
                )
    connection.close()

    record_bucket_names = sorted(record_chunks)
    record_bucket_ids = {bucket: index for index, bucket in enumerate(record_bucket_names)}
    record_bytes = 0
    for bucket in record_bucket_names:
        filename = f"records-{bucket}.json"
        size = write_json(records_dir / filename, {"records": record_chunks[bucket]})
        record_bytes += size

    term_bytes = 0
    term_chunk_count = 0
    term_chunk_keys: list[str] = []
    split_routes: dict[str, list[str]] = {}
    split_routes_level_three: dict[str, list[str]] = {}

    def prepare_terms(source: dict[str, dict[int, tuple[int, int, int]]]) -> list[list[object]]:
        prepared: list[list[object]] = []
        for term in sorted(source):
            postings = [
                [record_id, record_bucket_ids[record_bucket_by_id[record_id]], *masks]
                for record_id, masks in source[term].items()
            ]
            postings.sort(key=posting_priority)
            prepared.append([term, postings[:MAX_POSTINGS_PER_TERM]])
        return prepared

    def store_term_chunk(logical_key: str, terms: list[list[object]]) -> None:
        nonlocal term_bytes, term_chunk_count
        filename = f"terms-{logical_key}.json"
        size = write_json(terms_dir / filename, {"terms": terms})
        term_bytes += size
        term_chunk_count += 1
        term_chunk_keys.append(logical_key)

    def store_broad_chunk(prefix: str, terms: list[list[object]]) -> None:
        broad_by_id: dict[int, list[int]] = {}
        for term, postings in terms:
            for record_id, record_bucket_id, field_mask, exact_mask, prefix_mask in postings:
                current = broad_by_id.setdefault(record_id, [record_id, record_bucket_id, 0, 0, 0])
                current[2] |= field_mask
                current[3] |= exact_mask if term == prefix else 0
                current[4] |= prefix_mask
        broad_postings = sorted(broad_by_id.values(), key=posting_priority)[:MAX_BROAD_POSTINGS]
        store_term_chunk(f"{prefix}-broad", [[prefix, broad_postings]])

    for bucket in sorted(term_postings):
        terms = prepare_terms(term_postings[bucket])
        if len(encoded_json({"terms": terms})) <= TERM_SPLIT_BYTES or bucket == "other":
            store_term_chunk(bucket, terms)
            continue

        children: dict[str, list[list[object]]] = defaultdict(list)
        for term, postings in terms:
            child_key = (term[:3] + "___")[:3]
            children[child_key].append([term, postings])
        store_broad_chunk(bucket, terms)
        for child_key in sorted(children):
            child_terms = children[child_key]
            if len(encoded_json({"terms": child_terms})) <= TERM_SPLIT_BYTES:
                store_term_chunk(child_key, child_terms)
                continue
            grandchildren: dict[str, list[list[object]]] = defaultdict(list)
            for term, postings in child_terms:
                grandchildren[(term[:4] + "____")[:4]].append([term, postings])
            store_broad_chunk(child_key, child_terms)
            for grandchild_key in sorted(grandchildren):
                store_term_chunk(grandchild_key, grandchildren[grandchild_key])
            split_routes_level_three[child_key] = sorted(grandchildren)
        split_routes[bucket] = sorted(children)

    source_counts = json.loads(meta.get("source_counts", "{}"))
    provenance_count = int(meta.get("provenance_count", sum(source_counts.values())))
    canonical_count = int(meta.get("canonical_count", final_count))
    report = {
        "sourceFiles": discovered,
        "selectedCatalog": catalog_path.relative_to(data_dir).as_posix(),
        "rawRecordsDiscovered": provenance_count,
        "validRecordsParsed": provenance_count,
        "duplicatesRemoved": provenance_count - canonical_count,
        "recordsSkipped": 0,
        "finalUniqueRecords": canonical_count,
        "sourceCounts": source_counts,
        "quality": dict(sorted(quality.items())),
        "privateFieldsExcluded": ["internal IDs", "raw price", "sales price", "importer", "discontinued flag", "raw source JSON"],
        "termChunkCount": term_chunk_count,
        "recordChunkCount": len(record_chunks),
        "termIndexBytes": term_bytes,
        "recordDataBytes": record_bytes,
        "generatedBytes": term_bytes + record_bytes,
    }

    manifest = {
        "version": 2,
        "recordCount": canonical_count,
        "minimumQueryLength": 2,
        "architecture": "adaptive two/three/four-character term postings plus 64-record detail blocks",
        "schema": ["id", "brandName", "genericName", "strength", "category", "dosageForm", "manufacturer", "packSize"],
        "fieldMasks": {"brandName": 1, "genericName": 2, "strength": 4, "category": 8, "dosageForm": 16, "manufacturer": 32, "packSize": 64},
        "recordBucketCount": len(record_bucket_names),
        "splitRoutes": split_routes,
        "splitRoutesLevelThree": split_routes_level_three,
        "termChunkKeys": sorted(term_chunk_keys),
        "clientCandidateLimit": 10000,
        "detailCandidateLimit": 32,
    }
    write_json(output_dir / "manifest.json", manifest)
    write_json(output_dir / "build-report.json", report)
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=DEFAULT_DATA_DIR)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    args = parser.parse_args()
    report = build(args.data_dir.resolve(), args.output_dir.resolve())
    print(json.dumps(report, ensure_ascii=True, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
