import type {
  AuthContext, BrokerDataProvider, PortfolioSnapshot, PriceTick, MacroTick,
} from './brokerProvider';
import type { MacroRegime, NewsItem, Position, TradeSignal } from '../store/types';

const RAW_BASE = 'https://raw.githubusercontent.com/Shrivathsav123/meritquant/main/data';
const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

const GATE_NAMES = [
  'Trend Align', 'RS Rank', 'Alpha Volume', 'Volatility Squeeze',
  'Earnings Drift', 'Sector Flow', 'Options Skew', 'Liquidity Floor', 'Regime Fit',
] as const;

// ── Seeded RNG (same algo as mockProvider) ───────────────────────────────────
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function normalize01to100(series: number[]): number[] {
  const lo = Math.min(...series), hi = Math.max(...series), span = hi - lo || 1;
  return series.map(v => ((v - lo) / span) * 100);
}
function hashStr(s: string): number {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h;
}
// Build a deterministic sparkline that starts at entry and ends at current
function buildSparkline(ticker: string, entry: number, current: number, n = 60): number[] {
  const rng = mulberry32(hashStr(ticker));
  const series = [entry];
  for (let i = 1; i < n - 1; i++) {
    const prev = series[i - 1];
    const drift = (current - prev) / Math.max(n - i, 1);
    series.push(Math.max(0.01, prev * (1 + (rng() - 0.5) * 0.009) + drift * 0.4));
  }
  series.push(current);
  return normalize01to100(series);
}

// ── Backend JSON shapes ──────────────────────────────────────────────────────
interface BackendPos {
  ticker: string; name: string; shares: number;
  entry_price: number; current_price: number;
  pnl: number; pnl_pct: number; stop_loss: number;
}
interface BackendPortfolio {
  balance: number; cash: number;
  positions: Record<string, BackendPos>;
  total_value: number; pnl: number; pnl_pct: number;
  updated: string;
}
interface BackendPattern {
  entry_price: number; stop_price: number;
  target_1: number; target_2: number;
  gates_cleared: number; max_gates: number;
}
interface BackendSignal {
  ticker: string; name: string; score: number;
  signal: string; conviction: string; rsi: string;
  patterns: BackendPattern[];
  news_headline: string;
  top_pattern: string; top_pattern_gates: number;
}
interface BackendNewsItem {
  title: string; source: string;
  published_date: string; tickers_mentioned: string[];
  sentiment: string;
}

