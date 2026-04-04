import Link from "next/link";

type BrandWordmarkProps = {
  href?: string;
  inverse?: boolean;
};

function ComplyCheckMark() {
  return (
    <svg
      viewBox="0 0 72 72"
      className="h-12 w-12 shrink-0 overflow-hidden rounded-[0.35rem] border border-[#d6ddd5] bg-white p-[4px]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="complycheck-shield" x1="10" y1="10" x2="60" y2="60">
          <stop offset="0%" stopColor="#3f7448" />
          <stop offset="100%" stopColor="#184d27" />
        </linearGradient>
        <filter id="complycheck-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.2" floodColor="#0d2e17" floodOpacity="0.24" />
        </filter>
      </defs>

      <path
        d="M36 5C48 8 56 12 62 16V34C62 49 51.4 60.8 36 67C20.6 60.8 10 49 10 34V16C16 12 24 8 36 5Z"
        fill="url(#complycheck-shield)"
      />

      <path
        d="M25 37.5L33 45.5L49.5 27.5"
        fill="none"
        stroke="#0e3118"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.18"
        filter="url(#complycheck-shadow)"
      />
      <path
        d="M24 36L32.5 44.5L49 28"
        fill="none"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BrandWordmark({
  href = "/",
  inverse = false,
}: BrandWordmarkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-3"
      aria-label="ComplyCheck NIS2"
    >
      <ComplyCheckMark />
      <span
        className={`text-[1.68rem] font-bold tracking-[-0.05em] ${
          inverse ? "text-white" : "text-ink"
        }`}
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
      >
        ComplyCheck
      </span>
    </Link>
  );
}
