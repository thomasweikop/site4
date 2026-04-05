type RegulationBadgeProps = {
  label?: string;
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

function getFontSize(label: string) {
  if (label.length >= 6) {
    return 10;
  }

  if (label.length >= 5) {
    return 11.5;
  }

  return 14;
}

export default function RegulationBadge({
  label = "NIS2",
  className = "",
}: RegulationBadgeProps) {
  const normalizedLabel = label.trim().toUpperCase();

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-[0.4rem] border border-[#243f74] bg-[#1a3568] ${className}`.trim()}
      aria-hidden="true"
    >
      <svg viewBox="0 0 56 56" className="h-full w-full">
        <rect width="56" height="56" fill="#1a3568" />

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
          fontSize={getFontSize(normalizedLabel)}
          fontWeight="800"
          fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
          letterSpacing={normalizedLabel.length > 4 ? "0.2" : "0.4"}
        >
          {normalizedLabel}
        </text>
      </svg>
    </span>
  );
}
