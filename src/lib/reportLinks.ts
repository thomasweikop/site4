import type { ScanResult } from "@/lib/nis2Scan";

export type ReportSnapshot = {
  sessionId: string;
  company: string;
  score: number;
  status: string;
  bandSummary: string;
  executiveSummary: string;
  urgencyStatement: string;
  profileSummary: string[];
  weakestDimensions: string[];
  blockers: string[];
  nextSteps: string[];
  topAnalysisAreas: Array<{
    label: string;
    percentage: number;
    complianceLabel: string;
    description: string;
    typicalGaps: string[];
    actions: string[];
  }>;
  priorityAreas: Array<{
    label: string;
    summary: string;
  }>;
  partnerRecommendations: Array<{
    label: string;
    vendor: string;
    rationale: string;
    website?: string;
  }>;
  roadmap: Array<{
    phase: string;
    title: string;
    items: string[];
  }>;
};

const DEFAULT_SITE_URL = "https://nis.weikop.me";

function toBase64Url(value: string) {
  if (typeof window === "undefined") {
    return Buffer.from(value, "utf8").toString("base64url");
  }

  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  if (typeof window === "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }

  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function buildReportSnapshot(input: {
  sessionId: string;
  company?: string;
  result: ScanResult;
}): ReportSnapshot {
  const { sessionId, result } = input;

  return {
    sessionId,
    company: input.company?.trim() || "Virksomheden",
    score: result.percentage,
    status: result.band.status,
    bandSummary: result.band.summary,
    executiveSummary: result.executiveSummary,
    urgencyStatement: result.urgencyStatement,
    profileSummary: result.profileSummary,
    weakestDimensions: result.weakestDimensions.map(
      (dimension) => `${dimension.label}: ${dimension.percentage}%`,
    ),
    blockers: result.blockers.map((blocker) => blocker.question),
    nextSteps: result.nextSteps,
    topAnalysisAreas: result.topAnalysisAreas.map((area) => ({
      label: area.label,
      percentage: area.percentage,
      complianceLabel: area.complianceLabel,
      description: area.description,
      typicalGaps: area.typicalGaps,
      actions: area.actions,
    })),
    priorityAreas: result.priorityAreas.map((area) => ({
      label: area.label,
      summary: area.summary,
    })),
    partnerRecommendations: result.partnerRecommendations.map((partner) => ({
      label: partner.label,
      vendor: partner.primaryVendor?.name ?? partner.summary,
      rationale: partner.rationale,
      website: partner.primaryVendor?.website || undefined,
    })),
    roadmap: result.roadmap.map((phase) => ({
      phase: phase.phase,
      title: phase.title,
      items: phase.items,
    })),
  };
}

export function encodeReportSnapshot(snapshot: ReportSnapshot) {
  return toBase64Url(JSON.stringify(snapshot));
}

export function decodeReportSnapshot(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(value)) as ReportSnapshot;
    if (!parsed || typeof parsed !== "object" || !parsed.sessionId) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(
    /\/$/,
    "",
  );
}

export function buildFullRecommendationPath(
  sessionId: string,
  encodedSnapshot?: string,
) {
  const search = encodedSnapshot
    ? `?report=${encodeURIComponent(encodedSnapshot)}`
    : "";
  return `/result/${sessionId}/full${search}`;
}

export function buildFullRecommendationUrl(
  sessionId: string,
  encodedSnapshot?: string,
) {
  return `${getSiteUrl()}${buildFullRecommendationPath(
    sessionId,
    encodedSnapshot,
  )}`;
}

export function buildSpecialistsPath() {
  return "/specialists";
}

export function buildSpecialistsUrl() {
  return `${getSiteUrl()}${buildSpecialistsPath()}`;
}

export function buildSessionSpecialistsPath(sessionId: string) {
  return `/specialister/${sessionId}`;
}

export function buildRecommendedExpertsPath(sessionId: string) {
  return `/anbefalede-eksperter/${sessionId}`;
}

export function buildFollowupQuestionsPath(sessionId: string) {
  return `/sporgsmal-til-ansvarlige/${sessionId}`;
}

export function buildActionRequestPath(sessionId: string) {
  return `/result/${sessionId}/kontakt`;
}

export function buildSessionSpecialistsUrl(sessionId: string) {
  return `${getSiteUrl()}${buildSessionSpecialistsPath(sessionId)}`;
}

export function buildRecommendedExpertsUrl(sessionId: string) {
  return `${getSiteUrl()}${buildRecommendedExpertsPath(sessionId)}`;
}

export function buildFollowupQuestionsUrl(sessionId: string) {
  return `${getSiteUrl()}${buildFollowupQuestionsPath(sessionId)}`;
}

export function buildActionRequestUrl(sessionId: string) {
  return `${getSiteUrl()}${buildActionRequestPath(sessionId)}`;
}
