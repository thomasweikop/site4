import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy | ComplyCheck",
  description:
    "Kort beskrivelse af hvordan kontaktoplysninger og screeningsdata håndteres i ComplyCheck MVP'en.",
};

export default function PrivacyPage() {
  return (
    <main className="bg-page text-ink">
      <SiteHeader current="privacy" />

      <section className="px-6 py-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
            Privacy
          </p>
          <h1 className="mt-4 font-display text-4xl leading-none text-ink md:text-[3.2rem]">
            Hvordan data håndteres i denne MVP
          </h1>
          <div className="mt-6 grid gap-4 text-sm leading-7 text-soft">
            <p>
              Screeningssessioner gemmes lokalt i browseren i denne MVP, så
              virksomheden kan vende tilbage til rapporten på samme enhed.
            </p>
            <p>
              Når en formular sendes, bruges kontaktoplysningerne til at
              kontakte virksomheden om næste skridt og modtage den konkrete
              henvendelse på email.
            </p>
            <p>
              Screeningen er et beslutningsværktøj og ikke en juridisk
              afgørelse. Undlad derfor at indsætte følsomme personoplysninger
              eller fortrolige incident-detaljer i fritekstfelterne.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
