"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import Nis2LeadForm from "@/app/Nis2LeadForm";
import Nis2ReportView from "@/components/Nis2ReportView";
import ReportUnlockForm from "@/components/ReportUnlockForm";
import {
  getSessionReport,
  getStoredReportSession,
  markReportUnlocked,
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
  const storedSession = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => getStoredReportSession(sessionId),
    () => null,
  );
  const [sessionOverride, setSessionOverride] =
    useState<StoredReportSession | null>(null);
  const session = sessionOverride ?? storedSession;

  if (!clientReady) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-sm text-soft">Indlæser rapporten...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Rapporten kunne ikke findes
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">
          Sessionen findes ikke på denne enhed
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-soft">
          Resultatet gemmes lokalt i browseren i denne MVP. Hvis rapporten blev
          åbnet på en anden enhed eller efter at browserdata er ryddet, skal
          testen startes igen.
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

  const result = getSessionReport(session);
  const unlocked = Boolean(session.unlockedAt);
  const teaserLines = [
    `Samlet score: ${result.percentage}% (${result.band.status})`,
    ...result.profileSummary,
    ...result.weakestDimensions.map(
      (dimension) => `${dimension.label}: ${dimension.percentage}%`,
    ),
  ];

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
                Teaser
              </p>
              <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.15rem]">
                Rapporten er klar
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-soft md:text-base">
                Virksomheden har allerede en vægtet score og de første match.
                Lås rapporten op for at se dimensioner, 30/60/90-plan og
                anbefalede partnere i fuld længde.
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
                    Partnermatch
                  </p>
                  <p className="mt-2 text-lg font-semibold text-ink">
                    {result.partnerRecommendations.length} anbefalinger
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {teaserLines.map((line) => (
                  <p
                    key={line}
                    className="border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                Dette ligger i rapporten
              </p>
              <div className="mt-5 grid gap-3">
                {[
                  "4 dimensioner: governance, technical, operational og compliance.",
                  "Kritiske blockers og de områder der bør håndteres først.",
                  "30 / 60 / 90 dages prioriteret handlingsplan.",
                  "3 partneranbefalinger med fit score, rationale og alternativer.",
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
        <>
          <div className="border border-[#b6cfb6] bg-[#edf4ed] px-5 py-4 text-sm text-[#235b41] shadow-[var(--shadow)]">
            Den fulde rapport er låst op for denne browser. Kontaktoplysningerne
            er registreret, og resultatet kan nu læses i fuld længde.
          </div>

          <Nis2ReportView
            result={result}
            footerCta={
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/for-partners"
                  className="inline-flex border border-white/14 bg-white px-6 py-3 text-sm font-semibold text-sage transition hover:bg-[#f1ece3]"
                >
                  Se partner-modellen
                </Link>
                <Link
                  href="/scan"
                  className="inline-flex border border-white/14 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
                >
                  Tag testen igen
                </Link>
              </div>
            }
          />

          <Nis2LeadForm
            eyebrow="Næste samtale"
            title="Skal resultatet omsættes til en konkret dialog?"
            description="Send rapportkonteksten videre, hvis virksomheden vil bruge resultatet som udgangspunkt for scope, prioritering eller leverandørvalg."
            messageLabel="Hvad skal virksomheden tage fat i først?"
            messagePlaceholder="Fx governance-spor, teknisk remediation eller en prioriteret partnerdialog."
            submitLabel="Send rapporten videre"
            successMessage="Tak. Resultatet er modtaget, og næste samtale kan tage udgangspunkt i rapporten."
            helperText="Mest nyttigt når virksomheden vil gå fra screening til konkret plan."
            sourceTag="NIS2 unlocked report lead"
            contextLines={[
              ...result.profileSummary,
              `Samlet score: ${result.percentage}%`,
              `Status: ${result.band.status}`,
              ...result.weakestDimensions.map(
                (dimension) =>
                  `Laveste dimension: ${dimension.label} ${dimension.percentage}%`,
              ),
              ...result.partnerRecommendations.map(
                (partner) =>
                  `Partner: ${partner.label} -> ${
                    partner.primaryVendor?.name ?? partner.summary
                  }`,
              ),
            ]}
          />
        </>
      ) : null}
    </div>
  );
}
