import { PieChart, Radar, Newspaper, CandlestickChart, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import type { TabId } from '../../store/types';
const DOCK_ITEMS: { id: TabId; label: string; Icon: LucideIcon }[] = [
  { id: 'portfolio', label: 'Portfolio', Icon: PieChart },
  { id: 'signals',   label: 'Signals',   Icon: Radar },
  { id: 'news',      label: 'News',      Icon: Newspaper },
  { id: 'charts',    label: 'Charts',    Icon: CandlestickChart },
  { id: 'ai',        label: 'Ask AI',    Icon: Sparkles },
];
export function FloatingDock() {
  const activeTab = usePortfolioStore((s) => s.activeTab);
  const setActiveTab = usePortfolioStore((s) => s.setActiveTab);
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md h-16
                 bg-void-surface/85 backdrop-blur-lg border border-white/10 rounded-full
                 flex items-center justify-around px-6 shadow-2xl z-50"
    >
      {DOCK_ITEMS.map(({ id, label, Icon }) => {
        const active = id === activeTab;
        return (
          <button
            key={id}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            onClick={() => setActiveTab(id)}
            className="relative flex h-full w-11 flex-col items-center justify-center"
          >
            <Icon
              strokeWidth={active ? 2.2 : 1.8}
              className={`h-5 w-5 transition-colors duration-300 ${active ? 'text-white' : 'text-system-slate'}`}
            />
            <span className={`mt-1.5 h-1 w-1 rounded-full ${active ? 'bg-catalyst animate-pulse' : 'bg-transparent'}`} />
          </button>
        );
      })}
    </nav>
  );
}
