import Image from "next/image";
import Link from "next/link";
import {
  ANSWER_OPTIONS,
  SCAN_QUESTIONS,
  SCORE_BANDS,
  SCORE_RULES,
  WEIGHTED_TOPICS,
} from "@/lib/nis2Scan";
import Nis2LeadForm from "./Nis2LeadForm";

const HERO_PILLS = [
  "2-3 minutter",
  "10 spørgsmål",
  "Score + gaps + næste skridt",
];

const BENEFIT_POINTS = [
  "Få et hurtigt første billede af hvor I står på NIS2.",
  "Se hvor governance, beredskab og adgangsstyring halter mest.",
  "Skab et bedre grundlag for at prioritere rådgivning, teknologi og budget.",
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Svar på 10 spørgsmål",
    text: "Formatet er hurtigt og bevidst enkelt, så ledelse og IT kan gennemføre uden forberedelse.",
  },
  {
    step: "02",
    title: "Få en vægtet score",
    text: "Risikovurdering, incident response og MFA tæller mere, så resultatet føles mere realistisk.",
  },
  {
    step: "03",
    title: "Se de største gaps",
    text: "I får et første billede af hvilke kontroller der bør prioriteres før resten.",
  },
  {
    step: "04",
    title: "Brug det som næste skridt",
    text: "Resultatet bliver et mere konkret afsæt for rådgivning, implementering eller intern prioritering.",
  },
];

const REPORT_PREVIEW = [
  "Score med tydelig status og risikoniveau.",
  "Gap-analyse på de vigtigste mangler.",
  "Kort forklaring af hvad resultatet betyder i praksis.",
  "Forslag til første handlingspunkter og næste skridt.",
];

const TARGET_SEGMENTS = [
  "Virksomheder med 50-500 ansatte, hvor presset fra NIS2 allerede er mærkbart.",
  "Brancher som energi, transport, sundhed, finans/fintech og SaaS/IT.",
  "CFO, IT-chef, CISO eller COO som skal forstå risiko, indsats og budget hurtigt.",
  "Teams der mangler et første beslutningsgrundlag før de køber rådgivning eller teknologi.",
];

