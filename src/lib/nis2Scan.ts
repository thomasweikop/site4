import {
  DIMENSION_ORDER,
  FOLLOWUP_QUESTIONS,
  FLOW_B_DIMENSION_THRESHOLD,
  MATRIX_COLUMNS,
  RECOMMENDED_EXPERT_COUNT,
  SCORING_CONFIG,
  TOP_AREA_COUNT,
  TYPE_ROUTING,
  VENDOR_DIRECTORY,
  VENDOR_TYPE_META,
  getBlockerAreaKey,
  getQuestionWeight,
  vendorSupportsArea,
  type DimensionKey,
  type GranularAreaKey,
  type MatrixAreaKey,
  type VendorDirectoryEntry,
  type VendorSizeFit,
  type VendorType,
} from "./nis2BuildPack";
import {
  NIS2_AREA_GUIDANCE,
  getComplianceLevelKey,
  type ComplianceLevelKey,
  type GuidanceAreaKey,
} from "./nis2AreaGuidance";

export const ANSWER_OPTIONS = [
  {
    value: "yes",
    label: "Ja",
    pointsLabel: "10 point",
    description: "Et område der ser ud til at være etableret og aktivt brugt.",
  },
  {
    value: "partial",
    label: "Delvist",
    pointsLabel: "5 point",
    description:
      "Noget er på plads, men modenheden er for ujævn til at være tryg.",
  },
  {
    value: "no",
    label: "Nej",
    pointsLabel: "0 point",
    description: "Et tydeligt gap der bør indgå i den første handlingsplan.",
  },
] as const;

export const COMPANY_SIZE_OPTIONS = [
  { value: "50-99", label: "50-99 ansatte" },
  { value: "100-249", label: "100-249 ansatte" },
  { value: "250-500", label: "250-500 ansatte" },
] as const;

export const INDUSTRY_OPTIONS = [
  { value: "energy", label: "Energi" },
  { value: "transport", label: "Transport" },
  { value: "health", label: "Sundhed" },
  { value: "finance", label: "Finans / fintech" },
  { value: "saas", label: "SaaS / IT" },
  { value: "other", label: "Anden branche" },
] as const;

export const ROLE_OPTIONS = [
  { value: "cfo", label: "CFO / økonomi" },
  { value: "it", label: "IT-chef / CIO" },
  { value: "security", label: "CISO / sikkerhed" },
  { value: "operations", label: "COO / drift" },
  { value: "management", label: "Ledelse / bestyrelse" },
] as const;

const ANSWER_POINTS = {
  yes: 10,
  partial: 5,
  no: 0,
} as const;

const USER_DIMENSION_LABELS: Record<DimensionKey, string> = {
  governance: "Governance og ansvar",
  technical: "Tekniske kontroller",
  operational: "Beredskab og drift",
  compliance: "Dokumentation og compliance",
};

const PRIORITY_AREA_META: Record<
  DimensionKey,
  {
    label: string;
    summary: string;
  }
> = {
  governance: {
    label: "Governance og ansvar",
    summary:
      "Ansvar, ledelsesforankring, politikker og risikostyring er ikke tilstrækkeligt formaliseret endnu.",
  },
  technical: {
    label: "Tekniske kontroller",
    summary:
      "Der er behov for et stærkere fundament indenfor logging, MFA, adgangs- og asset-overblik.",
  },
  operational: {
    label: "Beredskab og drift",
    summary:
      "Beredskab, træning, continuity og den praktiske håndtering af hændelser kræver mere modenhed.",
  },
  compliance: {
    label: "Dokumentation og compliance",
    summary:
      "Dokumentation, leverandørstyring, assurance og den løbende compliance-opfølgning er fortsat for svag.",
  },
};

const DIMENSION_NEXT_STEPS: Record<DimensionKey, string> = {
  governance:
    "Afklar ansvar, ledelsesforankring og styringsmodel, så virksomheden har et tydeligt ejerskab for NIS2-arbejdet.",
  technical:
    "Prioritér de tekniske grundkontroller først, især MFA, logging, adgangsoverblik og kritiske systemejere.",
  operational:
    "Etabler et mere operationelt beredskab omkring incident response, træning og continuity, så virksomheden kan reagere under pres.",
  compliance:
    "Saml dokumentation, leverandørstyring og revisionsspor, så virksomheden kan underbygge næste prioritering og efterfølgende compliance-arbejde.",
};

