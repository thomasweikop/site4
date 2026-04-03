import rawBuildSpec from "@/data/nis2_build_spec_v4.json";
import rawVendorMatrix from "@/data/nis2_vendor_area_matrix_real_v4.json";

export type DimensionKey =
  | "governance"
  | "technical"
  | "operational"
  | "compliance";

export type VendorType = "legal" | "grc" | "technical" | "soc" | "audit";
export type VendorSizeFit = "smb" | "mid-market" | "enterprise";

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

export type MatrixColumn = {
  key: MatrixAreaKey;
  label: string;
  kind: "dimension" | "granular";
};

export type VendorDirectoryEntry = {
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

function hasMatrixMark(value: string) {
  return value.trim() === "●";
}

const GRANULAR_LABEL_TO_KEY = Object.fromEntries(
  GRANULAR_AREA_COLUMNS.map((column) => [column.label, column.key]),
) as Record<string, GranularAreaKey>;

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
    qualificationScoreInitial: 0.45,
    typeFit: 0.2,
    areaFit: 0.15,
    sizeFit: 0.1,
    sectorFit: 0.05,
    blockerFit: 0.05,
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

    return {
      rankInType: Number(row.Rank_in_type || 999),
      name: row.Company.trim(),
      type: normalizeVendorType(row.Primary_type),
      secondaryTypes: parseVendorTypes(row.Secondary_types),
      adjacentTypes: parseVendorTypes(row.Adjacent_types),
      sizeFit: normalizeSizeFit(row.Size_fit),
      sectorFit: row.Sector_fit.trim(),
      priceBand: row.Price_band.trim(),
      bestFor: row.Best_for.trim(),
      website: row.Website.trim(),
      qualificationMethodNote: row.Qualification_method_note.trim(),
      score: Number(row.Qualification_score_initial || 0),
      recommendedRole: row.Recommended_role.trim(),
      recommendedWhen: row.Recommended_when.trim(),
      bestMatchAreas: parseList(row.Best_match_areas),
      dimensionCount: Number(row.Dimension_count || 0),
      granularAreaCount: Number(row.Granular_area_count || 0),
      matrixAreas,
      capabilityAreaKeys,
      capabilityAreaLabels: MATRIX_COLUMNS.filter((column) =>
        capabilityAreaKeys.includes(column.key),
      ).map((column) => column.label),
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
