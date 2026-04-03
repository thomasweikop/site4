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
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Anbefaling på specialister
        </p>
        <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.15rem]">
          Specialister med relevant erfaring indenfor de vigtigste områder
        </h1>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-soft md:text-base">
          Listen er prioriteret efter hvor godt profilerne matcher virksomhedens
          vigtigste fokusområder, størrelse, sektor og eventuelle blockers.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {result.topAnalysisAreas.map((area) => (
            <span
              key={area.key}
              className="border border-line bg-paper px-4 py-2 text-sm text-ink"
            >
              {area.label}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={buildSessionSpecialistsPath(sessionId)}
            className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Specialist liste
          </Link>
          <Link
            href={buildFollowupQuestionsPath(sessionId)}
            className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Spørgsmål til de ansvarlige
          </Link>
        </div>
      </section>

      <section className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-line bg-paper text-left">
                <th className="px-4 py-4 text-sm font-semibold text-ink">
                  Firmanavn
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-ink">
                  Specialer
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-ink">
                  Begrundelse
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-ink">
                  Website
                </th>
              </tr>
            </thead>
            <tbody>
              {result.recommendedExperts.map((expert) => {
                const specialties =
                  expert.matchedAreaLabels.length > 0
                    ? expert.matchedAreaLabels
                    : expert.vendor.capabilityAreaLabels.slice(0, 4);

                return (
                  <tr
                    key={`${expert.vendor.type}-${expert.vendor.name}`}
                    className="border-b border-line align-top last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-ink">{expert.vendor.name}</p>
                      <p className="mt-1 text-xs text-soft">{expert.label}</p>
                    </td>
                    <td className="px-4 py-4 text-sm leading-6 text-soft">
                      {specialties.join(", ")}
                    </td>
                    <td className="px-4 py-4 text-sm leading-7 text-soft">
                      {expert.rationale}
                    </td>
                    <td className="px-4 py-4">
                      <a
                        href={expert.vendor.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex bg-sage px-4 py-2 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
                      >
                        Website
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
