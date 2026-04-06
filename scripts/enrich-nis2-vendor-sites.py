#!/usr/bin/env python3

from __future__ import annotations

import json
import math
import re
import warnings
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from urllib3.exceptions import NotOpenSSLWarning


warnings.filterwarnings("ignore", category=NotOpenSSLWarning)

ROOT = Path(__file__).resolve().parents[1]
VENDOR_PATH = ROOT / "src/data/nis2_vendor_area_matrix_real_v4.json"
OUTPUT_PATH = ROOT / "src/data/nis2_vendor_enrichment_v2.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36"
    )
}

MAX_RELEVANT_LINKS = 3
MAX_WORKERS = 8
REQUEST_TIMEOUT = 12

TYPE_MAP = {
    "legal": "legal",
    "grc": "grc",
    "technical": "technical",
    "soc": "soc",
    "audit": "audit",
}

MATRIX_SIGNAL_KEYWORDS = {
    "governance-responsibility": [
        "governance",
        "ledelse",
        "bestyrelse",
        "board",
        "ansvar",
        "operating model",
        "styringsmodel",
        "policy",
        "politikker",
    ],
    "policies-documentation": [
        "policy",
        "politikker",
        "dokumentation",
        "isms",
        "iso 27001",
        "kontrolramme",
        "controls framework",
        "processer",
        "procedurer",
    ],
    "risk-assessment": [
        "risikovurdering",
        "risk assessment",
        "risikostyring",
        "threat assessment",
        "trusselsvurdering",
    ],
    "supplier-management": [
        "leverandør",
        "third-party",
        "third party",
        "supply chain",
        "outsourcing",
        "kontrakter",
        "vendor risk",
    ],
    "incident-response": [
        "incident response",
        "hændelse",
        "beredskab",
        "forensic",
        "csirt",
        "playbook",
        "tabletop",
        "cyber incident",
    ],
    "logging-monitoring": [
        "logging",
        "monitorering",
        "monitoring",
        "siem",
        "soc",
        "mdr",
        "xdr",
        "detection",
        "detektion",
    ],
    "identity-mfa-pam": [
        "identity",
        "iam",
        "mfa",
        "pam",
        "privileged access",
        "sso",
        "zero trust",
        "adgangsstyring",
    ],
    "asset-access-overview": [
        "asset management",
        "aktivoverblik",
        "asset",
        "cmdb",
        "access review",
        "access governance",
        "inventar",
        "adgangsoverblik",
    ],
    "training-awareness": [
        "awareness",
        "træning",
        "uddannelse",
        "phishing",
        "simulation",
        "security culture",
    ],
    "backup-recovery-continuity": [
        "backup",
        "recovery",
        "disaster recovery",
        "business continuity",
        "continuity",
        "resilience",
        "failover",
        "beredskabsplan",
    ],
    "audit-assurance": [
        "audit",
        "assurance",
        "revision",
        "attestation",
        "certificering",
        "iso 27001",
        "compliance review",
        "review",
    ],
}

DIMENSION_AREA_MAP = {
    "governance": [
        "governance-responsibility",
        "policies-documentation",
        "risk-assessment",
    ],
    "technical": [
        "logging-monitoring",
        "identity-mfa-pam",
        "asset-access-overview",
    ],
    "operational": [
        "incident-response",
        "training-awareness",
        "backup-recovery-continuity",
    ],
    "compliance": [
        "supplier-management",
        "policies-documentation",
        "audit-assurance",
    ],
}

TAG_LABELS = {
    "governance-responsibility": "Governance og ansvar",
    "policies-documentation": "Politikker og dokumentation",
    "risk-assessment": "Risikovurdering",
    "supplier-management": "Leverandørstyring",
    "incident-response": "Incident management",
    "logging-monitoring": "Logging og monitorering",
    "identity-mfa-pam": "Identity / MFA / PAM",
    "asset-access-overview": "Asset- og adgangsoverblik",
    "training-awareness": "Awareness og træning",
    "backup-recovery-continuity": "Business continuity & recovery",
    "audit-assurance": "Audit og assurance",
}

