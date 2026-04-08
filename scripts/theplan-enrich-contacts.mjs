import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const exportsDir = resolve(root, "exports");
const matrixPath = resolve(root, "src/data/nis2_vendor_area_matrix_real_v4.json");
const inputPath = resolve(exportsDir, "theplan_outreach_leads.json");
const outputJsonPath = resolve(exportsDir, "theplan_contact_enrichment.json");
const outputCsvPath = resolve(exportsDir, "theplan_contact_enrichment.csv");

const REQUEST_TIMEOUT_MS = 6000;
const MAX_CONTACT_PAGES = 2;
const CONCURRENCY = 8;

mkdirSync(exportsDir, { recursive: true });

const matrix = JSON.parse(readFileSync(matrixPath, "utf8"));
const outreachRecords = JSON.parse(readFileSync(inputPath, "utf8"));

const matrixByCompany = new Map(matrix.map((row) => [row.Company, row]));

function csvEscape(value) {
  const stringValue = value == null ? "" : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function normalizeText(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function htmlToText(html = "") {
  return normalizeText(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gim, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gim, " ")
      .replace(/<[^>]+>/g, "\n")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&"),
  );
}

function extractEmails(text) {
  const blockedTlds = new Set([
    "png",
    "jpg",
    "jpeg",
    "svg",
    "webp",
    "gif",
    "css",
    "js",
    "woff",
    "woff2",
    "ttf",
    "ico",
  ]);

  return [
    ...new Set(
      (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [])
        .map((item) => item.toLowerCase())
        .filter((item) => {
          const tld = item.split(".").pop();
          return tld && !blockedTlds.has(tld);
        }),
    ),
  ];
}

function extractPhones(text) {
  const matches = text.match(/(?:\+?\d[\d\s().-]{6,}\d)/g) ?? [];

  return [...new Set(
    matches
      .map((item) => normalizeText(item))
      .filter((item) => {
        const digitsOnly = item.replace(/\D/g, "");
        const digitCount = digitsOnly.length;
        if (digitCount < 8 || digitCount > 15) {
          return false;
        }

        if (
          (digitCount === 8 &&
            /^(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(19|20)\d{2}$/.test(digitsOnly)) ||
          (digitCount === 9 &&
            /^(?:\d)?(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(19|20)\d{2}$/.test(digitsOnly))
        ) {
          return false;
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(item)) {
          return false;
        }

        if (/(^|\D)(19|20)\d{2}([./-]|\s)(0?\d|1[0-2])([./-]|\s)(0?\d|[12]\d|3[01])($|\D)/.test(item)) {
          return false;
        }

        if (/(^|\D)(0?\d|[12]\d|3[01])([./-])(0?\d|1[0-2])([./-])(19|20)\d{2}($|\D)/.test(item)) {
          return false;
        }

        return /[+\s().-]/.test(item);
      }),
  )];
}

function absoluteUrl(baseUrl, href) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function getCandidateContactLinks(baseUrl, html) {
  const linkMatches = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gims)];
  const candidates = [];

  for (const match of linkMatches) {
    const href = match[1] ?? "";
    const label = normalizeText((match[2] ?? "").replace(/<[^>]+>/g, " "));
    const url = absoluteUrl(baseUrl, href);

    if (!url) {
      continue;
    }

    const haystack = `${href} ${label}`.toLowerCase();
    if (
      haystack.includes("kontakt") ||
      haystack.includes("contact") ||
      haystack.includes("om-os") ||
      haystack.includes("about") ||
      haystack.includes("team") ||
      haystack.includes("people") ||
      haystack.includes("ledelse") ||
      haystack.includes("medarbejdere")
    ) {
      candidates.push(url);
    }
  }

  return unique(candidates).slice(0, MAX_CONTACT_PAGES);
}

function scoreEmail(email) {
  if (/^(sales|salg|business|kontakt|contact|hello|info)@/i.test(email)) {
    return 100;
  }
  if (/^(support|admin|privacy|gdpr|post)@/i.test(email)) {
    return 65;
  }
  return 80;
}

function classifyTitleSnippet(text) {
  const snippets = text
    .split(/[\n|]+/)
    .map((item) => normalizeText(item))
    .filter(Boolean)
    .filter((item) => item.length <= 140)
    .filter((item) => !/[{}=<>]/.test(item));

  return snippets.filter((item) =>
    /(sales|salg|commercial|business development|partner|director|direktør|account manager|kundeansvarlig|cco|cmo)/i.test(
      item,
    ),
  );
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; theplan-contact-enrichment/1.0; +https://www.complycheck.dk)",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function enrichRecord(record) {
  const homepageHtml = await fetchText(record.website);
  const pagesScanned = [];
  const combinedTexts = [];

  if (homepageHtml) {
    pagesScanned.push(record.website);
    combinedTexts.push(homepageHtml);
  }

  const candidateLinks = homepageHtml
    ? getCandidateContactLinks(record.website, homepageHtml)
    : [];

  const homepageEmails = homepageHtml ? extractEmails(homepageHtml) : [];
  const homepagePhones = homepageHtml ? extractPhones(homepageHtml) : [];
  const hasHomepageContactSignal =
    homepageEmails.length > 0 || homepagePhones.length > 0;

  if (!hasHomepageContactSignal) {
    for (const url of candidateLinks) {
      const html = await fetchText(url);
      if (!html) {
        continue;
      }
      pagesScanned.push(url);
      combinedTexts.push(html);
    }
  }

  const mergedText = combinedTexts.join("\n");
  const textOnly = htmlToText(mergedText);
  const emails = unique(extractEmails(mergedText)).sort(
    (left, right) => scoreEmail(right) - scoreEmail(left),
  );
  const phones = unique([
    ...extractPhones(textOnly),
    ...extractPhones(
      [...mergedText.matchAll(/href=["']tel:([^"']+)["']/gi)].map((match) => match[1]).join("\n"),
    ),
  ]);
  const linkedinUrls = unique(
    [...mergedText.matchAll(/https?:\/\/(?:[\w.-]+\.)?linkedin\.com\/[^\s"'<>]+/gi)].map(
      (match) => match[0].replace(/&amp;/g, "&").replace(/[),.;]+$/, ""),
    ),
  ).filter((url) => /linkedin\.com\/company\//i.test(url));
  const titleSnippets = classifyTitleSnippet(textOnly).slice(0, 10);

  const matrixRow = matrixByCompany.get(record.company);

  return {
    vendorKey: record.vendorKey,
    company: record.company,
    website: record.website,
    domain: record.domain,
    primaryType: record.primaryType,
    bestFor: record.bestFor,
    recommendedRole: record.recommendedRole,
    genericEmails: emails.filter((email) =>
      /^(sales|salg|business|kontakt|contact|hello|info|support)@/i.test(email),
    ),
    allEmails: emails,
    phoneNumbers: phones,
    linkedinUrls,
    contactPageUrls: pagesScanned.filter((url) => url !== record.website),
    titleSnippets,
    homepageScanned: Boolean(homepageHtml),
    pagesScannedCount: pagesScanned.length,
    blockerRiskAssessment: matrixRow?.Blocker_risk_assessment === "●",
    blockerIncidentResponse: matrixRow?.Blocker_incident_response === "●",
    blockerMfaAccess: matrixRow?.Blocker_mfa_access === "●",
    confidence:
      emails.length > 0
        ? "high"
        : titleSnippets.length > 0 || phones.length > 0
          ? "medium"
          : homepageHtml
            ? "low"
            : "none",
  };
}

async function runWithConcurrency(items, worker, concurrency) {
  const results = [];
  let index = 0;
  let completed = 0;

  async function runOne() {
    while (index < items.length) {
      const currentIndex = index++;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
      completed += 1;
      if (completed % 25 === 0 || completed === items.length) {
        console.log(`Progress: ${completed}/${items.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => runOne()));
  return results;
}

const enriched = await runWithConcurrency(
  outreachRecords,
  enrichRecord,
  CONCURRENCY,
);

const csvColumns = [
  "vendorKey",
  "company",
  "website",
  "domain",
  "primaryType",
  "genericEmails",
  "allEmails",
  "phoneNumbers",
  "linkedinUrls",
  "contactPageUrls",
  "titleSnippets",
  "confidence",
  "pagesScannedCount",
  "bestFor",
  "recommendedRole",
];

const csvLines = [
  csvColumns.join(","),
  ...enriched.map((record) =>
    csvColumns
      .map((column) => {
        const value = record[column];
        if (Array.isArray(value)) {
          return csvEscape(value.join(" | "));
        }
        return csvEscape(value);
      })
      .join(","),
  ),
];

writeFileSync(outputJsonPath, `${JSON.stringify(enriched, null, 2)}\n`);
writeFileSync(outputCsvPath, `${csvLines.join("\n")}\n`);

const highConfidenceCount = enriched.filter((item) => item.confidence === "high").length;
const mediumConfidenceCount = enriched.filter((item) => item.confidence === "medium").length;

console.log(`Wrote ${enriched.length} contact enrichment records.`);
console.log(`High confidence: ${highConfidenceCount}`);
console.log(`Medium confidence: ${mediumConfidenceCount}`);
console.log(`JSON: ${outputJsonPath}`);
console.log(`CSV: ${outputCsvPath}`);
