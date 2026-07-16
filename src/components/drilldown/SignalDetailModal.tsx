import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { selectSelectedSignal, selectLivePriceFor } from '../../store/selectors';
import { transitionSpec } from '../../lib/motion';
import type { TradeSignal } from '../../store/types';
import { PriceLadder } from './PriceLadder';
import { GateMatrix } from './GateMatrix';
import { NarrativeAccordion } from './NarrativeAccordion';
export function SignalDetailModal() {
  const signal = usePortfolioStore(selectSelectedSignal);
  const livePrice = usePortfolioStore((s) => selectLivePriceFor(s, signal?.ticker));
  const selectSignal = usePortfolioStore((s) => s.selectSignal);
  const close = () => selectSignal(null);
  useEffect(() => {
    if (!signal) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal?.id]);
  return (
    <AnimatePresence>
      {signal && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-2xl"
          />
          <div className="pointer-events-none fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center">
            <motion.article
              layoutId={`signal-${signal.id}`}
              transition={transitionSpec}
              className="glass-surface pointer-events-auto max-h-[92dvh] w-full max-w-lg
                         space-y-5 overflow-y-auto rounded-3xl p-5"
            >
              <DetailHeader signal={signal} />
              <PriceLadder levels={signal.levels} livePrice={livePrice ?? signal.levels.entry} />
              <GateMatrix gates={signal.gates} />
              <NarrativeAccordion signal={signal} />
            </motion.article>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
function DetailHeader({ signal }: { signal: TradeSignal }) {
  return (
    <header className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold font-telemetry tracking-tight text-white">{signal.ticker}</h2>
          <p className="text-xs text-system-slate">{signal.companyName}</p>
        </div>
        <div className="text-right">
          <p className="font-interface text-[10px] uppercase tracking-widest text-system-slate">Target Return</p>
          <p className="font-telemetry text-xl font-bold text-bull">{signal.expectedReturn}</p>
        </div>
      </div>
      <button className="h-12 w-full rounded-2xl bg-gradient-to-r from-catalyst to-blue-600
                         text-white font-bold tracking-wider text-sm
                         transition-transform duration-300 ease-out-expo active:scale-[0.98]">
        EXECUTE VIA FIDELITY
      </button>
    </header>
  );
}
