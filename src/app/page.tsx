import Link from "next/link";
import Nis2LeadForm from "./Nis2LeadForm";

const DELIVERY_CARDS = [
  {
    eyebrow: "Scope",
    title: "Afklaring af omfang og ansvar",
    text: "Vi hjælper jer med at få styr på hvilke enheder, systemer, leverandører og ledelsesbeslutninger der faktisk skal med i NIS2-arbejdet.",
  },
  {
    eyebrow: "Gap-analyse",
    title: "Fra diffuse krav til konkret prioritering",
    text: "I får en praktisk gennemgang af hvor I står nu, hvad der mangler, og hvad der bør løses først for at reducere reel risiko.",
  },
  {
    eyebrow: "Roadmap",
    title: "En plan der kan eksekveres",
    text: "Vi omsætter kravene til et roadmap med ansvar, rækkefølge og realistiske næste skridt for både ledelse og drift.",
  },
];

const OFFER_ITEMS = [
  "Ledelsesbriefing og beslutningsoplæg",
  "NIS2 scope-afklaring og modenhedsbillede",
  "Gapanalyse på processer, leverandører og beredskab",
  "Prioriteret handlingsplan for de næste 30, 60 og 90 dage",
  "Sparring på politikker, hændelser og dokumentation",
  "Praktisk hjælp til at komme fra compliance-snak til reel gennemførsel",
];

