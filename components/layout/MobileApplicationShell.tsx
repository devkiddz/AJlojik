'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

import MobileBottomNavigation from '@/components/navigation/MobileBottomNavigation';

import {
  CUSTOMER_EXPERIENCE_START_FRESH_EVENT,
  requestFreshStoreExperience
} from '@/features/customer-experience/customerExperienceEvents';

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

  const resetToStore =
    useCallback(
      () => {
        setDiscoveryOpen(
          false
        );

        requestFreshStoreExperience();
      },
      []
    );

  useEffect(() => {
    const closeForFreshStore =
      () => {
        setDiscoveryOpen(
          false
        );
      };

    window.addEventListener(
      CUSTOMER_EXPERIENCE_START_FRESH_EVENT,
      closeForFreshStore
    );

    return () => {
      window.removeEventListener(
        CUSTOMER_EXPERIENCE_START_FRESH_EVENT,
        closeForFreshStore
      );
    };
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

      <MobileBottomNavigation
        discoveryOpen={discoveryOpen}
        onToggleDiscovery={toggleDiscovery}
        onResetToStore={resetToStore}
      />
    </MobileDiscoveryContext.Provider>
  );
}
