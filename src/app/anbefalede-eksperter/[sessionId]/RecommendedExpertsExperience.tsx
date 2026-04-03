"use client";

import Link from "next/link";
import RecommendedExpertSections from "@/components/RecommendedExpertSections";
import type { StoredReportSession } from "@/lib/nis2Session";
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
          Hvert område nedenfor viser tre relevante specialister. Den bedst
          matchende profil er markeret som anbefalet.
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

      </section>
      <RecommendedExpertSections result={result} sessionId={sessionId} />
    </div>
  );
}
