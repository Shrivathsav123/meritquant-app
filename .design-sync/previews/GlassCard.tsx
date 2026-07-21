import { GlassCard } from 'meritquant-app-ui';

export function Default() {
  return (
    <GlassCard className="w-72 p-5">
      <p className="font-interface text-[10px] uppercase tracking-widest text-system-slate">
        Portfolio Value
      </p>
      <p className="mt-1 font-telemetry text-2xl font-bold text-white">$284,910.42</p>
      <p className="mt-1 font-telemetry text-sm text-bull">+2.34% today</p>
    </GlassCard>
  );
}

export function Empty() {
  return <GlassCard className="h-24 w-72" />;
}
