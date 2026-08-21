#!/usr/bin/env python3
"""Smoke-test the generated static medicine index and ranking."""

from __future__ import annotations

import json
import re
import time
import unicodedata
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "medicine-search"
NON_WORD_RE = re.compile(r"[^\w]+", re.UNICODE)


def normalize(value: object) -> str:
    text = unicodedata.normalize("NFKD", str(value or "").casefold())
    text = "".join(char for char in text if not unicodedata.combining(char))
    return " ".join(NON_WORD_RE.sub(" ", text).split())


def bucket(token: str) -> str:
    prefix = token[:2]
    if prefix and all("a" <= char <= "z" or "0" <= char <= "9" for char in prefix):
        return prefix + "_" * (2 - len(prefix))
    return "other"


def rank(record: list[object], query: str, tokens: list[str]) -> int:
    brand, generic, strength, category, form, manufacturer, pack = map(normalize, record[1:])
    combined = " ".join((brand, generic, strength, category, form, manufacturer, pack))
    matched = sum(token in combined for token in tokens)
    if not matched:
        return 0
    score = matched * 100 + (500 if matched == len(tokens) else 0)
    if brand == query:
        score += 1000
    elif brand.startswith(query):
        score += 800
    if generic == query:
        score += 700
    elif generic.startswith(query):
        score += 600
    if query in brand:
        score += 500
    if query in generic:
        score += 400
    if any(query in value for value in (strength, category, form, manufacturer, pack)):
        score += 200
    return score


def search(manifest: dict[str, object], query: str) -> tuple[list[list[object]], int, float]:
    started = time.perf_counter()
    normalized_query = normalize(query)
    tokens = list(dict.fromkeys(normalized_query.split()))
    candidates: dict[int, dict[str, object]] = {}
    bytes_loaded = 0

    for token_index, token in enumerate(tokens):
        entry = manifest["termChunks"].get(bucket(token))
        if not entry:
            continue
        path = INDEX / entry["file"]
        bytes_loaded += path.stat().st_size
        chunk = json.loads(path.read_text(encoding="utf-8"))
        for term, postings in chunk["terms"]:
            if token not in term:
                continue
            term_score = 120 if term == token else 80 if term.startswith(token) else 40
            for record_id, record_bucket_id, field_mask in postings:
                candidate = candidates.setdefault(
                    record_id,
                    {"id": record_id, "recordBucketId": record_bucket_id, "fieldMask": 0, "tokens": set(), "termScore": 0},
                )
                candidate["fieldMask"] |= field_mask
                candidate["tokens"].add(token_index)
                candidate["termScore"] += term_score

    preliminary = sorted(
        candidates.values(),
        key=lambda item: (
            -len(item["tokens"]),
            -(len(item["tokens"]) == len(tokens)),
            -bool(item["fieldMask"] & 1),
            -bool(item["fieldMask"] & 2),
            -item["termScore"],
            item["id"],
        ),
    )[:120]

    wanted = {item["id"] for item in preliminary}
    records: list[list[object]] = []
    for bucket_id in sorted({item["recordBucketId"] for item in preliminary}):
        bucket_name = manifest["recordBucketNames"][bucket_id]
        path = INDEX / manifest["recordChunks"][bucket_name]["file"]
        bytes_loaded += path.stat().st_size
        chunk = json.loads(path.read_text(encoding="utf-8"))
        records.extend(record for record in chunk["records"] if record[0] in wanted)

    ranked = sorted(
        ((rank(record, normalized_query, tokens), record) for record in records),
        key=lambda item: (-item[0], normalize(item[1][1]), item[1][0]),
    )
    results = [record for score, record in ranked if score > 0][:50]
    return results, bytes_loaded, (time.perf_counter() - started) * 1000


def main() -> None:
    manifest = json.loads((INDEX / "manifest.json").read_text(encoding="utf-8"))
    cases = [
        "A Cold 5mg/500mg/30mg Tablet",
        "a cold",
        "paracetamol",
        "PARACETAMOL 500",
        "  amox   500 cap  ",
        "dietary",
        "tablet",
        "sun pharma",
        "zzqxqv",
    ]
    report = []
    for query in cases:
        results, bytes_loaded, elapsed_ms = search(manifest, query)
        report.append(
            {
                "query": query,
                "results": len(results),
                "firstBrand": results[0][1] if results else None,
                "bytesLoadedWithoutCache": bytes_loaded,
                "elapsedMs": round(elapsed_ms, 2),
            }
        )
    if report[0]["results"] == 0 or report[1]["results"] == 0:
        raise SystemExit("Exact or partial brand search failed")
    if report[2]["results"] == 0 or report[3]["results"] == 0:
        raise SystemExit("Generic or generic-plus-strength search failed")
    if report[4]["results"] == 0:
        raise SystemExit("Multi-token abbreviated search failed")
    if report[-1]["results"] != 0:
        raise SystemExit("No-result search returned unrelated records")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
