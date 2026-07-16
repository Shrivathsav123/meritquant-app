import { AnimatePresence, motion } from 'framer-motion';
import type { ComponentType } from 'react';
import { useBrokerSync } from './services/useBrokerSync';
import { usePortfolioStore } from './store/usePortfolioStore';
import type { TabId } from './store/types';
import { channelTransition } from './lib/motion';
import { PortfolioChannel } from './components/portfolio/PortfolioChannel';
import { SignalsChannel } from './components/signals/SignalsChannel';
import { NewsTerminal } from './components/news/NewsTerminal';
import { ChartsChannel } from './components/charts/ChartsChannel';
import { AIChannel } from './components/ai/AIChannel';
import { FloatingDock } from './components/layout/FloatingDock';
import { SignalDetailModal } from './components/drilldown/SignalDetailModal';
const CHANNELS: Record<TabId, ComponentType> = {
  portfolio: PortfolioChannel,
  signals: SignalsChannel,
  news: NewsTerminal,
  charts: ChartsChannel,
  ai: AIChannel,
};
export default function App() {
  useBrokerSync();
  const activeTab = usePortfolioStore((s) => s.activeTab);
  const Channel = CHANNELS[activeTab];
  return (
    <div className="min-h-dvh bg-void-base font-interface text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(122,18,255,0.08),transparent)]" />
      <main className="relative mx-auto max-w-md px-4 pb-32 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={channelTransition}
          >
            <Channel />
          </motion.div>
        </AnimatePresence>
      </main>
      <FloatingDock />
      <SignalDetailModal />
    </div>
  );
}
