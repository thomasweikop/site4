import Link from "next/link";

type BrandWordmarkProps = {
  href?: string;
  inverse?: boolean;
};

const STAR_POSITIONS = [
  [36, 8],
  [50, 12],
  [60, 22],
  [64, 36],
  [60, 50],
  [50, 60],
  [36, 64],
  [22, 60],
  [12, 50],
  [8, 36],
  [12, 22],
  [22, 12],
] as const;

function Nis2Mark() {
  return (
    <svg
      viewBox="0 0 72 72"
      className="h-12 w-12 shrink-0 overflow-hidden rounded-[0.35rem] border border-[#d6ddd5] bg-white"
      aria-hidden="true"
    >
      <rect width="36" height="72" fill="#0F1F73" />
      <rect x="36" width="36" height="72" fill="#203E7C" />

      {STAR_POSITIONS.map(([x, y], index) => (
        <polygon
          key={index}
          points="0,-2.8 0.9,-0.8 3,-0.8 1.2,0.4 1.9,2.7 0,1.4 -1.9,2.7 -1.2,0.4 -3,-0.8 -0.9,-0.8"
          transform={`translate(${x} ${y})`}
          fill="white"
        />
      ))}

      <text
        x="36"
        y="33"
        fill="white"
        textAnchor="middle"
        fontSize="16"
        fontWeight="800"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        NIS2
      </text>
      <text
        x="36"
        y="45"
        fill="white"
        textAnchor="middle"
        fontSize="7"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="0.6"
      >
        DIRECTIVE
      </text>
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
      aria-label="ComplyCheck"
    >
      <Nis2Mark />
      <span
        className={`text-[1.55rem] font-semibold tracking-[-0.04em] ${
          inverse ? "text-white" : "text-ink"
        }`}
      >
        ComplyCheck
      </span>
    </Link>
  );
}
