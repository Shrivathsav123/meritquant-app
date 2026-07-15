export interface Position {
  ticker: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  dailyChangePx: number;
  dailyChangePct: number;
  sparklineData: number[];
}
export interface MacroRegime {
  vix: { value: number; changePct: number; trend: number[] };
  dxy: { value: number; changePct: number; trend: number[] };
  yieldCurve: { value: number; changePct: number; trend: number[] };
  spy: { value: number; changePct: number; trend: number[] };
  tlt: { value: number; changePct: number; trend: number[] };
  regimeState: 'BULL_VOLATILE' | 'BULL_QUIET' | 'BEAR_VOLATILE' | 'BEAR_QUIET';
}
export interface TradeSignal {
  id: string;
  ticker: string;
  companyName: string;
  type: 'STRONG_BUY' | 'BOTTLENECK' | 'BULLISH';
  score: number;
  triggers: string[];
  expectedReturn: string;
  levels: { entry: number; stopLoss: number; target1: number; target2: number };
  gates: { id: string; name: string; status: 'PASSED' | 'FAILED' | 'UNCHECKED' }[];
}
export interface PortfolioStore {
  portfolioValue: number;
  cashBalance: number;
  realizedPnLToday: number;
  positions: Position[];
  macro: MacroRegime;
  signals: TradeSignal[];
  activeTab: 'portfolio' | 'signals' | 'news' | 'charts' | 'ai';
  selectedSignalId: string | null;
}
// ── Additive types (NOT part of the locked contract) ──
export type Sentiment = 'BULLISH' | 'BEARISH' | 'NEUTRAL';
export interface NewsItem {
  id: string;
  source: string;
  headline: string;
  sentiment: Sentiment;
  publishedAt: number;
}
export type MacroKey = Exclude<keyof MacroRegime, 'regimeState'>;
export type TabId = PortfolioStore['activeTab'];
export type GateStatus = TradeSignal['gates'][number]['status'];