const TARGET_GROUPS = [
  "Virksomheder der tror de kan være omfattet, men mangler overblik",
  "Ledelser der vil have et klart billede af ansvar, risiko og næste beslutning",
  "IT- og sikkerhedsansvarlige der mangler struktur, prioritering og et realistisk roadmap",
  "Organisationer der vil være klar før kunder, bestyrelse eller revisor begynder at presse på",
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Kort afklaringsmøde",
    text: "Vi afklarer hurtigt jeres situation, modenhed og hvad der haster mest.",
  },
  {
    step: "02",
    title: "Analyse af nuværende setup",
    text: "Vi gennemgår organisation, systemlandskab, leverandører og de vigtigste governance-punkter.",
  },
  {
    step: "03",
    title: "Prioriteret leverance",
    text: "I får et konkret output der kan bruges med det samme, ikke bare generel rådgivning.",
  },
  {
    step: "04",
    title: "Videre eksekvering",
    text: "Vi kan enten overlade planen til jer eller hjælpe videre med de næste arbejdspakker.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Kan I afgøre om vi er omfattet?",
    answer:
      "Vi kan hjælpe jer med en praktisk scope-afklaring og pege på de vigtigste forhold der bør vurderes. Den endelige juridiske vurdering bør altid forankres rigtigt hos jer.",
  },
  {
    question: "Er det her kun for store virksomheder?",
    answer:
      "Nej. Mange mellemstore virksomheder bliver ramt indirekte gennem kunder, leverandørkrav, bestyrelse eller kontrakter længe før de føler sig helt klar.",
  },
  {
    question: "Kan I hjælpe uden at overtage det hele?",
    answer:
      "Ja. Vi kan både lave et afklaringsforløb, en målrettet gapanalyse eller hjælpe på de dele hvor jeres team mangler fart og struktur.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">{text}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),transparent_26%),radial-gradient(circle_at_80%_20%,_rgba(59,130,246,0.18),transparent_20%),linear-gradient(180deg,#020617,#0f172a)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/50 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 pb-18 pt-8 md:px-8 md:pb-24 lg:px-10 lg:pt-10">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-lg font-black tracking-[0.18em] text-white">
              WEIKOP NIS2
            </Link>
            <div className="hidden items-center gap-6 text-sm font-semibold text-slate-300 md:flex">
              <a href="#ydelser" className="transition hover:text-white">
                Ydelser
              </a>
              <a href="#proces" className="transition hover:text-white">
                Proces
              </a>
              <a href="#kontakt" className="transition hover:text-white">
                Kontakt
              </a>
            </div>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-300">
                Praktisk NIS2-rådgivning
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight text-white md:text-7xl">
                Få styr på NIS2 uden at drukne i compliance-støj.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                Vi hjælper jer med at afklare scope, lukke de vigtigste gaps og få en plan der kan
                bruges i drift, ledelse og bestyrelse. Kort sagt: mindre usikkerhed, bedre
                prioritering og hurtigere fremdrift.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
                <span className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-slate-200">
                  Ledelsesbriefing
                </span>
                <span className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-slate-200">
                  Gap-analyse
                </span>
                <span className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-slate-200">
                  Roadmap og prioritering
                </span>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#kontakt"
                  className="inline-flex rounded-full bg-sky-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-200"
                >
                  Book afklaringsmøde
                </a>
                <a
                  href="#ydelser"
                  className="inline-flex rounded-full border border-white/12 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
                >
                  Se hvad vi hjælper med
                </a>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[30px] border border-white/12 bg-white/6 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.32)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
                  Hurtigt overblik
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-950/55 p-4">
                    <p className="text-sm font-semibold text-white">Ledelse</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Hvad er jeres ansvar, og hvilke beslutninger bør træffes først?
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-950/55 p-4">
                    <p className="text-sm font-semibold text-white">Drift</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Hvilke processer, leverandører og sikkerhedsgaps skaber størst risiko nu?
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-950/55 p-4 sm:col-span-2">
                    <p className="text-sm font-semibold text-white">Leverance</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      En prioriteret plan, ikke bare et langt dokument. I får noget der kan bruges i
                      næste møde, næste sprint og næste ledelsesbeslutning.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-sky-300/25 bg-sky-300/10 p-5 shadow-[0_24px_80px_rgba(56,189,248,0.14)]">
                <p className="text-sm font-semibold text-white">Typisk første leverance</p>
                <ul className="mt-4 grid gap-3 text-sm text-slate-100">
                  <li className="rounded-2xl bg-slate-950/40 px-4 py-3">
                    Scope og ansvar på én side
                  </li>
                  <li className="rounded-2xl bg-slate-950/40 px-4 py-3">
                    Top-10 gaps med prioritering
                  </li>
                  <li className="rounded-2xl bg-slate-950/40 px-4 py-3">
                    30/60/90-dages roadmap
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="ydelser" className="px-6 py-18 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Ydelser"
            title="Det her hjælper vi jer med først."
            text="Vi fokuserer på det der skaber ro, beslutningskraft og reel fremdrift. Ikke på at producere mest mulig dokumentation for dokumentationens skyld."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {DELIVERY_CARDS.map((card) => (
              <article
                key={card.title}
                className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.16)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                  {card.eyebrow}
                </p>
                <h3 className="mt-3 text-2xl font-bold text-white">{card.title}</h3>
                <p className="mt-4 text-base leading-7 text-slate-300">{card.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.04] p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                  Leverancer
                </p>
                <h3 className="mt-3 text-3xl font-black tracking-tight text-white">
                  Praktiske outputs I faktisk kan bruge.
                </h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {OFFER_ITEMS.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4 text-sm font-semibold text-slate-100"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-white/[0.03] px-6 py-18 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow="Typisk kunde"
            title="Godt match hvis I mangler klarhed og tempo."
            text="NIS2-arbejdet går ofte i stå mellem ledelse, IT, sikkerhed og drift. Vi hjælper når der er brug for struktur, prioritering og en tydelig næste beslutning."
          />

          <div className="grid gap-3">
            {TARGET_GROUPS.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/8 bg-slate-950/50 px-5 py-4 text-base leading-7 text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="proces" className="px-6 py-18 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Proces"
            title="Et forløb der skaber fremdrift fra første uge."
            text="Vi holder det enkelt: afklar, analysér, prioriter, eksekvér. Det gør det lettere at få både ledelse og organisation med."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            {PROCESS_STEPS.map((step) => (
              <article
                key={step.step}
                className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.14)]"
              >
                <p className="text-sm font-semibold text-sky-300">{step.step}</p>
                <h3 className="mt-4 text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="kontakt" className="border-t border-white/8 px-6 py-18 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading
              eyebrow="Kontakt"
              title="Book en kort NIS2-afklaring."
              text="Fortæl kort hvor I står, så vender vi tilbage med et konkret forslag til næste skridt. Første samtale bruges på afklaring, ikke på generisk salgssnak."
            />

            <div className="mt-8 grid gap-3">
              {FAQ_ITEMS.map((item) => (
                <div
                  key={item.question}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <p className="text-base font-semibold text-white">{item.question}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <Nis2LeadForm />
        </div>
      </section>
    </main>
  );
}
