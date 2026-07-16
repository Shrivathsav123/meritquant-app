import { memo } from 'react';
import type { Position } from '../../store/types';
import { Sparkline } from '../shared/Sparkline';
import { fmtUsd, fmtSignedUsd, fmtSignedPct } from '../../lib/format';
export const PositionCard = memo(function PositionCard({ position: p }: { position: Position }) {
  const dailyUsd = p.dailyChangePx * p.quantity;
  const up = dailyUsd >= 0;
  return (
    <li className="glass-surface relative overflow-hidden rounded-2xl px-4 py-3.5">
      <Sparkline
        data={p.sparklineData}
        strokeClass="stroke-catalyst/20 stroke-2"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div className="relative flex items-center justify-between">
        <div className="min-w-0">
          <p className="font-telemetry text-base font-bold tracking-tight text-white">{p.ticker}</p>
          <p className="truncate text-xs text-system-slate">{p.name}</p>
          <p className="mt-0.5 font-telemetry text-[10px] text-system-slate">
            {p.quantity} @ {fmtUsd(p.avgCost)}
          </p>
        </div>
        <div className="shrink-0 text-right font-telemetry">
          <p className={`text-sm font-semibold ${up ? 'text-bull' : 'text-bear'}`}>
            {fmtSignedUsd(dailyUsd)}
          </p>
          <p className={`text-xs ${up ? 'text-bull/70' : 'text-bear/70'}`}>
            {fmtSignedPct(p.dailyChangePct)}
          </p>
        </div>
      </div>
    </li>
  );
});
