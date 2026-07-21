import { NarrativeAccordion } from 'meritquant-app-ui';
import type { TradeSignal } from 'meritquant-app-ui';

const SIGNAL: TradeSignal = {
  id: 'sig-aapl',
  ticker: 'AAPL',
  companyName: 'Apple Inc.',
  type: 'STRONG_BUY',
  score: 8,
  triggers: ['Breakout above 50DMA', 'Volume surge +180%', 'Options flow bullish'],
  expectedReturn: '+9.5%',
  levels: { entry: 182.5, stopLoss: 176.2, target1: 191.8, target2: 201.4 },
  gates: [
    { id: 'g1', name: 'Trend', status: 'PASSED' },
    { id: 'g2', name: 'Momentum', status: 'PASSED' },
    { id: 'g3', name: 'Volume', status: 'PASSED' },
    { id: 'g4', name: 'Volatility', status: 'PASSED' },
    { id: 'g5', name: 'Breadth', status: 'PASSED' },
    { id: 'g6', name: 'Sentiment', status: 'FAILED' },
    { id: 'g7', name: 'Liquidity', status: 'FAILED' },
    { id: 'g8', name: 'Catalyst', status: 'UNCHECKED' },
    { id: 'g9', name: 'Risk/Reward', status: 'UNCHECKED' },
  ],
};

export function Default() {
  return (
    <div className="w-96">
      <NarrativeAccordion signal={SIGNAL} />
    </div>
  );
}
