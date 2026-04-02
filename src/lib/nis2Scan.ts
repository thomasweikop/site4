import {
  DIMENSION_LABELS,
  DIMENSION_ORDER,
  DIMENSION_SUMMARIES,
  DIMENSION_VENDOR_MAP,
  SCORING_CONFIG,
  VENDOR_DIRECTORY,
  VENDOR_TYPE_META,
  getQuestionWeight,
  type DimensionKey,
  type VendorDirectoryEntry,
  type VendorSizeFit,
  type VendorType,
} from "./nis2BuildPack";

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

export const SCAN_QUESTIONS = [
  {
    id: "01",
    category: "Governance",
    question: "Har virksomheden en formel ansvarlig for informationssikkerhed?",
    weight: getQuestionWeight("01"),
    recommendation:
      "Udpeg en tydelig ansvarlig med mandat til at drive informationssikkerhed.",
  },
  {
    id: "02",
    category: "Governance",
    question:
      "Har virksomheden dokumenterede sikkerhedspolitikker for IT, adgang og data?",
    weight: getQuestionWeight("02"),
    recommendation:
      "Saml og opdater de vigtigste politikker, så ansvar og minimumskrav er tydelige.",
  },
  {
    id: "03",
    category: "Risiko",
    question:
      "Har virksomheden gennemført en risikovurdering inden for de sidste 12 måneder?",
    weight: getQuestionWeight("03"),
    recommendation:
      "Lav en frisk risikovurdering med fokus på kritiske systemer, leverandører og drift.",
  },
  {
    id: "04",
    category: "Leverandører",
    question:
      "Har virksomheden overblik over kritiske IT-leverandører og afhængigheder?",
    weight: getQuestionWeight("04"),
    recommendation:
      "Kortlaeg kritiske leverandører og vurder hvor de udgør sikkerheds- eller driftsrisiko.",
  },
  {
    id: "05",
    category: "Incident response",
    question:
      "Har virksomheden en plan for håndtering, hvis virksomheden bliver ramt af et angreb?",
    weight: getQuestionWeight("05"),
    recommendation:
      "Etabler en incident response plan med roller, eskalering og kommunikationsflow.",
  },
  {
    id: "06",
    category: "Overvågning",
    question:
      "Logger og overvåger virksomheden sikkerhedshændelser systematisk?",
    weight: getQuestionWeight("06"),
    recommendation:
      "Skab bedre logging og overvågning, så hændelser bliver opdaget tidligere.",
  },
  {
    id: "07",
    category: "Adgang",
    question:
      "Bruger virksomheden MFA på kritiske systemer og administrative konti?",
    weight: getQuestionWeight("07"),
    recommendation:
      "Udrul MFA konsekvent på administrative konti og andre kritiske systemer først.",
  },
  {
    id: "08",
    category: "Adgang",
    question: "Har virksomheden styr på hvem der har adgang til hvad?",
    weight: getQuestionWeight("08"),
    recommendation:
      "Gennemgå adgangsrettigheder og fjern unødvendige eller uafklarede privilegier.",
  },
  {
    id: "09",
    category: "Awareness",
    question:
      "Træner virksomheden medarbejdere i phishing, adgangssikkerhed og grundlæggende cyberhygiejne?",
    weight: getQuestionWeight("09"),
    recommendation:
      "Indfør regelmæssig awareness-træning og korte øvelser med tydeligt ansvar.",
  },
  {
    id: "10",
    category: "Test",
    question:
      "Tester virksomheden sikkerheden gennem audits, reviews eller penetrationstest?",
    weight: getQuestionWeight("10"),
    recommendation:
      "Planlæg faste tests og reviews, så svagheder bliver fundet før de bliver udnyttet.",
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
    range: "80–100",
    status: "Lav risiko",
    risk: "Lav risiko",
    className: "bg-[#dce8dc] text-sage border-[#b6cfb6]",
    barClassName: "bg-sage",
    summary:
      "Virksomheden ser forholdsvis godt dækket ud på tværs af de vigtigste områder, men bør stadig holde tempoet oppe på de resterende gaps.",
  },
  {
    id: "medium",
    min: 60,
    range: "60–79",
    status: "Moderat risiko",
    risk: "Moderat risiko",
    className: "bg-[#f4ead2] text-[#6b4e1d] border-[#dfc58e]",
    barClassName: "bg-[#c78c2d]",
    summary:
      "Virksomheden har noget på plads, men der er tydelige svagheder som bør prioriteres, før presset fra kunder, drift eller regulering vokser.",
  },
  {
    id: "high",
    min: 40,
    range: "40–59",
    status: "Høj risiko",
    risk: "Høj risiko",
    className: "bg-[#f4ddd6] text-ember border-[#e0a291]",
    barClassName: "bg-ember",
    summary:
      "Virksomheden har flere væsentlige mangler, og de vigtigste organisatoriske og tekniske kontroller bør prioriteres nu.",
  },
  {
    id: "critical",
    min: 0,
    range: "0–39",
    status: "Kritisk risiko",
    risk: "Høj risiko",
    className: "bg-[#f4ddd6] text-ember border-[#e0a291]",
    barClassName: "bg-ember",
    summary:
      "Der er flere kritiske huller i fundamentet, og de mest centrale kontroller bør adresseres hurtigt for at reducere reel risiko.",
  },
] as const;

