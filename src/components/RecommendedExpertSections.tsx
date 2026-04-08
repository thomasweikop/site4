"use client";

import { useState } from "react";

import PercentageRing from "@/components/PercentageRing";
import TrackedWebsiteLink from "@/components/TrackedWebsiteLink";
import { getMatrixKeysForAnalysisArea } from "@/lib/analysisAreaMatrix";
import { MATRIX_COLUMNS } from "@/lib/nis2BuildPack";
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

type RecommendedExpertSectionsProps = {
  result: ScanResult;
};

function AreaSpecialistsTable({
  areaKey,
  areaLabel,
  areaPercentage,
  areaDescription,
  item,
  secondarySpecialists,
  additionalSpecialists,
}: {
  areaKey: string;
  areaLabel: string;
  areaPercentage: number;
  areaDescription: string;
  item: ScanResult["vendorFits"][number] | null;
  secondarySpecialists: ScanResult["vendorFits"];
  additionalSpecialists: ScanResult["vendorFits"];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const areaColumns = getMatrixKeysForAnalysisArea(areaKey)
    .map((key) => MATRIX_COLUMNS.find((column) => column.key === key))
    .filter((column) => column !== undefined);
  const rankedRows = [
    ...(item ? [item] : []),
    ...secondarySpecialists,
    ...additionalSpecialists,
  ];
  const visibleRows = isExpanded ? rankedRows : rankedRows.slice(0, 6);

  if (rankedRows.length === 0) {
    return (
      <div className="border border-line bg-paper px-5 py-4">
        <p className="text-sm leading-6 text-soft">
          Der er ikke fundet specialister i denne kategori endnu.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-line bg-paper">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-[#f3efe6] align-top text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#36574f]">
              <th className="w-14 px-4 py-4">#</th>
              <th className="min-w-[16rem] px-4 py-4">Specialist / rådgiver</th>
              {areaColumns.map((column) => (
                <th
                  key={`${areaKey}-${column.key}`}
                  className="min-w-[10rem] px-4 py-4"
                >
                  {column.label}
                </th>
              ))}
              <th className="min-w-[9rem] px-4 py-4 text-center">Match score</th>
              <th className="min-w-[9rem] px-4 py-4 text-center">Mere</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <tr
                key={`${areaKey}-${row.vendor.name}`}
                className="border-b border-line align-middle last:border-b-0"
              >
                <td className="px-4 py-4 text-lg font-medium text-ink">
                  {index + 1}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <TrackedWebsiteLink
                      href={row.vendor.website}
                      vendorName={row.vendor.name}
                      source="recommended_experts_card_name"
                      areaKey={areaKey}
                      className="text-base font-semibold leading-tight text-ink underline decoration-[#1b4f45]/20 underline-offset-4 transition hover:text-[#0d4b43]"
                    >
                      {row.vendor.name}
                    </TrackedWebsiteLink>
                    {index === 0 ? (
                      <span className="border border-[#b9cbc4] bg-white px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[#36574f]">
                        Anbefalet
                      </span>
                    ) : null}
                  </div>
                </td>
                {areaColumns.map((column) => (
                  <td
                    key={`${areaKey}-${row.vendor.name}-${column.key}`}
                    className="px-4 py-4 text-center"
                  >
                    {row.vendor.matrixAreas[column.key] ? (
                      <span
                        aria-label={`${row.vendor.name} dækker ${column.label}`}
                        className="inline-flex h-4 w-4 items-center justify-center border border-[#839990] bg-[#173f39] text-[0.55rem] text-white"
                      >
                        ■
                      </span>
                    ) : (
                      <span className="inline-flex h-4 w-4 border border-[#ccd7d2] bg-white" />
                    )}
                  </td>
                ))}
                <td className="px-4 py-4 text-center">
                  <div className="text-[2rem] font-semibold leading-none tracking-[-0.05em] text-ink">
                    {Math.max(0, Math.min(100, row.fitScore))}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <TrackedWebsiteLink
                    href={row.vendor.website}
                    vendorName={row.vendor.name}
                    source="recommended_experts_card"
                    areaKey={areaKey}
                    className="inline-flex items-center justify-center text-sm font-semibold text-ink underline decoration-[#1b4f45]/20 underline-offset-4 transition hover:text-[#0d4b43]"
                  >
                    Læs mere
                  </TrackedWebsiteLink>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-line bg-[#f8f4ec] align-top">
              <td className="px-4 py-4" />
              <th className="px-4 py-4 text-sm font-semibold text-ink">
                Compliance niveau for dette område
              </th>
              {areaColumns.map((column) => (
                <td
                  key={`${areaKey}-${column.key}-score`}
                  className="px-4 py-4 text-center text-base font-semibold text-ink"
                >
                  {areaPercentage} %
                </td>
              ))}
              <td className="px-4 py-4 text-center text-sm font-semibold text-ink">
                {areaPercentage} %
              </td>
              <td className="px-4 py-4" />
            </tr>
            <tr className="border-t border-line bg-white align-top">
              <td className="px-4 py-4" />
              <th className="px-4 py-4 text-sm font-semibold text-ink">
                Begrundelse for vurdering
              </th>
              <td
                colSpan={areaColumns.length + 2}
                className="max-w-4xl px-4 py-4 text-sm leading-7 text-soft"
              >
                <span className="font-semibold text-ink">{areaLabel}:</span>{" "}
                {areaDescription}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {rankedRows.length > 6 ? (
        <div className="border-t border-line bg-white px-5 py-3">
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="text-sm font-semibold text-ink underline decoration-[#1b4f45]/20 underline-offset-4 transition hover:text-[#0d4b43]"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Vis færre specialister" : "Vis flere specialister"}
          </button>
        </div>
      ) : null}
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

              <div className="mt-4">
                <AreaSpecialistsTable
                  areaKey={area.key}
                  areaLabel={area.label}
                  areaPercentage={area.percentage}
                  areaDescription={area.description}
                  item={primarySpecialist}
                  secondarySpecialists={secondarySpecialists}
                  additionalSpecialists={additionalSpecialists}
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
