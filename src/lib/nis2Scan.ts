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
    description: "Noget er på plads, men modenheden er for ujævn til at være tryg.",
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
    question: "Har I en formel ansvarlig for informationssikkerhed?",
    weight: 1,
    recommendation: "Udpeg en tydelig ansvarlig med mandat til at drive informationssikkerhed.",
  },
  {
    id: "02",
    category: "Governance",
    question: "Har I dokumenterede sikkerhedspolitikker for IT, adgang og data?",
    weight: 1,
    recommendation: "Saml og opdater de vigtigste politikker, så ansvar og minimumskrav er tydelige.",
  },
  {
    id: "03",
    category: "Risiko",
    question: "Har I gennemført en risikovurdering inden for de sidste 12 måneder?",
    weight: 2,
    recommendation: "Lav en frisk risikovurdering med fokus på kritiske systemer, leverandører og drift.",
  },
  {
    id: "04",
    category: "Leverandører",
    question: "Har I overblik over kritiske IT-leverandører og afhængigheder?",
    weight: 1,
    recommendation: "Kortlaeg kritiske leverandører og vurder hvor de udgør sikkerheds- eller driftsrisiko.",
  },
  {
    id: "05",
    category: "Incident response",
    question: "Har I en plan for hvad I gør, hvis I bliver ramt af et angreb?",
    weight: 2,
    recommendation: "Etabler en incident response plan med roller, eskalering og kommunikationsflow.",
  },
  {
    id: "06",
    category: "Overvågning",
    question: "Logger og overvåger I sikkerhedshændelser systematisk?",
    weight: 1,
    recommendation: "Skab bedre logging og overvågning, så hændelser bliver opdaget tidligere.",
  },
  {
    id: "07",
    category: "Adgang",
    question: "Bruger I MFA på kritiske systemer og administrative konti?",
    weight: 2,
    recommendation: "Udrul MFA konsekvent på administrative konti og andre kritiske systemer først.",
  },
  {
    id: "08",
    category: "Adgang",
    question: "Har I styr på hvem der har adgang til hvad?",
    weight: 1,
    recommendation: "Gennemgå adgangsrettigheder og fjern unødvendige eller uafklarede privilegier.",
  },
  {
    id: "09",
    category: "Awareness",
    question: "Træner I medarbejdere i phishing, adgangssikkerhed og grundlæggende cyberhygiejne?",
    weight: 1,
    recommendation: "Indfør regelmæssig awareness-træning og korte øvelser med tydeligt ansvar.",
  },
  {
    id: "10",
    category: "Test",
    question: "Tester I jeres sikkerhed gennem audits, reviews eller penetrationstest?",
    weight: 1,
    recommendation: "Planlæg faste tests og reviews, så svagheder bliver fundet før de bliver udnyttet.",
  },
] as const;

export const SCORE_RULES = ANSWER_OPTIONS.map((option) => ({
  label: option.label,
  points: option.pointsLabel,
  text: option.description,
}));

export const SCORE_BANDS = [
  {
    id: "good",
    min: 80,
    range: "80–100",
    status: "Godt dækket",
    risk: "Lav risiko",
    className: "bg-[#dce8dc] text-sage border-[#b6cfb6]",
    barClassName: "bg-sage",
    summary:
      "I ser forholdsvis godt dækket ud på tværs af de vigtigste områder, men bør stadig holde tempoet oppe på de resterende gaps.",
  },
  {
    id: "medium",
    min: 50,
    range: "50–79",
    status: "Delvist compliant",
    risk: "Moderat risiko",
    className: "bg-[#f4ead2] text-[#6b4e1d] border-[#dfc58e]",
    barClassName: "bg-[#c78c2d]",
    summary:
      "I har noget på plads, men der er tydelige svagheder som bør prioriteres, før presset fra kunder, drift eller regulering vokser.",
  },
  {
    id: "high",
    min: 0,
    range: "0–49",
    status: "Kritisk gap",
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

type GapItem = {
  id: ScanQuestionId;
  category: string;
  question: string;
  answer: ScanAnswerValue;
  answerLabel: string;
  pointsLost: number;
  recommendation: string;
};

function getBand(percentage: number) {
  return SCORE_BANDS.find((band) => percentage >= band.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
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

function getProfileInsights(profile: ScanProfile) {
  const insights = [];

  if (profile.industry === "energy" || profile.industry === "transport") {
    insights.push(
      "I brancher som energi og transport bliver governance, leverandørstyring og beredskab ofte hurtigt centrale temaer.",
    );
  }

  if (profile.industry === "health" || profile.industry === "finance") {
    insights.push(
      "I sundhed og finans er dokumentation, hændelseshåndtering og adgangskontrol typisk ekstra følsomme områder.",
    );
  }

  if (profile.industry === "saas") {
    insights.push(
      "I SaaS og IT vil adgangsstyring, logging og håndtering af leverandør- og driftsafhængigheder ofte vægte tungt i praksis.",
    );
  }

  if (profile.companySize === "250-500") {
    insights.push(
      "I den større del af segmentet forventes der ofte mere formaliseret styring, tydeligt ejerskab og bedre leverandøroverblik.",
    );
  }

  if (profile.companySize === "50-99") {
    insights.push(
      "I den mindre del af segmentet handler det ofte om at få de vigtigste kontroller på plads hurtigt, uden at bygge et for tungt setup.",
    );
  }

  if (profile.role === "cfo" || profile.role === "management") {
    insights.push(
      "For ledelse og økonomi er scoren især nyttig som et beslutningsgrundlag for prioritering, ansvar og budget.",
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

export function calculateScanResult(answers: ScanAnswers, profile?: ScanProfile) {
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
      answerLabel: getAnswerLabel(answer),
      weightedScore,
      weightedMax,
      pointsLost,
    };
  });

  const totalPoints = details.reduce((sum, item) => sum + item.weightedScore, 0);
  const maxPoints = details.reduce((sum, item) => sum + item.weightedMax, 0);
  const percentage = Math.round((totalPoints / maxPoints) * 100);
  const band = getBand(percentage);
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

  const nextSteps = Array.from(new Set(gaps.map((gap) => gap.recommendation))).slice(0, 3);

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
    profileInsights,
    profileSummary,
  };
}
