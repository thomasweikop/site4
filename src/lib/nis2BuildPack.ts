import rawBuildSpec from "@/data/nis2_build_spec_v4.json";
import rawVendorEnrichment from "@/data/nis2_vendor_enrichment_v2.json";
import rawVendorMatrix from "@/data/nis2_vendor_area_matrix_real_v4.json";

export type DimensionKey =
  | "governance"
  | "technical"
  | "operational"
  | "compliance";

export type VendorType = "legal" | "grc" | "technical" | "soc" | "audit";
export type VendorSizeFit = "smb" | "mid-market" | "enterprise";
export type VendorProfileTier = "directory" | "verified" | "subscription";

export type GranularAreaKey =
  | "governance-responsibility"
  | "policies-documentation"
  | "risk-assessment"
  | "supplier-management"
  | "incident-response"
  | "logging-monitoring"
  | "identity-mfa-pam"
  | "asset-access-overview"
  | "training-awareness"
  | "backup-recovery-continuity"
  | "audit-assurance";

export type MatrixAreaKey = DimensionKey | GranularAreaKey;

type RawBuildSpec = {
  version: string;
  language: string;
  product_name: string;
  core_copy: {
    headline: string;
    intro: string;
    cta_a_label: string;
    cta_a_button: string;
    cta_b_label: string;
    cta_b_button: string;
    recommended_button: string;
  };
  routes: string[];
  answer_scale: Record<"Nej" | "Delvist" | "Ja", number>;
  questions: Array<{
    id: string;
    category: string;
    label_da: string;
    weight: number;
    dimensions: string[];
    critical_blocker: boolean;
  }>;
  dimensions: Record<
    string,
    {
      questions: string[];
      weights: Record<string, number>;
    }
  >;
  risk_bands: Record<string, [number, number]>;
  important_areas_rule: string;
  flow_b_rule: string;
  blockers: string[];
  type_routing: Record<
    string,
    {
      primary: string[];
      adjacent: string[];
    }
  >;
  fit_score_formula: {
    formula: string;
    components: Record<string, string>;
  };
  followups: Record<string, string[]>;
};

type RawVendorRow = {
  Rank_in_type: string;
  Company: string;
  Primary_type: string;
  Secondary_types: string;
  Size_fit: string;
  Sector_fit: string;
  Price_band: string;
  Best_for: string;
  Website: string;
  Qualification_method_note: string;
  Qualification_score_initial: string;
  Recommended_role: string;
  Governance: string;
  Technical: string;
  Operational: string;
  Compliance: string;
  "Governance & ansvar": string;
  "Politikker & dokumentation": string;
  Risikovurdering: string;
  Leverandørstyring: string;
  "Incident response": string;
  "Logging & monitorering": string;
  "Identity / MFA / PAM": string;
  "Asset- og adgangsoverblik": string;
  "Træning & awareness": string;
  "Backup / recovery / continuity": string;
  "Audit / assurance": string;
  Best_match_areas: string;
  Recommended_when: string;
  Dimension_count: string;
  Granular_area_count: string;
  Blocker_risk_assessment: string;
  Blocker_incident_response: string;
  Blocker_mfa_access: string;
  Adjacent_types: string;
  Type_fit_primary_score: string;
  Type_fit_adjacent_score: string;
  Type_fit_nonmatch_score: string;
};

type RawVendorEnrichmentRow = {
  vendorKey: string;
  websiteSummaryDa?: string;
  websiteSignalTags?: string[];
  websiteSignalScore?: number;
  websiteDepthScore?: number;
  pagesScanned?: number;
  profileTier?: string;
  casesPerYear?: number | null;
  dedicatedSpecialists?: number | null;
  manualBoostScore?: number;
  sourceUrls?: string[];
  matrixSignalScores?: Partial<Record<MatrixAreaKey, number>>;
};

export type MatrixColumn = {
  key: MatrixAreaKey;
  label: string;
  kind: "dimension" | "granular";
};

