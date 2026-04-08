import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import Nis2LeadForm from "@/app/Nis2LeadForm";

export const metadata: Metadata = {
  title: "Kontakt | ComplyCheck",
  description:
    "Kontakt ComplyCheck om NIS2-screening, næste skridt, assessment og valg af specialister.",
};

export default function ContactPage() {
  return (
    <main className="bg-page text-ink">
      <SiteHeader />

      <section className="px-6 py-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Kontakt
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl leading-none text-ink md:text-[3.2rem]">
              Få hjælp til næste skridt
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-soft">
              Skriv kort hvad virksomheden gerne vil have afklaret. Vi kan
              hjælpe med næste vurdering, assessment og udvælgelse af relevante
              specialister.
            </p>
          </section>

          <Nis2LeadForm
            eyebrow="Kontakt"
            title="Send en besked til ComplyCheck"
            description="Udfyld formularen, så vender vi tilbage med et konkret næste skridt. Henvendelsen sendes internt til ComplyCheck."
            submitLabel="Send besked"
            successMessage="Tak. Beskeden er sendt, og vi vender tilbage hurtigst muligt."
            helperText="Kort afklaring først. Praktisk næste skridt bagefter."
            sourceTag="Public contact"
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
