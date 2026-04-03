"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReportSnapshot } from "@/lib/reportLinks";
import type { StoredReportSession } from "@/lib/nis2Session";
import { useStoredReportSession } from "@/lib/useStoredReportSession";
import {
  buildRecommendedExpertsPath,
  buildSessionSpecialistsPath,
} from "@/lib/reportLinks";

type FullRecommendationExperienceProps = {
  sessionId: string;
  initialSession?: StoredReportSession | null;
  snapshot?: ReportSnapshot | null;
};

function formatList(values: string[]) {
  if (values.length === 0) {
    return "";
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} og ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")} og ${values[values.length - 1]}`;
}

export default function FullRecommendationExperience({
  sessionId,
  initialSession = null,
  snapshot = null,
}: FullRecommendationExperienceProps) {
  const { clientReady, session, result } = useStoredReportSession(
    sessionId,
    initialSession,
  );

  if (!clientReady) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-sm text-soft">Indlæser de detaljerede anbefalinger...</p>
      </div>
    );
  }

  const areas =
    result?.topAnalysisAreas ?? snapshot?.topAnalysisAreas ?? [];
  const company =
    session?.unlockLead?.company?.trim() || snapshot?.company || "Virksomheden";
  const specialistsHref = buildSessionSpecialistsPath(sessionId);
  const recommendedExpertsHref = buildRecommendedExpertsPath(sessionId);

  if (!result && !snapshot) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Detaljerede anbefalinger
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">
          Anbefalingen kunne ikke indlæses
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-soft">
          Start testen igen eller gå tilbage til resultatet for at åbne
          initiativerne på ny.
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

  return (
    <div className="space-y-6">
      <section className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Vigtigste initiativer
        </p>
        <h1 className="mt-4 max-w-5xl text-balance font-display text-4xl leading-none text-ink md:text-[3.2rem]">
          Vigtigste initiativer til at sikre en højere compliance
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-soft md:text-base">
          Fokuser først på de vigtigste tre områder i analysen af {company}, og
          brug derefter specialistlisten til at kvalificere hvilke dialoger der
          er mest relevante.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {areas.map((area) => (
            <article
              key={area.label}
              className="border border-line bg-paper p-5"
            >
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#4c655d]">
                Fokusområde
              </p>
              <h2 className="mt-3 text-xl font-semibold text-ink">
                {area.label}
              </h2>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#4c655d]">
                {area.complianceLabel} · {area.percentage}%
              </p>
              <p className="mt-4 text-sm leading-6 text-soft">
                {area.description}
              </p>
              <ul className="mt-4 grid gap-2 text-sm leading-6 text-soft">
                {area.actions.slice(0, 3).map((action) => (
                  <li key={action}>• {action}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
            Specialistoverblik
          </p>
          <p className="mt-5 text-sm leading-7 text-soft md:text-base">
            Der er en lang række specialister der står klar til at hjælpe. Vi har
            lavet en omfattende listning af de vigtigste i Danmark baseret på
            deres specialer og kompetencer.
          </p>
          <p className="mt-4 text-sm leading-7 text-soft md:text-base">
            Billedet viser et udsnit af specialistarket med leverandører,
            ekspertområder og routing på tværs af mange profiler, så virksomheden
            kan se bredden før der laves en egentlig anbefaling.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={recommendedExpertsHref}
              className="inline-flex bg-sage px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
            >
              Giv anbefaling
            </Link>
            <Link
              href={specialistsHref}
              className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
            >
              Specialist liste
            </Link>
          </div>
        </article>

        <article className="border border-line bg-white p-5 shadow-[var(--shadow)] md:p-6">
          <div className="overflow-hidden border border-line bg-paper">
            <Image
              src="/nis2-specialist-matrix-preview.jpg"
              alt="Preview af specialistarket med leverandører og NIS2-områder"
              width={1800}
              height={2200}
              className="h-auto w-full"
              priority
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-soft">
            Preview af specialistarket. Leverandørnavne og områder er vist i
            komprimeret form for at give et samlet overblik.
          </p>
        </article>
      </section>

      <section className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Hvad anbefalingen bygger på
        </p>
        <p className="mt-4 text-sm leading-7 text-soft md:text-base">
          Den efterfølgende anbefaling prioriterer specialister ud fra
          virksomhedens vigtigste fokusområder:{" "}
          <span className="font-semibold text-ink">
            {formatList(areas.map((area) => area.label))}
          </span>
          . Herefter vægtes specialistprofilerne efter type-fit, area-fit,
          størrelse, sektor og eventuelle blockers.
        </p>
      </section>
    </div>
  );
}
