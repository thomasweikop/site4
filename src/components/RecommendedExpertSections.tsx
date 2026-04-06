"use client";

import Link from "next/link";
import PercentageRing from "@/components/PercentageRing";
import { buildSessionSpecialistsPath } from "@/lib/reportLinks";
import { getMatrixKeysForAnalysisArea } from "@/lib/analysisAreaMatrix";
import type { ScanResult } from "@/lib/nis2Scan";

export function getAreaSpecialists(result: ScanResult) {
  const usedCompanyNames = new Set<string>();

  return result.topAnalysisAreas.map((area) => {
    const matrixKeys = getMatrixKeysForAnalysisArea(area.key);
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
  sessionId: string;
};

export default function RecommendedExpertSections({
  result,
  sessionId,
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
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#4c655d]">
                {area.complianceLabel}
              </p>
            </div>
            <PercentageRing
              percentage={area.percentage}
              label={area.label}
              size={126}
              strokeWidth={12}
              valueScale={0.28}
              captionLines={["COMPLIANCE", "SCORE"]}
            />
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

                    <div className="mt-6">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#5d6e68]">
                        Match score
                      </p>
                      <p className="mt-2 text-4xl font-semibold leading-none tracking-[-0.04em] text-ink md:text-[3rem]">
                        {item.fitScore}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-ink">Specialer</p>
                    <ul className="mt-2 space-y-1 text-sm leading-6 text-soft">
                      {item.vendor.specialtyHighlights.map((line) => (
                        <li
                          key={`${item.vendor.name}-${line}`}
                          className="grid grid-cols-[auto_1fr] items-start gap-x-2"
                        >
                          <span aria-hidden="true">•</span>
                          <span>{line}</span>
                        </li>
                      ))}
                      {specialties.length > 0 ? (
                        <li
                          key={`${item.vendor.name}-match`}
                          className="grid grid-cols-[auto_1fr] items-start gap-x-2"
                        >
                          <span aria-hidden="true">•</span>
                          <span>
                            Match i denne analyse: {specialties.join(", ")}
                          </span>
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
                        Modtag materiale om {area.label}
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <Link
              href={{
                pathname: buildSessionSpecialistsPath(sessionId),
                query: { area: area.key },
              }}
              className="inline-flex border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
            >
              Se flere
            </Link>
          </div>
        </section>
      ))}

      <div className="px-1 text-xs leading-6 text-[#6a7b76]">
        Match score er et samlet estimat af hvor godt specialistens primære
        profil, dækkede NIS2-områder, market fit, branchematch og øvrige
        kompetencesignal passer til virksomhedens aktuelle behov i den
        indledende screening. Scoren er vejledende og bør bruges som et
        prioriteringssignal, ikke som en endelig faglig vurdering.
      </div>
    </div>
  );
}
