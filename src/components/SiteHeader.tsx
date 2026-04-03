import Link from "next/link";
import BrandWordmark from "@/components/BrandWordmark";
import HeaderBackButton from "@/components/HeaderBackButton";

type SiteHeaderProps = {
  current?: "home" | "scan" | "about" | "partners" | "privacy" | "specialists";
};

const MENU_ITEMS = [
  {
    href: "/about-nis2",
    label: "NIS2",
  },
] as const;

export default function SiteHeader({ current }: SiteHeaderProps) {
  const showBackBar = current && current !== "home";

  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-6 md:px-8 lg:px-10">
        <BrandWordmark />

        <div className="flex items-center gap-3">
          <span className="inline-flex bg-black px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-white">
            NIS2
          </span>

          <details className="relative">
            <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center border border-line bg-white text-ink transition hover:bg-[#f4f0e7] [&::-webkit-details-marker]:hidden">
              <span className="sr-only">Åbn menu</span>
              <span className="flex flex-col gap-[4px]" aria-hidden="true">
                <span className="block h-[2px] w-5 bg-current" />
                <span className="block h-[2px] w-5 bg-current" />
                <span className="block h-[2px] w-5 bg-current" />
              </span>
            </summary>

            <div className="absolute right-0 top-[calc(100%+0.6rem)] z-20 min-w-[170px] border border-line bg-white p-2 shadow-[var(--shadow)]">
              {MENU_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </div>

      {showBackBar ? (
        <div className="bg-sage">
          <div className="mx-auto max-w-7xl px-6 py-3 md:px-8 lg:px-10">
            <HeaderBackButton />
          </div>
        </div>
      ) : null}
    </header>
  );
}
