"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  MATRIX_COLUMNS,
  VENDOR_TYPE_META,
  type VendorDirectoryEntry,
  type VendorSizeFit,
  type VendorType,
} from "@/lib/nis2BuildPack";
import type { StoredReportSession } from "@/lib/nis2Session";
import { INDUSTRY_OPTIONS, type IndustryValue } from "@/lib/nis2Scan";
import {
  buildFollowupQuestionsPath,
} from "@/lib/reportLinks";
import { getMatrixKeysForAnalysisArea } from "@/lib/analysisAreaMatrix";
import { useStoredReportSession } from "@/lib/useStoredReportSession";

type SpecialistsMatrixExperienceProps = {
  sessionId: string;
  initialSession?: StoredReportSession | null;
  initialAreaKey?: string;
};

type TypeFilter = VendorType | "all";
type SizeFilter = VendorSizeFit | "all";
type SectorFilter = IndustryValue | "all";

const SIZE_FILTER_OPTIONS: Array<{ value: SizeFilter; label: string }> = [
  { value: "all", label: "Alle størrelser" },
  { value: "smb", label: "SMB" },
  { value: "mid-market", label: "Mid-market" },
  { value: "enterprise", label: "Enterprise" },
];

const TYPE_FILTER_OPTIONS: Array<{ value: TypeFilter; label: string }> = [
  { value: "all", label: "Alle typer" },
  { value: "legal", label: VENDOR_TYPE_META.legal.label },
  { value: "grc", label: VENDOR_TYPE_META.grc.label },
  { value: "technical", label: VENDOR_TYPE_META.technical.label },
  { value: "soc", label: VENDOR_TYPE_META.soc.label },
  { value: "audit", label: VENDOR_TYPE_META.audit.label },
];

const SECTOR_FILTER_OPTIONS: Array<{ value: SectorFilter; label: string }> = [
  { value: "all", label: "Alle brancher" },
  ...INDUSTRY_OPTIONS,
];

function getIndustryTokens(industry: IndustryValue) {
  switch (industry) {
    case "energy":
      return ["energy", "energi", "critical sectors"];
    case "transport":
      return ["transport", "critical sectors"];
    case "health":
      return ["health", "healthcare", "sundhed", "critical sectors"];
    case "finance":
      return ["finance", "financial", "finans", "fintech", "critical sectors"];
    case "saas":
      return ["saas", "software", "digital", "it"];
    default:
      return [];
  }
}

function vendorMatchesSector(
  vendor: VendorDirectoryEntry,
  sectorFilter: SectorFilter,
) {
  if (sectorFilter === "all") {
    return true;
  }

  const sectorFit = vendor.sectorFit.toLowerCase();

  if (sectorFit.includes("cross-sector")) {
    return true;
  }

  return getIndustryTokens(sectorFilter).some((token) =>
    sectorFit.includes(token),
  );
}

