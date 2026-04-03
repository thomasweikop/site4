import type { ReactNode } from "react";
import type { ScanResult } from "@/lib/nis2Scan";

type Nis2ReportViewProps = {
  result: ScanResult;
  title?: string;
  subtitle?: string;
  footerCta?: ReactNode;
};

export default function Nis2ReportView({
  result,
  title = "Virksomhedens NIS2-anbefalinger",
  subtitle = "Et vægtet første billede af modenhed, gaps og de partnerprofiler der passer bedst til næste skridt.",
  footerCta,
}: Nis2ReportViewProps) {
  return (
    <div className="space-y-6">
      <section className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Anbefalinger
            </p>
            <h1 className="mt-4 max-w-3xl text-balance font-display text-4xl leading-none text-ink md:text-[3.2rem]">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-soft md:text-base">
              {subtitle}
            </p>
          </div>
          <div
            className={`border px-4 py-2 text-sm font-semibold ${result.band.className}`}
          >
            {result.band.status}
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="border border-line bg-paper p-5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#4c655d]">
              Samlet score
            </p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-5xl font-semibold tracking-[-0.04em] text-ink md:text-6xl">
                  {result.percentage}%
                </p>
                <p className="mt-2 text-sm text-soft">{result.band.risk}</p>
              </div>
              <div className="text-right text-sm text-soft">
                <p>{result.totalPoints} point</p>
                <p>ud af {result.maxPoints}</p>
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden bg-[#dde5df]">
              <div
                className={`h-full ${result.band.barClassName}`}
                style={{ width: `${result.percentage}%` }}
              />
            </div>

            <p className="mt-5 text-sm leading-6 text-soft">
              {result.riskSummary}
            </p>
          </div>

          <div className="border border-line bg-white p-5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#4c655d]">
              Ledelsesresume
            </p>
            <p className="mt-4 text-base leading-7 text-ink">
              {result.executiveSummary}
            </p>
            <p className="mt-4 text-sm leading-6 text-soft">
              {result.urgencyStatement}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {result.profileSummary.map((item) => (
                <span
                  key={item}
                  className="border border-line bg-paper px-3 py-2 text-sm text-soft"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
            Fire dimensioner
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {result.dimensions.map((dimension) => (
              <article
                key={dimension.key}
                className="border border-line bg-paper p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                      {dimension.label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink">
                      {dimension.percentage}%
                    </p>
                  </div>
                  <span className="border border-line bg-white px-3 py-1 text-xs font-semibold text-soft">
                    {dimension.status}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-soft">
                  {dimension.summary}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-line bg-white p-6 shadow-[var(--shadow)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Svarfordeling
            </p>
            <div className="mt-5 grid gap-3">
              <div className="border border-line bg-paper px-4 py-4">
                <p className="text-sm font-semibold text-ink">Ja</p>
                <p className="mt-1 text-2xl font-semibold text-ink">
                  {result.breakdown.yes}
                </p>
              </div>
              <div className="border border-line bg-paper px-4 py-4">
                <p className="text-sm font-semibold text-ink">Delvist</p>
                <p className="mt-1 text-2xl font-semibold text-ink">
                  {result.breakdown.partial}
                </p>
              </div>
              <div className="border border-line bg-paper px-4 py-4">
                <p className="text-sm font-semibold text-ink">Nej</p>
                <p className="mt-1 text-2xl font-semibold text-ink">
                  {result.breakdown.no}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-line bg-white p-6 shadow-[var(--shadow)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Profilkontekst
            </p>
            <div className="mt-4 grid gap-3">
              {result.profileInsights.length > 0 ? (
                result.profileInsights.map((item) => (
                  <p
                    key={item}
                    className="border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft"
                  >
                    {item}
                  </p>
                ))
              ) : (
                <p className="border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft">
                  Resultatet bør altid læses sammen med virksomhedens størrelse,
                  branche og konkrete ansvar internt.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {result.blockers.length > 0 ? (
        <section className="border border-[#e0a291] bg-[#f8e5df] p-6 shadow-[var(--shadow)] md:p-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#7e5d55]">
            Kritiske blockers
          </p>
          <div className="mt-5 grid gap-3">
            {result.blockers.map((blocker) => (
              <article key={blocker.id} className="border border-[#e0a291] bg-white px-4 py-4">
                <h2 className="text-base font-semibold text-ink">
                  {blocker.question}
                </h2>
                <p className="mt-2 text-sm leading-6 text-soft">
                  Denne blocker påvirker matchingen direkte og trækker
                  anbefalingerne mod {blocker.vendorTypes.join(" / ")}.
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
        <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
            30 / 60 / 90 dage
          </p>
          <div className="mt-5 grid gap-4">
            {result.roadmap.map((phase) => (
              <article
                key={phase.phase}
                className="border border-line bg-paper p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {phase.phase}
                    </p>
                    <p className="mt-1 text-sm text-soft">{phase.title}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2">
                  {phase.items.map((item) => (
                    <p key={item} className="text-sm leading-6 text-soft">
                      {item}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                Anbefalede partnerprofiler
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-ink">
                Match baseret på score, gaps og blocker-logik
              </h2>
            </div>
            <span className="border border-line bg-paper px-4 py-2 text-sm text-soft">
              {result.vendorDirectoryCount} profiler i kataloget
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            {result.partnerRecommendations.map((partner) => (
              <article key={partner.type} className="border border-line bg-paper p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                      {partner.label}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-ink">
                      {partner.primaryVendor?.name ?? partner.summary}
                    </h3>
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
                      <span className="font-semibold text-ink">Prisniveau:</span>{" "}
                      {partner.primaryVendor.priceBand}
                    </p>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-3">
                  {partner.primaryVendor?.website ? (
                    <a
                      href={partner.primaryVendor.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#f7f4ed]"
                    >
                      Besøg {partner.primaryVendor.name}
                    </a>
                  ) : null}
                  <span className="inline-flex border border-line bg-white px-4 py-2 text-sm text-soft">
                    Alternativer:{" "}
                    {partner.sampleVendors
                      .slice(1)
                      .map((vendor) => vendor.name)
                      .join(", ") || "Ingen ekstra vist"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
        <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
            Største gaps
          </p>
          <div className="mt-5 grid gap-4">
            {result.gaps.map((gap) => (
              <article key={gap.id} className="border border-line bg-paper p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                      {gap.category}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-ink">
                      {gap.question}
                    </h2>
                  </div>
                  <span className="border border-line bg-white px-3 py-1 text-xs font-semibold text-soft">
                    {gap.answerLabel}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-soft">
                  {gap.recommendation}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="border border-line bg-sage p-6 text-white shadow-[var(--shadow)] md:p-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#b9d0c2]">
            Første anbefalede skridt
          </p>
          <div className="mt-5 grid gap-3">
            {result.nextSteps.map((step) => (
              <div
                key={step}
                className="border border-white/12 px-4 py-4 text-sm leading-6 text-white/84"
              >
                {step}
              </div>
            ))}
          </div>

          {footerCta ? <div className="mt-6">{footerCta}</div> : null}
        </div>
      </section>
    </div>
  );
}
