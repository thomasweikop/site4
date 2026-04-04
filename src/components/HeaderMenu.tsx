import Link from "next/link";
import Nis2Badge from "@/components/Nis2Badge";

type HeaderMenuProps = {
  inverse?: boolean;
};

const NIS2_SITE_ITEMS = [
  { href: "/", label: "Forside" },
  { href: "/#hvordan", label: "Hvordan" },
  { href: "/scan", label: "Start scan" },
  { href: "/specialists", label: "Specialister" },
  { href: "/about-nis2", label: "Om NIS2" },
  { href: "/for-partners", label: "For partnere" },
  { href: "/privacy", label: "Privacy" },
] as const;

const OTHER_SITE_ITEMS = [
  { label: "GDPR" },
  { label: "DORA" },
  { label: "AI Act" },
  { label: "CRA" },
] as const;

export default function HeaderMenu({ inverse = false }: HeaderMenuProps) {
  const summaryClassName = inverse
    ? "border border-white/18 bg-transparent text-white hover:bg-white/8"
    : "border border-line bg-white text-ink hover:bg-[#f4f0e7]";
  const panelClassName = inverse
    ? "border border-white/12 bg-[#0b2723] text-white shadow-[var(--shadow)]"
    : "border border-line bg-white text-ink shadow-[var(--shadow)]";
  const sectionLabelClassName = inverse ? "text-white/56" : "text-soft";
  const itemClassName = inverse
    ? "text-white transition hover:bg-white/6"
    : "text-ink transition hover:bg-paper";
  const placeholderClassName = inverse ? "text-white/68" : "text-soft";
  const dividerClassName = inverse ? "border-white/12" : "border-line";

  return (
    <div className="flex items-center gap-3">
      <Nis2Badge className="h-11 w-11 shrink-0" />

      <details className="group relative">
        <summary
          className={`flex h-11 w-11 cursor-pointer list-none items-center justify-center transition [&::-webkit-details-marker]:hidden ${summaryClassName}`}
        >
          <span className="sr-only">Åbn menu</span>
          <span className="flex flex-col gap-[4px]" aria-hidden="true">
            <span className="block h-[2px] w-5 bg-current" />
            <span className="block h-[2px] w-5 bg-current" />
            <span className="block h-[2px] w-5 bg-current" />
          </span>
        </summary>

        <div
          className={`absolute right-0 top-[calc(100%+0.6rem)] z-20 min-w-[240px] p-2 ${panelClassName}`}
        >
          <div className="px-3 pb-2 pt-1">
            <p
              className={`text-[0.68rem] font-semibold uppercase tracking-[0.24em] ${sectionLabelClassName}`}
            >
              ComplyCheck NIS2
            </p>
          </div>

          {NIS2_SITE_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 text-sm font-semibold ${itemClassName}`}
            >
              {item.label}
            </Link>
          ))}

          <div className={`my-2 border-t ${dividerClassName}`} />

          <div className="px-3 pb-2 pt-1">
            <p
              className={`text-[0.68rem] font-semibold uppercase tracking-[0.24em] ${sectionLabelClassName}`}
            >
              Øvrige sites
            </p>
          </div>

          {OTHER_SITE_ITEMS.map((item) => (
            <span
              key={item.label}
              className={`block px-4 py-3 text-sm font-semibold ${placeholderClassName}`}
            >
              {item.label}
            </span>
          ))}

          <div className={`my-2 border-t ${dividerClassName}`} />

          <Link
            href="/om-complycheck"
            className={`block px-4 py-3 text-sm font-semibold ${itemClassName}`}
          >
            Om ComplyCheck
          </Link>

          <Link
            href="/superadmin/login"
            className={`block px-4 py-3 text-sm font-semibold ${itemClassName}`}
          >
            Superadmin login
          </Link>
        </div>
      </details>
    </div>
  );
}