export const WEIGHTED_TOPICS = [
  "Risikovurdering vægtes højere, fordi det er fundamentet for resten af indsatsen.",
  "Incident response vægtes højere, fordi manglende beredskab bliver dyrt meget hurtigt.",
  "MFA vægtes højere, fordi det ofte er et enkelt område med stor effekt på reel risiko.",
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

export type BlockerItem = {
  id: ScanQuestionId;
  question: string;
  vendorTypes: VendorType[];
};

function getBand(percentage: number) {
  return (
    SCORE_BANDS.find((band) => percentage >= band.min) ??
    SCORE_BANDS[SCORE_BANDS.length - 1]
  );
}

function getAnswerLabel(answer: ScanAnswerValue) {
  return (
    ANSWER_OPTIONS.find((option) => option.value === answer)?.label ?? "Nej"
  );
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

  if (percentage >= SCORING_CONFIG.thresholds.dimension_red_below) {
    return "Delvist dækket";
  }

  return "Bør prioriteres";
}

function getProfileInsights(profile: ScanProfile) {
  const insights = [];

  if (profile.industry === "energy" || profile.industry === "transport") {
    insights.push(
      "For energi og transport bliver governance, leverandørstyring og beredskab ofte hurtigt centrale temaer.",
    );
  }

  if (profile.industry === "health" || profile.industry === "finance") {
    insights.push(
      "For sundhed og finans er dokumentation, hændelseshåndtering og adgangskontrol typisk ekstra følsomme områder.",
    );
  }

  if (profile.industry === "saas") {
    insights.push(
      "For SaaS og IT vil adgangsstyring, logging og håndtering af leverandør- og driftsafhængigheder ofte vægte tungt i praksis.",
    );
  }

  if (profile.companySize === "250-500") {
    insights.push(
      "Blandt større virksomheder forventes der ofte mere formaliseret styring, tydeligt ejerskab og bedre leverandøroverblik.",
    );
  }

  if (profile.companySize === "50-99") {
    insights.push(
      "Blandt mindre virksomheder handler det ofte om at få de vigtigste kontroller på plads hurtigt, uden at bygge et for tungt setup.",
    );
  }

  if (profile.role === "cfo" || profile.role === "management") {
    insights.push(
      "For ledelse og økonomi er scoren især nyttig som beslutningsgrundlag for prioritering, ansvar og budget.",
    );
  }

  if (profile.role === "it" || profile.role === "security") {
    insights.push(
      "For IT og sikkerhed er resultatet mest værdifuldt som et hurtigt billede af hvor den første tekniske og organisatoriske indsats bør starte.",
    );
  }

  if (profile.role === "operations") {
    insights.push(
      "For drift er fokus typisk på hændelser, afhængigheder og hvor sikkerhedsgaps kan blive til reelle driftsforstyrrelser.",
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
      label: DIMENSION_LABELS[dimensionKey],
      percentage,
      score,
      maxScore,
      status: getDimensionStatus(percentage),
      summary: DIMENSION_SUMMARIES[dimensionKey],
      vendorTypes: DIMENSION_VENDOR_MAP[dimensionKey],
    } satisfies DimensionScore;
  });
}