const FAQ_ITEMS = [
  {
    question: "Er det her en juridisk afgørelse af om vi er omfattet?",
    answer:
      "Nej. Scanen er et hurtigt modenheds- og gap-billede, som hjælper jer med at forstå hvor I bør starte. Den erstatter ikke en egentlig juridisk vurdering.",
  },
  {
    question: "Hvor lang tid tager scanen?",
    answer:
      "Målet er 2-3 minutter. Formatet er holdt simpelt med Ja, Delvist og Nej, så den er realistisk at gennemføre for travle ledere og IT-ansvarlige.",
  },
  {
    question: "Hvad får vi ud af resultatet?",
    answer:
      "I får en vægtet score, jeres største gaps og de første anbefalede næste skridt, så resultatet kan bruges som et konkret næste arbejdsdokument.",
  },
];

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
        className={`text-xs font-extrabold uppercase tracking-[0.28em] ${
          inverse ? "text-[#9bd1ff]" : "text-ember"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-4 max-w-4xl text-balance text-4xl font-extrabold tracking-[-0.04em] md:text-6xl ${
          inverse ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-5 max-w-2xl text-lg leading-8 ${
          inverse ? "text-white/74" : "text-soft"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="overflow-hidden bg-page text-ink">
      <section className="relative min-h-[94svh] overflow-hidden border-b border-white/10 bg-sage">
        <Image
          src="/pic7.jpg"
          alt="Hero-billede for Weikop NIS2 scan."
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,12,25,0.34),rgba(7,12,25,0.86))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,170,125,0.22),transparent_26%),radial-gradient(circle_at_78%_20%,rgba(111,199,255,0.16),transparent_24%)]" />

        <div className="relative mx-auto flex min-h-[94svh] max-w-7xl flex-col px-6 pb-12 pt-6 md:px-8 lg:px-10">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-[1.6rem] border border-white/10 bg-white/10 px-4 py-3 text-white shadow-[0_24px_70px_rgba(5,9,20,0.24)] backdrop-blur-md">
            <Link
              href="/"
              className="text-sm font-extrabold uppercase tracking-[0.28em] text-white"
            >
              WEIKOP
            </Link>

            <div className="hidden items-center gap-7 text-sm font-semibold text-white/78 md:flex">
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
            </div>

            <Link
              href="/scan"
              className="inline-flex rounded-full bg-ember px-5 py-2.5 text-sm font-extrabold text-[#081122] transition hover:bg-[#8cd8ff]"
            >
              Start nu
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center py-16">
            <div className="mx-auto max-w-5xl text-center text-white">
              <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-white/74">
                MVP: gratis NIS2 compliance scan
              </p>
              <h1 className="mx-auto mt-8 max-w-5xl text-balance text-5xl font-extrabold tracking-[-0.05em] text-white [text-shadow:0_18px_48px_rgba(5,8,18,0.42)] md:text-7xl lg:text-[5.5rem]">
                Er din virksomhed klar til NIS2?
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/82 md:text-2xl md:leading-9">
                Få et hurtigt første billede af hvor tæt I er på NIS2, hvad der
                mangler, og hvilke næste skridt der giver mest mening først.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/scan"
                  className="inline-flex rounded-full bg-ember px-8 py-4 text-base font-extrabold text-[#081122] transition hover:bg-[#8cd8ff]"
                >
                  Start gratis scan
                </Link>
                <a
                  href="#spoergsmaal"
                  className="inline-flex rounded-full border border-white/18 bg-white/10 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/16"
                >
                  Se de 10 spørgsmål
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                {HERO_PILLS.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sage px-6 py-18 text-white md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <SectionHeading
            eyebrow="Hvorfor det virker"
            title="Et roligere og stærkere udgangspunkt for jeres NIS2-arbejde."
            text="Når kravene føles tunge og uklare, er det første behov sjældent en stor platform. Det er et hurtigt, troværdigt overblik som kan samle ledelse, IT og drift om de næste beslutninger."
            inverse
          />

          <div className="grid gap-4">
            {BENEFIT_POINTS.map((item) => (
              <div
                key={item}
                className="flex items-start gap-4 rounded-[1.8rem] border border-white/10 bg-white/8 px-5 py-5 shadow-[0_24px_70px_rgba(5,9,20,0.18)]"
              >
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/14 text-sm text-[#9bd1ff]">
                  ✓
                </span>
                <p className="text-base leading-7 text-white/82">{item}</p>
              </div>
            ))}

            <div className="grid gap-4 md:grid-cols-3">
              {TARGET_SEGMENTS.slice(0, 3).map((item) => (
                <article
                  key={item}
                  className="rounded-[1.8rem] border border-white/10 bg-[#10192e] p-5"
                >
                  <p className="text-sm leading-6 text-white/72">{item}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="hvordan" className="px-6 py-18 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Sådan virker det"
              title="Scanningen er bygget som en hurtig first step, ikke som tung compliance-software."
              text="I får den samme rolige, enkle oplevelse hele vejen: spørgsmål, score, gaps og et næste skridt der faktisk kan bruges bagefter."
            />

            <div className="mt-8 grid gap-4">
              {HOW_IT_WORKS.map((item) => (
                <article
                  key={item.step}
                  className="rounded-[2rem] border border-line bg-white/88 p-6 shadow-[var(--shadow)]"
                >
                  <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-ember">
                    {item.step}
                  </p>
                  <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-soft">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2.3rem] border border-line bg-white/92 p-6 shadow-[var(--shadow)] md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-ember">
                  Scan preview
                </p>
                <h3 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-ink">
                  Sådan føles MVP&apos;en
                </h3>
              </div>
              <div className="rounded-full border border-line bg-[#f4f7fb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-soft">
                Spørgsmål 7 / 10
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] bg-sage p-6 text-white">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#9bd1ff]">
                Live eksempel
              </p>
              <h4 className="mt-3 max-w-lg text-3xl font-extrabold tracking-[-0.04em] text-white">
                Bruger I MFA på kritiske systemer og administrative konti?
              </h4>

              <div className="mt-6 grid gap-3">
                {ANSWER_OPTIONS.map((answer) => (
                  <div
                    key={answer.value}
                    className="rounded-[1.2rem] border border-white/10 bg-white/7 px-4 py-4 text-sm font-semibold text-white/85"
                  >
                    {answer.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[1.8rem] border border-line bg-[#f4f7fb] p-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ember">
                    Eksempel på output
                  </p>
                  <p className="mt-2 text-5xl font-black tracking-[-0.05em] text-ink">
                    62%
                  </p>
                </div>
                <div className="rounded-full border border-[#dfc58e] bg-[#f4ead2] px-4 py-2 text-sm font-semibold text-[#6b4e1d]">
                  Delvist compliant
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#dbe5f0]">
                <div className="h-full w-[62%] rounded-full bg-ember" />
              </div>

              <div className="mt-5 grid gap-3">
                {REPORT_PREVIEW.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.2rem] border border-line bg-white px-4 py-3 text-sm leading-6 text-soft"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="spoergsmaal"
        className="px-6 pb-18 md:px-8 md:pb-24 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="De 10 spørgsmål"
            title="Spørgsmålene er korte, realistiske og lette at svare på."
            text="Vi starter med de emner der giver mest signal i et første scan: governance, risiko, incident response, adgang, leverandører og test."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {SCAN_QUESTIONS.map((item) => (
              <article
                key={item.id}
                className="rounded-[2rem] border border-line bg-white/90 p-5 shadow-[var(--shadow)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ember">
                      {item.category}
                    </p>
                    <h3 className="mt-2 text-lg font-extrabold leading-7 tracking-[-0.02em] text-ink">
                      {item.question}
                    </h3>
                  </div>
                  <div className="rounded-full border border-line bg-[#f4f7fb] px-3 py-1 text-xs font-semibold text-soft">
                    {item.id}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {ANSWER_OPTIONS.map((answer) => (
                    <span
                      key={answer.value}
                      className="rounded-full border border-line bg-[#f4f7fb] px-4 py-2 text-sm font-semibold text-soft"
                    >
                      {answer.label}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="score" className="px-6 pb-18 md:px-8 md:pb-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Scoremodel"
            title="Simpel nok til en MVP. Stærk nok til at føles troværdig."
            text="Pointmodellen er let at forstå, men nogle områder tæller mere, så outputtet føles mere realistisk end en flad ja/nej-quiz."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[2.1rem] border border-line bg-white/92 p-6 shadow-[var(--shadow)]">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-ember">
                Point pr. svar
              </p>
              <div className="mt-5 grid gap-3">
                {SCORE_RULES.map((rule) => (
                  <div
                    key={rule.label}
                    className="rounded-[1.5rem] border border-line bg-[#f4f7fb] px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-base font-extrabold text-ink">
                        {rule.label}
                      </p>
                      <p className="text-sm font-semibold text-ember">
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

            <div className="grid gap-6">
              <div className="rounded-[2.1rem] border border-line bg-white/92 p-6 shadow-[var(--shadow)]">
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-ember">
                  Score-bånd
                </p>
                <div className="mt-5 grid gap-3">
                  {SCORE_BANDS.map((band) => (
                    <div
                      key={band.range}
                      className={`rounded-[1.5rem] border px-4 py-4 ${band.className}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-lg font-extrabold">{band.range}</p>
                        <div className="flex flex-wrap gap-2 text-sm font-semibold">
                          <span>{band.status}</span>
                          <span>/</span>
                          <span>{band.risk}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2.1rem] border border-line bg-white/92 p-6 shadow-[var(--shadow)]">
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-ember">
                  Vægtede spørgsmål
                </p>
                <div className="mt-5 grid gap-3">
                  {WEIGHTED_TOPICS.map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.4rem] border border-line bg-[#f4f7fb] px-4 py-4 text-sm leading-6 text-soft"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="kontakt" className="px-6 pb-22 md:px-8 md:pb-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.86fr_1.14fr]">
          <div>
            <SectionHeading
              eyebrow="Kontakt"
              title="Når scoren peger på gaps, er næste skridt at få dem lukket i den rigtige rækkefølge."
              text="Brug formularen hvis du vil have hjælp til at omsætte scanen til rådgivning, teknologi eller en mere konkret handlingsplan."
            />

            <div className="mt-8 rounded-[2rem] border border-line bg-white/92 p-6 shadow-[var(--shadow)]">
              <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-ember">
                Hvem det er til
              </p>
              <div className="mt-4 grid gap-3">
                {TARGET_SEGMENTS.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.4rem] border border-line bg-[#f4f7fb] px-4 py-4 text-sm leading-6 text-soft"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-3">
              {FAQ_ITEMS.map((item) => (
                <div
                  key={item.question}
                  className="rounded-[1.8rem] border border-line bg-white/92 p-5 shadow-[var(--shadow)]"
                >
                  <p className="text-base font-extrabold tracking-[-0.02em] text-ink">
                    {item.question}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-soft">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Nis2LeadForm
            sourceTag="NIS2 landing lead"
            description="Skriv kort hvor I står, og hvad I gerne vil have afklaret efter scanen. Vi bruger det til at vende tilbage med et mere konkret næste skridt."
          />
        </div>
      </section>
    </main>
  );
}
