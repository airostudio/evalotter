export function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Score ${score} out of 100`}>
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="#20293d" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#scoreGradient)"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
      />
      <defs>
        <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c5cff" />
          <stop offset="100%" stopColor="#5ce1e6" />
        </linearGradient>
      </defs>
      <text x="50%" y="48%" textAnchor="middle" className="fill-paper-100" fontSize={size * 0.26} fontWeight={600}>
        {Math.round(score)}
      </text>
      <text x="50%" y="66%" textAnchor="middle" className="fill-paper-100" fontSize={size * 0.09} opacity={0.5}>
        / 100
      </text>
    </svg>
  );
}
