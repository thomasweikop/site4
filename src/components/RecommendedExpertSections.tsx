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

function splitIntoColumns(items: string[], columnCount: number) {
  if (items.length === 0) {
    return [];
  }

  const columns = Array.from({ length: columnCount }, () => [] as string[]);
  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });
  return columns.filter((column) => column.length > 0);
}

const VENDOR_SIZE_LABELS = {
  smb: "SMB",
  "mid-market": "Mid-market",
  enterprise: "Enterprise",
} as const;

const SECTOR_LABELS: Record<string, string> = {
  energy: "Energi",
  transport: "Transport",
  health: "Sundhed",
  finance: "Finans",
  saas: "SaaS / IT",
  other: "Andre brancher",
  "cross-sector": "Tværgående",
};

function formatSizeFitLabels(sizeFit: Array<keyof typeof VENDOR_SIZE_LABELS>) {
  return sizeFit.map((size) => VENDOR_SIZE_LABELS[size]).join(", ");
}

function formatSectorFitLabel(rawValue: string) {
  return rawValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => SECTOR_LABELS[item] ?? item)
    .join(", ");
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
        }) => {
          const additionalColumns = splitIntoColumns(additionalSpecialists, 5);

          return (
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
              <article className="grid gap-5 border border-line bg-paper p-5 md:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)_minmax(12rem,13rem)]">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[1.9rem] font-semibold leading-none tracking-[-0.04em] text-ink">
                      {primarySpecialist.vendor.name}
                    </p>
                    <span className="bg-[#73acd6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] !text-white">
                      Anbefalet
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-ink">Specialer</p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-soft md:text-sm">
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

                <div className="flex flex-col items-start gap-3 md:items-end">
                  <div className="flex w-full max-w-[12.75rem] flex-col items-center justify-center border border-[#22384d] bg-[#22384d] px-4 py-4 text-center">
                    <p className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] !text-white/80">
                      Match score
                    </p>
                    <p className="mt-2 text-[3.5rem] font-semibold leading-none tracking-[-0.06em] !text-white">
                      {primarySpecialist.fitScore}%
                    </p>
                  </div>
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
              </article>
            ) : null}

            {secondarySpecialists.length > 0 ? (
              <div className="space-y-4">
                {secondarySpecialists.map((item) => (
                  <article
                    key={`${area.key}-${item.vendor.name}`}
                    className="grid gap-5 border border-line bg-paper p-4 md:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)_minmax(12rem,13rem)]"
                  >
                    <div className="space-y-3">
                      <p className="text-[1.45rem] font-semibold leading-tight tracking-[-0.03em] text-ink">
                        {item.vendor.name}
                      </p>
                    </div>

                    <div>
                      <div className="grid gap-x-5 gap-y-2 text-[0.82rem] leading-5 text-soft md:grid-cols-5">
                        <div>
                          <p className="font-semibold text-ink">Områder</p>
                          <p>
                            {(
                              item.matchedAreaLabels.length > 0
                                ? item.matchedAreaLabels
                                : item.vendor.capabilityAreaLabels.slice(0, 3)
                            ).join(", ")}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-ink">Markedsfit</p>
                          <p>{formatSizeFitLabels(item.vendor.sizeFit)}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-ink">Branche</p>
                          <p>{formatSectorFitLabel(item.vendor.sectorFit)}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-ink">Kompetencer</p>
                          <p>{item.vendor.capabilityAreaLabels.slice(0, 3).join(", ")}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-ink">Profil</p>
                          <p>{item.vendor.bestFor}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <div className="flex w-full max-w-[12.75rem] flex-col items-center justify-center border border-[#22384d] bg-[#22384d] px-4 py-4 text-center">
                        <p className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] !text-white/80">
                          Match score
                        </p>
                        <p className="mt-2 text-[3rem] font-semibold leading-none tracking-[-0.05em] !text-white">
                          {item.fitScore}%
                        </p>
                      </div>
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
                        Modtag materiale
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            <div className="border border-line bg-paper p-4">
              <p className="text-sm font-semibold text-ink">
                Flere specialister i samme kategori
              </p>
              {additionalColumns.length > 0 ? (
                <div className="mt-3 grid gap-x-5 gap-y-2 text-[0.76rem] leading-5 text-soft md:grid-cols-5">
                  {additionalColumns.map((column, columnIndex) => (
                    <ul key={`${area.key}-column-${columnIndex}`} className="space-y-1">
                      {column.map((vendorName) => (
                        <li key={`${area.key}-${vendorName}`}>{vendorName}</li>
                      ))}
                    </ul>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[0.76rem] leading-5 text-soft">
                  Der er ikke flere profiler i denne kategori endnu.
                </p>
              )}
            </div>
          </div>
        </section>
      );
        },
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
