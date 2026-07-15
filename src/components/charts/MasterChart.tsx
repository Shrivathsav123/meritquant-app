import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { resolveProvider, type SeriesRange } from '../../services/brokerProvider';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { resample, buildPaths } from '../../lib/chart';
import { fmtUsd } from '../../lib/format';
import { TimeFilterBar } from './TimeFilterBar';
const PATH_TWEEN = { duration: 0.55, ease: [0.16, 1, 0.3, 1] } as const;
export function MasterChart() {
  const portfolioValue = usePortfolioStore((s) => s.portfolioValue);
  const [range, setRange] = useState<SeriesRange>('1D');
  const [series, setSeries] = useState<number[]>([]);
  useEffect(() => {
    let alive = true;
    resolveProvider().then((p) =>
      p.fetchEquitySeries({ userId: 'dev-user', accessToken: 'dev-token' }, range)
        .then((s) => { if (alive) setSeries(resample(s, 120)); }),
    );
    return () => { alive = false; };
  }, [range]);
  const { linePath, areaPath } = useMemo(() => buildPaths(series), [series]);
  return (
    <section className="glass-surface rounded-3xl p-4">
      <header className="flex items-baseline justify-between px-1">
        <h2 className="font-interface text-[10px] uppercase tracking-widest text-system-slate">Equity Curve</h2>
        <span className="font-telemetry text-sm font-semibold text-white">{fmtUsd(portfolioValue)}</span>
      </header>
      <svg viewBox="0 0 100 46" preserveAspectRatio="none" className="mt-2 h-44 w-full">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7A12FF" stopOpacity="0.35" />
            <stop offset="55%" stopColor="#7A12FF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#7A12FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {linePath && (
          <>
            <motion.path
              animate={{ d: areaPath } as Record<string, string>}
              transition={PATH_TWEEN}
              fill="url(#chartGradient)"
              stroke="none"
            />
            <motion.path
              animate={{ d: linePath } as Record<string, string>}
              transition={PATH_TWEEN}
              fill="none"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              className="stroke-catalyst-glow"
            />
          </>
        )}
      </svg>
      <TimeFilterBar value={range} onChange={setRange} />
    </section>
  );
}
