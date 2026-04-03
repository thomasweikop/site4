"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { CORE_COPY } from "@/lib/nis2BuildPack";
import {
  buildFollowupQuestionsPath,
  buildFullRecommendationPath,
  buildReportSnapshot,
  buildSessionSpecialistsPath,
  encodeReportSnapshot,
} from "@/lib/reportLinks";
import ReportUnlockForm from "@/components/ReportUnlockForm";
import {
  getSessionReport,
  markReportUnlocked,
  parseSessionsStorageValue,
  readSessionsStorageValue,
  type StoredReportSession,
  type UnlockLead,
} from "@/lib/nis2Session";

type ResultExperienceProps = {
  sessionId: string;
};

const NOOP_SUBSCRIBE = () => () => {};

export default function ResultExperience({
  sessionId,
}: ResultExperienceProps) {
  const clientReady = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => true,
    () => false,
  );
  const sessionsStorageValue = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    readSessionsStorageValue,
    () => "[]",
  );
  const storedSession =
    parseSessionsStorageValue(sessionsStorageValue).find(
      (candidate) => candidate.id === sessionId,
    ) ?? null;
  const [sessionOverride, setSessionOverride] =
    useState<StoredReportSession | null>(null);
  const session = sessionOverride ?? storedSession;

  if (!clientReady) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-sm text-soft">Indlæser anbefalingerne...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Anbefalingerne kunne ikke findes
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">
          Sessionen findes ikke på denne enhed
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-soft">
          Resultatet gemmes lokalt i browseren i denne MVP. Hvis
          anbefalingerne åbnes på en anden enhed eller efter at browserdata er
          ryddet, skal testen startes igen.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/scan"
            className="inline-flex bg-sage px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d4b43]"
          >
            Start testen igen
          </Link>
          <Link
            href="/"
            className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Til forsiden
          </Link>
        </div>
      </div>
    );
  }

  const unlocked = Boolean(session.unlockedAt);
  const result = getSessionReport(session);

  const reportSnapshot = buildReportSnapshot({
    sessionId,
    company: session.unlockLead?.company,
    result,
  });
  const encodedReportSnapshot = encodeReportSnapshot(reportSnapshot);
  const fullRecommendationHref = buildFullRecommendationPath(
    sessionId,
    encodedReportSnapshot,
  );
  const sessionSpecialistsHref = buildSessionSpecialistsPath(sessionId);
  const followupQuestionsHref = buildFollowupQuestionsPath(sessionId);

  function handleUnlocked(lead: UnlockLead) {
    const updated = markReportUnlocked(sessionId, lead);

    if (updated) {
      setSessionOverride(updated);
    }
  }

  return (
    <div className="space-y-6">
      {!unlocked ? (
        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-6">
            <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                Anbefalingerne er klar
              </p>
              <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.15rem]">
                Før anbefalingerne sendes, registreres virksomhed, navn og email
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-soft md:text-base">
                Når oplysningerne er indtastet, sendes anbefalingerne til mail.
                Derefter kan virksomheden fortsætte til specialistoverblik og
                spørgsmål til de ansvarlige i virksomheden.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="border border-line bg-paper p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                    Score
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-ink">
                    {result.percentage}%
                  </p>
                </div>
                <div className="border border-line bg-paper p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                    Status
                  </p>
                  <p className="mt-2 text-lg font-semibold text-ink">
                    {result.band.status}
                  </p>
                </div>
                <div className="border border-line bg-paper p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                    Fokusområder
                  </p>
                  <p className="mt-2 text-lg font-semibold text-ink">
                    {result.priorityAreas.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                Det virksomheden får bagefter
              </p>
              <div className="mt-5 grid gap-3">
                {[
                  "Et overblik over hvor der fortsat er huller i virksomhedens NIS2 compliance.",
                  "En stor specialistmatrix med alle 125 profiler og deres styrkeområder.",
                  "En prioriteret side med anbefalede eksperter sorteret efter fit score.",
                  "Fem konkrete spørgsmål til hvert område der kræver mere indsigt.",
                ].map((item) => (
                  <div
                    key={item}
                    className="border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ReportUnlockForm
            sessionId={sessionId}
            result={result}
            onUnlocked={handleUnlocked}
          />
        </section>
      ) : null}

      {unlocked ? (
        <section className="space-y-6">
          <div className="border border-[#b6cfb6] bg-[#edf4ed] px-5 py-4 text-sm text-[#235b41] shadow-[var(--shadow)]">
            Anbefalingerne sendes til dig på mail.
          </div>

          <div className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Næste skridt
            </p>
            <h1 className="mt-4 max-w-4xl text-balance font-display text-4xl leading-none text-ink md:text-[3.15rem]">
              {CORE_COPY.headline}
            </h1>
            <p className="mt-5 text-base leading-7 text-soft">
              {CORE_COPY.intro}
            </p>

            <div className="mt-6 grid gap-3">
              {result.priorityAreas.map((area) => (
                <div
                  key={area.key}
                  className="border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft"
                >
                  <span className="font-semibold text-ink">{area.label}</span>
                  <span className="text-soft">: {area.summary}</span>
                </div>
              ))}
            </div>

            {result.blockers.length > 0 ? (
              <div className="mt-6 border border-[#e0a291] bg-[#f8e5df] px-4 py-4 text-sm leading-6 text-[#7e5d55]">
                <p className="font-semibold text-ink">
                  Kritiske blockers som bør afklares først
                </p>
                <ul className="mt-3 grid gap-2">
                  {result.blockers.map((blocker) => (
                    <li key={blocker.id}>{blocker.question}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={fullRecommendationHref}
                className="inline-flex bg-sage px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d4b43]"
              >
                Se detaljerede anbefalinger
              </Link>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <article className="border border-line bg-paper p-5">
                <h2 className="text-xl font-semibold text-ink">
                  {CORE_COPY.cta_a_label}
                </h2>
                <p className="mt-3 text-sm leading-6 text-soft">
                  Se den fulde matrix med specialister, områder og filtrering,
                  før virksomheden vælger hvilke dialoger der er mest relevante.
                </p>
                <Link
                  href={sessionSpecialistsHref}
                  className="mt-5 inline-flex bg-sage px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d4b43]"
                >
                  {CORE_COPY.cta_a_button}
                </Link>
              </article>

              <article className="border border-line bg-paper p-5">
                <h2 className="text-xl font-semibold text-ink">
                  {CORE_COPY.cta_b_label}
                </h2>
                <p className="mt-3 text-sm leading-6 text-soft">
                  Få mere indsigt i de svageste områder gennem målrettede
                  spørgsmål til de ansvarlige i virksomheden.
                </p>
                <Link
                  href={followupQuestionsHref}
                  className="mt-5 inline-flex bg-sage px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d4b43]"
                >
                  {CORE_COPY.cta_b_button}
                </Link>
              </article>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
