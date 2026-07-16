import { useEffect } from 'react';
import { resolveProvider, type AuthContext } from './brokerProvider';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { useNewsStore } from '../store/useNewsStore';
function useAuth(): AuthContext | null {
  return { userId: 'dev-user', accessToken: 'dev-token' };
}
export function useBrokerSync(): void {
  const auth = useAuth();
  useEffect(() => {
    if (!auth) return;
    let alive = true;
    const offs: Array<() => void> = [];
    resolveProvider().then((provider) => {
      if (!alive) return;
      provider.fetchSnapshot(auth).then((snap) => {
        if (alive) usePortfolioStore.getState().hydrate(snap);
      });
      offs.push(
        provider.streamTicks(auth, (t) => usePortfolioStore.getState().applyTick(t)),
        provider.streamMacro(auth, (m) => usePortfolioStore.getState().applyMacroTick(m)),
        provider.streamNews(auth, (n) => useNewsStore.getState().push(n)),
      );
    });
    return () => { alive = false; offs.forEach((off) => off()); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.userId]);
}
