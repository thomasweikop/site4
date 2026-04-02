import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Om NIS2 | ComplyCheck",
  description:
    "Kort forklaring af hvad NIS2 betyder, hvad screeningen bruges til, og hvordan resultatet bør læses.",
};

const TOPICS = [
  {
    title: "Hvad NIS2 typisk handler om",
    text: "Ledelsesansvar, risikostyring, hændelseshåndtering, leverandørstyring og passende tekniske foranstaltninger er blandt de temaer der går igen.",
  },
  {
    title: "Hvad screeningen er god til",
    text: "At skabe et hurtigt modenhedsbillede, sætte sprog på de vigtigste gaps og gøre det lettere at prioritere næste samtale internt.",
  },
  {
    title: "Hvad screeningen ikke er",
    text: "Den er ikke en juridisk afgørelse, ikke en certificering og ikke et fuldt compliance-program i sig selv.",
  },
] as const;

export default function AboutNis2Page() {
  return (
    <main className="bg-page text-ink">
      <SiteHeader current="about" />

      <section className="px-6 py-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Om NIS2
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl leading-none text-ink md:text-[3.4rem]">
              En kort introduktion til hvad screeningen faktisk måler
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-soft">
              ComplyCheck er bygget som en NIS2 readiness-screening. Formålet er
              at give virksomheden et første beslutningsgrundlag, ikke at udstede
              en juridisk konklusion.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {TOPICS.map((topic) => (
                <article
                  key={topic.title}
                  className="border border-line bg-paper p-5"
                >
                  <h2 className="text-lg font-semibold text-ink">
                    {topic.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-soft">
                    {topic.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
