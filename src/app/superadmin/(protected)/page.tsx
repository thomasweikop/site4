import type { Metadata } from "next";
import { getSuperadminOverview } from "@/lib/superadminStore";

export const metadata: Metadata = {
  title: "Superadmin | ComplyCheck",
  description: "Overblik over ComplyCheck superadmin.",
};

const CARDS = [
  {
    key: "logCount",
    label: "Log",
    copy: "Hændelser fra brugere og superadmin på tværs af flow og redigeringer.",
  },
  {
    key: "vendorCount",
    label: "Specialister",
    copy: "Profiler i specialistdatabasen som kan søges, justeres og vedligeholdes.",
  },
  {
    key: "userCount",
    label: "Brugere",
    copy: "Indsendte kontaktoplysninger og eksisterende leads fra sessions.",
  },
  {
    key: "questionCount",
    label: "Spørgsmål",
    copy: "Spørgsmål, kategorier og anbefalingstekster i screeningflowet.",
  },
  {
    key: "adminCount",
    label: "Admin",
    copy: "Superadmin-brugere med adgang til backoffice.",
  },
] as const;

export default async function SuperadminOverviewPage() {
  const overview = await getSuperadminOverview();

  return (
    <div className="space-y-8">
      <section className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.74rem] font-semibold uppercase tracking-[0.26em] text-[#697b9e]">
          ComplyCheck superadmin
        </p>
        <h1 className="mt-4 text-balance font-display text-[3.3rem] leading-[0.92] text-ink">
          Overblik og administration
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-soft">
          Arbejd i samme backoffice-layout på tværs af log, specialister,
          brugere, spørgsmål, scoring og admin-adgang uden at skifte kontekst.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {CARDS.map((card) => (
          <article
            key={card.key}
            className="border border-line bg-white p-8 shadow-[var(--shadow)]"
          >
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.26em] text-[#697b9e]">
              {card.label}
            </p>
            <p className="mt-4 text-5xl font-semibold tracking-[-0.04em] text-[#050a1f]">
              {overview[card.key]}
            </p>
            <p className="mt-4 max-w-md text-sm leading-6 text-soft">
              {card.copy}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
