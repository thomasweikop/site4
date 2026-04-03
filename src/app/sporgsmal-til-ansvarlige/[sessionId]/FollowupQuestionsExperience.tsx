"use client";

import Link from "next/link";
import type { StoredReportSession } from "@/lib/nis2Session";
import {
  buildRecommendedExpertsPath,
  buildSessionSpecialistsPath,
} from "@/lib/reportLinks";
import { useStoredReportSession } from "@/lib/useStoredReportSession";

type FollowupQuestionsExperienceProps = {
  sessionId: string;
  initialSession?: StoredReportSession | null;
};

export default function FollowupQuestionsExperience({
  sessionId,
  initialSession = null,
}: FollowupQuestionsExperienceProps) {
  const { clientReady, session, result } = useStoredReportSession(
    sessionId,
    initialSession,
  );

  if (!clientReady) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-sm text-soft">Indlæser spørgsmål...</p>
      </div>
    );
  }

  if (!session || !result) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Spørgsmålene kunne ikke indlæses
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">
          Sessionen findes ikke på denne enhed
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-soft">
          Start testen igen på denne enhed for at genskabe sessionen og de
          tilhørende opfølgende spørgsmål.
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
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-4xl">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Spørgsmål til de ansvarlige
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.25rem]">
              Mere indsigt i de områder der kræver afklaring
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-soft md:text-base">
              Brug disse spørgsmål i ledelse, IT eller sikkerhedsgruppen, når
              virksomheden skal kvalificere næste beslutning og afklare scope.
            </p>
          </div>

          <div className="grid min-w-[220px] gap-3">
            <div className="border border-line bg-paper px-4 py-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                Vises for
              </p>
              <p className="mt-2 text-sm text-soft">
                Områder med score under 70
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={buildSessionSpecialistsPath(sessionId)}
            className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Specialistmatrix
          </Link>
          <Link
            href={buildRecommendedExpertsPath(sessionId)}
            className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Anbefalede eksperter
          </Link>
        </div>
      </section>

      {result.followupAreas.length === 0 ? (
        <section className="border border-line bg-white p-8 shadow-[var(--shadow)]">
          <p className="text-sm leading-7 text-soft">
            Ingen dimensioner ligger under tærsklen på 70 i denne screening.
            Brug i stedet de detaljerede anbefalinger og ekspertlisten til at
            kvalificere næste skridt.
          </p>
        </section>
      ) : (
        <section className="grid gap-4">
          {result.followupAreas.map((area) => (
            <article
              key={area.key}
              className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                    {area.label}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-ink">
                    Fem spørgsmål til næste afklaring
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-soft">
                    {area.summary}
                  </p>
                </div>
                <span className="border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink">
                  Score {area.percentage}%
                </span>
              </div>

              <ol className="mt-6 grid gap-3">
                {area.questions.map((question, index) => (
                  <li
                    key={question}
                    className="border border-line bg-paper px-4 py-4 text-sm leading-7 text-soft"
                  >
                    <span className="font-semibold text-ink">{index + 1}.</span>{" "}
                    {question}
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
