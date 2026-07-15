import type { PortfolioStore, Position, TradeSignal } from './types';
export const selectDailyPnL = (s: PortfolioStore): number =>
  s.positions.reduce((acc, p) => acc + p.dailyChangePx * p.quantity, 0);
export const selectDailyChangePct = (s: PortfolioStore): number => {
  const pnl = selectDailyPnL(s);
  const investedNow = s.positions.reduce((a, p) => a + p.currentPrice * p.quantity, 0);
  const openBase = investedNow - pnl;
  return openBase > 0 ? (pnl / openBase) * 100 : 0;
};
export const selectUnrealizedPnL = (s: PortfolioStore): number =>
  s.positions.reduce((acc, p) => acc + (p.currentPrice - p.avgCost) * p.quantity, 0);
export const selectWinRate = (s: PortfolioStore): number => {
  if (s.positions.length === 0) return 0;
  const winners = s.positions.filter((p) => p.currentPrice > p.avgCost).length;
  return (winners / s.positions.length) * 100;
};
export const selectBestPosition = (s: PortfolioStore): Position | null =>
  s.positions.length === 0
    ? null
    : s.positions.reduce((best, p) => (p.dailyChangePct > best.dailyChangePct ? p : best));
export const selectSelectedSignal = (s: PortfolioStore): TradeSignal | null =>
  s.signals.find((sig) => sig.id === s.selectedSignalId) ?? null;
export const selectLivePriceFor = (s: PortfolioStore, ticker: string | undefined): number | null => {
  if (!ticker) return null;
  return s.positions.find((p) => p.ticker === ticker)?.currentPrice ?? null;
};