export default function SpecialistsMatrixExperience({
  sessionId,
  initialSession = null,
  initialAreaKey,
}: SpecialistsMatrixExperienceProps) {
  const { clientReady, session, result } = useStoredReportSession(
    sessionId,
    initialSession,
  );
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("all");
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>("all");
  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const [areaFilterKey, setAreaFilterKey] = useState<string | undefined>(
    initialAreaKey,
  );

  const hasManualSearchFilters =
    typeFilter !== "all" || sizeFilter !== "all" || sectorFilter !== "all";
  const effectiveAreaFilterKey = hasManualSearchFilters
    ? undefined
    : areaFilterKey;

  const vendors = useMemo(() => {
    if (!result) {
      return [];
    }

    return result.vendorFits.filter((item) => {
      const vendor = item.vendor;

      if (typeFilter !== "all" && vendor.type !== typeFilter) {
        return false;
      }

      if (sizeFilter !== "all" && !vendor.sizeFit.includes(sizeFilter)) {
        return false;
      }

      if (!vendorMatchesSector(vendor, sectorFilter)) {
        return false;
      }

      if (recommendedOnly && item.matchedAreas.length === 0) {
        return false;
      }

      if (effectiveAreaFilterKey) {
        const matchingMatrixKeys = getMatrixKeysForAnalysisArea(
          effectiveAreaFilterKey,
        );

        if (
          matchingMatrixKeys.length > 0 &&
          !matchingMatrixKeys.some((matrixKey) => vendor.matrixAreas[matrixKey])
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    effectiveAreaFilterKey,
    recommendedOnly,
    result,
    sectorFilter,
    sizeFilter,
    typeFilter,
  ]);

  if (!clientReady) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-sm text-soft">Indlæser specialistmatrix...</p>
      </div>
    );
  }

  if (!session || !result) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Specialistmatrixen kunne ikke indlæses
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">
          Sessionen findes ikke på denne enhed
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-soft">
          Start testen igen på denne enhed for at genskabe sessionen og det
          tilhørende specialistoverblik.
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

  const selectedArea =
    result.topAnalysisAreas.find((area) => area.key === effectiveAreaFilterKey) ??
    null;

  return (
    <div className="space-y-6">
      <section className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-4xl">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Specialistoverblik
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.25rem]">
              Søgning på relevante rådgivere
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-soft md:text-base">
              Tabellen viser alle {result.vendorDirectoryCount} profiler i
              kataloget. Brug filtrene til at indsnævre overblikket og gå
              derefter videre til de anbefalede eksperter.
            </p>
            {selectedArea ? (
              <p className="mt-4 text-sm leading-7 text-soft md:text-base">
                Listen er filtreret til området{" "}
                <span className="font-semibold text-ink">
                  {selectedArea.label}
                </span>
                .
              </p>
            ) : null}
            {initialAreaKey && hasManualSearchFilters ? (
              <p className="mt-4 text-sm leading-7 text-soft md:text-base">
                Egne søgefiltre er aktive, så områdefilteret fra den forrige
                side er sat på pause.
              </p>
            ) : null}
          </div>

          <div className="grid min-w-[220px] gap-3">
            <div className="border border-line bg-paper px-4 py-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                Session
              </p>
              <p className="mt-2 text-sm font-semibold text-ink">
                {session.id.slice(0, 8)}
              </p>
            </div>
            <div className="border border-line bg-paper px-4 py-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                Topområder
              </p>
              <p className="mt-2 text-sm text-soft">
                {result.priorityAreas.map((area) => area.label).join(", ")}
              </p>
            </div>
            {initialAreaKey ? (
              <button
                type="button"
                onClick={() => setAreaFilterKey(undefined)}
                className="inline-flex justify-center border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
              >
                Nulstil områdefilter
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-3 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
          <label className="grid gap-2 text-sm text-soft">
            Primær type
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
              className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
            >
              {TYPE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-soft">
            Størrelse
            <select
              value={sizeFilter}
              onChange={(event) => setSizeFilter(event.target.value as SizeFilter)}
              className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
            >
              {SIZE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-soft">
            Branche
            <select
              value={sectorFilter}
              onChange={(event) =>
                setSectorFilter(event.target.value as SectorFilter)
              }
              className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
            >
              {SECTOR_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 border border-line bg-paper px-4 py-3 text-sm text-soft">
            <input
              type="checkbox"
              checked={recommendedOnly}
              onChange={(event) => setRecommendedOnly(event.target.checked)}
              className="h-4 w-4 accent-[#2a5a4f]"
            />
            Kun anbefalede til mine topområder
          </label>

          <div className="border border-line bg-white px-4 py-3 text-sm text-soft">
            Viser {vendors.length} af {result.vendorFits.length} leverandører
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#search-results"
            className="inline-flex bg-sage px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
          >
            Søg
          </a>
          <Link
            href={buildFollowupQuestionsPath(sessionId)}
            className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Spørgsmål til de ansvarlige
          </Link>
          <Link
            href={`/result/${sessionId}`}
            className="inline-flex border border-line bg-white px-6 py-3 text-sm font-semibold text-soft transition hover:bg-paper"
          >
            Tilbage til resultatet
          </Link>
        </div>
      </section>

      <section
        id="search-results"
        className="scroll-mt-28 border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8"
      >
        <div className="overflow-x-auto">
          <table className="min-w-[1420px] border-collapse text-sm">
            <thead className="bg-paper">
              <tr>
                <th className="border-b border-line px-4 py-3 text-left font-semibold text-ink">
                  Company
                </th>
                {MATRIX_COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    className="h-[170px] w-[58px] border-b border-line px-2 py-3 align-bottom text-center font-semibold text-ink"
                  >
                    <span className="inline-block whitespace-nowrap [writing-mode:vertical-rl] rotate-180">
                      {column.label}
                    </span>
                  </th>
                ))}
                <th className="border-b border-line px-4 py-3 text-left font-semibold text-ink">
                  Website
                </th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((item) => (
                <tr
                  key={`${item.vendor.type}-${item.vendor.rankInType}-${item.vendor.name}`}
                  className="border-b border-line align-top last:border-b-0"
                >
                  <td className="px-4 py-4">
                    <p className="font-semibold text-ink">{item.vendor.name}</p>
                    <p className="mt-2 text-xs leading-5 text-soft">
                      {VENDOR_TYPE_META[item.vendor.type].label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-soft">
                      Fit score {item.fitScore}
                    </p>
                  </td>
                  {MATRIX_COLUMNS.map((column) => (
                    <td
                      key={`${item.vendor.name}-${column.key}`}
                      className="px-4 py-4 text-center text-lg leading-none text-[#2a5a4f]"
                    >
                      {item.vendor.matrixAreas[column.key] ? "●" : ""}
                    </td>
                  ))}
                  <td className="px-4 py-4">
                    <a
                      href={item.vendor.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex border border-line bg-paper px-3 py-2 font-semibold text-ink transition hover:bg-white"
                    >
                      Åbn website
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
