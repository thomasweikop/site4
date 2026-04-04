type PercentageRingProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
};

export default function PercentageRing({
  percentage,
  size = 92,
  strokeWidth = 10,
  label = "Score",
}: PercentageRingProps) {
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    circumference - (normalizedPercentage / 100) * circumference;
  const center = size / 2;

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
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="#1a5148"
          fontSize={size * 0.23}
          fontWeight="700"
          style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
        >
          {normalizedPercentage}%
        </text>
      </svg>
    </div>
  );
}
