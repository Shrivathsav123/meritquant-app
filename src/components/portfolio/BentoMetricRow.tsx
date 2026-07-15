import { usePortfolioStore } from '../../store/usePortfolioStore';
import { selectWinRate, selectBestPosition } from '../../store/selectors';
import { fmtUsd } from '../../lib/format';
import type { PortfolioStore } from '../../store/types';
const METRICS: { label: string; read: (s: PortfolioStore) => string }[] = [
  { label: 'Cash',          read: (s) => fmtUsd(s.cashBalance) },
  { label: 'Positions',     read: (s) => String(s.positions.length) },
  { label: 'Win Rate',      read: (s) => `${selectWinRate(s).toFixed(0)}%` },
  { label: 'Best Position', read: (s) => selectBestPosition(s)?.ticker ?? '—' },
];
export function BentoMetricRow() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {METRICS.map(({ label, read }) => (
        <MetricCell key={label} label={label} read={read} />
      ))}
    </div>
  );
}
function MetricCell({ label, read }: (typeof METRICS)[number]) {
  const value = usePortfolioStore(read);
  return (
    <div className="glass-surface rounded-2xl px-2 py-3 text-center">
      <p className="font-interface uppercase text-[10px] tracking-wider text-system-slate">{label}</p>
      <p className="mt-1 truncate font-telemetry text-lg font-medium text-white">{value}</p>
    </div>
  );
}
