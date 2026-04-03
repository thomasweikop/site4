"use client";

import Link from "next/link";
import type { MatrixAreaKey } from "@/lib/nis2BuildPack";
import type { StoredReportSession } from "@/lib/nis2Session";
import { buildFollowupQuestionsPath, buildSessionSpecialistsPath } from "@/lib/reportLinks";
import type { ScanResult } from "@/lib/nis2Scan";
import { useStoredReportSession } from "@/lib/useStoredReportSession";

type RecommendedExpertsExperienceProps = {
  sessionId: string;
  initialSession?: StoredReportSession | null;
};

const ANALYSIS_AREA_TO_MATRIX_KEYS = {
  "governance-risk-management": [
    "governance",
    "governance-responsibility",
    "policies-documentation",
    "risk-assessment",
  ],
  "incident-management": [
    "operational",
    "incident-response",
    "logging-monitoring",
  ],
  "business-continuity-disaster-recovery": [
    "operational",
    "backup-recovery-continuity",
  ],
  "supply-chain-security": ["compliance", "supplier-management"],
  "security-in-network-information-systems": [
    "technical",
    "asset-access-overview",
    "logging-monitoring",
  ],
  "access-control-identity-management": [
    "technical",
    "identity-mfa-pam",
    "asset-access-overview",
  ],
  "vulnerability-patch-management": [
    "technical",
    "asset-access-overview",
    "audit-assurance",
  ],
  "monitoring-detection-logging": [
    "technical",
    "operational",
    "logging-monitoring",
  ],
  "cryptography-data-protection": [
    "technical",
    "compliance",
    "identity-mfa-pam",
  ],
  "awareness-training": ["operational", "training-awareness"],
} satisfies Record<string, MatrixAreaKey[]>;

function getAreaSpecialists(result: ScanResult) {
  return result.topAnalysisAreas.map((area) => {
    const matrixKeys = ANALYSIS_AREA_TO_MATRIX_KEYS[area.key] ?? [];
    const specialists = result.vendorFits
      .filter((item) =>
        matrixKeys.some((matrixKey) => item.vendor.matrixAreas[matrixKey]),
      )
      .sort((left, right) => {
        const rightMatches = matrixKeys.filter(
          (matrixKey) => right.vendor.matrixAreas[matrixKey],
        ).length;
        const leftMatches = matrixKeys.filter(
          (matrixKey) => left.vendor.matrixAreas[matrixKey],
        ).length;

        if (rightMatches !== leftMatches) {
          return rightMatches - leftMatches;
        }

        return right.fitScore - left.fitScore;
      })
      .slice(0, 3);

    return {
      area,
      specialists,
    };
  });
}

export default function RecommendedExpertsExperience({
  sessionId,
  initialSession = null,
}: RecommendedExpertsExperienceProps) {
  const { clientReady, session, result } = useStoredReportSession(
    sessionId,
    initialSession,
  );

  if (!clientReady) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-sm text-soft">Indlæser anbefalede eksperter...</p>
      </div>
    );
  }

  if (!session || !result) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Ekspertlisten kunne ikke indlæses
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">
          Sessionen findes ikke på denne enhed
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-soft">
          Start testen igen på denne enhed for at genskabe sessionen og den
          tilhørende ranking.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/scan"
            className="inline-flex bg-sage px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
          >
            Start testen igen
          </Link>
          <Link
            href={`/result/${sessionId}`}
            className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Til resultatet
          </Link>
        </div>
      </div>
    );
  }

  const groupedSpecialists = getAreaSpecialists(result);

  return (
    <div className="space-y-6">
      <section className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Anbefaling på specialister
        </p>
        <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.15rem]">
          Specialister med relevant erfaring indenfor de vigtigste områder
        </h1>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-soft md:text-base">
          Hvert område nedenfor viser tre relevante specialister. Den bedst
          matchende profil er markeret som anbefalet.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {groupedSpecialists.map(({ area }) => (
            <span
              key={area.key}
              className="border border-line bg-paper px-4 py-2 text-sm text-ink"
            >
              {area.label}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={buildSessionSpecialistsPath(sessionId)}
            className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Specialist liste
          </Link>
          <Link
            href={buildFollowupQuestionsPath(sessionId)}
            className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Spørgsmål til de ansvarlige
          </Link>
        </div>
      </section>

      {groupedSpecialists.map(({ area, specialists }) => (
        <section
          key={area.key}
          id={area.key}
          className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-ink">
                {area.label}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-soft md:text-base">
                {area.description}
              </p>
            </div>
            <span className="border border-line bg-paper px-4 py-2 text-sm text-ink">
              {area.complianceLabel} · {area.percentage}%
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            {specialists.map((item, index) => {
              const specialties =
                item.matchedAreaLabels.length > 0
                  ? item.matchedAreaLabels
                  : item.vendor.capabilityAreaLabels.slice(0, 4);

              return (
                <article
                  key={`${area.key}-${item.vendor.name}`}
                  className="grid gap-4 border border-line bg-paper p-5 md:grid-cols-[1.2fr_1fr_1.25fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold text-ink">
                        {item.vendor.name}
                      </p>
                      {index === 0 ? (
                        <span className="bg-sage px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] !text-white">
                          Anbefalet
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-soft">
                      {item.vendor.bestFor}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-ink">Specialer</p>
                    <p className="mt-2 text-sm leading-6 text-soft">
                      {specialties.join(", ")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-ink">Begrundelse</p>
                    <p className="mt-2 text-sm leading-7 text-soft">
                      {item.vendor.recommendedWhen ||
                        `${item.vendor.name} matcher især ${area.label.toLowerCase()} og har samtidig synlige kompetencer indenfor ${specialties
                          .slice(0, 3)
                          .join(", ")
                          .toLowerCase()}.`}
                    </p>
                  </div>

                  <div className="flex items-start">
                    <a
                      href={item.vendor.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex bg-sage px-4 py-2 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
                    >
                      Website
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