function getTypeFitScore(vendor: VendorDirectoryEntry, targetType: VendorType) {
  if (vendor.type === targetType) {
    return 100;
  }

  if (vendor.secondaryTypes.includes(targetType)) {
    return 75;
  }

  return 50;
}

function getVendorPool(type: VendorType, size: VendorSizeFit) {
  const exact = VENDOR_DIRECTORY.filter(
    (vendor) => vendor.type === type && vendor.sizeFit.includes(size),
  );

  if (exact.length > 0) {
    return exact;
  }

  const midFallback = VENDOR_DIRECTORY.filter(
    (vendor) => vendor.type === type && vendor.sizeFit.includes("mid-market"),
  );

  if (midFallback.length > 0) {
    return midFallback;
  }

  return VENDOR_DIRECTORY.filter((vendor) => vendor.type === type);
}

function getSectorTokens(industry: IndustryValue) {
  switch (industry) {
    case "energy":
      return ["energy", "critical"];
    case "transport":
      return ["transport", "critical"];
    case "health":
      return ["health", "healthcare", "critical"];
    case "finance":
      return ["finance", "financial", "critical"];
    case "saas":
      return ["digital", "it", "saas", "software"];
    default:
      return [];
  }
}

function getSectorFitScore(
  vendor: VendorDirectoryEntry,
  industry?: IndustryValue,
) {
  if (!industry) {
    return 70;
  }

  const sectorFit = vendor.sectorFit.toLowerCase();

  if (sectorFit.includes("cross-sector")) {
    return 75;
  }

  const tokens = getSectorTokens(industry);

  if (tokens.some((token) => sectorFit.includes(token))) {
    return 100;
  }

  return 55;
}

function getCommercialFitScore(
  vendor: VendorDirectoryEntry,
  companySize?: CompanySizeValue,
) {
  const band = vendor.priceBand.toLowerCase();

  if (!companySize) {
    return 70;
  }

  if (companySize === "50-99") {
    if (band.includes("low")) {
      return 100;
    }

    if (band.includes("medium")) {
      return 80;
    }

    return 55;
  }

  if (companySize === "250-500") {
    if (band.includes("high")) {
      return 95;
    }

    if (band.includes("medium")) {
      return 80;
    }

    return 65;
  }

  if (band.includes("medium")) {
    return 90;
  }

  return 70;
}

function getSizeFitScore(vendor: VendorDirectoryEntry, size: VendorSizeFit) {
  return vendor.sizeFit.includes(size) ? 100 : 60;
}

function getBlockerFitScore(
  vendor: VendorDirectoryEntry,
  blockerIds: ScanQuestionId[],
  type: VendorType,
) {
  if (blockerIds.length === 0) {
    return 70;
  }

  const text = `${vendor.bestFor} ${vendor.recommendedRole}`.toLowerCase();
  const fitsRisk =
    blockerIds.includes("03") &&
    (type === "legal" ||
      type === "grc" ||
      /risk|governance|legal|compliance|nis2/.test(text));
  const fitsIncident =
    blockerIds.includes("05") &&
    (type === "soc" ||
      type === "technical" ||
      /incident|response|soc|mdr|monitor/.test(text));
  const fitsMfa =
    blockerIds.includes("07") &&
    (type === "technical" ||
      type === "soc" ||
      /mfa|identity|iam|access|privileged/.test(text));

  return fitsRisk || fitsIncident || fitsMfa ? 100 : 55;
}

