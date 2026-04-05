import Image from "next/image";
import Link from "next/link";
import BrandWordmark from "@/components/BrandWordmark";
import HeaderMenu from "@/components/HeaderMenu";
import SiteFooter from "@/components/SiteFooter";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Besvar 10 spørgsmål",
    text: "Svarene bygger på virksomhedens egen forståelse af nuværende setup.",
  },
  {
    step: "02",
    title: "Få en vægtet indikation",
    text: "Nogle områder tillægges større betydning for at afspejle typiske risici.",
  },
  {
    step: "03",
    title: "Se mulige mangler",
    text: "Resultatet peger på områder, hvor der kan være behov for yderligere afdækning.",
  },
  {
    step: "04",
    title: "Brug det som startpunkt",
    text: "En indledende ramme for videre dialog, prioritering og evt. ekstern rådgivning.",
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
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <SectionHeading
            eyebrow="Overblik"
            title="En første indikation - ikke en konklusion."
            text="ComplyCheck giver et hurtigt billede af virksomhedens compliance-niveau baseret på virksomhedens egne svar."
          />

          <div className="border border-line bg-white px-6 py-7 shadow-[var(--shadow)] md:px-8 md:py-8">
            <div className="max-w-3xl space-y-4 text-base leading-8 text-soft">
              <p>
                Det er ikke en analyse, revision eller vurdering foretaget af
                rådgivere.
              </p>
              <p>
                Formålet er at give en indledende indikation af, hvor
                virksomheden står - og hvor der potentielt kan være mangler.
              </p>
              <p>
                Et simpelt udgangspunkt, som kan bruges til at starte den
                videre dialog internt.
              </p>
              <p>Resultatet bør ses som en pejling, ikke en facitliste.</p>
              <p>
                Det erstatter ikke et egentligt compliance-program eller en
                dybere gennemgang.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="hvordan" className="px-6 py-18 md:px-8 md:py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr]">
          <SectionHeading
            eyebrow="Sådan virker det"
            title="10 spørgsmål. En indledende pejling."
            text="Screeningen er kort og baseret på egen vurdering. Den giver et hurtigt indtryk - ikke et fuldstændigt billede."
          />

          <div className="border border-line bg-white shadow-[var(--shadow)]">
            {HOW_IT_WORKS.map((item) => (
              <article
                key={item.step}
                className="border-b border-line px-6 py-6 last:border-b-0 md:px-8"
              >
                <div className="grid gap-4 md:grid-cols-[72px_1fr] md:items-start">
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d] md:pt-1">
                    {item.step}
                  </p>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.03em] text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-soft">
                      {item.text}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
