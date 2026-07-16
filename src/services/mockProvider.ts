import type {
  AuthContext, BrokerDataProvider, PortfolioSnapshot,
} from './brokerProvider';
import type { MacroRegime, NewsItem, Position, TradeSignal } from '../store/types';

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function walk(rng: () => number, n: number, start: number, vol: number): number[] {
  const out = [start];
  for (let i = 1; i < n; i++) out.push(out[i - 1] * (1 + (rng() - 0.5) * vol));
  return out;
}
function normalize01to100(series: number[]): number[] {
  const lo = Math.min(...series), hi = Math.max(...series), span = hi - lo || 1;
  return series.map((v) => ((v - lo) / span) * 100);
}
const rng = mulberry32(0x5eed);

interface Book { raw: Record<string, number[]>; positions: Position[] }
function buildBook(): Book {
  const defs: [string, string, number, number][] = [
    ['AMD',  'Advanced Micro Devices', 42, 158.2],
    ['NVDA', 'NVIDIA Corp',            10, 121.4],
    ['MSFT', 'Microsoft Corp',         14, 447.1],
    ['PLTR', 'Palantir Technologies', 120,  27.9],
    ['COIN', 'Coinbase Global',        18, 231.5],
  ];
  const raw: Record<string, number[]> = {};
  const positions = defs.map(([ticker, name, quantity, avgCost]) => {
    const series = walk(rng, 240, avgCost * (0.94 + rng() * 0.12), 0.004);
    raw[ticker] = series;
    const open = series[0], px = series[series.length - 1];
    return {
      ticker, name, quantity, avgCost,
      currentPrice: px,
      dailyChangePx: px - open,
      dailyChangePct: ((px - open) / open) * 100,
      sparklineData: normalize01to100(series),
    } satisfies Position;
  });
  return { raw, positions };
}
function buildMacro(): MacroRegime {
  const mk = (v: number, vol: number) => {
    const trend = walk(rng, 96, v, vol);
    const value = trend[trend.length - 1];
    return { value, changePct: ((value - trend[0]) / trend[0]) * 100, trend };
  };
  return {
    vix: mk(16.4, 0.02), dxy: mk(104.2, 0.003), yieldCurve: mk(4.31, 0.006),
    spy: mk(552.8, 0.004), tlt: mk(92.6, 0.004),
    regimeState: 'BULL_VOLATILE',
  };
}
function buildSignals(): TradeSignal[] {
  const GATE_NAMES = [
    'Trend Align', 'RS Rank', 'Alpha Volume', 'Volatility Squeeze', 'Earnings Drift',
    'Sector Flow', 'Options Skew', 'Liquidity Floor', 'Regime Fit',
  ];
  const mkGates = (passed: number[], failed: number[]): TradeSignal['gates'] =>
    GATE_NAMES.map((n, i) => ({
      id: `g${i + 1}`,
      name: n,
      status: passed.includes(i + 1) ? 'PASSED' : failed.includes(i + 1) ? 'FAILED' : 'UNCHECKED',
    }));
  return [
    {
      id: 'sig-amd', ticker: 'AMD', companyName: 'Advanced Micro Devices',
      type: 'STRONG_BUY', score: 8,
      triggers: ['VOL BREAKOUT', 'RS NEW HIGH', 'CALL FLOW'],
      expectedReturn: '+12.4%',
      levels: { entry: 158.4, stopLoss: 149.8, target1: 171.2, target2: 178.05 },
      gates: mkGates([1, 2, 3, 5, 6, 7, 8, 9], []),
    },
    {
      id: 'sig-pltr', ticker: 'PLTR', companyName: 'Palantir Technologies',
      type: 'BULLISH', score: 6,
      triggers: ['BASE BREAK', 'SECTOR FLOW'],
      expectedReturn: '+8.1%',
      levels: { entry: 28.1, stopLoss: 25.9, target1: 30.6, target2: 32.4 },
      gates: mkGates([1, 3, 4, 6, 9], [2]),
    },
    {
      id: 'sig-coin', ticker: 'COIN', companyName: 'Coinbase Global',
      type: 'BOTTLENECK', score: 5,
      triggers: ['SUPPLY ZONE', 'THIN TAPE'],
      expectedReturn: '+5.6%',
      levels: { entry: 229.0, stopLoss: 217.4, target1: 243.1, target2: 251.7 },
      gates: mkGates([1, 6], [3, 7, 8]),
    },
  ];
}
const NEWS_POOL: Omit<NewsItem, 'id' | 'publishedAt'>[] = [
  { source: 'Reuters', headline: 'Fed officials signal patience on cuts as core inflation cools for third straight month', sentiment: 'BULLISH' },
  { source: 'CNBC', headline: 'AMD unveils next-gen MI400 accelerator roadmap; hyperscaler pre-orders exceed forecasts', sentiment: 'BULLISH' },
  { source: 'Bloomberg', headline: 'Treasury yields climb after weak 10-year auction pressures long-duration assets', sentiment: 'BEARISH' },
  { source: 'WSJ', headline: 'Retail options volume hits record as zero-day contracts dominate SPX flow', sentiment: 'NEUTRAL' },
  { source: 'Reuters', headline: 'Semiconductor equipment billings rise 18% YoY on AI capacity expansion', sentiment: 'BULLISH' },
];
export function createMockProvider(): BrokerDataProvider {
  const book = buildBook();
  const macro = buildMacro();
  return {
    async fetchSnapshot(_auth: AuthContext): Promise<PortfolioSnapshot> {
      const invested = book.positions.reduce((a, p) => a + p.currentPrice * p.quantity, 0);
      const cashBalance = 12_400.22;
      return {
        portfolioValue: cashBalance + invested,
        cashBalance,
        realizedPnLToday: 486.4,
        positions: book.positions,
        macro,
        signals: buildSignals(),
      };
    },
    async fetchEquitySeries(_auth, range) {
      const n = { '1D': 120, '1W': 168, '1M': 120, '3M': 180, ALL: 240 }[range];
      return walk(mulberry32(range.length * 7919), n, 180_000, 0.006);
    },
    async askAssistant(_auth, prompt) {
      return `Mock analysis for "${prompt}": portfolio beta is 1.18, largest factor exposure is AI-semis. Regime model reads BULL_VOLATILE — size entries at 0.75x and respect the G4 squeeze gate.`;
    },
    streamTicks(_auth, on) {
      const id = setInterval(() => {
        const p = book.positions[Math.floor(rng() * book.positions.length)];
        const series = book.raw[p.ticker];
        const next = series[series.length - 1] * (1 + (rng() - 0.5) * 0.0035);
        series.push(next);
        if (series.length > 390) series.shift();
        on({ ticker: p.ticker, price: next, ts: Date.now(), sparklineData: normalize01to100(series) });
      }, 1200);
      return () => clearInterval(id);
    },
    streamMacro(_auth, on) {
      const keys = ['vix', 'dxy', 'yieldCurve', 'spy', 'tlt'] as const;
      const id = setInterval(() => {
        const key = keys[Math.floor(rng() * keys.length)];
        const cell = macro[key];
        const value = cell.value * (1 + (rng() - 0.5) * 0.004);
        on({ key, value, changePct: cell.changePct + (rng() - 0.5) * 0.1, trendPoint: value });
      }, 2500);
      return () => clearInterval(id);
    },
    streamNews(_auth, on) {
      let i = 0;
      const emit = () => on({ ...NEWS_POOL[i++ % NEWS_POOL.length], id: `news-${i}-${Date.now()}`, publishedAt: Date.now() });
      emit(); emit(); emit();
      const id = setInterval(emit, 20_000);
      return () => clearInterval(id);
    },
  };
}
