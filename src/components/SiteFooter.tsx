import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-soft md:flex-row md:items-center md:justify-between md:px-8 lg:px-10">
        <p>
          ComplyCheck giver et første modenhedsbillede,{" "}
          <a
            href="/api/public/random-analysis"
            className="underline decoration-current/30 underline-offset-2 transition hover:text-ink"
          >
            ikke
          </a>{" "}
          en juridisk afgørelse.
        </p>
        <div className="flex flex-wrap gap-5">
          <Link href="/about-nis2" className="transition hover:text-ink">
            Om NIS2
          </Link>
          <Link href="/for-partners" className="transition hover:text-ink">
            For partnere
          </Link>
          <Link href="/privacy" className="transition hover:text-ink">
            Privatliv
          </Link>
        </div>
      </div>
    </footer>
  );
}
