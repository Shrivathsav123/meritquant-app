import { FilterPillRow } from 'meritquant-app-ui';

const AVAILABLE = ['ALL', 'STRONG_BUY', 'BOTTLENECK', 'BULLISH'] as const;

export function AllActive() {
  return (
    <div className="w-80">
      <FilterPillRow available={[...AVAILABLE]} active="ALL" onChange={() => {}} />
    </div>
  );
}

export function FilterActive() {
  return (
    <div className="w-80">
      <FilterPillRow available={[...AVAILABLE]} active="STRONG_BUY" onChange={() => {}} />
    </div>
  );
}