function buildPartnerRationale(
  dimensions: DimensionScore[],
  sizeLabel: string,
) {
  const dimensionLabels = dimensions.map((item) => item.label.toLowerCase());
  const focusText =
    dimensionLabels.length > 1
      ? `${dimensionLabels.slice(0, -1).join(", ")} og ${dimensionLabels[dimensionLabels.length - 1]}`
      : dimensionLabels[0];

  return `Anbefales fordi virksomhedens største behov lige nu ligger i ${focusText}, og fordi denne profil typisk passer til segmentet ${sizeLabel.toLowerCase()}.`;
}

function getPartnerRecommendations(
  dimensions: DimensionScore[],
  blockerIds: ScanQuestionId[],
  profile?: ScanProfile,
) {
  const sortedDimensions = [...dimensions].sort(
    (left, right) => left.percentage - right.percentage,
  );
  const priorityDimensions = sortedDimensions.filter(
    (dimension) => dimension.percentage < 60,
  );
  const activeDimensions =
    priorityDimensions.length > 0
      ? priorityDimensions
      : sortedDimensions.slice(0, 2);
  const requestedTypes = new Map<VendorType, DimensionScore[]>();
  const segment = profile
    ? getCompanySizeSegment(profile.companySize)
    : "mid-market";
  const sizeLabel = profile
    ? getOptionLabel(COMPANY_SIZE_OPTIONS, profile.companySize)
    : "100-249 ansatte";

  for (const dimension of activeDimensions) {
    for (const vendorType of DIMENSION_VENDOR_MAP[dimension.key]) {
      const current = requestedTypes.get(vendorType) ?? [];
      current.push(dimension);
      requestedTypes.set(vendorType, current);
    }
  }

  if (blockerIds.includes("03")) {
    for (const vendorType of ["legal", "grc"] as const) {
      const current = requestedTypes.get(vendorType) ?? [];
      requestedTypes.set(vendorType, current);
    }
  }

  if (blockerIds.includes("05") || blockerIds.includes("07")) {
    for (const vendorType of ["technical", "soc"] as const) {
      const current = requestedTypes.get(vendorType) ?? [];
      requestedTypes.set(vendorType, current);
    }
  }

  const categoryGroups: VendorType[][] = [
    ["legal", "grc"],
    ["technical", "soc"],
    ["audit", "legal", "grc"],
  ];
  const chosenTypes: VendorType[] = [];

  for (const group of categoryGroups) {
    const preferred = group.find(
      (type) => requestedTypes.has(type) && !chosenTypes.includes(type),
    );

    if (preferred) {
      chosenTypes.push(preferred);
      continue;
    }

    const fallback = group.find((type) => !chosenTypes.includes(type));

    if (fallback) {
      chosenTypes.push(fallback);
    }
  }

  return chosenTypes
    .slice(0, SCORING_CONFIG.output.primary_recommendations)
    .map((type) => {
      const sourceDimensions =
        requestedTypes.get(type) ??
        activeDimensions.filter((dimension) =>
          DIMENSION_VENDOR_MAP[dimension.key].includes(type),
        );

      const vendorPool = getVendorPool(type, segment)
        .map((vendor) => {
          const fitScore = Math.round(
            vendor.score * SCORING_CONFIG.rankingFormula.base_vendor_score +
              getTypeFitScore(vendor, type) *
                SCORING_CONFIG.rankingFormula.type_fit +
              getSizeFitScore(vendor, segment) *
                SCORING_CONFIG.rankingFormula.size_fit +
              getSectorFitScore(vendor, profile?.industry) *
                SCORING_CONFIG.rankingFormula.sector_fit +
              getBlockerFitScore(vendor, blockerIds, type) *
                SCORING_CONFIG.rankingFormula.critical_blocker_fit +
              getCommercialFitScore(vendor, profile?.companySize) *
                SCORING_CONFIG.rankingFormula.commercial_fit,
          );

          return {
            vendor,
            fitScore,
          };
        })
        .sort((left, right) => {
          if (right.fitScore !== left.fitScore) {
            return right.fitScore - left.fitScore;
          }

          if (right.vendor.score !== left.vendor.score) {
            return right.vendor.score - left.vendor.score;
          }

          return left.vendor.rankInType - right.vendor.rankInType;
        });

      return {
        type,
        label: VENDOR_TYPE_META[type].label,
        summary: VENDOR_TYPE_META[type].summary,
        rationale: buildPartnerRationale(sourceDimensions, sizeLabel),
        fitScore: vendorPool[0]?.fitScore ?? 0,
        directoryCount: vendorPool.length,
        sampleVendors: vendorPool.slice(0, 3).map((item) => item.vendor),
        primaryVendor: vendorPool[0]?.vendor,
      } satisfies PartnerRecommendation;
    });
}

