"use client";

import { useState } from "react";

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
  const visibleColumns = isExpanded
    ? columns
    : columns.map((column) => column.slice(0, 4));

  return (
    <div className="border border-line bg-paper p-4">
      <p className="text-sm font-semibold text-ink">
        Flere specialister i samme kategori
      </p>
      {visibleColumns.length > 0 ? (
        <>
          <div
            id={`${areaKey}-specialists-panel`}
            className="mt-3 grid gap-x-6 gap-y-1 text-[0.48rem] leading-3 text-soft md:grid-cols-5"
          >
            {visibleColumns.map((column, columnIndex) => (
              <ul
                key={`${areaKey}-column-${columnIndex}`}
                className="space-y-1 text-left"
              >
                {column.map((item) => (
                  <li key={`${areaKey}-${item.vendor.name}`}>
                    <a
                      href={item.vendor.website}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-[#1b4f45]/20 underline-offset-2 transition hover:text-[#0d4b43]"
                    >
                      {item.vendor.name}
                    </a>
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
  compact?: boolean;
};

function MatchScoreDisplay({
  score,
  compact = false,
}: MatchScoreDisplayProps) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const wrapperClass = compact
    ? "flex w-full max-w-[8.5rem] flex-col items-center self-end"
    : "flex w-full max-w-[8.5rem] flex-col items-center self-end";
  const labelClass =
    "w-full pt-2 text-center text-[0.76rem] font-medium uppercase tracking-[0.32em] text-[#174f46]";
  const valueClass =
    "mt-3 text-[3.15rem] font-semibold leading-none tracking-[-0.06em] text-[#0f4b42]";
  const barWidthClass = compact ? "mt-3 h-[0.55rem] w-full" : "mt-3 h-[0.6rem] w-full";

  return (
    <div className={wrapperClass}>
      <div className="h-px w-full bg-[#174f46]" />
      <div className={labelClass}>MATCH SCORE</div>
      <div className={valueClass}>{normalizedScore}</div>
      <div className={`${barWidthClass} bg-[#d6d7d6]`}>
        <div
          className="h-full bg-[#0f4b42]"
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    </div>
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
          className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8"
        >
          <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_8.5rem]">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-ink">
                {area.label}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-soft md:text-base">
                {area.description}
              </p>
            </div>
            <div className="flex w-[8.5rem] flex-col items-center justify-self-center">
              <p className="mb-3 text-center text-[0.76rem] font-medium uppercase tracking-[0.28em] text-[#6fa3cf]">
                {area.complianceLabel}
              </p>
              <PercentageRing
                percentage={area.percentage}
                label={area.label}
                size={128}
                strokeWidth={12}
                valueScale={0.52}
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {primarySpecialist ? (
              <article className="grid items-start gap-6 border border-line bg-paper p-5 md:grid-cols-[minmax(0,1fr)_8.5rem]">
                <div className="flex min-h-[13.5rem] flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={primarySpecialist.vendor.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[1.55rem] font-semibold leading-tight tracking-[-0.04em] text-ink underline decoration-[#1b4f45]/20 underline-offset-4 transition hover:text-[#0d4b43]"
                    >
                      {primarySpecialist.vendor.name}
                    </a>
                    <span className="bg-[#73acd6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] !text-white">
                      Anbefalet
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-ink">Specialer</p>
                  <ul className="mt-2 space-y-1 text-[0.8rem] leading-6 text-soft">
                    {primarySpecialist.vendor.specialtyHighlights
                      .slice(0, 4)
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
                  <a
                    href={primarySpecialist.vendor.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto inline-flex self-center bg-sage px-4 py-2 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
                  >
                    Modtag materiale
                  </a>
                </div>

                <div className="flex w-[8.5rem] justify-center justify-self-center">
                  <MatchScoreDisplay score={primarySpecialist.fitScore} />
                </div>
              </article>
            ) : null}

            {secondarySpecialists.length > 0 ? (
              <div className="space-y-3">
                {secondarySpecialists.map((item) => (
                  <article
                    key={`${area.key}-${item.vendor.name}`}
                    className="grid items-start gap-6 border border-line bg-paper p-4 md:grid-cols-[minmax(0,1fr)_8rem]"
                  >
                    <div className="flex min-h-[8rem] flex-col gap-3">
                      <a
                        href={item.vendor.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[1.25rem] font-semibold leading-tight tracking-[-0.03em] text-ink underline decoration-[#1b4f45]/20 underline-offset-4 transition hover:text-[#0d4b43]"
                      >
                        {item.vendor.name}
                      </a>
                      <a
                        href={item.vendor.website}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-auto inline-flex self-center bg-sage px-4 py-2 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
                      >
                        Modtag materiale
                      </a>
                    </div>

                    <div className="flex w-full justify-center md:justify-center">
                      <MatchScoreDisplay score={item.fitScore} compact />
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

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
        profil, dækkede NIS2-områder, market fit, branchematch og øvrige
        kompetencesignal passer til virksomhedens aktuelle behov i den
        indledende screening. Scoren er vejledende og bør bruges som et
        prioriteringssignal, ikke som en endelig faglig vurdering.
      </div>
    </div>
  );
}