REGULATORY_KEYWORDS = [
    "nis2",
    "nis 2",
    "gdpr",
    "dora",
    "cer",
    "cra",
    "ai act",
    "digital operational resilience",
    "regulatorisk",
    "compliance",
]

SECTOR_KEYWORDS = [
    "transport",
    "finans",
    "finance",
    "bank",
    "sundhed",
    "health",
    "energi",
    "energy",
    "forsyning",
    "public sector",
    "offentlig",
    "critical infrastructure",
]

DELIVERY_KEYWORDS = [
    "services",
    "ydelser",
    "rådgivning",
    "advisory",
    "managed",
    "implementation",
    "implementering",
    "24/7",
    "specialists",
    "eksperter",
    "team",
]

RELEVANT_LINK_KEYWORDS = sorted(
    {
        *REGULATORY_KEYWORDS,
        *SECTOR_KEYWORDS,
        *DELIVERY_KEYWORDS,
        *[keyword for keywords in MATRIX_SIGNAL_KEYWORDS.values() for keyword in keywords],
    },
    key=len,
    reverse=True,
)


@dataclass
class WebsiteSignals:
    summary_text: str
    pages_scanned: int
    source_urls: list[str]
    website_signal_score: int
    website_depth_score: int
    matrix_signal_scores: dict[str, int]
    website_signal_tags: list[str]
    profile_tier: str


def normalize_vendor_type(value: str) -> str:
    return TYPE_MAP.get(value.strip().lower(), "grc")


def build_vendor_key(row: dict[str, str]) -> str:
    vendor_type = normalize_vendor_type(row["Primary_type"])
    rank_in_type = int(row["Rank_in_type"] or 999)
    name = row["Company"].strip()
    return f"{vendor_type}:{rank_in_type}:{name}"


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def clean_text(value: str) -> str:
    value = value.replace("\xa0", " ")
    return normalize_space(value)


def is_same_domain(base: str, candidate: str) -> bool:
    try:
        base_host = urlparse(base).netloc.replace("www.", "")
        candidate_host = urlparse(candidate).netloc.replace("www.", "")
        return base_host == candidate_host
    except Exception:
        return False


def score_relevant_link(href: str, text: str) -> int:
    haystack = f"{href} {text}".lower()
    score = 0

    for keyword in RELEVANT_LINK_KEYWORDS:
        if keyword in haystack:
            score += max(3, min(10, len(keyword)))

    return score


def extract_text(html: str) -> tuple[str, list[tuple[str, str, int]]]:
    soup = BeautifulSoup(html, "html.parser")

    for tag_name in ["script", "style", "noscript", "svg"]:
        for node in soup.find_all(tag_name):
            node.decompose()

    title = clean_text(soup.title.get_text(" ", strip=True)) if soup.title else ""
    meta_description = ""
    meta = soup.find("meta", attrs={"name": "description"})
    if meta and meta.get("content"):
        meta_description = clean_text(meta["content"])

    headings = [
        clean_text(node.get_text(" ", strip=True))
        for node in soup.find_all(["h1", "h2", "h3"])
    ]
    body_text = clean_text(soup.get_text(" ", strip=True))
    combined = " ".join(
        [part for part in [title, meta_description, *headings[:10], body_text] if part]
    )

    relevant_links: list[tuple[str, str, int]] = []
    for anchor in soup.find_all("a", href=True):
        href = clean_text(anchor["href"])
        text = clean_text(anchor.get_text(" ", strip=True))
        if not href or href.startswith("#") or href.startswith("mailto:"):
            continue

        score = score_relevant_link(href, text)
        if score > 0:
            relevant_links.append((href, text, score))

    return combined[:50000], relevant_links


def keyword_count(text: str, keyword: str) -> int:
    pattern = re.escape(keyword.lower())
    return len(re.findall(pattern, text))