export const SCAN_QUESTIONS = [
  {
    id: "01",
    category: "Governance",
    question:
      "Er der en navngiven ansvarlig for cybersikkerhed / NIS2 med ledelsesopbakning?",
    weight: getQuestionWeight("01"),
    recommendation:
      "Udpeg en tydelig ansvarlig med mandat til at drive NIS2-arbejdet og forankre det i ledelsen.",
  },
  {
    id: "02",
    category: "Governance",
    question:
      "Har virksomheden godkendte informationssikkerhedspolitikker og standarder, som revideres mindst én gang årligt?",
    weight: getQuestionWeight("02"),
    recommendation:
      "Saml og opdater de vigtigste politikker, så ansvar, minimumskrav og årlig opfølgning er tydelige.",
  },
  {
    id: "03",
    category: "Risiko",
    question:
      "Er der gennemført en dokumenteret cyber-risikovurdering inden for de seneste 12 måneder?",
    weight: getQuestionWeight("03"),
    recommendation:
      "Gennemfør en dokumenteret risikovurdering, der dækker kritiske systemer, leverandører og driftsafhængigheder.",
  },
  {
    id: "04",
    category: "Leverandører",
    question:
      "Vurderer virksomheden kritiske leverandører og vedligeholder dokumenterede sikkerhedskrav og due diligence?",
    weight: getQuestionWeight("04"),
    recommendation:
      "Kortlæg kritiske leverandører og opdater sikkerhedskrav, due diligence og kontraktopfølgning.",
  },
  {
    id: "05",
    category: "Incident response",
    question:
      "Har virksomheden en incident response-proces, rapporteringsflow og navngivne roller for større hændelser?",
    weight: getQuestionWeight("05"),
    recommendation:
      "Etabler en incident response-proces med roller, eskalering, kommunikationsflow og klare beslutningspunkter.",
  },
  {
    id: "06",
    category: "Overvågning",
    question:
      "Bliver kritiske systemer logget og overvåget centralt med alarmering?",
    weight: getQuestionWeight("06"),
    recommendation:
      "Prioritér central logging og alarmering på de vigtigste systemer, så hændelser opdages tidligere.",
  },
  {
    id: "07",
    category: "Adgang",
    question:
      "Er MFA tvunget på kritiske systemer, og er privilegeret adgang kontrolleret?",
    weight: getQuestionWeight("07"),
    recommendation:
      "Udrul MFA konsekvent på kritiske systemer og stram styringen af privilegerede konti.",
  },
  {
    id: "08",
    category: "Assets og adgang",
    question:
      "Vedligeholder virksomheden et overblik over kritiske aktiver, systemer, konti og ejere?",
    weight: getQuestionWeight("08"),
    recommendation:
      "Skab et opdateret overblik over kritiske aktiver, systemejere, konti og adgangsforhold.",
  },
  {
    id: "09",
    category: "Awareness",
    question:
      "Får medarbejdere løbende security awareness og rollebaseret træning?",
    weight: getQuestionWeight("09"),
    recommendation:
      "Planlæg et mere systematisk awareness-program med rollebaseret træning og løbende opfølgning.",
  },
  {
    id: "10",
    category: "Backup og continuity",
    question:
      "Tester virksomheden backup, recovery, continuity og nøglekontroller mindst én gang årligt?",
    weight: getQuestionWeight("10"),
    recommendation:
      "Planlæg faste tests af backup, recovery, continuity og de vigtigste sikkerhedskontroller.",
  },
] as const;

export const SCORE_RULES = ANSWER_OPTIONS.map((option) => ({
  label: option.label,
  points: option.pointsLabel,
  text: option.description,
}));

export const SCORE_BANDS = [
  {
    id: "low",
    min: 80,
    range: "80-100",
    status: "Relativt modent udgangspunkt",
    risk: "Relativt modent udgangspunkt",
    className: "bg-[#dce8dc] text-sage border-[#b6cfb6]",
    barClassName: "bg-sage",
    summary:
      "Virksomheden har et relativt stærkt udgangspunkt, men der vil stadig være områder som kræver opfølgning før fuld compliance kan antages.",
  },
  {
    id: "medium",
    min: 60,
    range: "60-79",
    status: "Behov for prioritering",
    risk: "Behov for prioritering",
    className: "bg-[#f4ead2] text-[#6b4e1d] border-[#dfc58e]",
    barClassName: "bg-[#c78c2d]",
    summary:
      "Virksomheden har noget på plads, men der er fortsat tydelige svagheder som bør prioriteres for at komme tættere på fuld compliance.",
  },
  {
    id: "high",
    min: 40,
    range: "40-59",
    status: "Betydelige huller",
    risk: "Betydelige huller",
    className: "bg-[#f4ddd6] text-ember border-[#e0a291]",
    barClassName: "bg-ember",
    summary:
      "Virksomheden har flere væsentlige huller, og de vigtigste organisatoriske og tekniske spor bør prioriteres hurtigt.",
  },
  {
    id: "critical",
    min: 0,
    range: "0-39",
    status: "Kritiske huller",
    risk: "Kritiske huller",
    className: "bg-[#f4ddd6] text-ember border-[#e0a291]",
    barClassName: "bg-ember",
    summary:
      "Der er flere kritiske huller i fundamentet, og virksomheden bør begynde med de få kontroller der reducerer reel eksponering hurtigst.",
  },
] as const;

