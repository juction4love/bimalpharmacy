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
UNIT_SPACE_RE = re.compile(r"(?<=\d)\s+(?=(?:mcg|mg|kg|ml|iu|units?|g|l)\b)")


def normalize(value: object) -> str:
    text = unicodedata.normalize("NFKD", str(value or "").casefold())
    text = "".join(char for char in text if not unicodedata.combining(char))
    return UNIT_SPACE_RE.sub("", " ".join(NON_WORD_RE.sub(" ", text).split()))


def bucket(token: str) -> str:
    prefix = token[:2]
    if prefix and all("a" <= char <= "z" or "0" <= char <= "9" for char in prefix):
        return prefix + "_" * (2 - len(prefix))
    return "other"


def term_chunk_key(manifest: dict[str, object], token: str) -> str | None:
    base = bucket(token)
    children = manifest["splitRoutes"].get(base)
    if not children:
        return base if base in manifest["termChunkKeys"] else None
    if len(token) == 2:
        return f"{base}-broad"
    child = (token[:3] + "___")[:3]
    if child not in children:
        return None
    grandchildren = manifest["splitRoutesLevelThree"].get(child)
    if not grandchildren:
        return child
    if len(token) == 3:
        return f"{child}-broad"
    grandchild = (token[:4] + "____")[:4]
    return grandchild if grandchild in grandchildren else None


def posting_priority(item: dict[str, object]) -> tuple[object, ...]:
    return (
        -bool(item["exactMask"] & 1),
        -bool(item["prefixMask"] & 1),
        -bool(item["fieldMask"] & 1),
        -bool(item["exactMask"] & 2),
        -bool(item["prefixMask"] & 2),
        -bool(item["fieldMask"] & 2),
        -item["termScore"],
        item["id"],
    )


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


def search(manifest: dict[str, object], query: str) -> tuple[list[list[object]], dict[str, object]]:
    started = time.perf_counter()
    normalized_query = normalize(query)
    tokens = list(dict.fromkeys(normalized_query.split()))
    token_maps: list[dict[int, dict[str, object]]] = []
    bytes_loaded = 0
    posting_files: set[str] = set()

    for token_index, token in enumerate(tokens):
        chunk_key = term_chunk_key(manifest, token)
        if not chunk_key:
            token_maps.append({})
            continue
        relative_path = f"terms/terms-{chunk_key}.json"
        path = INDEX / relative_path
        if relative_path not in posting_files:
            bytes_loaded += path.stat().st_size
            posting_files.add(relative_path)
        chunk = json.loads(path.read_text(encoding="utf-8"))
        token_candidates: dict[int, dict[str, object]] = {}
        for term, postings in chunk["terms"]:
            if token not in term:
                continue
            term_score = 120 if term == token else 80 if term.startswith(token) else 40
            for record_id, record_bucket_id, field_mask, exact_mask, prefix_mask in postings:
                candidate = token_candidates.setdefault(
                    record_id,
                    {"id": record_id, "recordBucketId": record_bucket_id, "fieldMask": 0, "exactMask": 0, "prefixMask": 0, "termScore": 0},
                )
                candidate["fieldMask"] |= field_mask
                candidate["exactMask"] |= exact_mask
                candidate["prefixMask"] |= prefix_mask
                candidate["termScore"] += term_score
        bounded = sorted(token_candidates.values(), key=posting_priority)[: manifest["clientCandidateLimit"]]
        token_maps.append({item["id"]: item for item in bounded})

    anchor = min(token_maps, key=len)
    candidates: list[dict[str, object]] = []
    for anchor_item in anchor.values():
        candidate = dict(anchor_item)
        candidate["tokens"] = 0
        for token_map in token_maps:
            match = token_map.get(candidate["id"])
            if not match:
                continue
            candidate["tokens"] += 1
            candidate["fieldMask"] |= match["fieldMask"]
            candidate["exactMask"] |= match["exactMask"]
            candidate["prefixMask"] |= match["prefixMask"]
            candidate["termScore"] += match["termScore"]
        candidates.append(candidate)

    preliminary = sorted(
        candidates,
        key=lambda item: (
            -(item["tokens"] == len(tokens)),
            -bool(item["exactMask"] & 1),
            -bool(item["prefixMask"] & 1),
            -bool(item["exactMask"] & 2),
            -bool(item["prefixMask"] & 2),
            -item["tokens"],
            -bool(item["fieldMask"] & 1),
            -bool(item["fieldMask"] & 2),
            -item["termScore"],
            item["id"],
        ),
    )[: manifest["detailCandidateLimit"]]

    wanted = {item["id"] for item in preliminary}
    records: list[list[object]] = []
    detail_files: set[str] = set()
    for bucket_id in sorted({item["recordBucketId"] for item in preliminary}):
        bucket_name = f"{bucket_id:04x}"
        relative_path = f"records/records-{bucket_name}.json"
        path = INDEX / relative_path
        bytes_loaded += path.stat().st_size
        detail_files.add(relative_path)
        chunk = json.loads(path.read_text(encoding="utf-8"))
        records.extend(record for record in chunk["records"] if record[0] in wanted)

    ranked = sorted(
        ((rank(record, normalized_query, tokens), record) for record in records),
        key=lambda item: (-item[0], normalize(item[1][1]), item[1][0]),
    )
    results = [record for score, record in ranked if score > 0][:50]
    return results, {
        "postingFiles": len(posting_files),
        "detailFiles": len(detail_files),
        "totalFiles": len(posting_files) + len(detail_files),
        "bytesLoadedWithoutCache": bytes_loaded,
        "candidateIds": len(candidates),
        "detailCandidates": len(preliminary),
        "renderedResults": min(20, len(results)),
        "elapsedMs": round((time.perf_counter() - started) * 1000, 2),
    }


