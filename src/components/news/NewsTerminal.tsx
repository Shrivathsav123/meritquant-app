import { useEffect, useState } from 'react';
import { useNewsStore } from '../../store/useNewsStore';
import type { NewsItem, Sentiment } from '../../store/types';
import { fmtTimeAgo } from '../../lib/format';
function useElapsedSeconds(since: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return Math.max(0, Math.floor((now - since) / 1000));
}
const SENTIMENT_TONE: Record<Sentiment, string> = {
  BULLISH: 'text-bull',
  BEARISH: 'text-bear',
  NEUTRAL: 'text-system-slate',
};
export function NewsTerminal() {
  const items = useNewsStore((s) => s.items);
  const lastUpdatedAt = useNewsStore((s) => s.lastUpdatedAt);
  const elapsed = useElapsedSeconds(lastUpdatedAt);
  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full animate-pulse bg-bull" />
          <h2 className="font-telemetry text-sm font-bold tracking-widest text-white">
            LIVE NEWS TERMINAL
          </h2>
        </div>
        <span className="font-telemetry text-[10px] text-system-slate">Updated {elapsed}s ago</span>
      </header>
      <ul className="space-y-2">
        {items.map((n) => <NewsRow key={n.id} item={n} />)}
      </ul>
    </section>
  );
}
function NewsRow({ item }: { item: NewsItem }) {
  return (
    <li className="glass-surface flex gap-3 rounded-2xl p-3.5">
      <span className="h-fit shrink-0 bg-system-slateMuted text-white text-[9px] px-1.5 py-0.5 rounded">
        {item.source}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-white/90 font-interface leading-snug">{item.headline}</p>
        <p className="mt-1.5 flex items-center gap-2 font-telemetry text-[10px]">
          <span className={`font-semibold ${SENTIMENT_TONE[item.sentiment]}`}>{item.sentiment}</span>
          <span className="text-system-slate">{fmtTimeAgo(item.publishedAt)}</span>
        </p>
      </div>
    </li>
  );
}
