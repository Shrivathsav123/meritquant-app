import type { TradeSignal } from '../../store/types';
export type SignalFilter = 'ALL' | TradeSignal['type'];
interface FilterPillRowProps {
  available: SignalFilter[];
  active: SignalFilter;
  onChange: (f: SignalFilter) => void;
}
export function FilterPillRow({ available, active, onChange }: FilterPillRowProps) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {available.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`shrink-0 rounded-full px-4 py-1.5 font-interface text-xs font-semibold tracking-wide transition-all duration-300 ease-out-expo ${
            f === active
              ? 'bg-catalyst text-white shadow-purple-glow'
              : 'bg-void-surfaceMuted text-system-slate border border-white/5'
          }`}
        >
          {f.replace('_', ' ')}
        </button>
      ))}
    </div>
  );
}
