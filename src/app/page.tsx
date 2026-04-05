import Image from "next/image";
import Link from "next/link";
import BrandWordmark from "@/components/BrandWordmark";
import HeaderMenu from "@/components/HeaderMenu";
import SiteFooter from "@/components/SiteFooter";

const BENEFIT_POINTS = [
  "Et første, hurtigt overblik over governance, beredskab og adgangsstyring.",
  "Et fælles beslutningsgrundlag for ledelse, IT og sikkerhedsansvarlige.",
  "Et enkel model til rådgivning, teknologi og intern prioritering.",
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Svar på 10 spørgsmål",
    text: "Formatet er enkelt nok til at kunne bruges af både ledelse og IT uden forberedelse.",
  },
  {
    step: "02",
    title: "Få en vægtet vurdering",
    text: "Risikovurdering, incident response og MFA vægtes højere for at give et mere realistisk billede.",
  },
  {
    step: "03",
    title: "Se de største mangler",
    text: "Resultatet peger på de områder hvor organisationen typisk bør begynde.",
  },
  {
    step: "04",
    title: "Brug det som beslutningsgrundlag",
    text: "Scoren er ikke målet i sig selv, men et mere konkret grundlag for næste prioritering.",
  },
] as const;

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  text: string;
  inverse?: boolean;
};

function SectionHeading({
  eyebrow,
  title,
  text,
  inverse = false,
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <p
        className={`text-[0.68rem] font-semibold uppercase tracking-[0.28em] ${
          inverse ? "text-[#b9d0c2]" : "text-[#4c655d]"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-4 max-w-4xl font-display text-[2.7rem] leading-none md:text-[3.45rem] ${
          inverse ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-4 max-w-2xl text-base leading-7 ${inverse ? "text-white/76" : "text-soft"}`}
      >
        {text}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="bg-page text-ink">
      <section className="bg-sage text-white">
        <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-6 py-7">
            <BrandWordmark inverse />
            <HeaderMenu inverse />
          </header>

          <div className="grid gap-12 pb-18 pt-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pb-22">
            <div className="max-w-3xl">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[#b9d0c2]">
                NIS2 readiness screening
              </p>
              <h1 className="mt-7 max-w-4xl font-display text-[3.55rem] leading-none text-white md:text-[4.85rem]">
                Test virksomhedens NIS2 niveau
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 md:text-lg">
                Få en kort og vægtet vurdering af hvor virksomheden står nu,
                hvilke områder der bør prioriteres først, og hvor næste
                drøftelse bør begynde.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/scan"
                  className="inline-flex items-center gap-2 border border-[#d8ddd2] bg-white px-7 py-4 text-sm font-semibold !text-[#073832] transition hover:bg-[#f2eee6]"
                >
                  <svg
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    className="h-4 w-4 fill-current"
                  >
                    <path d="M4 2.75v10.5L12.5 8 4 2.75Z" />
                  </svg>
                  Start screening
                </Link>
                <a
                  href="#hvordan"
                  className="inline-flex border border-white/18 bg-transparent px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/6"
                >
                  Læs hvordan det virker
                </a>
                <Link
                  href="/scan?random=1"
                  className="inline-flex items-center border border-white/18 bg-transparent px-7 py-4 text-sm font-semibold text-white/82 transition hover:bg-white/6 hover:text-white"
                >
                  Test tilfældigt resultat
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap gap-6 text-sm text-white/66">
                <span>10 spørgsmål</span>
                <span>2-3 minutter</span>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="overflow-hidden border border-white/10 bg-[#0d2d28]">
                <div className="aspect-[4/5]">
                  <Image
                    src="/pic7.jpg"
                    alt="Bygninger set nedefra, brugt som hero-billede for ComplyCheck."
                    width={1000}
                    height={666}
                    priority
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-paper px-6 py-18 md:px-8 md:py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.86fr_1.14fr]">
          <SectionHeading
            eyebrow="Overblik"
            title="Et struktureret udgangspunkt for næste prioritering."
            text="Formålet er ikke at erstatte et større compliance-program. Formålet er at skabe et nøgternt udgangspunkt, som organisationen kan arbejde videre fra."
          />

          <div className="grid gap-4 md:grid-cols-3">
            {BENEFIT_POINTS.map((item) => (
              <article
                key={item}
                className="border border-line bg-white px-5 py-6 shadow-[var(--shadow)]"
              >
                <p className="text-base leading-7 text-soft">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="hvordan" className="px-6 py-18 md:px-8 md:py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr]">
          <SectionHeading
            eyebrow="Sådan virker det"
            title="En kort screening med et tydeligt beslutningsgrundlag."
            text="Screeningen er bygget til at give et første, brugbart billede af modenhed, ikke en overfladisk quiz eller et tungt værktøj."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {HOW_IT_WORKS.map((item) => (
              <article
                key={item.step}
                className="border border-line bg-white p-6 shadow-[var(--shadow)]"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                  {item.step}
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-soft">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
