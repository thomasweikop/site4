import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import BrandWordmark from "@/components/BrandWordmark";
import ScanExperience from "./ScanExperience";

export const metadata: Metadata = {
  title: "Start NIS2 Scan | ComplyCheck",
  description:
    "Svar på 10 spørgsmål og få en vægtet NIS2-score med de største gaps og næste anbefalede skridt.",
};

export default function ScanPage() {
  return (
    <main className="overflow-hidden bg-page text-ink">
      <section className="relative overflow-hidden bg-sage">
        <Image
          src="/pic7.jpg"
          alt="Hero-baggrund for scan-flowet."
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,12,25,0.42),rgba(7,12,25,0.86))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,170,125,0.18),transparent_24%),radial-gradient(circle_at_76%_16%,rgba(111,199,255,0.14),transparent_22%)]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-32 pt-6 md:px-8 lg:px-10">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-[1.6rem] border border-white/10 bg-white/10 px-4 py-3 text-white shadow-[0_24px_70px_rgba(5,9,20,0.24)] backdrop-blur-md">
            <BrandWordmark inverse />

            <div className="hidden items-center gap-7 text-sm font-semibold text-white/78 md:flex">
              <Link href="/" className="transition hover:text-white">
                Forside
              </Link>
              <span className="rounded-full bg-white px-4 py-2 text-[#081122]">
                Scan
              </span>
            </div>

            <Link
              href="/"
              className="inline-flex rounded-full border border-white/14 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/16"
            >
              Tilbage
            </Link>
          </div>

          <div className="mx-auto mt-18 max-w-4xl py-10 text-center text-white md:mt-20 md:py-14">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-white/74">
              Gratis NIS2 compliance scan
            </p>
            <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-[-0.05em] text-white md:text-6xl">
              Svar på 10 spørgsmål og få jeres første NIS2-score.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/80 md:text-xl">
              Formatet er simpelt, men scoren er vægtet, så I hurtigt kan se
              hvor risikoen er størst, og hvilke næste skridt der bør komme
              først.
            </p>

          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-16 px-6 pb-20 md:px-8 md:pb-24 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ScanExperience />
        </div>
      </section>
    </main>
  );
}
