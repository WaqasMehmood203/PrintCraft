import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { PublicSite } from '@shared/types';
import { getPublicSite, subscribeStore } from '@/lib/staticStore';

interface SiteState {
  site: PublicSite;
  reload: () => void;
}

const SiteContext = createContext<SiteState | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<PublicSite>(() => getPublicSite());

  const reload = useCallback(() => {
    setSite(getPublicSite());
  }, []);

  useEffect(() => subscribeStore(reload), [reload]);

  return <SiteContext.Provider value={{ site, reload }}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside SiteProvider');
  return ctx;
}