def score_keyword_group(text: str, keywords: Iterable[str]) -> int:
    counts = [keyword_count(text, keyword) for keyword in keywords]
    matched = sum(1 for count in counts if count > 0)
    total = sum(min(count, 4) for count in counts)
    raw = matched * 10 + total * 9
    return min(100, raw)


def build_summary(vendor_type: str, tags: list[str], signal_score: int) -> str:
    base = {
        "legal": "Websitet signalerer juridisk rådgivning med fokus på",
        "grc": "Websitet signalerer governance- og dokumentationsforløb med fokus på",
        "technical": "Websitet signalerer teknisk implementering med fokus på",
        "soc": "Websitet signalerer sikkerhedsdrift og monitorering med fokus på",
        "audit": "Websitet signalerer audit- og assuranceydelser med fokus på",
    }.get(vendor_type, "Websitet signalerer ydelser med fokus på")

    if not tags:
        return "Offentligt website giver et generelt signal om cyber- og compliancerelaterede ydelser, men uden tydelig specialisering på de undersider der blev gennemgået."

    top_tags = ", ".join(tags[:3]).lower()
    if signal_score >= 70:
        suffix = "med relativt tydelig markedsprofil og konkret servicebeskrivelse."
    elif signal_score >= 50:
        suffix = "med en rimelig tydelig markedsprofil på tværs af de fundne sider."
    else:
        suffix = "men med begrænset dybde i de fundne offentlige beskrivelser."

    return f"{base} {top_tags} {suffix}"


def fetch_text_for_url(session: requests.Session, url: str) -> tuple[str, list[tuple[str, str, int]]]:
    response = session.get(
        url,
        timeout=REQUEST_TIMEOUT,
        headers=HEADERS,
        allow_redirects=True,
    )
    response.raise_for_status()
    return extract_text(response.text)


def build_website_signals(url: str) -> WebsiteSignals:
    session = requests.Session()
    session.headers.update(HEADERS)

    homepage_text = ""
    relevant_links: list[tuple[str, str, int]] = []
    source_urls: list[str] = []

    try:
      homepage_text, relevant_links = fetch_text_for_url(session, url)
      source_urls.append(url)
    except Exception:
      return WebsiteSignals(
          summary_text="",
          pages_scanned=0,
          source_urls=[],
          website_signal_score=35,
          website_depth_score=20,
          matrix_signal_scores={key: 0 for key in [*DIMENSION_AREA_MAP.keys(), *MATRIX_SIGNAL_KEYWORDS.keys()]},
          website_signal_tags=[],
          profile_tier="directory",
      )

    normalized_links: list[str] = []
    for href, text, score in sorted(relevant_links, key=lambda item: item[2], reverse=True):
        candidate = urljoin(url, href)
        if not is_same_domain(url, candidate):
            continue
        if candidate in normalized_links or candidate == url:
            continue
        normalized_links.append(candidate)
        if len(normalized_links) == MAX_RELEVANT_LINKS:
            break

    texts = [homepage_text]
    for candidate in normalized_links:
        try:
            text, _ = fetch_text_for_url(session, candidate)
            if text:
                texts.append(text)
                source_urls.append(candidate)
        except Exception:
            continue

    combined_text = "\n".join(texts).lower()

    area_scores = {
        area_key: score_keyword_group(combined_text, keywords)
        for area_key, keywords in MATRIX_SIGNAL_KEYWORDS.items()
    }

    dimension_scores = {}
    for dimension, area_keys in DIMENSION_AREA_MAP.items():
        values = [area_scores[area_key] for area_key in area_keys]
        dimension_scores[dimension] = round(sum(values) / max(1, len(values)))

    nis2_score = score_keyword_group(combined_text, REGULATORY_KEYWORDS)
    sector_score = score_keyword_group(combined_text, SECTOR_KEYWORDS)
    delivery_score = score_keyword_group(combined_text, DELIVERY_KEYWORDS)

    all_signal_scores = {**dimension_scores, **area_scores}
    scored_tags = [
        (TAG_LABELS[key], score)
        for key, score in area_scores.items()
        if score >= 30
    ]
    scored_tags.sort(key=lambda item: item[1], reverse=True)
    website_signal_tags = [label for label, _ in scored_tags[:5]]

    website_signal_score = min(
        100,
        round(
            (nis2_score * 0.24)
            + (delivery_score * 0.18)
            + (sector_score * 0.12)
            + (sum(sorted(area_scores.values(), reverse=True)[:4]) / 4 * 0.46)
        ),
    )
    website_depth_score = min(
        100,
        round(18 + len(source_urls) * 16 + len(website_signal_tags) * 8 + min(18, len(combined_text) / 3200)),
    )

    if website_signal_score >= 65 and len(source_urls) >= 2:
        profile_tier = "verified"
    else:
        profile_tier = "directory"

    return WebsiteSignals(
        summary_text=combined_text[:4000],
        pages_scanned=len(source_urls),
        source_urls=source_urls,
        website_signal_score=website_signal_score,
        website_depth_score=website_depth_score,
        matrix_signal_scores=all_signal_scores,
        website_signal_tags=website_signal_tags,
        profile_tier=profile_tier,
    )


