import type {
  AuthContext, BrokerDataProvider, PortfolioSnapshot, PriceTick,
  MacroTick, SeriesRange, Unsubscribe,
} from './brokerProvider';
import type { NewsItem } from '../store/types';
interface RestConfig { apiBase: string; wsBase: string; }
async function authedGet<T>(cfg: RestConfig, auth: AuthContext, path: string): Promise<T> {
  const res = await fetch(`${cfg.apiBase}${path}`, {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  });
  if (!res.ok) throw new Error(`MeritQuant API ${res.status} on ${path}`);
  return res.json() as Promise<T>;
}
function openStream(
  cfg: RestConfig,
  auth: AuthContext,
  channel: 'ticks' | 'macro' | 'news',
  onFrame: (payload: unknown) => void,
): Unsubscribe {
  let ws: WebSocket | null = null;
  let closed = false;
  let retry = 0;
  const connect = () => {
    ws = new WebSocket(`${cfg.wsBase}/v1/stream?channel=${channel}&token=${auth.accessToken}`);
    ws.onopen = () => { retry = 0; };
    ws.onmessage = (e) => onFrame(JSON.parse(e.data as string));
    ws.onclose = () => {
      if (closed) return;
      const backoff = Math.min(1000 * 2 ** retry++, 15_000);
      setTimeout(connect, backoff);
    };
  };
  connect();
  return () => { closed = true; ws?.close(); };
}
export function createRestProvider(cfg: RestConfig): BrokerDataProvider {
  return {
    fetchSnapshot: (auth) =>
      authedGet<PortfolioSnapshot>(cfg, auth, '/v1/portfolio/snapshot'),
    fetchEquitySeries: (auth, range: SeriesRange) =>
      authedGet<number[]>(cfg, auth, `/v1/portfolio/equity?range=${range}`),
    askAssistant: async (auth, prompt) => {
      const res = await fetch(`${cfg.apiBase}/v1/assistant/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`assistant ${res.status}`);
      return ((await res.json()) as { answer: string }).answer;
    },
    streamTicks: (auth, on) => openStream(cfg, auth, 'ticks', (p) => on(p as PriceTick)),
    streamMacro: (auth, on) => openStream(cfg, auth, 'macro', (p) => on(p as MacroTick)),
    streamNews: (auth, on) => openStream(cfg, auth, 'news', (p) => on(p as NewsItem)),
  };
}
