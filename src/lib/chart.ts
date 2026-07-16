export function resample(src: number[], n = 120): number[] {
  if (src.length === 0) return [];
  if (src.length === 1) return Array(n).fill(src[0]);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const pos = (i / (n - 1)) * (src.length - 1);
    const lo = Math.floor(pos);
    const hi = Math.min(lo + 1, src.length - 1);
    out.push(src[lo] + (src[hi] - src[lo]) * (pos - lo));
  }
  return out;
}
export function buildPaths(data: number[], w = 100, h = 46) {
  if (data.length < 2) return { linePath: '', areaPath: '' };
  const lo = Math.min(...data);
  const span = (Math.max(...data) - lo) || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h * 0.95 - ((v - lo) / span) * (h * 0.9);
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  const linePath = `M ${pts.join(' L ')}`;
  return { linePath, areaPath: `${linePath} L ${w} ${h} L 0 ${h} Z` };
}