export type VendorDirectoryEntry = {
  key: string;
  rankInType: number;
  name: string;
  type: VendorType;
  secondaryTypes: VendorType[];
  adjacentTypes: VendorType[];
  sizeFit: VendorSizeFit[];
  sectorFit: string;
  priceBand: string;
  bestFor: string;
  website: string;
  qualificationMethodNote: string;
  score: number;
  recommendedRole: string;
  recommendedWhen: string;
  bestMatchAreas: string[];
  dimensionCount: number;
  granularAreaCount: number;
  matrixAreas: Record<MatrixAreaKey, boolean>;
  capabilityAreaKeys: MatrixAreaKey[];
  capabilityAreaLabels: string[];
  granularAreaLabels: string[];
  specialtyHighlights: string[];
  websiteSummaryDa: string;
  websiteSignalTags: string[];
  websiteSignalScore: number;
  websiteDepthScore: number;
  websiteEvidenceScore: number;
  pagesScanned: number;
  profileTier: VendorProfileTier;
  casesPerYear: number | null;
  dedicatedSpecialists: number | null;
  manualBoostScore: number;
  sourceUrls: string[];
  matrixSignalScores: Partial<Record<MatrixAreaKey, number>>;
  capabilityBreadthScore: number;
  profileCompletenessScore: number;
  blockerCoverage: {
    riskAssessment: boolean;
    incidentResponse: boolean;
    mfaAccess: boolean;
  };
  typeFitScores: {
    primary: number;
    adjacent: number;
    nonmatch: number;
  };
};

const buildSpec = rawBuildSpec as unknown as RawBuildSpec;
const vendorEnrichment = rawVendorEnrichment as RawVendorEnrichmentRow[];
const vendorMatrix = rawVendorMatrix as RawVendorRow[];

export const PRODUCT_NAME = buildSpec.product_name;
export const CORE_COPY = buildSpec.core_copy;
export const FLOW_B_DIMENSION_THRESHOLD = 70;
export const TOP_AREA_COUNT = 3;
export const RECOMMENDED_EXPERT_COUNT = 5;

export const DIMENSION_ORDER: DimensionKey[] = [
  "governance",
  "technical",
  "operational",
  "compliance",
];

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  governance: "Governance",
  technical: "Technical",
  operational: "Operational",
  compliance: "Compliance",
};

export const DIMENSION_SUMMARIES: Record<DimensionKey, string> = {
  governance:
    "Ledelsesforankring, ansvar, politikker og dokumenteret risikostyring.",
  technical:
    "Tekniske kontroller som logging, MFA, PAM, aktiver og adgangsstyring.",
  operational:
    "Beredskab, awareness, continuity og den praktiske evne til at håndtere hændelser.",
  compliance:
    "Leverandørstyring, dokumentation, auditspor og løbende compliance-opfølgning.",
};

export const VENDOR_TYPE_META: Record<
  VendorType,
  { label: string; summary: string }
> = {
  legal: {
    label: "Legal / regulatorisk",
    summary:
      "Relevant når scope, ledelsesansvar, kontrakter og regulatorisk fortolkning er det primære arbejdsfelt.",
  },
  grc: {
    label: "GRC / dokumentation",
    summary:
      "Relevant når politikker, ISMS, risikoregister, dokumentation og leverandørstyring er de største huller.",
  },
  technical: {
    label: "Technical / implementering",
    summary:
      "Relevant når arkitektur, IAM, PAM, backup, hardening og tekniske sikkerhedskontroller er den største opgave.",
  },
  soc: {
    label: "SOC / monitorering",
    summary:
      "Relevant når logging, monitorering, MDR, incident response og sikkerhedsoperationer er den største mangel.",
  },
  audit: {
    label: "Audit / assurance",
    summary:
      "Relevant når ekstern validering, review, assurance og dokumentation over for kunder eller ledelse er central.",
  },
};

const WEBSITE_SIGNAL_LABEL_MAP: Record<string, string> = {
  "Governance og ansvar": "Governance og ansvar",
  "Politikker og dokumentation": "Politikker og dokumentation",
  Risikovurdering: "Risikovurdering",
  Leverandørstyring: "Leverandørstyring",
  "Incident management": "Incident response",
  "Logging og monitorering": "Logging & monitorering",
  "Identity / MFA / PAM": "Identity / MFA / PAM",
  "Asset- og adgangsoverblik": "Asset- og adgangsoverblik",
  "Awareness og træning": "Træning & awareness",
  "Business continuity & recovery": "Backup / recovery / continuity",
  "Audit og assurance": "Audit / assurance",
};

