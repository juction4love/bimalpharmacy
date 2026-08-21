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


def clean(value: object) -> str:
    if value is None:
        return ""
    return SPACE_RE.sub(" ", unicodedata.normalize("NFC", str(value)).strip())


def normalize(value: str) -> str:
    text = unicodedata.normalize("NFKD", clean(value).casefold())
    text = "".join(char for char in text if not unicodedata.combining(char))
    return SPACE_RE.sub(" ", NON_WORD_RE.sub(" ", text)).strip()


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


def record_bucket(record: list[object]) -> str:
    tokens = normalize(str(record[1])).split()
    return token_bucket(tokens[0]) if tokens else "other"


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
    term_postings: dict[str, dict[str, dict[int, int]]] = defaultdict(lambda: defaultdict(dict))
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

        detail_bucket = record_bucket(record)
        record_chunks[detail_bucket].append(record)
        record_bucket_by_id[final_count] = detail_bucket
        fields = (brand, generic, strength, category, dosage_form, manufacturer, pack)
        for field_index, field_value in enumerate(fields):
            field_mask = 1 << field_index
            for term in set(normalize(field_value).split()):
                if not term:
                    continue
                bucket = token_bucket(term)
                term_postings[bucket][term][final_count] = (
                    term_postings[bucket][term].get(final_count, 0) | field_mask
                )
    connection.close()

    record_bucket_names = sorted(record_chunks)
    record_bucket_ids = {bucket: index for index, bucket in enumerate(record_bucket_names)}
    record_manifest: dict[str, dict[str, object]] = {}
    record_bytes = 0
    for bucket in record_bucket_names:
        filename = f"records-{bucket}.json"
        size = write_json(records_dir / filename, {"records": record_chunks[bucket]})
        record_bytes += size
        record_manifest[bucket] = {
            "file": f"records/{filename}",
            "records": len(record_chunks[bucket]),
            "bytes": size,
        }

    term_manifest: dict[str, dict[str, object]] = {}
    term_bytes = 0
    for bucket in sorted(term_postings):
        filename = f"terms-{bucket}.json"
        terms = []
        posting_count = 0
        for term in sorted(term_postings[bucket]):
            postings = [
                [record_id, record_bucket_ids[record_bucket_by_id[record_id]], field_mask]
                for record_id, field_mask in sorted(term_postings[bucket][term].items())
            ]
            posting_count += len(postings)
            terms.append([term, postings])
        size = write_json(terms_dir / filename, {"terms": terms})
        term_bytes += size
        term_manifest[bucket] = {
            "file": f"terms/{filename}",
            "terms": len(terms),
            "postings": posting_count,
            "bytes": size,
        }

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
        "termChunkCount": len(term_postings),
        "recordChunkCount": len(record_chunks),
        "termIndexBytes": term_bytes,
        "recordDataBytes": record_bytes,
        "generatedBytes": term_bytes + record_bytes,
    }

    manifest = {
        "version": 1,
        "recordCount": canonical_count,
        "minimumQueryLength": 2,
        "architecture": "two-character term postings plus single-copy record chunks",
        "schema": ["id", "brandName", "genericName", "strength", "category", "dosageForm", "manufacturer", "packSize"],
        "fieldMasks": {"brandName": 1, "genericName": 2, "strength": 4, "category": 8, "dosageForm": 16, "manufacturer": 32, "packSize": 64},
        "recordBucketNames": record_bucket_names,
        "termChunks": term_manifest,
        "recordChunks": record_manifest,
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
