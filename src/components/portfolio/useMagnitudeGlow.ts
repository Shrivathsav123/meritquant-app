import { useMemo, type CSSProperties } from 'react';
export function useMagnitudeGlow(dailyChangePct: number): CSSProperties | undefined {
  return useMemo(() => {
    if (Math.abs(dailyChangePct) <= 1.5) return undefined;
    const glowRadius = Math.min(Math.max(Math.abs(dailyChangePct) * 8, 10), 40);
    const glowColor = dailyChangePct >= 0 ? 'rgba(0, 242, 155,' : 'rgba(255, 8, 68,';
    return { filter: `drop-shadow(0 0 ${glowRadius}px ${glowColor} 0.25))` };
  }, [dailyChangePct]);
}