export const GRANULAR_AREA_COLUMNS: MatrixColumn[] = [
  {
    key: "governance-responsibility",
    label: "Governance & ansvar",
    kind: "granular",
  },
  {
    key: "policies-documentation",
    label: "Politikker & dokumentation",
    kind: "granular",
  },
  {
    key: "risk-assessment",
    label: "Risikovurdering",
    kind: "granular",
  },
  {
    key: "supplier-management",
    label: "Leverandørstyring",
    kind: "granular",
  },
  {
    key: "incident-response",
    label: "Incident response",
    kind: "granular",
  },
  {
    key: "logging-monitoring",
    label: "Logging & monitorering",
    kind: "granular",
  },
  {
    key: "identity-mfa-pam",
    label: "Identity / MFA / PAM",
    kind: "granular",
  },
  {
    key: "asset-access-overview",
    label: "Asset- og adgangsoverblik",
    kind: "granular",
  },
  {
    key: "training-awareness",
    label: "Træning & awareness",
    kind: "granular",
  },
  {
    key: "backup-recovery-continuity",
    label: "Backup / recovery / continuity",
    kind: "granular",
  },
  {
    key: "audit-assurance",
    label: "Audit / assurance",
    kind: "granular",
  },
];

export const MATRIX_COLUMNS: MatrixColumn[] = [
  ...DIMENSION_ORDER.map(
    (key) =>
      ({
        key,
        label: DIMENSION_LABELS[key],
        kind: "dimension",
      }) satisfies MatrixColumn,
  ),
  ...GRANULAR_AREA_COLUMNS,
];

const BLOCKER_AREA_KEYS = {
  "03": "risk-assessment",
  "05": "incident-response",
  "07": "identity-mfa-pam",
} satisfies Record<string, GranularAreaKey>;

function normalizeDimensionKey(value: string): DimensionKey {
  switch (value.trim().toLowerCase()) {
    case "governance":
      return "governance";
    case "technical":
      return "technical";
    case "operational":
      return "operational";
    case "compliance":
      return "compliance";
    default:
      return "governance";
  }
}

function normalizeVendorType(value: string): VendorType {
  switch (value.trim().toLowerCase()) {
    case "legal":
      return "legal";
    case "grc":
      return "grc";
    case "technical":
      return "technical";
    case "soc":
      return "soc";
    case "audit":
      return "audit";
    default:
      return "grc";
  }
}

function normalizeSizeFit(value: string): VendorSizeFit[] {
  const normalized = value.toLowerCase();
  const fits: VendorSizeFit[] = [];

  if (normalized.includes("smb")) {
    fits.push("smb");
  }
  if (normalized.includes("mid-market")) {
    fits.push("mid-market");
  }
  if (normalized.includes("enterprise")) {
    fits.push("enterprise");
  }

  return fits.length > 0 ? fits : ["mid-market"];
}

function parseList(value: string) {
  return value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseVendorTypes(value: string) {
  return parseList(value).map(normalizeVendorType);
}

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeVendorProfileTier(value?: string): VendorProfileTier {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "verified") {
    return "verified";
  }

  if (normalized === "subscription" || normalized === "subscriber") {
    return "subscription";
  }

  return "directory";
}

function normalizeWebsiteSignalTags(tags: string[] = []) {
  return Array.from(
    new Set(
      tags
        .map((tag) => WEBSITE_SIGNAL_LABEL_MAP[tag.trim()] ?? tag.trim())
        .filter(Boolean),
    ),
  );
}

function normalizeMatrixSignalScores(
  scores?: Partial<Record<MatrixAreaKey, number>>,
) {
  if (!scores) {
    return {} satisfies Partial<Record<MatrixAreaKey, number>>;
  }

  const normalizedEntries = Object.entries(scores)
    .map(([key, value]) => [key, clampPercentage(Number(value) || 0)] as const)
    .filter(([key]) =>
      MATRIX_COLUMNS.some((column) => column.key === key),
    );

  return Object.fromEntries(
    normalizedEntries,
  ) as Partial<Record<MatrixAreaKey, number>>;
}

function hasMatrixMark(value: string) {
  return value.trim() === "●";
}

const GRANULAR_LABEL_TO_KEY = Object.fromEntries(
  GRANULAR_AREA_COLUMNS.map((column) => [column.label, column.key]),
) as Record<string, GranularAreaKey>;

export function buildVendorKey(input: {
  type: VendorType;
  rankInType: number;
  name: string;
}) {
  return `${input.type}:${input.rankInType}:${input.name}`;
}

