type PercentageRingProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  captionLines?: string[];
  valueScale?: number;
  showPercentSymbol?: boolean;
};

export default function PercentageRing({
  percentage,
  size = 92,
  strokeWidth = 10,
  label = "Score",
  captionLines,
  valueScale = 0.33,
  showPercentSymbol = false,
}: PercentageRingProps) {
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    circumference - (normalizedPercentage / 100) * circumference;
  const center = size / 2;
  const hasCaption = Array.isArray(captionLines) && captionLines.length > 0;
  const captionFontSize = size * 0.06;
  const captionBaseY = center + size * 0.18;

  return (
    <div
      className="inline-flex items-center justify-center"
      aria-label={`${label}: ${normalizedPercentage}%`}
      role="img"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#d8edf9"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#73acd6"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
        <text
          x="50%"
          y={hasCaption ? "44%" : "50%"}
          dominantBaseline={hasCaption ? "auto" : "middle"}
          textAnchor="middle"
          fill="#1a5148"
          fontSize={size * valueScale}
          fontWeight="700"
          style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
        >
          {showPercentSymbol ? `${normalizedPercentage}%` : normalizedPercentage}
        </text>
        {hasCaption
          ? captionLines.map((line, index) => (
              <text
                key={`${line}-${index}`}
                x="50%"
                y={captionBaseY + index * (captionFontSize + 2)}
                textAnchor="middle"
                fill="#5d6e68"
                fontSize={captionFontSize}
                fontWeight="700"
                letterSpacing="0.12em"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                {line}
              </text>
            ))
          : null}
      </svg>
    </div>
  );
}
