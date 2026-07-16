import { usePortfolioStore } from '../../store/usePortfolioStore';
import type { MacroKey } from '../../store/types';
import { Sparkline } from '../shared/Sparkline';
import { fmtSignedPct } from '../../lib/format';
const CELLS: { key: MacroKey; label: string }[] = [
  { key: 'vix', label: 'VIX' },
  { key: 'dxy', label: 'DXY' },
  { key: 'tlt', label: 'TLT' },
  { key: 'yieldCurve', label: '10YR' },
  { key: 'spy', label: 'SPY' },
];
const REGIME_TONE = {
  BULL_VOLATILE: 'text-bull border-bull/30 bg-bull/10',
  BULL_QUIET: 'text-bull-text border-bull/20 bg-bull/5',
  BEAR_VOLATILE: 'text-bear border-bear/30 bg-bear/10',
  BEAR_QUIET: 'text-bear-text border-bear/20 bg-bear/5',
} as const;
export function MacroGrid() {
  const macro = usePortfolioStore((s) => s.macro);
  return (
    <div className="space-y-2">
      <span className={`inline-block rounded-full border px-2.5 py-1 font-telemetry text-[10px] tracking-widest ${REGIME_TONE[macro.regimeState]}`}>
        REGIME · {macro.regimeState.replace('_', ' ')}
      </span>
      <div className="grid grid-cols-5 gap-1.5">
        {CELLS.map(({ key, label }) => {
          const { value, changePct, trend } = macro[key];
          const up = changePct >= 0;
          return (
            <div key={key} className="glass-surface rounded-xl px-1.5 py-2 text-center">
              <p className="text-[9px] tracking-widest text-system-slate">{label}</p>
              <p className="mt-0.5 font-telemetry text-xs font-medium text-white">{value.toFixed(2)}</p>
              <p className={`font-telemetry text-[9px] ${up ? 'text-bull' : 'text-bear'}`}>
                {fmtSignedPct(changePct)}
              </p>
              <Sparkline
                data={trend}
                strokeClass={up ? 'stroke-bull/70 stroke-2' : 'stroke-bear/70 stroke-2'}
                className="mt-1 h-5 w-full"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