const vendorEnrichmentMap = new Map(
  vendorEnrichment.map((entry) => [entry.vendorKey, entry]),
);

function buildMatrixAreas(row: RawVendorRow): Record<MatrixAreaKey, boolean> {
  return {
    governance: hasMatrixMark(row.Governance),
    technical: hasMatrixMark(row.Technical),
    operational: hasMatrixMark(row.Operational),
    compliance: hasMatrixMark(row.Compliance),
    "governance-responsibility": hasMatrixMark(row["Governance & ansvar"]),
    "policies-documentation": hasMatrixMark(row["Politikker & dokumentation"]),
    "risk-assessment": hasMatrixMark(row.Risikovurdering),
    "supplier-management": hasMatrixMark(row.Leverandørstyring),
    "incident-response": hasMatrixMark(row["Incident response"]),
    "logging-monitoring": hasMatrixMark(row["Logging & monitorering"]),
    "identity-mfa-pam": hasMatrixMark(row["Identity / MFA / PAM"]),
    "asset-access-overview": hasMatrixMark(row["Asset- og adgangsoverblik"]),
    "training-awareness": hasMatrixMark(row["Træning & awareness"]),
    "backup-recovery-continuity": hasMatrixMark(
      row["Backup / recovery / continuity"],
    ),
    "audit-assurance": hasMatrixMark(row["Audit / assurance"]),
  };
}

function formatSectorFit(value: string) {
  return value.replace(/;\s*/g, ", ");
}

function calculateWebsiteEvidenceScore(
  websiteSignalScore: number,
  websiteDepthScore: number,
) {
  return clampPercentage(websiteSignalScore * 0.72 + websiteDepthScore * 0.28);
}

function calculateCapabilityBreadthScore(
  dimensionCount: number,
  granularAreaCount: number,
) {
  const dimensionRatio = Math.min(dimensionCount, DIMENSION_ORDER.length) /
    DIMENSION_ORDER.length;
  const granularRatio = Math.min(
    granularAreaCount,
    GRANULAR_AREA_COLUMNS.length,
  ) / GRANULAR_AREA_COLUMNS.length;

  return clampPercentage(dimensionRatio * 35 + granularRatio * 65);
}

function calculateProfileCompletenessScore(input: {
  websiteSummaryDa: string;
  websiteSignalTags: string[];
  sourceUrls: string[];
  pagesScanned: number;
  profileTier: VendorProfileTier;
  websiteSignalScore: number;
  casesPerYear: number | null;
  dedicatedSpecialists: number | null;
}) {
  const profileTierScore =
    input.profileTier === "subscription"
      ? 20
      : input.profileTier === "verified"
        ? 14
        : 6;

  const score =
    (input.websiteSummaryDa ? 24 : 0) +
    Math.min(input.websiteSignalTags.length, 5) * 7 +
    Math.min(input.sourceUrls.length, 4) * 5 +
    Math.min(input.pagesScanned, 4) * 4 +
    profileTierScore +
    (input.websiteSignalScore >= 70 ? 10 : input.websiteSignalScore >= 45 ? 5 : 0) +
    (input.casesPerYear !== null ? 8 : 0) +
    (input.dedicatedSpecialists !== null ? 8 : 0);

  return clampPercentage(score);
}

function buildSpecialtyHighlights(input: {
  bestFor: string;
  websiteSummaryDa: string;
  websiteSignalTags: string[];
  bestMatchAreas: string[];
  granularAreaLabels: string[];
  sectorFit: string;
}) {
  const websiteSignalText =
    input.websiteSignalTags.length > 0
      ? `Signalspor fra website: ${input.websiteSignalTags
          .slice(0, 4)
          .join(", ")}`
      : "";
  const lines = [
    input.websiteSummaryDa || input.bestFor,
    websiteSignalText,
    input.bestMatchAreas.length > 0
      ? `Primære fokusområder: ${input.bestMatchAreas.join(", ")}`
      : "",
    input.granularAreaLabels.length > 0
      ? `Typiske kompetencer: ${input.granularAreaLabels
          .slice(0, 4)
          .join(", ")}`
      : "",
    input.sectorFit
      ? `Markedsfokus: ${formatSectorFit(input.sectorFit)}`
      : "",
  ].filter(Boolean);

  return Array.from(new Set(lines)).slice(0, 5);
}

