"use client";

import Link from "next/link";
import type { StoredReportSession } from "@/lib/nis2Session";
import { buildFollowupQuestionsPath, buildSessionSpecialistsPath } from "@/lib/reportLinks";
import { useStoredReportSession } from "@/lib/useStoredReportSession";

type RecommendedExpertsExperienceProps = {
  sessionId: string;
  initialSession?: StoredReportSession | null;
};

export default function RecommendedExpertsExperience({
  sessionId,
  initialSession = null,
}: RecommendedExpertsExperienceProps) {
  const { clientReady, session, result } = useStoredReportSession(
    sessionId,
    initialSession,
  );

  if (!clientReady) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-sm text-soft">Indlæser anbefalede eksperter...</p>
      </div>
    );
  }

  if (!session || !result) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Ekspertlisten kunne ikke indlæses
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">
          Sessionen findes ikke på denne enhed
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-soft">
          Start testen igen på denne enhed for at genskabe sessionen og den
          tilhørende ranking.
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
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-4xl">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Anbefalede eksperter
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.25rem]">
              Prioriterede eksperter baseret på virksomhedens behov
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-soft md:text-base">
              Her vises de profiler som scorer højest på type fit, area fit,
              størrelse, sektor og blocker-match. Listen er en prioriteret
              startliste, ikke en endelig indkøbsbeslutning.
            </p>
          </div>

          <div className="grid min-w-[220px] gap-3">
            <div className="border border-line bg-paper px-4 py-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                Score
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">
                {result.percentage}%
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
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={buildSessionSpecialistsPath(sessionId)}
            className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Til specialistmatrixen
          </Link>
          <Link
            href={buildFollowupQuestionsPath(sessionId)}
            className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Spørgsmål til de ansvarlige
          </Link>
        </div>
      </section>

      <section className="grid gap-4">
        {result.recommendedExperts.map((expert) => (
          <article
            key={`${expert.vendor.type}-${expert.vendor.name}`}
            className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                  Prioritet {expert.rank}
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-ink">
                  {expert.vendor.name}
                </h2>
                <p className="mt-2 text-sm text-soft">{expert.label}</p>
              </div>

              <span className="border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink">
                Fit score {expert.fitScore}
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-soft md:text-base">
              {expert.rationale}
            </p>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="grid gap-3">
                <div className="border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft">
                  <span className="font-semibold text-ink">Bedst til:</span>{" "}
                  {expert.vendor.bestFor}
                </div>
                <div className="border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft">
                  <span className="font-semibold text-ink">Anbefalet rolle:</span>{" "}
                  {expert.vendor.recommendedRole}
                </div>
                <div className="border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft">
                  <span className="font-semibold text-ink">Matchede områder:</span>{" "}
                  {expert.matchedAreaLabels.join(", ") || "Ingen direkte areas match."}
                </div>
              </div>

              <div className="grid gap-3">
                <div className="border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft">
                  Qualification score: {expert.qualificationScoreInitial}
                </div>
                <div className="border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft">
                  Type fit: {expert.typeFit} / Area fit: {expert.areaFit}
                </div>
                <div className="border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft">
                  Size fit: {expert.sizeFit} / Sector fit: {expert.sectorFit} /
                  Blocker fit: {expert.blockerFit}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={expert.vendor.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Åbn website
              </a>
              <span className="inline-flex border border-line bg-white px-4 py-2 text-sm text-soft">
                {expert.vendor.priceBand}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
