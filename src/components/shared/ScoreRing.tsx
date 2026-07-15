const R = 22;
const CIRCUMFERENCE = 2 * Math.PI * R;
export function ScoreRing({ score }: { score: number }) {
  const ringClass = score >= 8 ? 'stroke-bull' : score >= 5 ? 'stroke-system-amber' : 'stroke-bear';
  const offset = CIRCUMFERENCE * (1 - Math.min(Math.max(score, 0), 9) / 9);
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
        <circle cx="28" cy="28" r={R} strokeWidth="4" fill="none" className="stroke-white/5" />
        <circle
          cx="28" cy="28" r={R} strokeWidth="4" fill="none" strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={`${ringClass} transition-all duration-500 ease-out-expo`}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-telemetry text-lg font-bold text-white">
        {score}
      </span>
    </div>
  );
}
