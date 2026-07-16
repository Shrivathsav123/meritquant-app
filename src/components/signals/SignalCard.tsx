import { motion } from 'framer-motion';
import type { TradeSignal } from '../../store/types';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { transitionSpec } from '../../lib/motion';
import { ScoreRing } from '../shared/ScoreRing';
export function SignalCard({ signal }: { signal: TradeSignal }) {
  const selectSignal = usePortfolioStore((s) => s.selectSignal);
  return (
    <motion.button
      layoutId={`signal-${signal.id}`}
      transition={transitionSpec}
      onClick={() => selectSignal(signal.id)}
      className="glass-surface relative block w-full rounded-3xl p-4 pb-9 text-left hover:border-white/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-2xl font-bold font-telemetry tracking-tight text-white">{signal.ticker}</h3>
          <p className="text-xs text-system-slate">{signal.companyName}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {signal.triggers.map((t) => (
              <span
                key={t}
                className="rounded-md border border-catalyst/25 bg-catalyst/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-catalyst-light"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <ScoreRing score={signal.score} />
      </div>
      <span className="absolute bottom-3.5 right-4 text-bull text-sm font-semibold font-telemetry">
        {signal.expectedReturn}
      </span>
    </motion.button>
  );
}
