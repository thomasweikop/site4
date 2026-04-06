import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Superadmin | ComplyCheck",
  description: "Overblik over ComplyCheck superadmin.",
};

const CARDS = [
  {
    href: "/superadmin/log",
    label: "Log",
    copy: "Hændelser fra brugere og superadmin på tværs af flow og redigeringer.",
  },
  {
    href: "/superadmin/specialister",
    label: "Specialister",
    copy: "Profiler i specialistdatabasen som kan søges, justeres og vedligeholdes.",
  },
  {
    href: "/superadmin/logoer",
    label: "Logoer",
    copy: "Gennemgå kandidat-logoer i batches og godkend dem hurtigt til live visning.",
  },
  {
    href: "/superadmin/brugere",
    label: "Brugere",
    copy: "Indsendte kontaktoplysninger og eksisterende leads fra sessions.",
  },
  {
    href: "/superadmin/sporgsmal",
    label: "Spørgsmål",
    copy: "Spørgsmål, kategorier og anbefalingstekster i screeningflowet.",
  },
  {
    href: "/superadmin/admin",
    label: "Admin",
    copy: "Superadmin-brugere med adgang til backoffice.",
  },
] as const;

export default function SuperadminOverviewPage() {
  return (
    <div className="space-y-8">
      <section className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.26em] text-[#697b9e]">
              ComplyCheck superadmin
            </p>
            <h1 className="mt-4 text-balance font-display text-[3.3rem] leading-[0.92] text-ink">
              Overblik og administration
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-soft">
              Arbejd i samme backoffice-layout på tværs af log, specialister,
              brugere, spørgsmål, scoring og admin-adgang uden at skifte
              kontekst.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex shrink-0 items-center justify-center bg-[#050a1f] px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#101937]"
          >
            ComplyCheck Forside
          </Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="border border-line bg-white p-8 shadow-[var(--shadow)]"
          >
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.26em] text-[#697b9e]">
              {card.label}
            </p>
            <p className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#050a1f]">
              Gå til modul
            </p>
            <p className="mt-4 max-w-md text-sm leading-6 text-soft">
              {card.copy}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
