"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
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
  const [step, setStep] = useState<"sent" | "partners" | null>(null);
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
  const activeStep = step ?? (unlocked ? "partners" : null);
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
      setStep("sent");
    }
  }

  return (
    <div className="space-y-6">
      {!unlocked && !activeStep ? (
        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-6">
            <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                Rapporten er klar
              </p>
              <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.15rem]">
                Før rapporten vises, sendes den til virksomheden på mail
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-soft md:text-base">
                Først registreres virksomhedsnavn, navn og email. Derefter
                sendes rapporten til mail, og virksomheden kan fortsætte til en
                prioriteret liste af konsulentvirksomheder.
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
                  "En prioriteret konsulentliste baseret på virksomhedens konkrete behov.",
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

      {activeStep === "sent" ? (
        <section className="mx-auto max-w-4xl border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
            Rapport sendt
          </p>
          <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.15rem]">
            Rapporten sendes til dig på mail
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-soft">
            Ønsker du at se en prioriteret liste af konsulentvirksomheder, der
            kan hjælpe med at løse opgaver for virksomheden? Konsulenterne er
            prioriteret efter de behov testen har peget på.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep("partners")}
              className="inline-flex bg-sage px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d4b43]"
            >
              Fortsæt
            </button>
            <Link
              href="/scan"
              className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
            >
              Tag testen igen
            </Link>
          </div>
        </section>
      ) : null}

      {activeStep === "partners" ? (
        <section className="space-y-6">
          <div className="border border-[#b6cfb6] bg-[#edf4ed] px-5 py-4 text-sm text-[#235b41] shadow-[var(--shadow)]">
            Rapporten er sendt til mail. Herunder vises den prioriterede liste
            af konsulentvirksomheder baseret på virksomhedens behov.
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                  Resume
                </p>
                <h2 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3rem]">
                  Virksomhedens prioriterede match
                </h2>
                <p className="mt-4 text-base leading-7 text-soft">
                  {result.executiveSummary}
                </p>
                <p className="mt-4 text-sm leading-6 text-soft">
                  {result.urgencyStatement}
                </p>

                <div className="mt-6 grid gap-3">
                  {teaserLines.map((line) => (
                    <div
                      key={line}
                      className="border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft"
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                  Første anbefalede fokus
                </p>
                <div className="mt-5 grid gap-3">
                  {result.nextSteps.map((stepItem) => (
                    <div
                      key={stepItem}
                      className="border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft"
                    >
                      {stepItem}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                    Prioriteret konsulentliste
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-ink">
                    Konsulentvirksomheder der matcher virksomhedens behov
                  </h2>
                </div>
                <span className="border border-line bg-paper px-4 py-2 text-sm text-soft">
                  {result.partnerRecommendations.length} viste match
                </span>
              </div>

              <div className="mt-6 grid gap-4">
                {result.partnerRecommendations.map((partner, index) => (
                  <article
                    key={partner.type}
                    className="border border-line bg-paper p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                          Prioritet {index + 1}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-ink">
                          {partner.primaryVendor?.name ?? partner.label}
                        </h3>
                        <p className="mt-2 text-sm font-medium text-soft">
                          {partner.label}
                        </p>
                      </div>
                      <span className="border border-line bg-white px-3 py-1 text-xs font-semibold text-soft">
                        Fit score {partner.fitScore}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-soft">
                      {partner.rationale}
                    </p>

                    {partner.primaryVendor ? (
                      <div className="mt-4 grid gap-2 text-sm leading-6 text-soft">
                        <p>
                          <span className="font-semibold text-ink">Best for:</span>{" "}
                          {partner.primaryVendor.bestFor}
                        </p>
                        <p>
                          <span className="font-semibold text-ink">Rolle:</span>{" "}
                          {partner.primaryVendor.recommendedRole}
                        </p>
                        <p>
                          <span className="font-semibold text-ink">
                            Alternative profiler:
                          </span>{" "}
                          {partner.sampleVendors
                            .slice(1)
                            .map((vendor) => vendor.name)
                            .join(", ") || "Ingen ekstra vist"}
                        </p>
                      </div>
                    ) : null}

                    {partner.primaryVendor?.website ? (
                      <a
                        href={partner.primaryVendor.website}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#f7f4ed]"
                      >
                        Besøg {partner.primaryVendor.name}
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/for-partners"
                  className="inline-flex border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#f7f4ed]"
                >
                  Se partner-modellen
                </Link>
                <Link
                  href="/scan"
                  className="inline-flex border border-line bg-paper px-5 py-3 text-sm font-semibold text-soft transition hover:bg-white"
                >
                  Tag testen igen
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
