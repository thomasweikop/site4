"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import type { VendorDirectoryEntry } from "@/lib/nis2BuildPack";
import type { PriorityArea } from "@/lib/nis2Scan";
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

type ResultStep =
  | null
  | "summary"
  | "specialist-overview"
  | "specialist-recommended"
  | "questions";

const NOOP_SUBSCRIBE = () => () => {};

function vendorCoversArea(vendor: VendorDirectoryEntry, area: PriorityArea) {
  return (
    area.vendorTypes.includes(vendor.type) ||
    vendor.secondaryTypes.some((type) => area.vendorTypes.includes(type))
  );
}

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
  const [step, setStep] = useState<ResultStep>(null);
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
  const activeStep = step ?? (unlocked ? "summary" : null);

  function handleUnlocked(lead: UnlockLead) {
    const updated = markReportUnlocked(sessionId, lead);

    if (updated) {
      setSessionOverride(updated);
      setStep("summary");
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
                Før rapporten sendes, registreres virksomhed, navn og email
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-soft md:text-base">
                Når oplysningerne er indtastet, sendes rapporten til mail.
                Derefter kan virksomheden fortsætte til specialist-overblik og
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
                  "Et kort billede af hvor der fortsat er huller i virksomhedens NIS2 compliance.",
                  "Et specialist-overblik med leverandører og områder de typisk er stærke i.",
                  "En prioriteret liste af anbefalede eksperter.",
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

      {activeStep === "summary" ? (
        <section className="space-y-6">
          <div className="border border-[#b6cfb6] bg-[#edf4ed] px-5 py-4 text-sm text-[#235b41] shadow-[var(--shadow)]">
            Rapporten sendes til dig på mail.
          </div>

          <div className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Næste skridt
            </p>
            <h1 className="mt-4 max-w-4xl text-balance font-display text-4xl leading-none text-ink md:text-[3.15rem]">
              Ud fra dine besvarelser virker det til, at der fortsat er huller i
              virksomhedens NIS2 compliance
            </h1>
            <p className="mt-5 text-base leading-7 text-soft">
              {result.urgencyStatement}
            </p>

            <div className="mt-8">
              <p className="text-sm font-semibold text-ink">Vigtigste områder</p>
              <div className="mt-4 grid gap-3">
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
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <article className="border border-line bg-paper p-5">
                <h2 className="text-xl font-semibold text-ink">
                  Få overblik over specialister der kan hjælpe med at sikre fuld
                  compliance
                </h2>
                <p className="mt-3 text-sm leading-6 text-soft">
                  Start med et overblik over specialister og områder de typisk er
                  stærke i.
                </p>
                <button
                  type="button"
                  onClick={() => setStep("specialist-overview")}
                  className="mt-5 inline-flex bg-sage px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d4b43]"
                >
                  Fortsæt
                </button>
              </article>

              <article className="border border-line bg-paper p-5">
                <h2 className="text-xl font-semibold text-ink">
                  Spørgsmål til de ansvarlige i virksomheden
                </h2>
                <p className="mt-3 text-sm leading-6 text-soft">
                  Brug de næste spørgsmål til at få mere indsigt i de områder der
                  kræver afklaring før næste beslutning.
                </p>
                <button
                  type="button"
                  onClick={() => setStep("questions")}
                  className="mt-5 inline-flex bg-sage px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d4b43]"
                >
                  Fortsæt
                </button>
              </article>
            </div>
          </div>
        </section>
      ) : null}

      {activeStep === "specialist-overview" ? (
        <section className="space-y-6">
          <div className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Specialist-overblik
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.15rem]">
              Specialister og de områder de typisk er gode til
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-soft md:text-base">
              Tabellen viser et første overblik. Prikken markerer de områder hvor
              leverandøren typisk har kapabiliteter der matcher virksomhedens
              behov.
            </p>

            <div className="mt-8 overflow-x-auto border border-line">
              <table className="min-w-full border-collapse bg-white text-sm">
                <thead className="bg-paper">
                  <tr>
                    <th className="border-b border-line px-4 py-3 text-left font-semibold text-ink">
                      Leverandør
                    </th>
                    {result.priorityAreas.map((area) => (
                      <th
                        key={area.key}
                        className="border-b border-line px-4 py-3 text-center font-semibold text-ink"
                      >
                        {area.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.specialistMatrixVendors.map((vendor) => (
                    <tr key={vendor.name} className="border-b border-line last:border-b-0">
                      <td className="px-4 py-3 text-ink">
                        <div className="font-semibold">{vendor.name}</div>
                        <div className="mt-1 text-xs text-soft">
                          {vendor.type} / {vendor.priceBand}
                        </div>
                      </td>
                      {result.priorityAreas.map((area) => (
                        <td
                          key={`${vendor.name}-${area.key}`}
                          className="px-4 py-3 text-center"
                        >
                          {vendorCoversArea(vendor, area) ? (
                            <span className="inline-flex h-3 w-3 rounded-full bg-sage" />
                          ) : (
                            <span className="inline-flex h-3 w-3 rounded-full bg-[#d8ddd2]" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStep("specialist-recommended")}
                className="inline-flex bg-sage px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d4b43]"
              >
                Anbefalede eksperter
              </button>
              <button
                type="button"
                onClick={() => setStep("summary")}
                className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Tilbage
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {activeStep === "specialist-recommended" ? (
        <section className="space-y-6">
          <div className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Anbefalede eksperter
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.15rem]">
              Prioriterede eksperter baseret på virksomhedens behov
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-soft md:text-base">
              Her vises de eksperter der ligger stærkest i forhold til de huller
              testen har peget på.
            </p>

            <div className="mt-8 grid gap-4">
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
                      <h2 className="mt-2 text-xl font-semibold text-ink">
                        {partner.primaryVendor?.name ?? partner.label}
                      </h2>
                      <p className="mt-2 text-sm text-soft">{partner.label}</p>
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

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStep("specialist-overview")}
                className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Tilbage til overblik
              </button>
              <button
                type="button"
                onClick={() => setStep("summary")}
                className="inline-flex border border-line bg-white px-6 py-3 text-sm font-semibold text-soft transition hover:bg-paper"
              >
                Tilbage til start
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {activeStep === "questions" ? (
        <section className="space-y-6">
          <div className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Spørgsmål til de ansvarlige
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.15rem]">
              Konkrete spørgsmål der giver mere indsigt i de vigtigste områder
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-soft md:text-base">
              Brug spørgsmålene her i ledelse, IT eller sikkerhedsgruppen for at
              få et skarpere billede før næste prioritering.
            </p>

            <div className="mt-8 grid gap-4">
              {result.priorityAreas.map((area) => (
                <article
                  key={area.key}
                  className="border border-line bg-paper p-5"
                >
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-ink">
                    {area.label}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-soft">
                    {area.summary}
                  </p>
                  <ol className="mt-5 grid gap-3">
                    {area.followUpQuestions.map((question, index) => (
                      <li
                        key={question}
                        className="border border-line bg-white px-4 py-4 text-sm leading-6 text-soft"
                      >
                        <span className="font-semibold text-ink">
                          {index + 1}.
                        </span>{" "}
                        {question}
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStep("summary")}
                className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Tilbage
              </button>
              <button
                type="button"
                onClick={() => setStep("specialist-overview")}
                className="inline-flex bg-sage px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d4b43]"
              >
                Se specialister
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
