import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "For Partnere | ComplyCheck",
  description:
    "Hvordan leverandører matches mod gaps, dimensioner og blocker-logik i ComplyCheck.",
};

const PARTNER_TYPES = [
  "Legal / regulatorisk",
  "GRC / dokumentation",
  "Teknisk implementering",
  "SOC / monitorering",
  "Audit / assurance",
] as const;

export default function ForPartnersPage() {
  return (
    <main className="bg-page text-ink">
      <SiteHeader current="partners" />

      <section className="px-6 py-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              For partnere
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl leading-none text-ink md:text-[3.4rem]">
              Matchingen er bygget omkring gaps, dimensioner og segment-fit
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-soft">
              Partneranbefalingerne er ikke en tilfældig katalogvisning. De
              prioriteres ud fra scoremodel, blocker-logik, virksomhedsstørrelse
              og sektor-fit.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
            <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                De 5 partnerkategorier
              </p>
              <div className="mt-5 grid gap-3">
                {PARTNER_TYPES.map((type) => (
                  <div
                    key={type}
                    className="border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft"
                  >
                    {type}
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                Hvordan routing virker
              </p>
              <div className="mt-5 grid gap-3">
                {[
                  "Lav governance eller compliance trækker typisk mod legal og GRC.",
                  "Lav technical eller blockers på MFA / hændelser trækker mod technical og SOC.",
                  "Størrelse, prisbånd og sektor-fit bruges til at løfte mere relevante leverandører op.",
                  "Resultatet viser kun få kuraterede anbefalinger, ikke hele kataloget på én gang.",
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
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
