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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_18rem] xl:items-start">
      <section className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Generer analyse
        </p>
        <h1 className="mt-4 max-w-5xl text-balance font-display text-4xl leading-none text-ink md:text-[3.15rem]">
          Udfyld informationer herunder så analysen skabes på det rette grundlag
        </h1>

        <div className="mt-8">
          <ReportUnlockForm
            sessionId={sessionId}
            result={result}
            onUnlocked={(lead) => {
              markReportUnlocked(sessionId, lead);
            }}
            submitLabel="Generer analyse"
            successPath={resultPath}
            hideHeading
            className="p-0 shadow-none"
          />
        </div>
      </section>

      <section className="border border-line bg-white p-4 shadow-[var(--shadow)]">
        <div className="scale-[0.82] origin-top-left">
          <div className="w-[18rem] border border-line bg-[#f7f3ea] p-3">
            <div className="grid gap-2 grid-cols-2">
              {result.analysisAreas.slice(0, 6).map((area) => (
                <article
                  key={area.key}
                  className="border border-line bg-white p-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="max-w-[6.5rem] text-[0.58rem] font-semibold leading-tight text-ink">
                      {area.label}
                    </h3>
                    <PercentageRing
                      percentage={area.percentage}
                      label={`${area.label} score`}
                      size={34}
                      strokeWidth={5}
                      valueScale={0.32}
                      displayValue={area.percentage >= 90 ? "+90" : area.percentage}
                    />
                  </div>
                  <p className="mt-2 text-[0.42rem] leading-[0.7rem] text-soft">
                    <span className="font-semibold text-ink">Observation:</span>{" "}
                    {area.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
