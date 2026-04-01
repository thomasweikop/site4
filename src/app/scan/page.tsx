import type { Metadata } from "next";
import Link from "next/link";
import ScanExperience from "./ScanExperience";

export const metadata: Metadata = {
  title: "Start NIS2 Scan | Weikop",
  description:
    "Svar på 10 spørgsmål og få en vægtet NIS2-score med de største gaps og næste anbefalede skridt.",
};

export default function ScanPage() {
  return (
    <main className="overflow-hidden bg-page text-ink">
      <section className="relative border-b border-line">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(197,93,60,0.16),transparent_28%),radial-gradient(circle_at_86%_8%,_rgba(183,138,58,0.14),transparent_18%),linear-gradient(180deg,rgba(255,250,242,0.88),rgba(239,231,219,0.48))]" />
        <div className="relative mx-auto max-w-7xl px-6 pb-18 pt-8 md:px-8 md:pb-24 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-lg font-extrabold tracking-[0.2em] text-ink">
              WEIKOP
            </Link>

            <Link href="/" className="text-sm font-semibold text-soft transition hover:text-ink">
              Tilbage til forsiden
            </Link>
          </div>

          <div className="mt-14 max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ember">
              Gratis NIS2 compliance scan
            </p>
            <h1 className="mt-6 text-balance font-display text-6xl leading-none text-ink md:text-7xl">
              Svar på 10 spørgsmål og få jeres første NIS2-score.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-soft md:text-xl">
              Formatet er simpelt, men scoren er vægtet, så I hurtigt kan se hvor risikoen er
              størst, og hvilke næste skridt der bør komme først.
            </p>

            <div className="mt-10 flex flex-wrap gap-3 text-sm font-semibold">
              <span className="rounded-full border border-line bg-white/70 px-4 py-2 text-soft">
                2-3 minutter
              </span>
              <span className="rounded-full border border-line bg-white/70 px-4 py-2 text-soft">
                Ja / Delvist / Nej
              </span>
              <span className="rounded-full border border-line bg-white/70 px-4 py-2 text-soft">
                Score + gaps + næste skridt
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-18 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <ScanExperience />
        </div>
      </section>
    </main>
  );
}
