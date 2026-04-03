"use client";

import type { MatrixAreaKey } from "@/lib/nis2BuildPack";
import type { ScanResult } from "@/lib/nis2Scan";

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

export function getAreaSpecialists(result: ScanResult) {
  const usedCompanyNames = new Set<string>();

  return result.topAnalysisAreas.map((area) => {
    const matrixKeys = ANALYSIS_AREA_TO_MATRIX_KEYS[area.key] ?? [];
    const specialists: typeof result.vendorFits = [];
    const areaCompanyNames = new Set<string>();

    const rankedCandidates = result.vendorFits
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
      });

    for (const item of rankedCandidates) {
      const normalizedCompanyName = item.vendor.name.trim().toLowerCase();

      if (areaCompanyNames.has(normalizedCompanyName)) {
        continue;
      }

      if (usedCompanyNames.has(normalizedCompanyName)) {
        continue;
      }

      areaCompanyNames.add(normalizedCompanyName);
      usedCompanyNames.add(normalizedCompanyName);
      specialists.push(item);

      if (specialists.length === 3) {
        break;
      }
    }

    return {
      area,
      specialists,
    };
  });
}

type RecommendedExpertSectionsProps = {
  result: ScanResult;
};

export default function RecommendedExpertSections({
  result,
}: RecommendedExpertSectionsProps) {
  const groupedSpecialists = getAreaSpecialists(result);

  return (
    <div className="space-y-6">
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
                  className="grid gap-4 border border-line bg-paper p-5 md:grid-cols-[1.05fr_1.65fr]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold text-ink">
                        {item.vendor.name}
                      </p>
                      {index === 0 ? (
                        <span className="bg-[#73acd6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] !text-white">
                          Anbefalet
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-ink">Specialer</p>
                    <ul className="mt-2 grid gap-2 text-sm leading-6 text-soft">
                      {item.vendor.specialtyHighlights.map((line) => (
                        <li key={`${item.vendor.name}-${line}`}>• {line}</li>
                      ))}
                      {specialties.length > 0 ? (
                        <li key={`${item.vendor.name}-match`}>
                          • Match i denne analyse: {specialties.join(", ")}
                        </li>
                      ) : null}
                    </ul>
                  </div>

                  <div className="flex items-start md:col-span-2 md:justify-end">
                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <a
                        href={item.vendor.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-[#1b4f45] underline decoration-[#1b4f45]/30 underline-offset-4 transition hover:text-[#0d4b43]"
                      >
                        Website
                      </a>
                    <a
                      href={item.vendor.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex bg-sage px-4 py-2 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
                    >
                      Find rette kontaktperson
                    </a>
                    </div>
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
