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
    <main className="bg-page text-ink">
      <section className="bg-sage text-white">
        <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-6 py-7">
            <BrandWordmark inverse />

            <div className="hidden items-center gap-8 text-sm font-semibold text-white/74 lg:flex">
              <Link href="/" className="transition hover:text-white">
                Forside
              </Link>
              <span className="border border-white/16 px-4 py-2 text-white">
                Screening
              </span>
            </div>

            <Link
              href="/"
              className="inline-flex border border-white/18 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
            >
              Tilbage
            </Link>
          </header>

          <div className="grid gap-10 pb-16 pt-8 lg:grid-cols-[1fr_0.82fr] lg:items-center lg:pb-18">
            <div className="max-w-3xl">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[#b9d0c2]">
                NIS2 screening
              </p>
              <h1 className="mt-7 max-w-4xl font-display text-5xl leading-none text-white md:text-[5rem]">
                Svar på 10 spørgsmål og få et første, vægtet modenhedsbillede.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
                Formatet er kort og operativt. Formålet er at skabe et brugbart
                første overblik, som kan danne grundlag for den videre interne
                eller eksterne vurdering.
              </p>
            </div>

            <div className="overflow-hidden border border-white/10 bg-[#0d2d28]">
              <div className="aspect-[4/3]">
                <Image
                  src="/pic7.jpg"
                  alt="Bygninger set nedefra, brugt som hero-billede for screeningssiden."
                  width={1000}
                  height={666}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-14 md:px-8 md:py-16 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ScanExperience />
        </div>
      </section>
    </main>
  );
}
