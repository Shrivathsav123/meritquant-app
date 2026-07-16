import { create } from 'zustand';
import type { NewsItem } from './types';
interface NewsStore {
  items: NewsItem[];
  lastUpdatedAt: number;
  push: (n: NewsItem) => void;
}
const FEED_CAP = 50;
export const useNewsStore = create<NewsStore>()((set) => ({
  items: [],
  lastUpdatedAt: Date.now(),
  push: (n) =>
    set((s) => ({
      items: [n, ...s.items].slice(0, FEED_CAP),
      lastUpdatedAt: Date.now(),
    })),
}));