def main() -> None:
    manifest = json.loads((INDEX / "manifest.json").read_text(encoding="utf-8"))
    cases = [
        "A Cold 5mg/500mg/30mg Tablet",
        "a cold",
        "pa",
        "par",
        "paracetamol",
        "PARACETAMOL 500",
        "am",
        "amox",
        "amoxicillin",
        "  amox   500 cap  ",
        "co",
        "vit",
        "vitamin",
        "met",
        "metformin",
        "ator",
        "azith",
        "500",
        "500 mg",
        "zocef 500",
        "dietary",
        "tablet",
        "sun pharma",
        "medicine",
        "zzqxqv",
    ]
    report = []
    for query in cases:
        results, metrics = search(manifest, query)
        report.append(
            {
                "query": query,
                "results": len(results),
                "firstBrand": results[0][1] if results else None,
                **metrics,
            }
        )
    by_query = {item["query"]: item for item in report}
    if by_query[cases[0]]["results"] == 0 or by_query[cases[1]]["results"] == 0:
        raise SystemExit("Exact or partial brand search failed")
    if by_query["paracetamol"]["results"] == 0 or by_query["PARACETAMOL 500"]["results"] == 0:
        raise SystemExit("Generic or generic-plus-strength search failed")
    if by_query["  amox   500 cap  "]["results"] == 0:
        raise SystemExit("Multi-token abbreviated search failed")
    if report[-1]["results"] != 0:
        raise SystemExit("No-result search returned unrelated records")
    if normalize(report[0]["firstBrand"]) != normalize(cases[0]):
        raise SystemExit("Exact brand did not outrank substring matches")
    if normalize(search(manifest, "amoxicillin")[0][0][2]) != "amoxicillin":
        raise SystemExit("Exact generic did not outrank weak metadata matches")
    if "500" not in normalize(by_query["PARACETAMOL 500"]["firstBrand"]):
        raise SystemExit("Generic plus strength did not preserve multi-token relevance")
    amox_first = normalize(by_query["  amox   500 cap  "]["firstBrand"])
    if "500" not in amox_first or "cap" not in amox_first:
        raise SystemExit("amox 500 cap ranking regression")
    zocef_first = normalize(by_query["zocef 500"]["firstBrand"])
    if "zocef" not in zocef_first or "500" not in zocef_first:
        raise SystemExit("Brand plus strength did not outrank brand-only results")
    payload_limit = 2_000_000
    oversized = [item for item in report[:-1] if item["bytesLoadedWithoutCache"] > payload_limit]
    if oversized:
        raise SystemExit(f"Payload regression above {payload_limit} bytes: {oversized}")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
