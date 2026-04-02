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
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-6 py-7">
            <BrandWordmark />

            <div className="hidden items-center gap-8 text-sm font-semibold text-ink lg:flex">
              <Link href="/" className="transition hover:text-[#2a5a4f]">
                Forside
              </Link>
              <span className="border border-line bg-white px-4 py-2 text-ink">
                Screening
              </span>
            </div>

            <Link
              href="/"
              className="inline-flex border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#f4f0e7]"
            >
              Tilbage
            </Link>
          </header>
        </div>
      </section>

      <section className="px-6 py-8 md:px-8 md:py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ScanExperience />
        </div>
      </section>
    </main>
  );
}
