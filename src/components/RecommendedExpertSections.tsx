"use client";

import PercentageRing from "@/components/PercentageRing";
import { getMatrixKeysForAnalysisArea } from "@/lib/analysisAreaMatrix";
import type { ScanResult } from "@/lib/nis2Scan";

export function getAreaSpecialists(result: ScanResult) {
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

      areaCompanyNames.add(normalizedCompanyName);
      specialists.push(item);
    }

    return {
      area,
      primarySpecialist: specialists[0] ?? null,
      secondarySpecialists: specialists.slice(1, 3),
      additionalSpecialists: specialists.slice(3).map((item) => item.vendor.name),
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
      {groupedSpecialists.map(
        ({
          area,
          primarySpecialist,
          secondarySpecialists,
          additionalSpecialists,
        }) => (
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
              valueScale={0.38}
              captionLines={["COMPLIANCE", "SCORE"]}
            />
          </div>

          <div className="mt-6 space-y-4">
            {primarySpecialist ? (
              <article className="grid gap-5 border border-line bg-paper p-5 md:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)]">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[1.9rem] font-semibold leading-none tracking-[-0.04em] text-ink">
                      {primarySpecialist.vendor.name}
                    </p>
                    <span className="bg-[#73acd6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] !text-white">
                      Anbefalet
                    </span>
                  </div>

                  <div className="flex max-w-[17rem] flex-col items-center justify-center border border-[#314f67] bg-[#314f67] px-5 py-4 text-center">
                    <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] !text-white/80">
                      Match score
                    </p>
                    <p className="mt-2 text-[3.8rem] font-semibold leading-none tracking-[-0.06em] !text-white">
                      {primarySpecialist.fitScore}%
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={primarySpecialist.vendor.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-[#1b4f45] underline decoration-[#1b4f45]/30 underline-offset-4 transition hover:text-[#0d4b43]"
                    >
                      Website
                    </a>
                    <a
                      href={primarySpecialist.vendor.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex bg-sage px-4 py-2 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
                    >
                      Modtag materiale
                    </a>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-ink">Specialer</p>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-soft">
                    {primarySpecialist.vendor.specialtyHighlights
                      .slice(0, 5)
                      .map((line) => (
                        <li
                          key={`${primarySpecialist.vendor.name}-${line}`}
                          className="grid grid-cols-[auto_1fr] items-start gap-x-2"
                        >
                          <span aria-hidden="true">•</span>
                          <span>{line}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </article>
            ) : null}

            {secondarySpecialists.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {secondarySpecialists.map((item) => (
                  <article
                    key={`${area.key}-${item.vendor.name}`}
                    className="grid gap-4 border border-line bg-paper p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold leading-tight text-ink">
                          {item.vendor.name}
                        </p>
                        <a
                          href={item.vendor.website}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-sm font-medium text-[#1b4f45] underline decoration-[#1b4f45]/30 underline-offset-4 transition hover:text-[#0d4b43]"
                        >
                          Website
                        </a>
                      </div>
                      <div className="flex min-w-[9rem] flex-col items-center justify-center border border-[#314f67] bg-[#314f67] px-4 py-3 text-center">
                        <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] !text-white/80">
                          Match score
                        </p>
                        <p className="mt-2 text-[2.55rem] font-semibold leading-none tracking-[-0.05em] !text-white">
                          {item.fitScore}%
                        </p>
                      </div>
                    </div>

                    <a
                      href={item.vendor.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-fit bg-sage px-4 py-2 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
                    >
                      Modtag materiale
                    </a>
                  </article>
                ))}
              </div>
            ) : null}

            <div className="border border-line bg-paper p-4">
              <p className="text-sm font-semibold text-ink">
                Flere specialister i samme kategori
              </p>
              <p className="mt-3 text-sm leading-6 text-soft">
                {additionalSpecialists.length > 0
                  ? additionalSpecialists.join(", ")
                  : "Der er ikke flere profiler i denne kategori endnu."}
              </p>
            </div>
          </div>
        </section>
      ),
      )}

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
