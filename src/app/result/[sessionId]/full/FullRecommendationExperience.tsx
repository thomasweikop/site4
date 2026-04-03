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
        <h1 className="mt-4 max-w-5xl text-balance font-display text-4xl leading-none text-ink md:text-[3.2rem]">
          Find NIS2 specialist
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-soft md:text-base">
          Generer en liste med specialister baseret på de vigtigste områder i
          analysen af {company}.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="border border-line bg-paper p-6">
            <p className="text-sm font-semibold text-ink">
              Lav en liste med specialister indenfor:
            </p>
            <ul className="mt-5 grid gap-3 text-sm leading-7 text-soft md:text-base">
              {areas.map((area) => (
                <li key={area.label}>• {area.label}</li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={recommendedExpertsHref}
                className="inline-flex bg-sage px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
              >
                Generer liste
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
        </div>
      </section>
    </div>
  );
}
