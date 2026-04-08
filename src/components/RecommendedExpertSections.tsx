"use client";

import { useState } from "react";

import PercentageRing from "@/components/PercentageRing";
import TrackedWebsiteLink from "@/components/TrackedWebsiteLink";
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
      additionalSpecialists: specialists.slice(3),
    };
  });
}

function splitIntoColumns<T>(items: T[], columnCount: number) {
  if (items.length === 0) {
    return [];
  }

  const columns = Array.from({ length: columnCount }, () => [] as T[]);
  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });
  return columns.filter((column) => column.length > 0);
}

type AdditionalSpecialistsPanelProps = {
  areaKey: string;
  columns: Array<
    Array<{
      vendor: ScanResult["vendorFits"][number]["vendor"];
    }>
  >;
};

function AdditionalSpecialistsPanel({
  areaKey,
  columns,
}: AdditionalSpecialistsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const flatItems = columns.flat();
  const collapsedItems = flatItems.slice(0, 4);
  const visibleColumns = isExpanded ? columns : [collapsedItems];

  return (
    <div className="border border-line bg-paper p-4">
      <p className="text-sm font-semibold text-ink">
        Flere specialister i samme kategori
      </p>
      {visibleColumns.length > 0 ? (
        <>
          <div
            id={`${areaKey}-specialists-panel`}
            className={`mt-3 gap-x-4 gap-y-1 text-soft ${
              isExpanded
                ? "grid text-[0.38rem] leading-[0.62rem] md:grid-cols-5"
                : "grid text-[0.38rem] leading-[0.62rem]"
            }`}
          >
            {visibleColumns.map((column, columnIndex) => (
              <ul
                key={`${areaKey}-column-${columnIndex}`}
                className="space-y-1 text-left"
              >
                {column.map((item) => (
                  <li key={`${areaKey}-${item.vendor.name}`}>
                    <TrackedWebsiteLink
                      href={item.vendor.website}
                      vendorName={item.vendor.name}
                      source="recommended_experts_more"
                      areaKey={areaKey}
                      className="underline decoration-[#1b4f45]/20 underline-offset-2 transition hover:text-[#0d4b43]"
                    >
                      {item.vendor.name}
                    </TrackedWebsiteLink>
                  </li>
                ))}
              </ul>
            ))}
          </div>
          {columns.some((column) => column.length > 4) ? (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => setIsExpanded((current) => !current)}
                className="inline-flex h-6 w-8 items-center justify-center text-[#1b4f45] transition hover:text-[#0d4b43]"
                aria-expanded={isExpanded}
                aria-controls={`${areaKey}-specialists-panel`}
              >
                <svg
                  width="20"
                  height="12"
                  viewBox="0 0 20 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M1 1L10 10L19 1"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-[0.7rem] leading-5 text-soft">
          Der er ikke flere profiler i denne kategori endnu.
        </p>
      )}
    </div>
  );
}

type RecommendedExpertSectionsProps = {
  result: ScanResult;
};

type MatchScoreDisplayProps = {
  score: number;
};

function MatchScoreDisplay({ score }: MatchScoreDisplayProps) {
  const normalizedScore = Math.max(0, Math.min(100, score));

  return (
    <div className="w-full max-w-[10rem] border border-[#2a5851] bg-[#fffdfa] px-4 py-3 text-center">
      <div className="text-[0.62rem] font-medium uppercase tracking-[0.34em] text-[#174f46]">
        MATCH SCORE
      </div>
      <div className="mt-1 text-[2.25rem] font-semibold leading-none tracking-[-0.06em] text-[#0f4b42]">
        {normalizedScore}
      </div>
    </div>
  );
}

function SimpleSpecialistCard({
  areaKey,
  item,
}: {
  areaKey: string;
  item: ScanResult["vendorFits"][number];
}) {
  return (
    <article className="grid gap-4 border border-[#d6dfda] bg-[#fcf9f3] px-6 py-5 md:grid-cols-[minmax(0,1fr)_16rem] md:items-center">
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-4">
          <TrackedWebsiteLink
            href={item.vendor.website}
            vendorName={item.vendor.name}
            source="recommended_experts_card_name"
            areaKey={areaKey}
            className="min-w-0 text-[1.02rem] font-semibold leading-tight tracking-[-0.03em] text-ink transition hover:text-[#0d4b43] md:text-[1.06rem]"
          >
            {item.vendor.name}
          </TrackedWebsiteLink>
          <span className="shrink-0 bg-[#73acd6] px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.16em] !text-white">
            Anbefalet
          </span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[16rem] flex-col items-stretch gap-3 md:mx-0 md:ml-auto">
        <div className="ml-auto w-full max-w-[15.5rem]">
          <MatchScoreDisplay score={item.fitScore} />
        </div>
        <TrackedWebsiteLink
          href={item.vendor.website}
          vendorName={item.vendor.name}
          source="recommended_experts_card"
          areaKey={areaKey}
          className="ml-auto inline-flex w-full max-w-[15.5rem] justify-center bg-sage px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
        >
          Website
        </TrackedWebsiteLink>
      </div>
    </article>
  );
}

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
              className="border border-line bg-white p-5 shadow-[var(--shadow)] md:p-6"
            >
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_11rem] md:items-start">
                <div className="min-w-0">
                  <h2 className="text-[2rem] font-semibold tracking-[-0.03em] text-ink md:text-[2.2rem]">
                    {area.label}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-soft md:text-base">
                    <span className="font-semibold text-ink">Observation:</span>{" "}
                    {area.description}
                  </p>
                </div>

                <div className="mx-auto flex w-full max-w-[11rem] flex-col items-center md:mx-0 md:ml-auto">
                  <p className="mb-1 text-center text-[0.72rem] font-medium uppercase tracking-[0.28em] text-[#4d86ba]">
                    COMPLIANCE SCORE
                  </p>
                  <PercentageRing
                    percentage={area.percentage}
                    label="COMPLIANCE SCORE"
                    size={96}
                    strokeWidth={12}
                    valueScale={0.52}
                  />
                </div>
              </div>

              <div className="mt-1 space-y-2">
                {primarySpecialist ? (
                  <SimpleSpecialistCard
                    areaKey={area.key}
                    item={primarySpecialist}
                  />
                ) : null}

                {secondarySpecialists.map((item) => (
                  <SimpleSpecialistCard
                    key={`${area.key}-${item.vendor.name}`}
                    areaKey={area.key}
                    item={item}
                  />
                ))}

                <AdditionalSpecialistsPanel
                  areaKey={area.key}
                  columns={additionalColumns}
                />
              </div>
            </section>
          );
        },
      )}

      <div className="px-1 text-xs leading-6 text-[#6a7b76]">
        Match score er et samlet estimat af hvor godt specialistens primære
        profil, dækkede NIS2-områder, branchematch og øvrige
        kompetencesignal passer til virksomhedens aktuelle behov i den
        indledende screening. Scoren er vejledende og bør bruges som et
        prioriteringssignal, ikke som en endelig faglig vurdering.
      </div>
    </div>
  );
}
