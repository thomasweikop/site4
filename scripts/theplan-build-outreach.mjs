import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const exportsDir = resolve(root, "exports");
const matrixPath = resolve(root, "src/data/nis2_vendor_area_matrix_real_v4.json");
const enrichmentPath = resolve(root, "src/data/nis2_vendor_enrichment_v2.json");

mkdirSync(exportsDir, { recursive: true });

const matrix = JSON.parse(readFileSync(matrixPath, "utf8")).map((item) => item);
const enrichment = JSON.parse(readFileSync(enrichmentPath, "utf8")).map((item) => item);

const enrichmentByVendorKey = new Map(
  enrichment.map((item) => [item.vendorKey, item]),
);

function normalizeVendorType(value = "") {
  return value.trim().toLowerCase();
}

function makeVendorKey(row) {
  return `${normalizeVendorType(row.Primary_type)}:${row.Rank_in_type}:${row.Company}`;
}

function toDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function csvEscape(value) {
  const stringValue = value == null ? "" : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function buildWarmSignalLine(company) {
  return `${company} er allerede nævnt i ComplyChecks specialistoverblik relateret til NIS2.`;
}

function buildPersonalizedOpening(row, enrichmentRow) {
  const summary = enrichmentRow?.websiteSummaryDa?.trim();
  if (summary) {
    return `Jeg lagde mærke til ${row.Company}, fordi jeres offentlige profil peger på ${summary.charAt(0).toLowerCase()}${summary.slice(1)}`;
  }

  if (row.Best_for?.trim()) {
    return `Jeg lagde mærke til ${row.Company}, fordi I ser relevante ud for virksomheder med behov for ${row.Best_for.trim().toLowerCase()}.`;
  }

  return `Jeg lagde mærke til ${row.Company}, fordi I indgår i vores specialistoverblik for NIS2-relaterede rådgivere.`;
}

function buildReasonForOutreach(row, enrichmentRow) {
  const parts = [
    row.Primary_type ? `Primær kategori: ${row.Primary_type}` : "",
    row.Best_match_areas ? `Matchområder: ${row.Best_match_areas}` : "",
    enrichmentRow?.websiteSignalTags?.length
      ? `Signalspor: ${enrichmentRow.websiteSignalTags.join(", ")}`
      : "",
  ].filter(Boolean);

  return parts.join(" | ");
}

function buildOutreachRecord(row) {
  const vendorKey = makeVendorKey(row);
  const enrichmentRow = enrichmentByVendorKey.get(vendorKey);
  const domain = toDomain(row.Website);

  return {
    vendorKey,
    company: row.Company,
    website: row.Website,
    domain,
    primaryType: row.Primary_type,
    secondaryTypes: row.Secondary_types,
    adjacentTypes: row.Adjacent_types,
    sectorFit: row.Sector_fit,
    sizeFit: row.Size_fit,
    priceBand: row.Price_band,
    qualificationScoreInitial: Number(row.Qualification_score_initial || 0),
    bestFor: row.Best_for,
    recommendedRole: row.Recommended_role,
    bestMatchAreas: row.Best_match_areas,
    recommendedWhen: row.Recommended_when,
    websiteSummaryDa: enrichmentRow?.websiteSummaryDa ?? "",
    websiteSignalTags: enrichmentRow?.websiteSignalTags ?? [],
    sourceUrls: enrichmentRow?.sourceUrls ?? [row.Website],
    warmSignalLine: buildWarmSignalLine(row.Company),
    personalizedOpening: buildPersonalizedOpening(row, enrichmentRow),
    reasonForOutreach: buildReasonForOutreach(row, enrichmentRow),
    suggestedEmailSubject: `Kort om ${row.Company} i ComplyChecks specialistoverblik`,
    suggestedLinkedInOpening: `Hej, jeg skriver kort fordi ${row.Company} allerede indgår i vores specialistoverblik relateret til NIS2, og jeg vil gerne validere jeres profil.`,
  };
}

const outreachRecords = matrix.map(buildOutreachRecord);

const csvColumns = [
  "vendorKey",
  "company",
  "website",
  "domain",
  "primaryType",
  "secondaryTypes",
  "adjacentTypes",
  "sectorFit",
  "sizeFit",
  "priceBand",
  "qualificationScoreInitial",
  "bestFor",
  "recommendedRole",
  "bestMatchAreas",
  "recommendedWhen",
  "websiteSummaryDa",
  "websiteSignalTags",
  "sourceUrls",
  "warmSignalLine",
  "personalizedOpening",
  "reasonForOutreach",
  "suggestedEmailSubject",
  "suggestedLinkedInOpening",
];

const csvLines = [
  csvColumns.join(","),
  ...outreachRecords.map((record) =>
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

writeFileSync(
  resolve(exportsDir, "theplan_outreach_leads.json"),
  `${JSON.stringify(outreachRecords, null, 2)}\n`,
);
writeFileSync(
  resolve(exportsDir, "theplan_outreach_leads.csv"),
  `${csvLines.join("\n")}\n`,
);

console.log(`Wrote ${outreachRecords.length} outreach records.`);
console.log("JSON: exports/theplan_outreach_leads.json");
console.log("CSV: exports/theplan_outreach_leads.csv");
