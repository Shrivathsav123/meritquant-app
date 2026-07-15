import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { TradeSignal, GateStatus } from '../../store/types';
type Gate = TradeSignal['gates'][number];
interface GateMatrixProps {
  gates: Gate[];
  rules?: Record<string, string>;
}
const STATUS_BOX: Record<GateStatus, string> = {
  PASSED:    'bg-bull/10 border border-bull shadow-[inset_0_0_8px_rgba(0,242,155,0.2)]',
  FAILED:    'bg-bear/10 border border-bear',
  UNCHECKED: 'bg-void-surfaceMuted border border-white/5',
};
const STATUS_LABEL: Record<GateStatus, string> = {
  PASSED: 'text-bull',
  FAILED: 'text-bear',
  UNCHECKED: 'text-system-slate',
};
function useGateDisclosure(ms = 350) {
  const [active, setActive] = useState<number | null>(null);
  const timer = useRef<number | null>(null);
  const clearTimer = () => {
    if (timer.current !== null) { window.clearTimeout(timer.current); timer.current = null; }
  };
  const press = useCallback((i: number) => {
    clearTimer();
    timer.current = window.setTimeout(() => setActive(i), ms);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms]);
  const release = useCallback(() => { clearTimer(); setActive(null); }, []);
  const hover = useCallback((i: number) => setActive(i), []);
  return { active, press, release, hover };
}
export function GateMatrix({ gates, rules }: GateMatrixProps) {
  const { active, press, release, hover } = useGateDisclosure();
  return (
    <div>
      <p className="mb-2 font-interface text-[10px] uppercase tracking-widest text-system-slate">
        G1–G9 Gate Scoring Matrix
      </p>
      <div className="grid grid-cols-3 grid-rows-3 gap-2">
        {gates.slice(0, 9).map((gate, i) => {
          const col = i % 3;
          const tipBelow = i < 3;
          const tipX =
            col === 0 ? 'left-0'
            : col === 2 ? 'right-0'
            : 'left-1/2 -translate-x-1/2';
          return (
            <div
              key={gate.id}
              onMouseEnter={() => hover(i)}
              onMouseLeave={release}
              onPointerDown={() => press(i)}
              onPointerUp={release}
              onPointerCancel={release}
              onContextMenu={(e) => e.preventDefault()}
              className={clsx(
                'relative flex aspect-square select-none flex-col items-center justify-center gap-1',
                'rounded-xl transition-all duration-300 ease-out-expo',
                STATUS_BOX[gate.status],
              )}
            >
              <span className={clsx('font-telemetry text-sm font-bold', STATUS_LABEL[gate.status])}>
                G{i + 1}
              </span>
              <span className={clsx(
                'max-w-full truncate px-1 text-[8px] uppercase tracking-wider',
                STATUS_LABEL[gate.status],
              )}>
                {gate.name}
              </span>
              <AnimatePresence>
                {active === i && (
                  <motion.div
                    initial={{ opacity: 0, y: tipBelow ? -4 : 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: tipBelow ? -4 : 4, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className={clsx(
                      'pointer-events-none absolute z-30 w-44 rounded-lg border border-white/10',
                      'bg-void-surfaceMuted/95 p-2.5 backdrop-blur-md shadow-purple-glow',
                      'text-left text-[10px] font-interface leading-relaxed text-white/80',
                      tipBelow ? 'top-full mt-2' : 'bottom-full mb-2',
                      tipX,
                    )}
                  >
                    <span className="font-telemetry font-bold text-catalyst-light">Gate {i + 1}: </span>
                    {rules?.[gate.id] ?? `${gate.name} rule evaluation ${gate.status.toLowerCase()}.`}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
