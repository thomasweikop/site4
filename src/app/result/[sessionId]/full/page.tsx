import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  buildRecommendedExpertsPath,
  buildSessionSpecialistsPath,
  decodeReportSnapshot,
} from "@/lib/reportLinks";

export const metadata: Metadata = {
  title: "Fuld Anbefaling | ComplyCheck",
  description:
    "Læs den fulde anbefaling bag virksomhedens NIS2-screening og se de næste prioriterede skridt.",
};

type FullRecommendationPageProps = {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ report?: string | string[] | undefined }>;
};

export default async function FullRecommendationPage({
  params,
  searchParams,
}: FullRecommendationPageProps) {
  const { sessionId } = await params;
  const resolvedSearchParams = await searchParams;
  const reportParam = Array.isArray(resolvedSearchParams.report)
    ? resolvedSearchParams.report[0]
    : resolvedSearchParams.report;
  const snapshot = decodeReportSnapshot(reportParam);

  if (!snapshot || snapshot.sessionId !== sessionId) {
    return (
      <main className="bg-page text-ink">
        <SiteHeader current="scan" />

        <section className="px-6 py-8 md:px-8 md:py-10 lg:px-10">
          <div className="mx-auto max-w-5xl border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Fuld anbefaling
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.15rem]">
              Anbefalingen kunne ikke indlæses
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-soft md:text-base">
              Linket mangler de nødvendige anbefalingsdata eller er ikke længere
              gyldigt. Start testen igen eller gå direkte til specialistlisten.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/scan"
                className="inline-flex bg-sage px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d4b43]"
              >
                Start testen igen
              </Link>
              <Link
                href={buildSessionSpecialistsPath(sessionId)}
                className="inline-flex border border-line bg-paper px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Specialist liste
              </Link>
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="bg-page text-ink">
      <SiteHeader current="scan" />

      <section className="px-6 py-8 md:px-8 md:py-10 lg:px-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-4xl">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                  Fuld anbefaling
                </p>
                <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.25rem]">
                  Hvad anbefalingerne betyder for {snapshot.company}
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-soft md:text-base">
                  Denne side uddyber hvordan screeningen bør læses, hvilke
                  områder der ser svagest ud lige nu, og hvilke specialistspor
                  der typisk er mest relevante at starte med.
                </p>
              </div>

              <div className="grid min-w-[220px] gap-3">
                <div className="border border-line bg-paper px-4 py-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                    Samlet score
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-ink">
                    {snapshot.score}%
                  </p>
                </div>
                <div className="border border-line bg-paper px-4 py-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                    Status
                  </p>
                  <p className="mt-2 text-lg font-semibold text-ink">
                    {snapshot.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={buildSessionSpecialistsPath(sessionId)}
                className="inline-flex bg-sage px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d4b43]"
              >
                Specialist liste
              </Link>
              <Link
                href={buildRecommendedExpertsPath(sessionId)}
                className="inline-flex border border-line bg-paper px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Anbefalede eksperter
              </Link>
              <Link
                href={`/result/${sessionId}`}
                className="inline-flex border border-line bg-paper px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Tilbage til resultat
              </Link>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <article className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                Overordnet vurdering
              </p>
              <p className="mt-5 text-base leading-8 text-ink">
                {snapshot.executiveSummary}
              </p>
              <p className="mt-4 text-sm leading-7 text-soft md:text-base">
                {snapshot.urgencyStatement}
              </p>
              <p className="mt-4 text-sm leading-7 text-soft md:text-base">
                {snapshot.bandSummary}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {snapshot.profileSummary.map((item) => (
                  <span
                    key={item}
                    className="border border-line bg-paper px-3 py-2 text-sm text-soft"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>

            <article className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                Laveste områder
              </p>
              <div className="mt-5 grid gap-3">
                {snapshot.weakestDimensions.map((dimension) => (
                  <div
                    key={dimension}
                    className="border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft"
                  >
                    {dimension}
                  </div>
                ))}
                {snapshot.blockers.length > 0 ? (
                  <div className="border border-[#e0a291] bg-[#f8e5df] px-4 py-4 text-sm leading-6 text-[#7e5d55]">
                    <p className="font-semibold text-ink">
                      Kritiske forhold der bør afklares først
                    </p>
                    <ul className="mt-3 grid gap-2">
                      {snapshot.blockers.map((blocker) => (
                        <li key={blocker}>{blocker}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </article>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                Vigtigste områder
              </p>
              <div className="mt-5 grid gap-4">
                {snapshot.priorityAreas.map((area) => (
                  <div
                    key={area.label}
                    className="border border-line bg-paper px-4 py-4"
                  >
                    <p className="font-semibold text-ink">{area.label}</p>
                    <p className="mt-2 text-sm leading-6 text-soft">
                      {area.summary}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                Første anbefalede skridt
              </p>
              <p className="mt-5 text-sm leading-7 text-soft md:text-base">
                Formålet her er ikke at vælge alle leverandører med det samme,
                men at skabe et bedre grundlag for den første prioritering og de
                første dialoger internt i virksomheden.
              </p>
              <ol className="mt-5 grid gap-3">
                {snapshot.nextSteps.map((step, index) => (
                  <li
                    key={step}
                    className="border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft"
                  >
                    <span className="font-semibold text-ink">
                      {index + 1}.
                    </span>{" "}
                    {step}
                  </li>
                ))}
              </ol>
            </article>
          </section>

          <section className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                  Anbefalede ekspertspor
                </p>
                <h2 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3rem]">
                  Specialistprofiler der matcher virksomhedens behov bedst
                </h2>
                <p className="mt-4 text-sm leading-7 text-soft md:text-base">
                  Nedenfor er de profiler som screeningen peger på som de mest
                  relevante første spor. Det er ikke en endelig indkøbsbeslutning,
                  men en prioriteret shortlist.
                </p>
              </div>

              <Link
                href={buildSessionSpecialistsPath(sessionId)}
                className="inline-flex border border-line bg-paper px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Specialist liste
              </Link>
            </div>

            <div className="mt-8 grid gap-4">
              {snapshot.partnerRecommendations.map((partner, index) => (
                <article
                  key={`${partner.label}-${partner.vendor}`}
                  className="border border-line bg-paper p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                        Prioritet {index + 1}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-ink">
                        {partner.vendor}
                      </h3>
                      <p className="mt-2 text-sm text-soft">{partner.label}</p>
                    </div>
                    {partner.website ? (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#f7f4ed]"
                      >
                        Besøg website
                      </a>
                    ) : null}
                  </div>

                  <p className="mt-4 text-sm leading-7 text-soft md:text-base">
                    {partner.rationale}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              30 / 60 / 90 dage
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {snapshot.roadmap.map((phase) => (
                <article
                  key={phase.phase}
                  className="border border-line bg-paper p-5"
                >
                  <p className="text-sm font-semibold text-ink">
                    {phase.phase}
                  </p>
                  <p className="mt-1 text-sm text-soft">{phase.title}</p>
                  <div className="mt-4 grid gap-3">
                    {phase.items.map((item) => (
                      <p key={item} className="text-sm leading-6 text-soft">
                        {item}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
