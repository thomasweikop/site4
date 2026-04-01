import Link from "next/link";
import {
  ANSWER_OPTIONS,
  SCAN_QUESTIONS,
  SCORE_BANDS,
  SCORE_RULES,
  WEIGHTED_TOPICS,
} from "@/lib/nis2Scan";
import Nis2LeadForm from "./Nis2LeadForm";

const TRUST_POINTS = [
  {
    title: "10 spørgsmål",
    text: "Et hurtigt første billede af governance, risiko, beredskab og adgangsstyring.",
  },
  {
    title: "Ja / Delvist / Nej",
    text: "Scanningen er bygget til at være hurtig nok til travle ledere og IT-ansvarlige.",
  },
  {
    title: "Score + gap-analyse",
    text: "I får både en procent, de største mangler og de første anbefalede næste skridt.",
  },
];

const PROBLEM_POINTS = [
  {
    title: "De fleste ved ikke om de reelt er klar",
    text: "NIS2 er blevet et must-have emne, men mange virksomheder mangler stadig et hurtigt og troværdigt første overblik.",
  },
  {
    title: "Kompleksiteten gør beslutninger langsomme",
    text: "Ledelse, IT og drift taler ofte forbi hinanden, fordi kravene ikke er oversat til et konkret modenhedsbillede.",
  },
  {
    title: "Der er penge og drift på spil",
    text: "Når gaps ikke bliver synlige tidligt, vokser både regulatorisk risiko, kunde-pres og sandsynligheden for dyre fejlprioriteringer.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Svar på 10 spørgsmål",
    text: "MVP’en bruger et simpelt format med svarene Ja, Delvist eller Nej.",
  },
  {
    step: "02",
    title: "Få en vægtet score",
    text: "Alle svar tæller, men kritiske områder som risikovurdering, incident response og MFA vægtes højere.",
  },
  {
    step: "03",
    title: "Se jeres største gaps",
    text: "I får et første billede af hvor risikoen er høj, og hvilke emner der bør prioriteres først.",
  },
  {
    step: "04",
    title: "Få hjælp hvis I vil videre",
    text: "Når scanen er færdig, kan næste step være rådgivning, teknologi eller implementering.",
  },
];

const REPORT_PREVIEW = [
  {
    title: "Compliance score",
    text: "Fx 62% compliant med tydelig statusfarve og kort forklaring.",
  },
  {
    title: "Største gaps",
    text: "Fx manglende incident response plan, svag overvågning og delvis leverandørstyring.",
  },
  {
    title: "Hvad betyder det?",
    text: "En kort vurdering af drift, regulatorisk pres og sandsynlige prioriteringsfejl.",
  },
  {
    title: "Plan",
    text: "De første konkrete handlinger, fx politikker, MFA, overvågning og leverandøroverblik.",
  },
];

const TARGET_SEGMENTS = [
  "Virksomheder med 50–500 ansatte som er tæt nok på NIS2 til at mærke presset nu.",
  "Brancher som energi, transport, sundhed, finans/fintech og SaaS/IT.",
  "CFO, IT-chef, CISO eller COO som skal forstå både risiko, indsats og budget.",
  "Teams der mangler et første beslutningsgrundlag før de køber rådgivning eller teknologi.",
];