export const FOLLOWUP_QUESTIONS = Object.fromEntries(
  Object.entries(buildSpec.followups).map(([dimension, questions]) => [
    normalizeDimensionKey(dimension),
    questions,
  ]),
) as Record<DimensionKey, string[]>;

export const TYPE_ROUTING = Object.fromEntries(
  Object.entries(buildSpec.type_routing).map(([dimension, routing]) => [
    normalizeDimensionKey(dimension),
    {
      primary: routing.primary.map(normalizeVendorType),
      adjacent: routing.adjacent.map(normalizeVendorType),
    },
  ]),
) as Record<
  DimensionKey,
  {
    primary: VendorType[];
    adjacent: VendorType[];
  }
>;

export const DIMENSION_VENDOR_MAP: Record<DimensionKey, VendorType[]> =
  Object.fromEntries(
    DIMENSION_ORDER.map((dimension) => [
      dimension,
      TYPE_ROUTING[dimension].primary,
    ]),
  ) as Record<DimensionKey, VendorType[]>;

export const SCORING_CONFIG = {
  version: buildSpec.version,
  language: buildSpec.language,
  productName: buildSpec.product_name,
  questionCount: buildSpec.questions.length,
  questions: buildSpec.questions,
  weights: Object.fromEntries(
    buildSpec.questions.map((question) => [
      question.id.replace("Q", "").padStart(2, "0"),
      question.weight,
    ]),
  ) as Record<string, number>,
  dimensions: Object.fromEntries(
    Object.entries(buildSpec.dimensions).map(([dimension, value]) => [
      normalizeDimensionKey(dimension),
      value.questions.map((questionId) =>
        questionId.replace("Q", "").padStart(2, "0"),
      ),
    ]),
  ) as Record<DimensionKey, string[]>,
  dimensionWeights: Object.fromEntries(
    Object.entries(buildSpec.dimensions).map(([dimension, value]) => [
      normalizeDimensionKey(dimension),
      Object.fromEntries(
        Object.entries(value.weights).map(([questionId, weight]) => [
          questionId.replace("Q", "").padStart(2, "0"),
          weight,
        ]),
      ),
    ]),
  ) as Record<DimensionKey, Record<string, number>>,
  answerScale: buildSpec.answer_scale,
  riskBands: buildSpec.risk_bands,
  criticalBlockers: buildSpec.blockers.map((questionId) =>
    questionId.replace("Q", "").padStart(2, "0"),
  ),
  fitScoreFormula: buildSpec.fit_score_formula.formula,
  fitWeights: {
    qualificationScoreInitial: 0.2,
    typeFit: 0.13,
    areaFit: 0.14,
    sizeFit: 0.06,
    sectorFit: 0.05,
    blockerFit: 0.08,
    websiteEvidence: 0.1,
    prioritySignalFit: 0.1,
    capabilityBreadth: 0.05,
    profileCompleteness: 0.04,
    deliveryCapacity: 0.03,
    manualBoost: 0.02,
  },
  topAreaCount: TOP_AREA_COUNT,
  followupThreshold: FLOW_B_DIMENSION_THRESHOLD,
  recommendedExpertsCount: RECOMMENDED_EXPERT_COUNT,
} as const;

