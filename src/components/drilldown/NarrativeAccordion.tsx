import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { TradeSignal } from '../../store/types';
interface Section { id: string; title: string; body: string }
function deriveSections(signal: TradeSignal): Section[] {
  return [
    {
      id: 'context',
      title: 'Full Context Readout',
      body: `${signal.companyName} (${signal.ticker}) is rated ${signal.type.replace('_', ' ')} at ${signal.score}/9. Active triggers: ${signal.triggers.join(', ')}. Model expects ${signal.expectedReturn} to Target 1.`,
    },
    {
      id: 'volume',
      title: 'Trading Volume Profile',
      body: `Entry zone ${signal.levels.entry.toFixed(2)} sits above the highest-volume node; invalidation below ${signal.levels.stopLoss.toFixed(2)}. Supply thins toward ${signal.levels.target1.toFixed(2)} → ${signal.levels.target2.toFixed(2)}.`,
    },
    {
      id: 'catalyst',
      title: 'Algorithmic Catalyst Summary',
      body: `${signal.gates.filter((g) => g.status === 'PASSED').length}/9 gates passed. ${signal.gates.filter((g) => g.status === 'FAILED').map((g) => g.name).join(', ') || 'No'} gate(s) currently failing.`,
    },
  ];
}
export function NarrativeAccordion({ signal }: { signal: TradeSignal }) {
  const sections = deriveSections(signal);
  const [open, setOpen] = useState<string | null>(sections[0]?.id ?? null);
  return (
    <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10">
      {sections.map((s) => {
        const isOpen = open === s.id;
        return (
          <div key={s.id} className="bg-void-surfaceMuted/50">
            <button
              onClick={() => setOpen(isOpen ? null : s.id)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left"
            >
              <span className="font-interface text-xs font-semibold uppercase tracking-widest text-white/80">
                {s.title}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-system-slate transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-4 text-sm leading-relaxed text-white/70">{s.body}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
