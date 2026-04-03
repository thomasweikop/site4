"use client";

import Link from "next/link";
import {
  getExpandedGuidanceBullets,
  getGuidanceAreaByKey,
} from "@/lib/nis2AreaGuidance";
import type { StoredReportSession } from "@/lib/nis2Session";
import { useStoredReportSession } from "@/lib/useStoredReportSession";
import { buildRecommendedExpertsPath } from "@/lib/reportLinks";

type AreaDetailExperienceProps = {
  sessionId: string;
  areaKey: string;
  initialSession?: StoredReportSession | null;
};

export default function AreaDetailExperience({
  sessionId,
  areaKey,
  initialSession = null,
}: AreaDetailExperienceProps) {
  const { clientReady, session, result } = useStoredReportSession(
    sessionId,
    initialSession,
  );
  const areaDefinition = getGuidanceAreaByKey(areaKey);

  if (!clientReady) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-sm text-soft">Indlæser område...</p>
      </div>
    );
  }

  if (!areaDefinition || !session || !result) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Området kunne ikke indlæses
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">
          Der mangler data for dette område
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-soft">
          Gå tilbage til analysen og vælg området igen.
        </p>
        <div className="mt-6">
          <Link
            href={`/result/${sessionId}`}
            className="inline-flex bg-sage px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
          >
            Tilbage til resultatet
          </Link>
        </div>
      </div>
    );
  }

  const areaResult =
    result.analysisAreas.find((area) => area.key === areaKey) ?? null;
  const bullets = getExpandedGuidanceBullets(areaDefinition);

  return (
    <div className="space-y-6">
      <section className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Område
        </p>
        <h1 className="mt-4 max-w-5xl text-balance font-display text-4xl leading-none text-ink md:text-[3.2rem]">
          {areaDefinition.label}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-soft md:text-base">
          {areaDefinition.intro}
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-soft md:text-base">
          {areaResult?.description ?? areaDefinition.levels.medium.description}
        </p>

        {areaResult ? (
          <div className="mt-6 inline-flex border border-line bg-paper px-4 py-2 text-sm text-ink">
            {areaResult.complianceLabel} · {areaResult.percentage}%
          </div>
        ) : null}
      </section>

      <section className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
        <p className="text-sm font-semibold text-ink">
          Typiske mangler og udfordringer
        </p>
        <ul className="mt-6 grid gap-3 text-sm leading-7 text-soft md:text-base">
          {bullets.map((bullet) => (
            <li key={bullet}>• {bullet}</li>
          ))}
        </ul>
      </section>

      <section className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
        <p className="text-sm leading-7 text-soft md:text-base">
          Vi anbefaler at få kvalificeret rådgivning, før virksomheden beslutter
          scope, ansvar og rækkefølge for dette område. ComplyCheck kan hjælpe
          med anbefalinger fra specialistdatabasen, men påtager sig ikke ansvar
          for de konkrete valg, leverancer eller resultater hos de rådgivere der
          vælges.
        </p>

        <div className="mt-8">
          <Link
            href={`${buildRecommendedExpertsPath(sessionId)}#${areaKey}`}
            className="inline-flex bg-sage px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
          >
            Se specialister
          </Link>
        </div>
      </section>
    </div>
  );
}