export const WEIGHTED_TOPICS = [
  "Risikovurdering vægtes højere, fordi den sætter retningen for resten af indsatsen.",
  "Incident response vægtes højere, fordi manglende beredskab hurtigt bliver dyrt i praksis.",
  "MFA og privilegeret adgang vægtes højere, fordi det er et enkelt spor med stor effekt på reel eksponering.",
];

export type ScanQuestion = (typeof SCAN_QUESTIONS)[number];
export type ScanQuestionId = ScanQuestion["id"];
export type ScanAnswerValue = (typeof ANSWER_OPTIONS)[number]["value"];
export type ScanAnswers = Partial<Record<ScanQuestionId, ScanAnswerValue>>;
export type CompanySizeValue = (typeof COMPANY_SIZE_OPTIONS)[number]["value"];
export type IndustryValue = (typeof INDUSTRY_OPTIONS)[number]["value"];
export type RoleValue = (typeof ROLE_OPTIONS)[number]["value"];
export type ScanProfile = {
  companySize: CompanySizeValue;
  industry: IndustryValue;
  role: RoleValue;
};

export type GapItem = {
  id: ScanQuestionId;
  category: string;
  question: string;
  answer: ScanAnswerValue;
  answerLabel: string;
  pointsLost: number;
  recommendation: string;
};

export type DimensionScore = {
  key: DimensionKey;
  label: string;
  percentage: number;
  score: number;
  maxScore: number;
  status: string;
  summary: string;
  vendorTypes: VendorType[];
};

export type BlockerItem = {
  id: ScanQuestionId;
  question: string;
  areaKey: GranularAreaKey;
  vendorTypes: VendorType[];
};

export type RoadmapPhase = {
  phase: string;
  title: string;
  items: string[];
};

export type PriorityArea = {
  key: DimensionKey;
  label: string;
  summary: string;
  vendorTypes: VendorType[];
  followUpQuestions: string[];
};

export type AnalysisArea = {
  key: GuidanceAreaKey;
  label: string;
  intro: string;
  percentage: number;
  complianceLevel: ComplianceLevelKey;
  complianceLabel: string;
  description: string;
  typicalGaps: string[];
  actions: string[];
};

export type RankedVendorFit = {
  vendor: VendorDirectoryEntry;
  fitScore: number;
  qualificationScoreInitial: number;
  typeFit: number;
  areaFit: number;
  sizeFit: number;
  sectorFit: number;
  blockerFit: number;
  matchedAreas: MatrixAreaKey[];
  matchedAreaLabels: string[];
  preferredTypeMatch: "primary" | "adjacent" | "none";
};

export type RecommendedExpert = RankedVendorFit & {
  rank: number;
  label: string;
  rationale: string;
};

export type PartnerRecommendation = {
  type: VendorType;
  label: string;
  summary: string;
  rationale: string;
  fitScore: number;
  directoryCount: number;
  sampleVendors: VendorDirectoryEntry[];
  primaryVendor?: VendorDirectoryEntry;
};

export type FollowupArea = {
  key: DimensionKey;
  label: string;
  percentage: number;
  summary: string;
  questions: string[];
  vendorTypes: VendorType[];
};

type AnswerBreakdown = {
  yes: number;
  partial: number;
  no: number;
};

type ScoreBand = (typeof SCORE_BANDS)[number];

function dedupe<T>(values: T[]) {
  return Array.from(new Set(values));
}

function getBand(percentage: number): ScoreBand {
  return (
    SCORE_BANDS.find((band) => percentage >= band.min) ??
    SCORE_BANDS[SCORE_BANDS.length - 1]
  );
}

function getAnswerLabel(answer: ScanAnswerValue) {
  return ANSWER_OPTIONS.find((option) => option.value === answer)?.label ?? "Nej";
}

