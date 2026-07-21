import { PositionCard } from 'meritquant-app-ui';

const GAIN = {
  ticker: 'NVDA',
  name: 'NVIDIA Corporation',
  quantity: 40,
  avgCost: 118.32,
  currentPrice: 142.87,
  dailyChangePx: 3.41,
  dailyChangePct: 2.45,
  sparklineData: [128, 131, 129, 134, 138, 136, 141, 139, 142.87],
};

const LOSS = {
  ticker: 'INTC',
  name: 'Intel Corporation',
  quantity: 220,
  avgCost: 34.1,
  currentPrice: 29.85,
  dailyChangePx: -0.62,
  dailyChangePct: -2.03,
  sparklineData: [33.4, 32.9, 33.1, 31.8, 31.2, 30.6, 30.9, 30.1, 29.85],
};

export function Gaining() {
  return (
    <ul className="w-80">
      <PositionCard position={GAIN} />
    </ul>
  );
}

export function Losing() {
  return (
    <ul className="w-80">
      <PositionCard position={LOSS} />
    </ul>
  );
}
