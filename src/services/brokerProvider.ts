import type { MacroRegime, NewsItem, Position, TradeSignal, MacroKey } from '../store/types';
export interface AuthContext {
  userId: string;
  accessToken: string;
}
export interface PortfolioSnapshot {
  portfolioValue: number;
  cashBalance: number;
  realizedPnLToday: number;
  positions: Position[];
  macro: MacroRegime;
  signals: TradeSignal[];
}
export interface PriceTick {
  ticker: string;
  price: number;
  ts: number;
  sparklineData?: number[];
}
export interface MacroTick {
  key: MacroKey;
  value: number;
  changePct: number;
  trendPoint: number;
}
export type SeriesRange = '1D' | '1W' | '1M' | '3M' | 'ALL';
export type Unsubscribe = () => void;
export interface BrokerDataProvider {
  fetchSnapshot(auth: AuthContext): Promise<PortfolioSnapshot>;
  fetchEquitySeries(auth: AuthContext, range: SeriesRange): Promise<number[]>;
  askAssistant(auth: AuthContext, prompt: string): Promise<string>;
  streamTicks(auth: AuthContext, on: (t: PriceTick) => void): Unsubscribe;
  streamMacro(auth: AuthContext, on: (m: MacroTick) => void): Unsubscribe;
  streamNews(auth: AuthContext, on: (n: NewsItem) => void): Unsubscribe;
}
export function resolveProvider(): Promise<BrokerDataProvider> {
  if (import.meta.env.VITE_BROKER_PROVIDER === 'mock') {
    return import('./mockProvider').then((m) => m.createMockProvider());
  }
  return import('./restProvider').then((m) =>
    m.createRestProvider({
      apiBase: import.meta.env.VITE_API_BASE,
      wsBase: import.meta.env.VITE_WS_BASE,
    }),
  );
}
