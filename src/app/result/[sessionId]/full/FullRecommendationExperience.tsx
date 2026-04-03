"use client";

import Link from "next/link";
import type { ReportSnapshot } from "@/lib/reportLinks";
import type { StoredReportSession } from "@/lib/nis2Session";
import { useStoredReportSession } from "@/lib/useStoredReportSession";
import {
  buildActionRequestPath,
  buildRecommendedExpertsPath,
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
  const recommendedExpertsHref = buildRecommendedExpertsPath(sessionId);
  const actionRequestHref = buildActionRequestPath(sessionId);

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
          Vælg næste skridt baseret på de vigtigste områder i analysen af{" "}
          {company}.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="border border-line bg-paper p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4c655d]">
              1 Find de rette rådgivere
            </p>
            <p className="mt-4 text-sm leading-7 text-soft md:text-base">
              Vi har screenet det danske marked for rådgivere og specialister med
              fokus på NIS2-relaterede kompetencer. Ud fra virksomhedens
              vigtigste fokusområder kan listen bruges som en hurtig shortlist,
              før virksomheden vælger hvem der skal kontaktes først. Det giver et
              mere fokuseret udgangspunkt for næste dialog.
            </p>

            <div className="mt-6">
              <p className="text-sm font-semibold text-ink">
                Vis en liste med specialister indenfor:
              </p>
              <ul className="mt-4 grid gap-2 text-sm leading-7 text-soft md:text-base">
                {areas.map((area) => (
                  <li key={area.label}>• {area.label}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <Link
                href={recommendedExpertsHref}
                className="inline-flex bg-sage px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
              >
                Vis rådgivere
              </Link>
            </div>
          </article>

          <article className="border border-line bg-paper p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4c655d]">
              2 Målrettede initiativer
            </p>
            <p className="mt-4 text-sm leading-7 text-soft md:text-base">
              Målrettede initiativer kræver mere information om virksomheden end
              den indledende screening kan give alene. ComplyCheck kan hjælpe med
              at skabe et bedre overblik over gaps, den konkrete prioritering og
              hvilke rådgivere der er bedst egnet til at løfte næste skridt.
              Det gør det lettere at omsætte analysen til en realistisk
              actionliste og et mere konkret beslutningsgrundlag for
              virksomheden.
            </p>

            <div className="mt-8">
              <Link
                href={actionRequestHref}
                className="inline-flex bg-sage px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
              >
                Send mail
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
