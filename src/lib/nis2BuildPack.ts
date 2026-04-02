import rawScoringConfig from "@/data/nis2_scoring_config.json";
import rawVendorMaster from "@/data/nis2_vendor_master_125.json";

export type DimensionKey =
  | "governance"
  | "technical"
  | "operational"
  | "compliance";

export type VendorType = "legal" | "grc" | "technical" | "soc" | "audit";
export type VendorSizeFit = "smb" | "mid-market" | "enterprise";

type RawQuestion = {
  id: string;
  category: string;
  label: string;
  dimensions: string[];
  answers: Record<"No" | "Partial" | "Yes", number>;
  weight: number;
  critical_blocker: boolean;
};

type RawScoringConfig = {
  version: string;
  questions: RawQuestion[];
  dimensions: Record<
    string,
    {
      questions: string[];
      weights: Record<string, number>;
    }
  >;
  thresholds: {
    overall: Record<string, number[]>;
    dimension_red_below: number;
  };
  critical_blockers: string[];
  vendor_type_priority: Record<string, string[]>;
  ranking_formula: {
    base_vendor_score: number;
    type_fit: number;
    size_fit: number;
    sector_fit: number;
    critical_blocker_fit: number;
    commercial_fit: number;
  };
  output: {
    primary_recommendations: number;
    show_partner_type_explanation: boolean;
    show_30_60_90_plan: boolean;
  };
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
};

export type VendorDirectoryEntry = {
  rankInType: number;
  name: string;
  type: VendorType;
  secondaryTypes: VendorType[];
  sizeFit: VendorSizeFit[];
  sectorFit: string;
  priceBand: string;
  bestFor: string;
  website: string;
  qualificationMethodNote: string;
  score: number;
  recommendedRole: string;
};

const scoringConfig = rawScoringConfig as unknown as RawScoringConfig;
const vendorMaster = rawVendorMaster as RawVendorRow[];

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
    "Politikker, ansvar, ledelsesforankring og risikovurdering omkring virksomhedens styring.",
  technical:
    "MFA, logging, asset inventory, adgangskontrol og andre centrale tekniske kontroller.",
  operational:
    "Incident response, træning, kontinuitet og den praktiske evne til at reagere på hændelser.",
  compliance:
    "Leverandørkrav, dokumentation, readiness mod assurance og rapporteringsnære krav.",
};

export const VENDOR_TYPE_META: Record<
  VendorType,
  { label: string; summary: string }
> = {
  legal: {
    label: "Legal / regulatorisk",
    summary:
      "Relevant når scope, ansvar, kontrakter og regulatorisk fortolkning er det primære arbejdsfelt.",
  },
  grc: {
    label: "GRC / dokumentation",
    summary:
      "Relevant når virksomheden skal opbygge politikker, risikoregister, ISMS og ledelsesrapportering.",
  },
  technical: {
    label: "Teknisk implementering",
    summary:
      "Relevant når de vigtigste gaps ligger i adgang, hardening, backup, platforme eller sikkerhedsarkitektur.",
  },
  soc: {
    label: "SOC / monitorering",
    summary:
      "Relevant når de vigtigste gaps ligger i logging, detektion, incident response og løbende operations.",
  },
  audit: {
    label: "Audit / assurance",
    summary:
      "Relevant når virksomheden skal dokumentere modenhed, få et eksternt review eller styrke leverandør- og assurance-sporet.",
  },
};

function normalizeDimensionKey(value: string): DimensionKey {
  const normalized = value.trim().toLowerCase();

  if (
    normalized === "governance" ||
    normalized === "technical" ||
    normalized === "operational" ||
    normalized === "compliance"
  ) {
    return normalized;
  }

  return "governance";
}

function normalizeVendorType(value: string): VendorType {
  const normalized = value.trim().toLowerCase();

  if (
    normalized === "legal" ||
    normalized === "grc" ||
    normalized === "technical" ||
    normalized === "soc" ||
    normalized === "audit"
  ) {
    return normalized;
  }

  return "grc";
}

function normalizeSizeFit(value: string): VendorSizeFit[] {
  const normalized = value.toLowerCase();
  const result: VendorSizeFit[] = [];

  if (normalized.includes("smb")) {
    result.push("smb");
  }

  if (normalized.includes("mid-market")) {
    result.push("mid-market");
  }

  if (normalized.includes("enterprise")) {
    result.push("enterprise");
  }

  return result.length > 0 ? result : ["mid-market"];
}

export const SCORING_CONFIG = {
  version: scoringConfig.version,
  questionCount: scoringConfig.questions.length,
  questions: scoringConfig.questions,
  weights: Object.fromEntries(
    scoringConfig.questions.map((question) => [
      question.id.replace("Q", "").padStart(2, "0"),
      question.weight,
    ]),
  ) as Record<string, number>,
  dimensions: Object.fromEntries(
    Object.entries(scoringConfig.dimensions).map(([key, value]) => [
      normalizeDimensionKey(key),
      value.questions.map((questionId) =>
        questionId.replace("Q", "").padStart(2, "0"),
      ),
    ]),
  ) as Record<DimensionKey, string[]>,
  dimensionWeights: Object.fromEntries(
    Object.entries(scoringConfig.dimensions).map(([key, value]) => [
      normalizeDimensionKey(key),
      Object.fromEntries(
        Object.entries(value.weights).map(([questionId, weight]) => [
          questionId.replace("Q", "").padStart(2, "0"),
          weight,
        ]),
      ),
    ]),
  ) as Record<DimensionKey, Record<string, number>>,
  thresholds: scoringConfig.thresholds,
  criticalBlockers: scoringConfig.critical_blockers.map((questionId) =>
    questionId.replace("Q", "").padStart(2, "0"),
  ),
  rankingFormula: scoringConfig.ranking_formula,
  output: scoringConfig.output,
};

export const DIMENSION_VENDOR_MAP: Record<DimensionKey, VendorType[]> =
  Object.fromEntries(
    Object.entries(scoringConfig.vendor_type_priority).map(([key, value]) => [
      normalizeDimensionKey(key),
      value.map(normalizeVendorType),
    ]),
  ) as Record<DimensionKey, VendorType[]>;

export const VENDOR_DIRECTORY: VendorDirectoryEntry[] = vendorMaster.map(
  (row) => ({
    rankInType: Number(row.Rank_in_type || 999),
    name: row.Company.trim(),
    type: normalizeVendorType(row.Primary_type),
    secondaryTypes: row.Secondary_types
      ? row.Secondary_types.split(/[;,]/)
          .map((item) => item.trim())
          .filter(Boolean)
          .map(normalizeVendorType)
      : [],
    sizeFit: normalizeSizeFit(row.Size_fit),
    sectorFit: row.Sector_fit.trim(),
    priceBand: row.Price_band.trim(),
    bestFor: row.Best_for.trim(),
    website: row.Website.trim(),
    qualificationMethodNote: row.Qualification_method_note.trim(),
    score: Number(row.Qualification_score_initial || 0),
    recommendedRole: row.Recommended_role.trim(),
  }),
);

export function getQuestionWeight(questionId: string) {
  return SCORING_CONFIG.weights[questionId] ?? 1;
}