export const VENDOR_DIRECTORY: VendorDirectoryEntry[] = vendorMatrix.map(
  (row) => {
    const matrixAreas = buildMatrixAreas(row);
    const capabilityAreaKeys = MATRIX_COLUMNS.filter(
      (column) => matrixAreas[column.key],
    ).map((column) => column.key);
    const granularAreaLabels = GRANULAR_AREA_COLUMNS.filter(
      (column) => matrixAreas[column.key],
    ).map((column) => column.label);
    const bestFor = row.Best_for.trim();
    const sectorFit = row.Sector_fit.trim();
    const bestMatchAreas = parseList(row.Best_match_areas);
    const rankInType = Number(row.Rank_in_type || 999);
    const type = normalizeVendorType(row.Primary_type);
    const name = row.Company.trim();
    const key = buildVendorKey({
      type,
      rankInType,
      name,
    });
    const enrichment = vendorEnrichmentMap.get(key);
    const websiteSummaryDa = enrichment?.websiteSummaryDa?.trim() || "";
    const websiteSignalTags = normalizeWebsiteSignalTags(
      enrichment?.websiteSignalTags,
    );
    const websiteSignalScore = clampPercentage(
      Number(enrichment?.websiteSignalScore) || 0,
    );
    const websiteDepthScore = clampPercentage(
      Number(enrichment?.websiteDepthScore) || 0,
    );
    const pagesScanned = Math.max(0, Number(enrichment?.pagesScanned) || 0);
    const profileTier = normalizeVendorProfileTier(enrichment?.profileTier);
    const casesPerYear =
      typeof enrichment?.casesPerYear === "number"
        ? enrichment.casesPerYear
        : null;
    const dedicatedSpecialists =
      typeof enrichment?.dedicatedSpecialists === "number"
        ? enrichment.dedicatedSpecialists
        : null;
    const manualBoostScore = Number(enrichment?.manualBoostScore) || 0;
    const sourceUrls = Array.from(
      new Set((enrichment?.sourceUrls ?? []).filter(Boolean)),
    );
    const matrixSignalScores = normalizeMatrixSignalScores(
      enrichment?.matrixSignalScores,
    );
    const capabilityBreadthScore = calculateCapabilityBreadthScore(
      Number(row.Dimension_count || 0),
      Number(row.Granular_area_count || 0),
    );
    const profileCompletenessScore = calculateProfileCompletenessScore({
      websiteSummaryDa,
      websiteSignalTags,
      sourceUrls,
      pagesScanned,
      profileTier,
      websiteSignalScore,
      casesPerYear,
      dedicatedSpecialists,
    });
    const websiteEvidenceScore = calculateWebsiteEvidenceScore(
      websiteSignalScore,
      websiteDepthScore,
    );

    return {
      key,
      rankInType,
      name,
      type,
      secondaryTypes: parseVendorTypes(row.Secondary_types),
      adjacentTypes: parseVendorTypes(row.Adjacent_types),
      sizeFit: normalizeSizeFit(row.Size_fit),
      sectorFit,
      priceBand: row.Price_band.trim(),
      bestFor,
      website: row.Website.trim(),
      qualificationMethodNote: row.Qualification_method_note.trim(),
      score: Number(row.Qualification_score_initial || 0),
      recommendedRole: row.Recommended_role.trim(),
      recommendedWhen: row.Recommended_when.trim(),
      bestMatchAreas,
      dimensionCount: Number(row.Dimension_count || 0),
      granularAreaCount: Number(row.Granular_area_count || 0),
      matrixAreas,
      capabilityAreaKeys,
      capabilityAreaLabels: MATRIX_COLUMNS.filter((column) =>
        capabilityAreaKeys.includes(column.key),
      ).map((column) => column.label),
      granularAreaLabels,
      specialtyHighlights: buildSpecialtyHighlights({
        bestFor,
        websiteSummaryDa,
        websiteSignalTags,
        bestMatchAreas,
        granularAreaLabels,
        sectorFit,
      }),
      websiteSummaryDa,
      websiteSignalTags,
      websiteSignalScore,
      websiteDepthScore,
      websiteEvidenceScore,
      pagesScanned,
      profileTier,
      casesPerYear,
      dedicatedSpecialists,
      manualBoostScore,
      sourceUrls,
      matrixSignalScores,
      capabilityBreadthScore,
      profileCompletenessScore,
      blockerCoverage: {
        riskAssessment: hasMatrixMark(row.Blocker_risk_assessment),
        incidentResponse: hasMatrixMark(row.Blocker_incident_response),
        mfaAccess: hasMatrixMark(row.Blocker_mfa_access),
      },
      typeFitScores: {
        primary: Number(row.Type_fit_primary_score || 100),
        adjacent: Number(row.Type_fit_adjacent_score || 75),
        nonmatch: Number(row.Type_fit_nonmatch_score || 0),
      },
    } satisfies VendorDirectoryEntry;
  },
);

export function getQuestionWeight(questionId: string) {
  return SCORING_CONFIG.weights[questionId] ?? 1;
}

export function getBlockerAreaKey(questionId: string) {
  return BLOCKER_AREA_KEYS[questionId as keyof typeof BLOCKER_AREA_KEYS];
}

export function getGranularAreaKeyByLabel(label: string) {
  return GRANULAR_LABEL_TO_KEY[label];
}

export function vendorSupportsArea(
  vendor: VendorDirectoryEntry,
  areaKey: MatrixAreaKey,
) {
  return Boolean(vendor.matrixAreas[areaKey]);
}
