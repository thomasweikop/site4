"use client";

import Link from "next/link";
import PercentageRing from "@/components/PercentageRing";
import ReportUnlockForm from "@/components/ReportUnlockForm";
import { buildResultPath } from "@/lib/reportLinks";
import { markReportUnlocked, type StoredReportSession } from "@/lib/nis2Session";
import { useStoredReportSession } from "@/lib/useStoredReportSession";

type GenerateAnalysisExperienceProps = {
  sessionId: string;
  initialSession?: StoredReportSession | null;
};

export default function GenerateAnalysisExperience({
  sessionId,
  initialSession = null,
}: GenerateAnalysisExperienceProps) {
  const { clientReady, session, result } = useStoredReportSession(
    sessionId,
    initialSession,
  );

  if (!clientReady) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-sm text-soft">Indlæser analysesiden...</p>
      </div>
    );
  }

  if (!session || !result) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Analysesiden kunne ikke indlæses
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">
          Sessionen findes ikke på denne enhed
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-soft">
          Start testen igen på denne enhed for at genskabe sessionen og
          analysen.
        </p>
        <div className="mt-6">
          <Link
            href="/scan"
            className="inline-flex bg-sage px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
          >
            Start testen igen
          </Link>
        </div>
      </div>
    );
  }

  const resultPath = buildResultPath(sessionId);

  if (session.unlockedAt) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Analysen er allerede genereret
        </p>
        <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.05rem]">
          Virksomheden kan fortsætte direkte til analysen
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-soft">
          Oplysningerne er allerede sendt, og analysen er klar på næste side.
        </p>
        <div className="mt-6">
          <Link
            href={resultPath}
            className="inline-flex bg-sage px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
          >
            Gå til analysen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Generer analyse
        </p>
        <h1 className="mt-4 max-w-5xl text-balance font-display text-4xl leading-none text-ink md:text-[3.15rem]">
          Udfyld oplysningerne og generer virksomhedens analyse
        </h1>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-soft md:text-base">
          Udfyld navn, virksomhed, email og titel. Derefter sendes analysen til
          email, og virksomheden føres videre til den fulde analyseside.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
        <ReportUnlockForm
          sessionId={sessionId}
          result={result}
          onUnlocked={(lead) => {
            markReportUnlocked(sessionId, lead);
          }}
          heading="Generer analyse"
          intro="Skriv navn, virksomhed, email og titel. Når formularen er sendt, bliver analysen sendt til email, og du sendes videre til den fulde analyseside."
          submitLabel="Generer analyse"
          successPath={resultPath}
        />

        <section className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
            Eksempel på analyse
          </p>
          <h2 className="mt-4 text-balance font-display text-[2rem] leading-none text-ink md:text-[2.35rem]">
            Sådan ser analysen ud bagefter
          </h2>
          <p className="mt-4 text-sm leading-7 text-soft">
            Områderne er sorteret efter lavest compliance score først. Områder
            med meget høj score vises som +90.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {result.analysisAreas.map((area) => (
              <article
                key={area.key}
                className="border border-line bg-paper p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="max-w-[13rem] text-base font-semibold leading-tight text-ink">
                    {area.label}
                  </h3>
                  <PercentageRing
                    percentage={area.percentage}
                    label={`${area.label} score`}
                    size={68}
                    strokeWidth={9}
                    valueScale={0.4}
                    displayValue={area.percentage >= 90 ? "+90" : area.percentage}
                  />
                </div>
                <p className="mt-4 text-xs leading-6 text-soft">
                  <span className="font-semibold text-ink">Observation:</span>{" "}
                  {area.description}
                </p>
                <p className="mt-4 text-xs font-semibold text-[#1b4f45]">
                  Læs mere
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
