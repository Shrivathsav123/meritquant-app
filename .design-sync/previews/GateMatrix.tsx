import { GateMatrix } from 'meritquant-app-ui';

const NAMES = ['Trend', 'Momentum', 'Volume', 'Volatility', 'Breadth', 'Sentiment', 'Liquidity', 'Catalyst', 'Risk/Reward'];

const RULES = Object.fromEntries(NAMES.map((n, i) => [`g${i + 1}`, `${n} filter evaluated against the current regime.`]));

export function Mixed() {
  const gates = NAMES.map((name, i) => ({
    id: `g${i + 1}`,
    name,
    status: (i < 5 ? 'PASSED' : i < 7 ? 'FAILED' : 'UNCHECKED') as 'PASSED' | 'FAILED' | 'UNCHECKED',
  }));
  return (
    <div className="w-80">
      <GateMatrix gates={gates} rules={RULES} />
    </div>
  );
}

export function AllPassed() {
  const gates = NAMES.map((name, i) => ({ id: `g${i + 1}`, name, status: 'PASSED' as const }));
  return (
    <div className="w-80">
      <GateMatrix gates={gates} rules={RULES} />
    </div>
  );
}