// ── Fetch with 1-minute cache-busting query param ────────────────────────────
async function fetchJSON<T>(file: string): Promise<T> {
  const url = `${RAW_BASE}/${file}?t=${Math.floor(Date.now() / 60000)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${file}: ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Mappers ──────────────────────────────────────────────────────────────────
function mapType(signal: string): TradeSignal['type'] {
  const s = signal.toUpperCase().replace(/\s+/g, '_');
  if (s === 'STRONG_BUY') return 'STRONG_BUY';
  if (s === 'BUY' || s === 'BULLISH') return 'BULLISH';
  return 'BOTTLENECK';
}

function buildGates(score: number, topGates: number): TradeSignal['gates'] {
  const total = GATE_NAMES.length;
  const passed = Math.min(Math.round((score / 10) * total), total);
  // gates that didn't pass the top pattern count as FAILED
  const failed = topGates > 0 ? Math.max(0, topGates - passed) : 0;
  return GATE_NAMES.map((name, i) => ({
    id: `g${i + 1}`,
    name,
    status: (i < passed ? 'PASSED' : i < passed + failed ? 'FAILED' : 'UNCHECKED') as TradeSignal['gates'][number]['status'],
  }));
}

function mapPositions(portfolio: BackendPortfolio): Position[] {
  return Object.values(portfolio.positions).map(p => ({
    ticker: p.ticker,
    name: p.name,
    quantity: p.shares,
    avgCost: p.entry_price,
    currentPrice: p.current_price,
    dailyChangePx: p.current_price - p.entry_price,
    dailyChangePct: p.pnl_pct,
    sparklineData: buildSparkline(p.ticker, p.entry_price, p.current_price),
  }));
}

function mapSignals(signals: BackendSignal[], portfolio: BackendPortfolio): TradeSignal[] {
  return signals.slice(0, 8).map((s, idx) => {
    const pos = portfolio.positions[s.ticker];
    const pat = s.patterns[0];
    const entry    = pat?.entry_price ?? pos?.current_price ?? 100;
    const stopLoss = pat?.stop_price  ?? pos?.stop_loss     ?? entry * 0.92;
    const target1  = pat?.target_1    ?? entry * 1.10;
    const target2  = pat?.target_2    ?? entry * 1.20;
    const returnPct = (((target1 - entry) / entry) * 100).toFixed(1);

    const triggers: string[] = [];
    if (s.news_headline) triggers.push(s.news_headline.slice(0, 55).toUpperCase());
    if (s.top_pattern && s.top_pattern !== 'NONE') triggers.push(s.top_pattern);
    triggers.push(`${s.conviction || 'HIGH'} CONVICTION`);

    return {
      id: `sig-${s.ticker.toLowerCase()}-${idx}`,
      ticker: s.ticker,
      companyName: s.name,
      type: mapType(s.signal),
      score: s.score,
      triggers: triggers.slice(0, 3),
      expectedReturn: `+${returnPct}%`,
      levels: { entry, stopLoss, target1, target2 },
      gates: buildGates(s.score, s.top_pattern_gates ?? 0),
    } satisfies TradeSignal;
  });
}

function mapNews(items: BackendNewsItem[]): NewsItem[] {
  const sentMap: Record<string, NewsItem['sentiment']> = {
    BULLISH: 'BULLISH', BEARISH: 'BEARISH', NEUTRAL: 'NEUTRAL',
  };
  return items.slice(0, 20).map((n, i) => ({
    id: `news-gh-${i}-${new Date(n.published_date).getTime()}`,
    source: n.source === 'Google News' && n.tickers_mentioned[0]
      ? n.tickers_mentioned[0]
      : n.source,
    headline: n.title,
    sentiment: sentMap[n.sentiment?.toUpperCase()] ?? 'NEUTRAL',
    publishedAt: new Date(n.published_date).getTime(),
  }));
}

function buildMacro(portfolio: BackendPortfolio): MacroRegime {
  const mk = (value: number, changePct: number): MacroRegime['vix'] => ({
    value, changePct, trend: [value],
  });
  const regime: MacroRegime['regimeState'] = portfolio.pnl_pct >= 0
    ? 'BULL_VOLATILE' : 'BEAR_VOLATILE';
  return {
    vix: mk(16.4, -2.1), dxy: mk(104.2, 0.3),
    yieldCurve: mk(4.31, 0.6), spy: mk(552.8, 1.2), tlt: mk(92.6, -0.8),
    regimeState: regime,
  };
}

// ── Provider factory ─────────────────────────────────────────────────────────
export function createGithubDataProvider(): BrokerDataProvider {
  let cachedSnap: PortfolioSnapshot | null = null;
  let cachedAt = 0;

  async function loadSnap(bustCache = false): Promise<PortfolioSnapshot> {
    const now = Date.now();
    if (!bustCache && cachedSnap && now - cachedAt < POLL_INTERVAL) return cachedSnap;
    const [portfolio, signals] = await Promise.all([
      fetchJSON<BackendPortfolio>('portfolio.json'),
      fetchJSON<BackendSignal[]>('signals.json'),
    ]);
    cachedSnap = {
      portfolioValue: portfolio.total_value,
      cashBalance: portfolio.cash,
      realizedPnLToday: portfolio.pnl,
      positions: mapPositions(portfolio),
      macro: buildMacro(portfolio),
      signals: mapSignals(signals, portfolio),
    };
    cachedAt = now;
    return cachedSnap;
  }

  return {
    async fetchSnapshot(_auth: AuthContext): Promise<PortfolioSnapshot> {
      return loadSnap();
    },

    async fetchEquitySeries(_auth: AuthContext, range) {
      const portfolio = await fetchJSON<BackendPortfolio>('portfolio.json');
      const n = { '1D': 120, '1W': 168, '1M': 120, '3M': 180, ALL: 240 }[range];
      const rng = mulberry32(hashStr(range) ^ 0xd00d);
      const start = portfolio.balance;
      const end = portfolio.total_value;
      const series = [start];
      for (let i = 1; i < n - 1; i++) {
        const prev = series[i - 1];
        const drift = (end - prev) / Math.max(n - i, 1);
        series.push(Math.max(1, prev * (1 + (rng() - 0.5) * 0.006) + drift * 0.25));
      }
      series.push(end);
      return series;
    },

    async askAssistant(_auth: AuthContext, prompt: string): Promise<string> {
      const portfolio = await fetchJSON<BackendPortfolio>('portfolio.json');
      const count = Object.keys(portfolio.positions).length;
      const sign = portfolio.pnl >= 0 ? '+' : '-';
      const pnlStr = `${sign}$${Math.abs(portfolio.pnl).toFixed(2)} (${portfolio.pnl_pct.toFixed(2)}%)`;
      const tickers = Object.keys(portfolio.positions).join(', ');
      return `Scanner snapshot (${new Date(portfolio.updated).toLocaleDateString()}): ${count} active positions [${tickers}]. Portfolio value $${portfolio.total_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}, unrealized P&L ${pnlStr}. Query: "${prompt}"`;
    },

    streamTicks(_auth: AuthContext, on: (t: PriceTick) => void) {
      let active = true;
      const poll = () => loadSnap(true).then(snap =>
        snap.positions.forEach(p => on({
          ticker: p.ticker, price: p.currentPrice,
          ts: Date.now(), sparklineData: p.sparklineData,
        }))
      ).catch(() => {});
      poll();
      const id = setInterval(() => { if (active) poll(); }, POLL_INTERVAL);
      return () => { active = false; clearInterval(id); };
    },

    streamMacro(_auth: AuthContext, on: (m: MacroTick) => void) {
      loadSnap().then(snap => {
        (['vix', 'dxy', 'yieldCurve', 'spy', 'tlt'] as const).forEach(key => {
          const cell = snap.macro[key];
          on({ key, value: cell.value, changePct: cell.changePct, trendPoint: cell.value });
        });
      }).catch(() => {});
      return () => {};
    },

    streamNews(_auth: AuthContext, on: (n: NewsItem) => void) {
      let active = true;
      const emit = () =>
        fetchJSON<BackendNewsItem[]>('news_feed.json')
          .then(items => { if (active) mapNews(items).forEach(n => on(n)); })
          .catch(() => {});
      emit();
      const id = setInterval(() => { if (active) emit(); }, 10 * 60 * 1000);
      return () => { active = false; clearInterval(id); };
    },
  };
}
