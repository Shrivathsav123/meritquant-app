interface SparklineProps {
  data: number[];
  strokeClass?: string;
  className?: string;
}
export function Sparkline({ data, strokeClass = 'stroke-catalyst/20 stroke-2', className }: SparklineProps) {
  if (data.length < 2) return null;
  const lo = Math.min(...data);
  const span = (Math.max(...data) - lo) || 1;
  const d = data
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${((i / (data.length - 1)) * 100).toFixed(2)} ${(100 - ((v - lo) / span) * 100).toFixed(2)}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d={d} fill="none" vectorEffect="non-scaling-stroke" className={strokeClass} />
    </svg>
  );
}
