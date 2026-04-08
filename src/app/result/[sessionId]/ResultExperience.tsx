"use client";

import Link from "next/link";
import PercentageRing from "@/components/PercentageRing";
import {
  buildAnalysisGenerationPath,
  buildAreaDetailPath,
  buildComplianceRecommendationsPath,
} from "@/lib/reportLinks";
import {
  getSessionReport,
  type StoredReportSession,
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
  return `Der er indikationer på mulige mangler i ${formatList(labels)}.`;
}

export default function ResultExperience({
  sessionId,
  initialSession = null,
}: ResultExperienceProps) {
  const { clientReady, session: storedSession } = useStoredReportSession(
    sessionId,
    initialSession,
  );
  const session = storedSession;

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
  const statusNarrative = buildStatusNarrative(result);
  const complianceRecommendationsHref =
    buildComplianceRecommendationsPath(sessionId);
  const analysisGenerationHref = buildAnalysisGenerationPath(sessionId);

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

          <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
            <h2 className="text-balance font-display text-[2rem] leading-none text-ink md:text-[2.35rem]">
              Klar til at generere analysen
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-soft">
              Fortsæt til en separat side, hvor virksomhedsoplysningerne
              udfyldes, og hvor analysen kan genereres og sendes til email.
            </p>
            <div className="mt-6">
              <Link
                href={analysisGenerationHref}
                className="inline-flex bg-sage px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
              >
                Fortsæt til analyse
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {unlocked ? (
        <section className="space-y-6">
          <div className="border border-[#b6cfb6] bg-[#edf4ed] px-5 py-4 text-sm text-[#235b41] shadow-[var(--shadow)]">
            Test resultatet er sendt til {session.unlockLead?.email}.
          </div>

          <div className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Analysens resultat
            </p>
            <h1 className="mt-4 max-w-4xl text-balance font-display text-4xl leading-none text-ink md:text-[3.15rem]">
              Summary af initial NIS2 test
            </h1>
            <p className="mt-5 text-base leading-7 text-soft">
              Den initielle analyse peger på de områder hvor virksomheden bør
              starte, og hvilke initiativer der sandsynligvis vil give mest
              effekt først.
            </p>

            <div className="mt-6 space-y-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                  Alle områder
                </p>
                <p className="mt-2 text-sm leading-7 text-soft">
                  Områderne er sorteret efter lavest compliance score først.
                  Områder med meget høj score vises som +90.
                </p>
                <div className="mt-3 grid gap-4 lg:grid-cols-3">
                  {result.analysisAreas.map((area) => (
                    <article
                      key={area.key}
                      className="border border-line bg-paper p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h2 className="text-xl font-semibold leading-tight text-ink">
                            {area.label}
                          </h2>
                        </div>
                        <PercentageRing
                          percentage={area.percentage}
                          label="COMPLIANCE SCORE"
                          size={84}
                          strokeWidth={11}
                          valueScale={0.43}
                          displayValue={
                            area.percentage >= 90 ? "+90" : area.percentage
                          }
                        />
                      </div>

                      <p className="mt-4 text-sm leading-6 text-soft">
                        <span className="font-semibold text-ink">
                          Observation:
                        </span>{" "}
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
                Fortsæt
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
