import { usePortfolioStore } from '../../store/usePortfolioStore';
import { HeroPanel } from './HeroPanel';
import { BentoMetricRow } from './BentoMetricRow';
import { PositionCard } from './PositionCard';
export function PortfolioChannel() {
  const positions = usePortfolioStore((s) => s.positions);
  return (
    <div className="space-y-4">
      <HeroPanel />
      <BentoMetricRow />
      <ul className="space-y-2">
        {positions.map((p) => <PositionCard key={p.ticker} position={p} />)}
      </ul>
    </div>
  );
}
