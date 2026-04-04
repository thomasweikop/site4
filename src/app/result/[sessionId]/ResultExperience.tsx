"use client";

import Link from "next/link";
import { useState } from "react";
import PercentageRing from "@/components/PercentageRing";
import {
  buildAreaDetailPath,
  buildComplianceRecommendationsPath,
  buildReportSnapshot,
  buildSpecialistHelpPath,
  encodeReportSnapshot,
} from "@/lib/reportLinks";
import ReportUnlockForm from "@/components/ReportUnlockForm";
import {
  getSessionReport,
  markReportUnlocked,
  type StoredReportSession,
  type UnlockLead,
} from "@/lib/nis2Session";
import type { ScanResult } from "@/lib/nis2Scan";
import { useStoredReportSession } from "@/lib/useStoredReportSession";

type ResultExperienceProps = {
  sessionId: string;
  initialSession?: StoredReportSession | null;
};

function formatList(values: string[]) {
  if (values.length === 0) {
    return "";
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} og ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")} og ${values[values.length - 1]}`;
}

function buildStatusNarrative(result: ScanResult) {
  const labels = result.topAnalysisAreas.map((area) => area.label.toLowerCase());
  const severity =
    result.band.id === "critical" || result.band.id === "high"
      ? "kritiske"
      : result.band.id === "medium"
        ? "væsentlige"
        : "fortsat tydelige";

  return `Der er ${severity} mangler i ${formatList(labels)}.`;
}

export default function ResultExperience({
  sessionId,
  initialSession = null,
}: ResultExperienceProps) {
  const { clientReady, session: storedSession } = useStoredReportSession(
    sessionId,
    initialSession,
  );
  const [sessionOverride, setSessionOverride] =
    useState<StoredReportSession | null>(null);
  const [specialistHelpDecision, setSpecialistHelpDecision] = useState<
    "no" | null
  >(null);
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
            className="inline-flex bg-sage px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
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
  const company = session.unlockLead?.company?.trim() || "Virksomheden";
  const statusNarrative = buildStatusNarrative(result);

  const reportSnapshot = buildReportSnapshot({
    sessionId,
    company,
    result,
  });
  const encodedReportSnapshot = encodeReportSnapshot(reportSnapshot);
  const specialistHelpHref = buildSpecialistHelpPath(
    sessionId,
    encodedReportSnapshot,
  );
  const complianceRecommendationsHref =
    buildComplianceRecommendationsPath(sessionId);

  function handleUnlocked(lead: UnlockLead) {
    const updated = markReportUnlocked(sessionId, lead);

    if (updated) {
      setSessionOverride(updated);
      return;
    }

    if (!session) {
      return;
    }

    const unlockedAt = new Date().toISOString();
    setSessionOverride({
      ...session,
      updatedAt: unlockedAt,
      unlockedAt,
      unlockLead: lead,
    });
  }

  return (
    <div className="space-y-6">
      {!unlocked ? (
        <section className="mx-auto max-w-4xl space-y-6">
          <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Anbefalingerne er klar
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.05rem]">
              Den initielle analyse er gennemført
            </h1>
            <div className="mt-8 border border-line bg-paper px-6 py-6 text-center md:px-8 md:py-8">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                Samlet score
              </p>
              <p className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-ink md:text-[4.75rem]">
                {result.percentage}%
              </p>
              <p className="mt-4 text-sm leading-7 text-soft md:text-base">
                Status: {statusNarrative}
              </p>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-soft md:text-base">
              Analysen er et første billede af virksomhedens NIS2-niveau baseret
              på egne besvarelser. Resultatet kan bruges til at prioritere de
              første dialoger, initiativer og specialistspor.
            </p>
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
            Analysen er sendt til {session.unlockLead?.email}.
          </div>

          <div className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Analysens resultat
            </p>
            <h1 className="mt-4 max-w-4xl text-balance font-display text-4xl leading-none text-ink md:text-[3.15rem]">
              Resultat af initial NIS2 test
            </h1>
            <p className="mt-5 text-base leading-7 text-soft">
              Den initielle analyse peger på de områder hvor virksomheden bør
              starte, og hvilke initiativer der sandsynligvis vil give mest
              effekt først.
            </p>

            <div className="mt-8 space-y-4">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                  Vigtigste konklusioner
                </p>
                <div className="mt-4 grid gap-4">
                  {result.topAnalysisAreas.map((area) => (
                    <article
                      key={area.key}
                      className="border border-line bg-paper p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-semibold text-ink">
                            {area.label}
                          </h2>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#4c655d]">
                            {area.complianceLabel}
                          </p>
                        </div>
                        <PercentageRing
                          percentage={area.percentage}
                          label={area.label}
                          size={98}
                          strokeWidth={11}
                        />
                      </div>

                      <p className="mt-4 text-sm leading-7 text-soft md:text-base">
                        {area.description}
                      </p>

                      <div className="mt-5">
                        <Link
                          href={buildAreaDetailPath(sessionId, area.key)}
                          className="text-sm font-semibold text-[#1b4f45] underline decoration-[#1b4f45]/30 underline-offset-4 transition hover:text-[#0d4b43]"
                        >
                          Læs mere
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={complianceRecommendationsHref}
                className="inline-flex bg-sage px-5 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
              >
                Fortsæt til compliance anbefalinger
              </Link>
            </div>

            <div className="mt-10 border border-line bg-paper p-6 md:p-8">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                Specialist-hjælp
              </p>
              <h2 className="mt-4 text-balance font-display text-[2rem] leading-none text-ink md:text-[2.5rem]">
                Ønsker virksomheden hjælp til at identificere specialister?
              </h2>
              <p className="mt-4 max-w-4xl text-sm leading-7 text-soft md:text-base">
                Hvis virksomheden ønsker hjælp til at identificere specialister
                der kan hjælpe videre på de vigtigste områder, kan ComplyCheck
                samle næste specialistspor og sende det videre på email.
              </p>
              <ul className="mt-5 grid gap-2 text-sm leading-7 text-soft md:text-base">
                {result.topAnalysisAreas.map((area) => (
                  <li key={area.key} className="flex items-start gap-3">
                    <span className="mt-[2px] text-ink">•</span>
                    <span>{area.label}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={specialistHelpHref}
                  className="inline-flex bg-sage px-5 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
                >
                  Ja
                </Link>
                <button
                  type="button"
                  onClick={() => setSpecialistHelpDecision("no")}
                  className="inline-flex border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
                >
                  Nej
                </button>
              </div>

              {specialistHelpDecision === "no" ? (
                <p className="mt-4 text-sm leading-6 text-soft">
                  Det er helt fint. Specialist-hjælp kan altid vælges senere via
                  den email der allerede er sendt til virksomheden.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
