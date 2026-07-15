const usd = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2,
});
export const fmtUsd = (v: number) => usd.format(v);
export const fmtSignedUsd = (v: number) => `${v >= 0 ? '+' : '-'}${usd.format(Math.abs(v))}`;
export const fmtSignedPct = (v: number) => `${v >= 0 ? '+' : '-'}${Math.abs(v).toFixed(2)}%`;
export const fmtTimeAgo = (epochMs: number): string => {
  const s = Math.max(0, Math.floor((Date.now() - epochMs) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};
