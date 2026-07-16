import { motion } from 'framer-motion';
import type { TradeSignal } from '../../store/types';
import { transitionSpec } from '../../lib/motion';
interface PriceLadderProps {
  levels: TradeSignal['levels'];
  livePrice: number;
  height?: number;
}
interface Rung {
  key: string;
  label: string;
  price: number;
  lineClass: string;
  priceClass: string;
}
const W = 320;
const PAD_Y = 20;
const SPINE_X = 14;
const LABEL_X = 250;
export function PriceLadder({ levels, livePrice, height = 248 }: PriceLadderProps) {
  const rungs: Rung[] = [
    { key: 't2',    label: 'TARGET 2',  price: levels.target2,  lineClass: 'stroke-bull/40', priceClass: 'fill-bull/70' },
    { key: 't1',    label: 'TARGET 1',  price: levels.target1,  lineClass: 'stroke-bull',    priceClass: 'fill-bull' },
    { key: 'entry', label: 'ENTRY',     price: levels.entry,    lineClass: 'stroke-white',   priceClass: 'fill-white' },
    { key: 'stop',  label: 'STOP LOSS', price: levels.stopLoss, lineClass: 'stroke-bear',    priceClass: 'fill-bear' },
  ];
  const all = [...rungs.map((r) => r.price), livePrice];
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const pad = (hi - lo) * 0.06 || 1;
  const domain: [number, number] = [lo - pad, hi + pad];
  const innerH = height - PAD_Y * 2;
  const y = (p: number) => PAD_Y + (1 - (p - domain[0]) / (domain[1] - domain[0])) * innerH;
  return (
    <div className="glass-surface rounded-2xl p-4">
      <p className="mb-1 font-interface text-[10px] uppercase tracking-widest text-system-slate">
        Price Ladder
      </p>
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label="Trade level ladder">
        <line x1={SPINE_X} x2={SPINE_X} y1={PAD_Y} y2={height - PAD_Y} strokeWidth={1} className="stroke-white/10" />
        {rungs.map((r) => (
          <g key={r.key}>
            <line
              x1={SPINE_X} x2={LABEL_X}
              y1={y(r.price)} y2={y(r.price)}
              strokeWidth={1.5}
              className={r.lineClass}
            />
            <text
              x={LABEL_X + 8}
              y={y(r.price) - 3}
              className={`font-telemetry text-[11px] ${r.priceClass}`}
              style={{ fontSize: '11px', fontFamily: 'Geist Mono, JetBrains Mono, monospace' }}
            >
              {r.price.toFixed(2)}
            </text>
            <text
              x={LABEL_X + 8}
              y={y(r.price) + 9}
              className="fill-system-slate font-interface text-[8px] tracking-widest"
              style={{ fontSize: '8px', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', fill: '#4E5D6C', letterSpacing: '0.1em' }}
            >
              {r.label}
            </text>
          </g>
        ))}
        <motion.g
          initial={false}
          animate={{ y: y(livePrice) }}
          transition={transitionSpec}
        >
          <line
            x1={SPINE_X} x2={LABEL_X} y1={0} y2={0}
            strokeWidth={1} strokeDasharray="2 5"
            className="stroke-catalyst/40"
          />
          <path d="M 5 0 L 14 -5 L 14 5 Z" className="fill-catalyst" />
          <rect x={LABEL_X + 4} y={-9} width={62} height={18} rx={4} className="fill-void-surfaceMuted" />
          <text
            x={LABEL_X + 10}
            y={4}
            className="fill-catalyst-light font-telemetry text-[11px]"
            style={{ fontSize: '11px', fontFamily: 'Geist Mono, JetBrains Mono, monospace', fill: '#C47CFF' }}
          >
            {livePrice.toFixed(2)}
          </text>
        </motion.g>
      </svg>
    </div>
  );
}
