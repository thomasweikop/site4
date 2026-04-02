import Image from "next/image";
import Link from "next/link";
import {
  ANSWER_OPTIONS,
  SCAN_QUESTIONS,
  SCORE_BANDS,
  SCORE_RULES,
  WEIGHTED_TOPICS,
} from "@/lib/nis2Scan";
import BrandWordmark from "@/components/BrandWordmark";
import Nis2LeadForm from "./Nis2LeadForm";

const BENEFIT_POINTS = [
  "Et første, hurtigt overblik over governance, beredskab og adgangsstyring.",
  "Et fælles beslutningsgrundlag for ledelse, IT og sikkerhedsansvarlige.",
  "Et mere roligt næste skridt mod rådgivning, teknologi og intern prioritering.",
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
    title: "Se de største gaps",
    text: "Resultatet peger på de områder hvor organisationen typisk bør begynde.",
  },
  {
    step: "04",
    title: "Brug det som beslutningsgrundlag",
    text: "Scoren er ikke målet i sig selv, men et mere konkret grundlag for næste prioritering.",
  },
] as const;

const FAQ_ITEMS = [
  {
    question: "Er dette en juridisk afgørelse af om vi er omfattet?",
    answer:
      "Nej. Screeningen er et første modenheds- og gap-billede. Den erstatter ikke en egentlig juridisk eller regulatorisk vurdering.",
  },
  {
    question: "Hvor lang tid tager screeningen?",
    answer:
      "Målet er 2-3 minutter. Den er lavet til at kunne gennemføres hurtigt uden at organisationen først skal samle omfattende dokumentation.",
  },
  {
    question: "Hvad får vi ud af resultatet?",
    answer:
      "I får en vægtet score, de vigtigste gaps og de første anbefalede næste skridt, så resultatet kan bruges i en reel intern drøftelse.",
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
        className={`mt-4 max-w-4xl font-display text-4xl leading-none md:text-[4.2rem] ${
          inverse ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-5 max-w-2xl text-lg leading-8 ${inverse ? "text-white/76" : "text-soft"}`}
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

            <nav className="hidden items-center gap-8 text-sm font-semibold text-white/78 lg:flex">
              <a href="#hvordan" className="transition hover:text-white">
                Hvordan
              </a>
              <a href="#spoergsmaal" className="transition hover:text-white">
                Spørgsmål
              </a>
              <a href="#score" className="transition hover:text-white">
                Score
              </a>
              <a href="#kontakt" className="transition hover:text-white">
                Kontakt
              </a>
            </nav>

            <Link
              href="/scan"
              className="inline-flex border border-white/18 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
            >
              Start scan
            </Link>
          </header>

          <div className="grid gap-12 pb-18 pt-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pb-22">
            <div className="max-w-3xl">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[#b9d0c2]">
                NIS2 readiness screening
              </p>
              <h1 className="mt-8 max-w-4xl font-display text-5xl leading-none text-white md:text-[5.7rem]">
                Et mere formelt første billede af jeres NIS2-parathed.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78 md:text-xl">
                Få en kort og vægtet vurdering af hvor organisationen står nu,
                hvilke områder der bør prioriteres først, og hvor næste
                drøftelse bør begynde.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/scan"
                  className="inline-flex bg-white px-7 py-4 text-sm font-semibold text-sage transition hover:bg-[#f2eee6]"
                >
                  Start screening
                </Link>
                <a
                  href="#hvordan"
                  className="inline-flex border border-white/16 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/8"
                >
                  Læs hvordan det virker
                </a>
              </div>

              <div className="mt-12 flex flex-wrap gap-6 text-sm text-white/66">
                <span>10 spørgsmål</span>
                <span>2-3 minutter</span>
                <span>Ja / Delvist / Nej</span>
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
            title="Et mere roligt og anvendeligt udgangspunkt."
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
            title="En kort screening med et mere sobert output."
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

      <section
        id="spoergsmaal"
        className="border-y border-line bg-paper px-6 py-18 md:px-8 md:py-20 lg:px-10"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.06fr_0.94fr]">
          <div>
            <SectionHeading
              eyebrow="Screening"
              title="De 10 spørgsmål fokuserer på de områder der typisk betyder mest først."
              text="Governance, risiko, incident response, leverandører, adgang og test er valgt, fordi de giver et forholdsvis stærkt første signal."
            />

            <div className="mt-10 grid gap-4">
              {SCAN_QUESTIONS.map((item) => (
                <article
                  key={item.id}
                  className="border border-line bg-white px-5 py-5 shadow-[var(--shadow)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#4c655d]">
                        {item.category}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-ink">
                        {item.question}
                      </h3>
                    </div>
                    <div className="border border-line bg-paper px-3 py-1 text-xs font-semibold text-soft">
                      {item.id}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {ANSWER_OPTIONS.map((answer) => (
                      <span
                        key={answer.value}
                        className="border border-line bg-paper px-3 py-2 text-sm font-medium text-soft"
                      >
                        {answer.label}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div id="score" className="space-y-6">
            <div className="border border-line bg-white p-6 shadow-[var(--shadow)]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                Eksempel på output
              </p>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="font-display text-6xl leading-none text-ink">
                    62%
                  </p>
                  <p className="mt-3 text-sm text-soft">Delvist compliant</p>
                </div>
                <div className="border border-[#d2d8cb] bg-[#f2f3ee] px-4 py-2 text-sm font-medium text-ink">
                  Moderat risiko
                </div>
              </div>

              <div className="mt-6 h-2 overflow-hidden bg-[#dde5df]">
                <div className="h-full w-[62%] bg-[#2a5a4f]" />
              </div>

              <div className="mt-6 grid gap-3">
                {SCORE_BANDS.map((band) => (
                  <div
                    key={band.range}
                    className="border border-line bg-paper px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-ink">{band.range}</p>
                      <p className="text-sm text-soft">
                        {band.status} / {band.risk}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-line bg-white p-6 shadow-[var(--shadow)]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                Scoremodel
              </p>
              <div className="mt-5 grid gap-3">
                {SCORE_RULES.map((rule) => (
                  <div
                    key={rule.label}
                    className="border border-line bg-paper px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-ink">{rule.label}</p>
                      <p className="text-sm font-medium text-[#4c655d]">
                        {rule.points}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-soft">
                      {rule.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-line bg-sage px-6 py-6 text-white shadow-[var(--shadow)]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#b9d0c2]">
                Vægtning
              </p>
              <div className="mt-4 grid gap-3">
                {WEIGHTED_TOPICS.map((item) => (
                  <div
                    key={item}
                    className="border border-white/10 px-4 py-4 text-sm leading-6 text-white/78"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="kontakt" className="px-6 py-18 md:px-8 md:py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <SectionHeading
              eyebrow="Kontakt"
              title="Når resultatet peger på gaps, er næste skridt at prioritere dem roligt og i den rigtige rækkefølge."
              text="Brug formularen, hvis resultatet skal omsættes til en mere konkret drøftelse om governance, teknologi eller implementering."
            />

            <div className="mt-8 grid gap-3">
              {FAQ_ITEMS.map((item) => (
                <article
                  key={item.question}
                  className="border border-line bg-white px-5 py-5 shadow-[var(--shadow)]"
                >
                  <h3 className="text-lg font-semibold text-ink">
                    {item.question}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-soft">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <Nis2LeadForm
            sourceTag="NIS2 landing lead"
            description="Skriv kort hvor organisationen står, og hvad I gerne vil have afklaret efter screeningen. Vi bruger det til at vende tilbage med et mere konkret næste skridt."
          />
        </div>
      </section>
    </main>
  );
}
