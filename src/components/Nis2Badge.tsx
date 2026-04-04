type Nis2BadgeProps = {
  className?: string;
};

const STAR_POSITIONS = [
  [28, 8],
  [37, 11],
  [44, 18],
  [47, 28],
  [44, 38],
  [37, 45],
  [28, 48],
  [19, 45],
  [12, 38],
  [9, 28],
  [12, 18],
  [19, 11],
] as const;

export default function Nis2Badge({ className = "" }: Nis2BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-[0.4rem] border border-[#174b46] bg-[#123f41] ${className}`.trim()}
      aria-hidden="true"
    >
      <svg viewBox="0 0 56 56" className="h-full w-full">
        <rect width="56" height="56" fill="#123f41" />

        {STAR_POSITIONS.map(([x, y], index) => (
          <polygon
            key={index}
            points="0,-2.7 0.85,-0.85 2.8,-0.85 1.15,0.35 1.85,2.45 0,1.3 -1.85,2.45 -1.15,0.35 -2.8,-0.85 -0.85,-0.85"
            transform={`translate(${x} ${y})`}
            fill="white"
          />
        ))}

        <text
          x="28"
          y="33"
          fill="white"
          textAnchor="middle"
          fontSize="14"
          fontWeight="800"
          fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
        >
          NIS2
        </text>
      </svg>
    </span>
  );
}