function getOptionLabel<T extends readonly { value: string; label: string }[]>(
  options: T,
  value: T[number]["value"],
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function getCompanySizeSegment(companySize: CompanySizeValue): VendorSizeFit {
  if (companySize === "50-99") {
    return "smb";
  }

  if (companySize === "250-500") {
    return "enterprise";
  }

  return "mid-market";
}

function getDimensionStatus(percentage: number) {
  if (percentage >= 80) {
    return "Relativt stærkt";
  }

  if (percentage >= FLOW_B_DIMENSION_THRESHOLD) {
    return "Noget er på plads";
  }

  if (percentage >= 50) {
    return "Bør prioriteres";
  }

  return "Kritisk gap";
}

function getProfileInsights(profile: ScanProfile) {
  const insights: string[] = [];

  if (profile.industry === "energy" || profile.industry === "transport") {
    insights.push(
      "For energi og transport bliver risikostyring, leverandørstyring og beredskab ofte hurtigt centrale temaer.",
    );
  }

  if (profile.industry === "health" || profile.industry === "finance") {
    insights.push(
      "For sundhed og finans er dokumentation, hændelseshåndtering og adgangskontrol typisk ekstra følsomme områder.",
    );
  }

  if (profile.industry === "saas") {
    insights.push(
      "For SaaS og IT vægter adgangsstyring, logging og afhængigheder til drift og leverandører ofte tungt i prioriteringen.",
    );
  }

  if (profile.companySize === "250-500") {
    insights.push(
      "I større virksomheder forventes der typisk mere formaliseret styring, tydelig dokumentation og klarere ejerskab.",
    );
  }

  if (profile.companySize === "50-99") {
    insights.push(
      "I mindre organisationer handler det ofte om at få de vigtigste grundkontroller på plads uden at bygge et for tungt setup.",
    );
  }

  if (profile.role === "management" || profile.role === "cfo") {
    insights.push(
      "For ledelse og økonomi er resultatet især nyttigt som beslutningsgrundlag for prioritering, ansvar og budget.",
    );
  }

  if (profile.role === "it" || profile.role === "security") {
    insights.push(
      "For IT og sikkerhed er resultatet mest værdifuldt som et hurtigt billede af hvor den første tekniske og organisatoriske indsats bør starte.",
    );
  }

  if (profile.role === "operations") {
    insights.push(
      "For drift er fokus typisk på hændelser, continuity og hvor sikkerhedsgaps kan blive til reelle driftsforstyrrelser.",
    );
  }

  return insights.slice(0, 3);
}

function getDimensionScores(
  details: Array<{
    id: ScanQuestionId;
    baseScore: number;
  }>,
) {
  return DIMENSION_ORDER.map((dimensionKey) => {
    const questionIds = SCORING_CONFIG.dimensions[dimensionKey];
    const dimensionItems = details.filter((item) =>
      questionIds.includes(item.id),
    );
    const score = dimensionItems.reduce((sum, item) => {
      const weight =
        SCORING_CONFIG.dimensionWeights[dimensionKey][item.id] ?? 1;

      return sum + item.baseScore * weight;
    }, 0);
    const maxScore = dimensionItems.reduce(
      (sum, item) =>
        sum +
        10 * (SCORING_CONFIG.dimensionWeights[dimensionKey][item.id] ?? 1),
      0,
    );
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    return {
      key: dimensionKey,
      label: USER_DIMENSION_LABELS[dimensionKey],
      percentage,
      score,
      maxScore,
      status: getDimensionStatus(percentage),
      summary: PRIORITY_AREA_META[dimensionKey].summary,
      vendorTypes: TYPE_ROUTING[dimensionKey].primary,
    } satisfies DimensionScore;
  });
}

function getBlockers(
  details: Array<{
    id: ScanQuestionId;
    question: string;
    answer: ScanAnswerValue;
  }>,
) {
  return details
    .filter(
      (item) =>
        SCORING_CONFIG.criticalBlockers.includes(item.id) && item.answer === "no",
    )
    .map((item) => {
      const areaKey = getBlockerAreaKey(item.id);

      if (!areaKey) {
        return null;
      }

      return {
        id: item.id,
        question: item.question,
        areaKey,
        vendorTypes:
          item.id === "03" ? ["legal", "grc"] : (["technical", "soc"] as VendorType[]),
      } satisfies BlockerItem;
    })
    .filter(Boolean) as BlockerItem[];
}

function buildPriorityAreas(dimensions: DimensionScore[]) {
  return [...dimensions]
    .sort((left, right) => left.percentage - right.percentage)
    .slice(0, TOP_AREA_COUNT)
    .map((dimension) => ({
      key: dimension.key,
      label: PRIORITY_AREA_META[dimension.key].label,
      summary: PRIORITY_AREA_META[dimension.key].summary,
      vendorTypes: TYPE_ROUTING[dimension.key].primary,
      followUpQuestions: FOLLOWUP_QUESTIONS[dimension.key],
    })) satisfies PriorityArea[];
}

function buildFollowupAreas(dimensions: DimensionScore[]) {
  return dimensions
    .filter((dimension) => dimension.percentage < FLOW_B_DIMENSION_THRESHOLD)
    .sort((left, right) => left.percentage - right.percentage)
    .map((dimension) => ({
      key: dimension.key,
      label: PRIORITY_AREA_META[dimension.key].label,
      percentage: dimension.percentage,
      summary: PRIORITY_AREA_META[dimension.key].summary,
      questions: FOLLOWUP_QUESTIONS[dimension.key],
      vendorTypes: TYPE_ROUTING[dimension.key].primary,
    })) satisfies FollowupArea[];
}

function getPreferredVendorTypes(priorityAreas: PriorityArea[]) {
  return dedupe(priorityAreas.flatMap((area) => TYPE_ROUTING[area.key].primary));
}

function buildRelevantAreaKeys(
  priorityAreas: PriorityArea[],
  blockers: BlockerItem[],
) {
  const keys = new Set<MatrixAreaKey>();

  for (const area of priorityAreas) {
    keys.add(area.key);
  }

  for (const blocker of blockers) {
    keys.add(blocker.areaKey);
  }

  return Array.from(keys);
}

function getTypeFitScore(
  vendor: VendorDirectoryEntry,
  preferredTypes: VendorType[],
) {
  if (preferredTypes.includes(vendor.type)) {
    return {
      value: vendor.typeFitScores.primary,
      match: "primary" as const,
    };
  }

  if (
    vendor.adjacentTypes.some((type) => preferredTypes.includes(type)) ||
    vendor.secondaryTypes.some((type) => preferredTypes.includes(type))
  ) {
    return {
      value: vendor.typeFitScores.adjacent,
      match: "adjacent" as const,
    };
  }

  return {
    value: vendor.typeFitScores.nonmatch,
    match: "none" as const,
  };
}

function getAreaFitScore(
  vendor: VendorDirectoryEntry,
  relevantAreaKeys: MatrixAreaKey[],
) {
  if (relevantAreaKeys.length === 0) {
    return {
      value: 0,
      matchedAreas: [] as MatrixAreaKey[],
    };
  }

  const matchedAreas = relevantAreaKeys.filter((areaKey) =>
    vendorSupportsArea(vendor, areaKey),
  );

  return {
    value: Math.round((matchedAreas.length / relevantAreaKeys.length) * 100),
    matchedAreas,
  };
}

function getSizeFitScore(
  vendor: VendorDirectoryEntry,
  sizeSegment: VendorSizeFit,
) {
  if (vendor.sizeFit.includes(sizeSegment)) {
    return 100;
  }

  if (
    (sizeSegment === "mid-market" && vendor.sizeFit.length > 0) ||
    (sizeSegment !== "mid-market" && vendor.sizeFit.includes("mid-market"))
  ) {
    return 70;
  }

  return 40;
}

function getSectorTokens(industry: IndustryValue) {
  switch (industry) {
    case "energy":
      return ["energy", "energi"];
    case "transport":
      return ["transport"];
    case "health":
      return ["health", "healthcare", "sundhed"];
    case "finance":
      return ["finance", "financial", "finans", "fintech"];
    case "saas":
      return ["saas", "software", "digital", "it"];
    default:
      return [];
  }
}

function getSectorFitScore(vendor: VendorDirectoryEntry, industry: IndustryValue) {
  const sectorFit = vendor.sectorFit.toLowerCase();

  if (sectorFit.includes("cross-sector")) {
    return 100;
  }

  if (getSectorTokens(industry).some((token) => sectorFit.includes(token))) {
    return 100;
  }

  if (
    ["energy", "transport", "health", "finance"].includes(industry) &&
    sectorFit.includes("critical sectors")
  ) {
    return 70;
  }

  return 40;
}

function getBlockerFitScore(vendor: VendorDirectoryEntry, blockers: BlockerItem[]) {
  if (blockers.length === 0) {
    return 0;
  }

  const match = blockers.some((blocker) => {
    if (blocker.id === "03") {
      return vendor.blockerCoverage.riskAssessment;
    }

    if (blocker.id === "05") {
      return vendor.blockerCoverage.incidentResponse;
    }

    if (blocker.id === "07") {
      return vendor.blockerCoverage.mfaAccess;
    }

    return false;
  });

  return match ? 100 : 0;
}

function getMatrixAreaLabel(areaKey: MatrixAreaKey) {
  return MATRIX_COLUMNS.find((column) => column.key === areaKey)?.label ?? areaKey;
}

function buildExpertRationale(
  vendor: VendorDirectoryEntry,
  matchedAreaLabels: string[],
  priorityAreas: PriorityArea[],
) {
  const areaText =
    matchedAreaLabels.length > 0
      ? matchedAreaLabels.slice(0, 3).join(", ")
      : priorityAreas.map((area) => area.label).slice(0, 2).join(" og ");

  return `${vendor.name} prioriteres højt, fordi profilen matcher virksomhedens vigtigste områder indenfor ${areaText.toLowerCase()} og er kvalificeret til ${vendor.recommendedRole.toLowerCase()}.`;
}

function rankVendors(
  priorityAreas: PriorityArea[],
  blockers: BlockerItem[],
  profile?: ScanProfile,
) {
  const preferredTypes = getPreferredVendorTypes(priorityAreas);
  const relevantAreaKeys = buildRelevantAreaKeys(priorityAreas, blockers);
  const sizeSegment = profile
    ? getCompanySizeSegment(profile.companySize)
    : ("mid-market" satisfies VendorSizeFit);
  const industry = profile?.industry ?? "other";

  return VENDOR_DIRECTORY.map((vendor) => {
    const typeFit = getTypeFitScore(vendor, preferredTypes);
    const areaFit = getAreaFitScore(vendor, relevantAreaKeys);
    const sizeFit = getSizeFitScore(vendor, sizeSegment);
    const sectorFit = getSectorFitScore(vendor, industry);
    const blockerFit = getBlockerFitScore(vendor, blockers);

    // v4 fit score from the provided build spec.
    const fitScore = Math.round(
      vendor.score * SCORING_CONFIG.fitWeights.qualificationScoreInitial +
        typeFit.value * SCORING_CONFIG.fitWeights.typeFit +
        areaFit.value * SCORING_CONFIG.fitWeights.areaFit +
        sizeFit * SCORING_CONFIG.fitWeights.sizeFit +
        sectorFit * SCORING_CONFIG.fitWeights.sectorFit +
        blockerFit * SCORING_CONFIG.fitWeights.blockerFit,
    );

    return {
      vendor,
      fitScore,
      qualificationScoreInitial: vendor.score,
      typeFit: typeFit.value,
      areaFit: areaFit.value,
      sizeFit,
      sectorFit,
      blockerFit,
      matchedAreas: areaFit.matchedAreas,
      matchedAreaLabels: areaFit.matchedAreas.map(getMatrixAreaLabel),
      preferredTypeMatch: typeFit.match,
    } satisfies RankedVendorFit;
  }).sort((left, right) => {
    if (right.fitScore !== left.fitScore) {
      return right.fitScore - left.fitScore;
    }

    if (right.qualificationScoreInitial !== left.qualificationScoreInitial) {
      return right.qualificationScoreInitial - left.qualificationScoreInitial;
    }

    return left.vendor.rankInType - right.vendor.rankInType;
  });
}

function buildRecommendedExperts(
  vendorFits: RankedVendorFit[],
  priorityAreas: PriorityArea[],
) {
  return vendorFits.slice(0, RECOMMENDED_EXPERT_COUNT).map((item, index) => ({
    ...item,
    rank: index + 1,
    label: VENDOR_TYPE_META[item.vendor.type].label,
    rationale: buildExpertRationale(
      item.vendor,
      item.matchedAreaLabels,
      priorityAreas,
    ),
  })) satisfies RecommendedExpert[];
}

function buildPartnerRecommendations(vendorFits: RankedVendorFit[]) {
  const byType = new Map<VendorType, RankedVendorFit[]>();

  for (const item of vendorFits) {
    const current = byType.get(item.vendor.type) ?? [];
    current.push(item);
    byType.set(item.vendor.type, current);
  }

  return Array.from(byType.entries())
    .map(([type, items]) => {
      const sampleVendors = items.slice(0, 3).map((item) => item.vendor);
      const primaryVendor = sampleVendors[0];

      return {
        type,
        label: VENDOR_TYPE_META[type].label,
        summary: VENDOR_TYPE_META[type].summary,
        rationale:
          primaryVendor?.recommendedWhen || VENDOR_TYPE_META[type].summary,
        fitScore: items[0]?.fitScore ?? 0,
        directoryCount: items.length,
        sampleVendors,
        primaryVendor,
      } satisfies PartnerRecommendation;
    })
    .sort((left, right) => right.fitScore - left.fitScore)
    .slice(0, 3);
}

function buildRoadmap(
  priorityAreas: PriorityArea[],
  blockers: BlockerItem[],
  recommendedExperts: RecommendedExpert[],
) {
  const firstExpert = recommendedExperts[0];

  const firstMonth = dedupe(
    [
      ...blockers.map((blocker) => {
        if (blocker.id === "03") {
          return "Få gennemført en dokumenteret risikovurdering som første ledelsesforankrede arbejdsstrøm.";
        }

        if (blocker.id === "05") {
          return "Etabler roller, eskalering og rapporteringsflow for alvorlige hændelser.";
        }

        return "Luk de vigtigste huller i MFA og privilegeret adgang på kritiske systemer.";
      }),
      ...priorityAreas.slice(0, 2).map((area) => DIMENSION_NEXT_STEPS[area.key]),
    ],
  ).slice(0, 3);

  const middleMonth = dedupe(
    [
      firstExpert
        ? `Start dialog med ${firstExpert.vendor.name} eller en tilsvarende specialistprofil for at kvalificere scope og rækkefølge.`
        : "Start dialog med den mest relevante specialistprofil for at kvalificere scope og rækkefølge.",
      "Omsæt de vigtigste gaps til et kort internt roadmap med ansvarlige, afhængigheder og budget.",
      "Aftal hvilke beviser og dokumenter der skal opbygges først, så næste compliance-skridt kan underbygges.",
    ],
  );

  const lastMonth = [
    "Test de vigtigste kontroller gennem review, tabletop eller teknisk validering.",
    "Etabler et fast forum for opfølgning på ledelsesniveau omkring de prioriterede områder.",
    "Brug specialistdialogerne til at beslutte hvilke spor der skal håndteres internt og hvilke der kræver ekstern hjælp.",
  ];

  return [
    {
      phase: "0-30 dage",
      title: "Stabiliser fundamentet",
      items: firstMonth,
    },
    {
      phase: "30-60 dage",
      title: "Kvalificér og prioriter indsatsen",
      items: middleMonth,
    },
    {
      phase: "60-90 dage",
      title: "Dokumentér, test og beslut næste spor",
      items: lastMonth,
    },
  ] satisfies RoadmapPhase[];
}

function getUrgencyStatement(
  percentage: number,
  blockers: BlockerItem[],
  priorityAreas: PriorityArea[],
) {
  if (blockers.length > 0) {
    return "Der er kritiske blockers i resultatet. Virksomheden bør begynde med de få kontroller der reducerer reel eksponering hurtigst.";
  }

  if (percentage < 60) {
    return `Virksomheden bør begynde med ${priorityAreas
      .slice(0, 2)
      .map((area) => area.label.toLowerCase())
      .join(" og ")} som de første arbejdsspor.`;
  }

  return "Der er et brugbart udgangspunkt, men de svageste områder bør stadig prioriteres før virksomheden kan læne sig på resultatet som beslutningsgrundlag.";
}

function buildExecutiveSummary(
  percentage: number,
  analysisAreas: AnalysisArea[],
  blockers: BlockerItem[],
) {
  const areasText = analysisAreas
    .map((area) => area.label.toLowerCase())
    .join(", ")
    .replace(/, ([^,]*)$/, " og $1");

  if (blockers.length > 0) {
    return `Virksomhedens samlede score er ${percentage}%. De største relative gaps ligger indenfor ${areasText}, og der er samtidig kritiske blockers som bør håndteres først.`;
  }

  return `Virksomhedens samlede score er ${percentage}%. De største relative gaps ligger indenfor ${areasText}.`;
}

function buildAnalysisAreas(
  details: Array<{
    id: ScanQuestionId;
    baseScore: number;
  }>,
) {
  const detailsById = new Map(details.map((item) => [item.id, item]));

  return NIS2_AREA_GUIDANCE.map((area) => {
    let score = 0;
    let maxScore = 0;

    for (const [questionId, weight] of Object.entries(area.questionWeights)) {
      const item = detailsById.get(questionId as ScanQuestionId);

      if (!item || !weight) {
        continue;
      }

      score += item.baseScore * weight;
      maxScore += 10 * weight;
    }

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const complianceLevel = getComplianceLevelKey(percentage);
    const level = area.levels[complianceLevel];

    return {
      key: area.key,
      label: area.label,
      intro: area.intro,
      percentage,
      complianceLevel,
      complianceLabel: level.label,
      description: level.description,
      typicalGaps: level.typicalGaps,
      actions: level.actions,
    } satisfies AnalysisArea;
  }).sort((left, right) => left.percentage - right.percentage);
}

export function calculateScanResult(
  answers: ScanAnswers,
  profile?: ScanProfile,
) {
  const breakdown: AnswerBreakdown = {
    yes: 0,
    partial: 0,
    no: 0,
  };

  const details = SCAN_QUESTIONS.map((question) => {
    const answer = answers[question.id] ?? "no";
    breakdown[answer] += 1;

    const weightedMax = question.weight * 10;
    const weightedScore = question.weight * ANSWER_POINTS[answer];
    const pointsLost = weightedMax - weightedScore;

    return {
      ...question,
      answer,
      baseScore: ANSWER_POINTS[answer],
      answerLabel: getAnswerLabel(answer),
      weightedScore,
      weightedMax,
      pointsLost,
    };
  });

  const totalPoints = details.reduce((sum, item) => sum + item.weightedScore, 0);
  const maxPoints = details.reduce((sum, item) => sum + item.weightedMax, 0);
  const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
  const band = getBand(percentage);
  const dimensions = getDimensionScores(details);
  const blockers = getBlockers(details);
  const analysisAreas = buildAnalysisAreas(details);
  const topAnalysisAreas = analysisAreas.slice(0, TOP_AREA_COUNT);
  const weakestDimensions = [...dimensions]
    .sort((left, right) => left.percentage - right.percentage)
    .slice(0, 2);
  const priorityAreas = buildPriorityAreas(dimensions);
  const followupAreas = buildFollowupAreas(dimensions);
  const vendorFits = rankVendors(priorityAreas, blockers, profile);
  const recommendedExperts = buildRecommendedExperts(vendorFits, priorityAreas);
  const partnerRecommendations = buildPartnerRecommendations(vendorFits);
  const specialistMatrixVendors = vendorFits.map((item) => item.vendor);

  const profileSummary = profile
    ? [
        `Virksomhedsstørrelse: ${getOptionLabel(COMPANY_SIZE_OPTIONS, profile.companySize)}`,
        `Branche: ${getOptionLabel(INDUSTRY_OPTIONS, profile.industry)}`,
        `Rolle: ${getOptionLabel(ROLE_OPTIONS, profile.role)}`,
      ]
    : [];
  const profileInsights = profile ? getProfileInsights(profile) : [];

  const gaps: GapItem[] = details
    .filter((item) => item.answer !== "yes")
    .sort((left, right) => {
      if (right.pointsLost !== left.pointsLost) {
        return right.pointsLost - left.pointsLost;
      }

      return left.id.localeCompare(right.id);
    })
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      category: item.category,
      question: item.question,
      answer: item.answer,
      answerLabel: item.answerLabel,
      pointsLost: item.pointsLost,
      recommendation: item.recommendation,
    }));

  const nextSteps = dedupe(
    [
      ...blockers.map((blocker) => {
        if (blocker.id === "03") {
          return "Gennemfør en dokumenteret risikovurdering med ejere, prioritering og ledelsesforankring.";
        }

        if (blocker.id === "05") {
          return "Etabler incident response med roller, eskalering og rapporteringsflow for større hændelser.";
        }

        return "Tving MFA på kritiske systemer og få styr på privilegeret adgang før næste modenhedstrin.";
      }),
      ...priorityAreas.map((area) => DIMENSION_NEXT_STEPS[area.key]),
      ...gaps.map((gap) => gap.recommendation),
    ],
  ).slice(0, 3);

  const executiveSummary = buildExecutiveSummary(
    percentage,
    topAnalysisAreas,
    blockers,
  );
  const urgencyStatement = getUrgencyStatement(
    percentage,
    blockers,
    priorityAreas,
  );
  const roadmap = buildRoadmap(priorityAreas, blockers, recommendedExperts);
  const reportSections = dimensions.map(
    (dimension) => `${dimension.label}: ${dimension.percentage}%`,
  );

  return {
    percentage,
    totalPoints,
    maxPoints,
    band,
    gaps,
    nextSteps,
    breakdown,
    answeredCount: details.length,
    riskSummary: band.summary,
    dimensions,
    blockers,
    weakestDimensions,
    analysisAreas,
    topAnalysisAreas,
    priorityAreas,
    followupAreas,
    partnerRecommendations,
    recommendedExperts,
    vendorFits,
    executiveSummary,
    urgencyStatement,
    reportSections,
    vendorDirectoryCount: VENDOR_DIRECTORY.length,
    profileInsights,
    profileSummary,
    roadmap,
    specialistMatrixVendors,
  };
}

export type ScanResult = ReturnType<typeof calculateScanResult>;
