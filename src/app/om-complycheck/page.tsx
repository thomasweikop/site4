import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Om ComplyCheck | ComplyCheck",
  description:
    "Baggrunden for ComplyCheck og hvorfor platformen er skabt til at gøre compliance mere enkel og handlingsorienteret.",
};

const PARAGRAPHS = [
  "ComplyCheck er skabt af en gruppe ledere med baggrund inden for teknologi, virksomhedsledelse og bestyrelsesarbejde. Gennem vores arbejde har vi selv oplevet, hvor komplekst og uoverskueligt det er at navigere i de mange nye EU-reguleringer som NIS2, GDPR, DORA og AI Act.",
  "Selv for erfarne organisationer kan det være uklart, hvad der konkret kræves, hvor man står i dag, og hvilke områder der bør prioriteres først. Mange virksomheder mangler et klart overblik og ender med enten at undervurdere risikoen eller bruge unødigt mange ressourcer på de forkerte indsatser.",
  "Derfor besluttede vi at skabe ComplyCheck.",
  "Vores mål er at gøre compliance simpelt, operationelt og handlingsorienteret. Med få spørgsmål giver platformen et hurtigt overblik over virksomhedens compliance-niveau på tværs af centrale reguleringer. Resultatet er en konkret score, der gør det nemt at forstå, hvor der er mangler, og hvor indsatsen bør sættes ind.",
  "Men overblik er kun første skridt. ComplyCheck kobler også resultaterne med anbefalinger til relevante rådgivere og specialister, som kan hjælpe med at løfte compliance til næste niveau.",
  "Vi tror på, at compliance ikke kun handler om at undgå bøder, men om at skabe robuste, ansvarlige og fremtidssikrede virksomheder.",
  "ComplyCheck er udviklet med ét formål: at gøre kompleks regulering til noget, der er til at forstå og til at handle på.",
] as const;

export default function AboutComplyCheckPage() {
  return (
    <main className="bg-page text-ink">
      <SiteHeader />

      <section className="px-6 py-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Om ComplyCheck
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl leading-none text-ink md:text-[3.4rem]">
              Hvorfor ComplyCheck er bygget
            </h1>

            <div className="mt-8 space-y-5">
              {PARAGRAPHS.map((paragraph) => (
                <p
                  key={paragraph}
                  className="max-w-4xl text-base leading-8 text-soft"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