export function calculateScanResult(
  answers: ScanAnswers,
  profile?: ScanProfile,
) {
  const breakdown = {
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

  const totalPoints = details.reduce(
    (sum, item) => sum + item.weightedScore,
    0,
  );
  const maxPoints = details.reduce((sum, item) => sum + item.weightedMax, 0);
  const percentage = Math.round((totalPoints / maxPoints) * 100);
  const band = getBand(percentage);
  const dimensions = getDimensionScores(details);
  const blockers: BlockerItem[] = details
    .filter(
      (item) =>
        SCORING_CONFIG.criticalBlockers.includes(item.id) &&
        item.answer === "no",
    )
    .map((item) => ({
      id: item.id,
      question: item.question,
      vendorTypes: item.id === "03" ? ["legal", "grc"] : ["technical", "soc"],
    }));
  const weakestDimensions = [...dimensions]
    .sort((left, right) => left.percentage - right.percentage)
    .slice(0, 2);
  const partnerRecommendations = getPartnerRecommendations(
    dimensions,
    blockers.map((blocker) => blocker.id),
    profile,
  );
  const profileInsights = profile ? getProfileInsights(profile) : [];
  const profileSummary = profile
    ? [
        `Virksomhedsstørrelse: ${getOptionLabel(COMPANY_SIZE_OPTIONS, profile.companySize)}`,
        `Branche: ${getOptionLabel(INDUSTRY_OPTIONS, profile.industry)}`,
        `Rolle: ${getOptionLabel(ROLE_OPTIONS, profile.role)}`,
      ]
    : [];

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

  const nextSteps = Array.from(
    new Set(gaps.map((gap) => gap.recommendation)),
  ).slice(0, 3);

  const reportSections = [
    `Governance: ${dimensions.find((item) => item.key === "governance")?.percentage ?? 0}%`,
    `Technical: ${dimensions.find((item) => item.key === "technical")?.percentage ?? 0}%`,
    `Operational: ${dimensions.find((item) => item.key === "operational")?.percentage ?? 0}%`,
    `Compliance: ${dimensions.find((item) => item.key === "compliance")?.percentage ?? 0}%`,
  ];

  const executiveSummary = `Virksomhedens samlede score er ${percentage}%. De laveste områder lige nu er ${weakestDimensions
    .map((dimension) => dimension.label.toLowerCase())
    .join(
      " og ",
    )}${blockers.length > 0 ? ", og der er samtidig kritiske blockers som bør håndteres først." : "."}`;

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
    partnerRecommendations,
    executiveSummary,
    reportSections,
    vendorDirectoryCount: VENDOR_DIRECTORY.length,
    profileInsights,
    profileSummary,
  };
}
