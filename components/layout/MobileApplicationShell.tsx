'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import MobileBottomNavigation from '@/components/navigation/MobileBottomNavigation';

type MobileApplicationShellProps = {
  children: ReactNode;
};

type MobileDiscoveryContextValue = {
  discoveryOpen: boolean;

  openDiscovery: () => void;
  closeDiscovery: () => void;
  toggleDiscovery: () => void;

  setDiscoveryOpen: (open: boolean) => void;
};

const MobileDiscoveryContext = createContext<MobileDiscoveryContextValue | null>(null);

export function useMobileDiscovery() {
  const value = useContext(MobileDiscoveryContext);

  if (!value) {
    throw new Error('useMobileDiscovery must be used inside MobileApplicationShell.');
  }

  return value;
}

export default function MobileApplicationShell({ children }: MobileApplicationShellProps) {
  const [discoveryOpen, setDiscoveryOpen] = useState(false);

  const openDiscovery = useCallback(() => {
    setDiscoveryOpen(true);
  }, []);

  const closeDiscovery = useCallback(() => {
    setDiscoveryOpen(false);
  }, []);

  const toggleDiscovery = useCallback(() => {
    setDiscoveryOpen(current => !current);
  }, []);

  const contextValue = useMemo<MobileDiscoveryContextValue>(
    () => ({
      discoveryOpen,
      openDiscovery,
      closeDiscovery,
      toggleDiscovery,
      setDiscoveryOpen
    }),
    [discoveryOpen, openDiscovery, closeDiscovery, toggleDiscovery]
  );

  return (
    <MobileDiscoveryContext.Provider value={contextValue}>
      <div className="min-h-dvh pb-24 lg:pb-0">{children}</div>

      <MobileBottomNavigation discoveryOpen={discoveryOpen} onToggleDiscovery={toggleDiscovery} />
    </MobileDiscoveryContext.Provider>
  );
}
