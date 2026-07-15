import { usePortfolioStore } from '../../store/usePortfolioStore';
import { selectDailyPnL, selectDailyChangePct, selectUnrealizedPnL } from '../../store/selectors';
import { useMagnitudeGlow } from './useMagnitudeGlow';
import { fmtUsd, fmtSignedUsd, fmtSignedPct } from '../../lib/format';
export function HeroPanel() {
  const portfolioValue = usePortfolioStore((s) => s.portfolioValue);
  const realized = usePortfolioStore((s) => s.realizedPnLToday);
  const dailyPnL = usePortfolioStore(selectDailyPnL);
  const dailyPct = usePortfolioStore(selectDailyChangePct);
  const unrealized = usePortfolioStore(selectUnrealizedPnL);
  const glowStyle = useMagnitudeGlow(dailyPct);
  const tone = dailyPnL >= 0 ? 'text-bull' : 'text-bear';
  const toneSoft = dailyPnL >= 0 ? 'text-bull/80' : 'text-bear/80';
  return (
    <section style={glowStyle} className="glass-surface rounded-3xl p-6">
      <p className="font-interface text-[10px] uppercase tracking-widest text-system-slate">
        Total Portfolio Value
      </p>
      <h1 className="mt-1 text-5xl md:text-6xl font-bold font-telemetry tracking-tighter text-white">
        {fmtUsd(portfolioValue)}
      </h1>
      <div className="mt-3 flex items-baseline gap-2 font-telemetry">
        <span className={`font-bold ${tone}`}>{fmtSignedUsd(dailyPnL)}</span>
        <span className={`text-lg ${toneSoft}`}>({fmtSignedPct(dailyPct)})</span>
      </div>
      <div className="mt-5 flex items-stretch gap-4">
        <div className="flex-1">
          <p className="text-[10px] tracking-widest text-system-slate">REALIZED TODAY</p>
          <p className={`mt-1 font-telemetry text-lg font-medium ${realized >= 0 ? 'text-bull' : 'text-bear'}`}>
            {fmtSignedUsd(realized)}
          </p>
        </div>
        <div className="w-px bg-gradient-to-b from-white/10 to-transparent" />
        <div className="flex-1">
          <p className="text-[10px] tracking-widest text-system-slate">UNREALIZED BALANCE</p>
          <p className={`mt-1 font-telemetry text-lg font-medium ${unrealized >= 0 ? 'text-bull' : 'text-bear'}`}>
            {fmtSignedUsd(unrealized)}
          </p>
        </div>
      </div>
    </section>
  );
}
