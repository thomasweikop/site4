import Link from "next/link";
import BrandWordmark from "@/components/BrandWordmark";

type SiteHeaderProps = {
  current?: "home" | "scan" | "about" | "partners" | "privacy";
};

export default function SiteHeader({ current }: SiteHeaderProps) {
  const items = [
    { href: "/about-nis2", label: "Om NIS2", key: "about" },
    { href: "/for-partners", label: "For partnere", key: "partners" },
    { href: "/privacy", label: "Privacy", key: "privacy" },
  ] as const;

  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-7 md:px-8 lg:px-10">
        <BrandWordmark />

        <nav className="hidden items-center gap-8 text-sm font-semibold text-ink lg:flex">
          <Link
            href="/"
            className={current === "home" ? "text-[#2a5a4f]" : "transition hover:text-[#2a5a4f]"}
          >
            Forside
          </Link>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                current === item.key
                  ? "text-[#2a5a4f]"
                  : "transition hover:text-[#2a5a4f]"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/scan"
          className="inline-flex border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#f4f0e7]"
        >
          {current === "scan" ? "Til scanen" : "Start test"}
        </Link>
      </div>
    </header>
  );
}
