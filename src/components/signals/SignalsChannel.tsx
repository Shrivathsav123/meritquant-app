import { useMemo, useState } from 'react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { FilterPillRow, type SignalFilter } from './FilterPillRow';
import { SignalCard } from './SignalCard';
export function SignalsChannel() {
  const signals = usePortfolioStore((s) => s.signals);
  const [filter, setFilter] = useState<SignalFilter>('ALL');
  const available = useMemo<SignalFilter[]>(
    () => ['ALL', ...new Set(signals.map((s) => s.type))],
    [signals],
  );
  const visible = useMemo(
    () => (filter === 'ALL' ? signals : signals.filter((s) => s.type === filter)),
    [signals, filter],
  );
  return (
    <div className="space-y-4">
      <FilterPillRow available={available} active={filter} onChange={setFilter} />
      <div className="space-y-3">
        {visible.map((sig) => <SignalCard key={sig.id} signal={sig} />)}
      </div>
    </div>
  );
}
