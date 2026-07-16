import { motion } from 'framer-motion';
import { transitionSpec } from '../../lib/motion';
import type { SeriesRange } from '../../services/brokerProvider';
const RANGES: SeriesRange[] = ['1D', '1W', '1M', '3M', 'ALL'];
export function TimeFilterBar({ value, onChange }: { value: SeriesRange; onChange: (r: SeriesRange) => void }) {
  return (
    <div className="mt-3 flex rounded-full border border-white/5 bg-void-surfaceMuted p-1">
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`relative flex-1 rounded-full py-1.5 font-telemetry text-[11px] tracking-wider transition-colors duration-300 ${
            r === value ? 'text-white' : 'text-system-slate'
          }`}
        >
          {r === value && (
            <motion.span
              layoutId="range-thumb"
              transition={transitionSpec}
              className="absolute inset-0 rounded-full bg-catalyst shadow-purple-glow"
            />
          )}
          <span className="relative">{r}</span>
        </button>
      ))}
    </div>
  );
}