def build_vendor_enrichment(rows: list[dict[str, str]]) -> list[dict[str, object]]:
    unique_websites = {
        row["Website"].strip(): row["Primary_type"].strip().lower()
        for row in rows
        if row.get("Website", "").strip()
    }

    website_results: dict[str, WebsiteSignals] = {}
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_map = {
            executor.submit(build_website_signals, website): website
            for website in unique_websites
        }
        for future in as_completed(future_map):
            website = future_map[future]
            try:
                website_results[website] = future.result()
            except Exception:
                website_results[website] = WebsiteSignals(
                    summary_text="",
                    pages_scanned=0,
                    source_urls=[],
                    website_signal_score=35,
                    website_depth_score=20,
                    matrix_signal_scores={key: 0 for key in [*DIMENSION_AREA_MAP.keys(), *MATRIX_SIGNAL_KEYWORDS.keys()]},
                    website_signal_tags=[],
                    profile_tier="directory",
                )

    enrichment_rows: list[dict[str, object]] = []

    for row in rows:
        vendor_type = normalize_vendor_type(row["Primary_type"])
        vendor_key = build_vendor_key(row)
        website = row.get("Website", "").strip()
        website_signals = website_results.get(website)

        if website_signals:
            tags = website_signals.website_signal_tags
            summary = build_summary(
                vendor_type,
                tags,
                website_signals.website_signal_score,
            )
            signal_scores = website_signals.matrix_signal_scores
            website_signal_score = website_signals.website_signal_score
            website_depth_score = website_signals.website_depth_score
            profile_tier = website_signals.profile_tier
            pages_scanned = website_signals.pages_scanned
            source_urls = website_signals.source_urls
        else:
            tags = []
            summary = ""
            signal_scores = {key: 0 for key in [*DIMENSION_AREA_MAP.keys(), *MATRIX_SIGNAL_KEYWORDS.keys()]}
            website_signal_score = 35
            website_depth_score = 20
            profile_tier = "directory"
            pages_scanned = 0
            source_urls = []

        enrichment_rows.append(
            {
                "vendorKey": vendor_key,
                "websiteSummaryDa": summary,
                "websiteSignalTags": tags,
                "websiteSignalScore": website_signal_score,
                "websiteDepthScore": website_depth_score,
                "pagesScanned": pages_scanned,
                "profileTier": profile_tier,
                "casesPerYear": None,
                "dedicatedSpecialists": None,
                "manualBoostScore": 0,
                "sourceUrls": source_urls,
                "matrixSignalScores": signal_scores,
            }
        )

    enrichment_rows.sort(key=lambda item: str(item["vendorKey"]))
    return enrichment_rows


def main() -> None:
    rows = json.loads(VENDOR_PATH.read_text())
    enrichment = build_vendor_enrichment(rows)
    OUTPUT_PATH.write_text(
        json.dumps(enrichment, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(enrichment)} enrichment rows to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
