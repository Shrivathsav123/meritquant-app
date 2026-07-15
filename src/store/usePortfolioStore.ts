import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { PortfolioStore, TabId } from './types';
import type { MacroTick, PortfolioSnapshot, PriceTick } from '../services/brokerProvider';
interface PortfolioActions {
  hydrate: (snap: PortfolioSnapshot) => void;
  applyTick: (t: PriceTick) => void;
  applyMacroTick: (m: MacroTick) => void;
  setActiveTab: (tab: TabId) => void;
  selectSignal: (id: string | null) => void;
}
const EMPTY_METRIC = { value: 0, changePct: 0, trend: [] as number[] };
const INITIAL: PortfolioStore = {
  portfolioValue: 0,
  cashBalance: 0,
  realizedPnLToday: 0,
  positions: [],
  macro: {
    vix: { ...EMPTY_METRIC }, dxy: { ...EMPTY_METRIC }, yieldCurve: { ...EMPTY_METRIC },
    spy: { ...EMPTY_METRIC }, tlt: { ...EMPTY_METRIC },
    regimeState: 'BULL_QUIET',
  },
  signals: [],
  activeTab: 'portfolio',
  selectedSignalId: null,
};
const TREND_WINDOW = 96;
export const usePortfolioStore = create<PortfolioStore & PortfolioActions>()(
  devtools(
    subscribeWithSelector((set) => ({
      ...INITIAL,
      hydrate: (snap) => set(() => ({ ...snap }), false, 'hydrate'),
      applyTick: ({ ticker, price, sparklineData }) =>
        set((st) => {
          let touched = false;
          const positions = st.positions.map((p) => {
            if (p.ticker !== ticker) return p;
            touched = true;
            const sessionOpen = p.currentPrice - p.dailyChangePx;
            const dailyChangePx = price - sessionOpen;
            return {
              ...p,
              currentPrice: price,
              dailyChangePx,
              dailyChangePct: sessionOpen !== 0 ? (dailyChangePx / sessionOpen) * 100 : 0,
              sparklineData: sparklineData ?? p.sparklineData,
            };
          });
          if (!touched) return st;
          const invested = positions.reduce((a, p) => a + p.currentPrice * p.quantity, 0);
          return { positions, portfolioValue: st.cashBalance + invested };
        }, false, `tick/${ticker}`),
      applyMacroTick: ({ key, value, changePct, trendPoint }) =>
        set((st) => ({
          macro: {
            ...st.macro,
            [key]: {
              value,
              changePct,
              trend: [...st.macro[key].trend, trendPoint].slice(-TREND_WINDOW),
            },
          },
        }), false, `macro/${key}`),
      setActiveTab: (activeTab) => set({ activeTab }, false, 'setActiveTab'),
      selectSignal: (selectedSignalId) => set({ selectedSignalId }, false, 'selectSignal'),
    })),
    { name: 'MeritQuant' },
  ),
);