const MATCH_CATEGORIES = [
  {
    title: "Rådgivning",
    text: "Når virksomheden først skal have afklaret scope, governance og krav.",
  },
  {
    title: "Teknologi",
    text: "Når gaps peger på logging, IAM, SIEM, overvågning eller andre konkrete kontroller.",
  },
  {
    title: "Implementering",
    text: "Når der er brug for hjælp til at omsætte score og gaps til reel fremdrift.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Er scanen en juridisk afgørelse af om vi er omfattet?",
    answer:
      "Nej. MVP’en er et hurtigt modenheds- og gap-billede. Den kan pege på hvor I bør starte, men den erstatter ikke en egentlig juridisk vurdering.",
  },
  {
    question: "Hvor lang tid tager scanen?",
    answer:
      "Målet er 2–3 minutter. Formatet er bevidst enkelt, så travle ledere og IT-ansvarlige kan gennemføre den uden forberedelse.",
  },
  {
    question: "Hvad sker der efter scoren?",
    answer:
      "I får et første output med score, største gaps og anbefalede næste skridt. Derefter kan I vælge om I vil have en intro til at lukke de vigtigste huller.",
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
        className={`text-xs font-semibold uppercase tracking-[0.28em] ${
          inverse ? "text-[#e8d7b4]" : "text-ember"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-4 text-balance font-display text-4xl leading-none md:text-6xl ${
          inverse ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      <p className={`mt-5 max-w-2xl text-lg leading-8 ${inverse ? "text-white/75" : "text-soft"}`}>
        {text}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="overflow-hidden bg-page text-ink">
      <section className="relative border-b border-line">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(197,93,60,0.16),transparent_28%),radial-gradient(circle_at_86%_8%,_rgba(183,138,58,0.14),transparent_18%),linear-gradient(180deg,rgba(255,250,242,0.88),rgba(239,231,219,0.48))]" />
        <div className="absolute left-[-6rem] top-24 h-64 w-64 rounded-full bg-[rgba(197,93,60,0.12)] blur-3xl motion-safe:animate-[drift_14s_ease-in-out_infinite]" />
        <div className="absolute right-[-4rem] top-10 h-72 w-72 rounded-full bg-[rgba(183,138,58,0.12)] blur-3xl motion-safe:animate-[drift_18s_ease-in-out_infinite]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-8 lg:px-10 lg:pb-24">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-lg font-extrabold tracking-[0.2em] text-ink">
              WEIKOP
            </Link>

            <div className="hidden items-center gap-6 text-sm font-semibold text-soft md:flex">
              <a href="#hvordan" className="transition hover:text-ink">
                Hvordan
              </a>
              <a href="#spoergsmaal" className="transition hover:text-ink">
                Spørgsmål
              </a>
              <a href="#score" className="transition hover:text-ink">
                Score
              </a>
              <a href="#kontakt" className="transition hover:text-ink">
                Kontakt
              </a>
            </div>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ember">
                MVP: gratis NIS2 compliance scan
              </p>
              <h1 className="mt-6 max-w-5xl text-balance font-display text-6xl leading-none text-ink md:text-7xl lg:text-[5.45rem]">
                Er din virksomhed klar til NIS2?
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-soft md:text-xl">
                Få et hurtigt første billede af hvor tæt I er på NIS2, hvad der mangler, og hvilke
                næste skridt der giver mest mening først.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/scan"
                  className="inline-flex rounded-full bg-ember px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#a94f34]"
                >
                  Start gratis scan
                </Link>
                <a
                  href="#spoergsmaal"
                  className="inline-flex rounded-full border border-line bg-white/60 px-7 py-3 text-sm font-semibold text-ink transition hover:bg-white"
                >
                  Se de 10 spørgsmål
                </a>
              </div>

              <div className="mt-12 grid gap-4 md:grid-cols-3">
                {TRUST_POINTS.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-[1.75rem] border border-line bg-white/70 p-5 shadow-[var(--shadow)]"
                  >
                    <p className="text-sm font-bold text-ink">{item.title}</p>
                    <p className="mt-3 text-sm leading-6 text-soft">{item.text}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative lg:pt-6">
              <div className="absolute -left-4 top-16 hidden h-28 w-28 rounded-[2rem] border border-line bg-paper lg:block lg:rotate-6" />

              <div className="relative rounded-[2.2rem] border border-line bg-surface/95 p-6 shadow-[var(--shadow)] md:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ember">
                      Scan preview
                    </p>
                    <p className="mt-2 text-lg font-bold text-ink">Sådan føles MVP’en</p>
                  </div>
                  <div className="rounded-full border border-line bg-page px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-soft">
                    Spørgsmål 7 / 10
                  </div>
                </div>

                <div className="mt-6 rounded-[1.9rem] bg-sage p-6 text-white">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#e8d7b4]">
                    Live eksempel
                  </p>
                  <h3 className="mt-3 max-w-md font-display text-4xl leading-none">
                    Bruger I MFA på kritiske systemer og administrative konti?
                  </h3>

                <div className="mt-6 grid gap-3">
                    {ANSWER_OPTIONS.map((answer) => (
                      <div
                        key={answer.value}
                        className="rounded-[1.4rem] border border-white/10 bg-white/7 px-4 py-4 text-sm font-semibold text-white/85"
                      >
                        {answer.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-[1.7rem] border border-line bg-page p-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ember">
                        Eksempel på output
                      </p>
                      <p className="mt-2 text-5xl font-black tracking-tight text-ink">62%</p>
                    </div>
                    <div className="rounded-full border border-[#dfc58e] bg-[#f4ead2] px-4 py-2 text-sm font-semibold text-[#6b4e1d]">
                      Delvist compliant
                    </div>
                  </div>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e5d9c8]">
                    <div className="h-full w-[62%] rounded-full bg-ember" />
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="rounded-[1.2rem] border border-line bg-white/75 px-4 py-3 text-sm text-soft">
                      ❌ Ingen incident response plan
                    </div>
                    <div className="rounded-[1.2rem] border border-line bg-white/75 px-4 py-3 text-sm text-soft">
                      ❌ Manglende sikkerhedsovervågning
                    </div>
                    <div className="rounded-[1.2rem] border border-line bg-white/75 px-4 py-3 text-sm text-soft">
                      ⚠️ Delvis leverandørstyring
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-soft">
                  Scanen er nu klar som første MVP og bruger vægtede svar til at gøre resultatet
                  mere realistisk end en flad ja/nej-quiz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-18 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Hvorfor det virker"
            title="NIS2 er en stærk MVP, fordi efterspørgslen allerede er tvungen."
            text="Det her er interessant nu, fordi det kombinerer høj usikkerhed, høj kompleksitet og et budgetområde som virksomheder ikke kan ignorere særlig længe."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {PROBLEM_POINTS.map((item) => (
              <article
                key={item.title}
                className="rounded-[2rem] border border-line bg-white/72 p-6 shadow-[var(--shadow)]"
              >
                <h3 className="text-2xl font-bold text-ink">{item.title}</h3>
                <p className="mt-4 text-base leading-7 text-soft">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="hvordan" className="border-y border-line bg-sage px-6 py-18 text-white md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Sådan virker det"
            title="Et simpelt flow: scan, score, gaps, næste skridt."
            text="MVP’en skal ikke ligne en tung compliance-platform. Den skal hurtigt give et troværdigt første billede, som gør det nemmere at tage næste beslutning."
            inverse
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item) => (
              <article
                key={item.step}
                className="rounded-[2rem] border border-white/10 bg-white/7 p-6 shadow-[0_30px_80px_rgba(8,16,13,0.16)]"
              >
                <p className="text-sm font-semibold text-[#e8d7b4]">{item.step}</p>
                <h3 className="mt-4 text-2xl font-bold text-white">{item.title}</h3>
                <p className="mt-4 text-base leading-7 text-white/75">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="spoergsmaal" className="px-6 py-18 md:px-8 md:py-24 lg:px-10">
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
                className="rounded-[1.7rem] border border-line bg-white/72 p-5 shadow-[var(--shadow)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ember">
                      {item.category}
                    </p>
                    <h3 className="mt-2 text-lg font-bold leading-7 text-ink">{item.question}</h3>
                  </div>
                  <div className="rounded-full border border-line bg-page px-3 py-1 text-xs font-semibold text-soft">
                    {item.id}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {ANSWER_OPTIONS.map((answer) => (
                    <span
                      key={answer.value}
                      className="rounded-full border border-line bg-page px-4 py-2 text-sm font-semibold text-soft"
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

      <section id="score" className="border-y border-line bg-paper px-6 py-18 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Scoremodel"
            title="Simpel nok til en MVP. Stærk nok til at føles troværdig."
            text="Pointmodellen er let at forstå, men nogle områder tæller mere, så outputtet føles mere realistisk end en flad ja/nej-quiz."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[2rem] border border-line bg-white/80 p-6 shadow-[var(--shadow)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ember">
                Point pr. svar
              </p>
              <div className="mt-5 grid gap-3">
                {SCORE_RULES.map((rule) => (
                  <div
                    key={rule.label}
                    className="rounded-[1.4rem] border border-line bg-page px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-base font-bold text-ink">{rule.label}</p>
                      <p className="text-sm font-semibold text-ember">{rule.points}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-soft">{rule.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-[2rem] border border-line bg-white/80 p-6 shadow-[var(--shadow)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ember">
                  Score-bånd
                </p>
                <div className="mt-5 grid gap-3">
                  {SCORE_BANDS.map((band) => (
                    <div
                      key={band.range}
                      className={`rounded-[1.4rem] border px-4 py-4 ${band.className}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-lg font-bold">{band.range}</p>
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

              <div className="rounded-[2rem] border border-line bg-white/80 p-6 shadow-[var(--shadow)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ember">
                  Vægtede spørgsmål
                </p>
                <div className="mt-5 grid gap-3">
                  {WEIGHTED_TOPICS.map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.3rem] border border-line bg-page px-4 py-4 text-sm leading-6 text-soft"
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

      <section className="px-6 py-18 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <SectionHeading
              eyebrow="Output"
              title="Scoren er kun starten. Rapporten er det der konverterer."
              text="Brugeren skal ikke bare se et tal. De skal også forstå hvorfor det betyder noget, og hvad de tre vigtigste næste skridt er."
            />

            <div className="mt-8 rounded-[2rem] border border-line bg-paper p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ember">
                Eksempel
              </p>
              <p className="mt-3 max-w-xl text-balance font-display text-4xl leading-none text-ink">
                Din score: 62% compliant
              </p>
              <p className="mt-4 text-base leading-7 text-soft">
                Status: delvist compliant. Risikoen er især knyttet til beredskab, overvågning og
                leverandørstyring.
              </p>
            </div>

            <div className="mt-8 grid gap-3">
              {REPORT_PREVIEW.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.7rem] border border-line bg-white/72 p-5 shadow-[var(--shadow)]"
                >
                  <p className="text-base font-bold text-ink">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-soft">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-line bg-surface/90 p-6 shadow-[var(--shadow)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-ember">
              Hvem det er til
            </p>
            <h3 className="mt-4 text-balance font-display text-5xl leading-none text-ink">
              Bygget til virksomheder der har brug for et første beslutningsgrundlag hurtigt.
            </h3>

            <div className="mt-8 grid gap-3">
              {TARGET_SEGMENTS.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.6rem] border border-line bg-page px-5 py-4 text-base leading-7 text-soft"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[1.8rem] bg-sage p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#e8d7b4]">
                Efter scanen
              </p>
              <h4 className="mt-3 text-3xl font-bold text-white">Tre naturlige match-kategorier</h4>

              <div className="mt-5 grid gap-3">
                {MATCH_CATEGORIES.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.4rem] border border-white/10 bg-white/7 px-4 py-4"
                  >
                    <p className="text-base font-bold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/75">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="kontakt" className="border-t border-line px-6 py-18 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionHeading
              eyebrow="Kontakt"
              title="Når scoren peger på gaps, er næste skridt at få dem lukket i den rigtige rækkefølge."
              text="Brug formularen hvis du vil have hjælp til at omsætte scanen til rådgivning, teknologi eller en mere konkret handlingsplan."
            />

            <div className="mt-8 rounded-[2rem] border border-line bg-paper p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ember">
                Efter scoren
              </p>
              <p className="mt-3 max-w-xl text-balance font-display text-4xl leading-none text-ink">
                Brug resultatet som et beslutningsgrundlag, ikke bare som et tal.
              </p>
              <p className="mt-4 text-base leading-7 text-soft">
                Det bedste output opstår, når score, gaps og næste skridt bliver omsat til en reel
                prioritering for ledelse, IT og sikkerhedsansvarlige.
              </p>
            </div>

            <div className="mt-8 grid gap-3">
              {FAQ_ITEMS.map((item) => (
                <div
                  key={item.question}
                  className="rounded-[1.7rem] border border-line bg-white/70 p-5 shadow-[var(--shadow)]"
                >
                  <p className="text-base font-bold text-ink">{item.question}</p>
                  <p className="mt-3 text-sm leading-6 text-soft">{item.answer}</p>
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
