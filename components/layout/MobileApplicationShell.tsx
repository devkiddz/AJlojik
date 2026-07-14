'use client';

import { useState, type ReactNode } from 'react';

import MobileDiscoverySheet from '@/components/discovery-hub-panel/MobileDiscoverySheet';
import MobileBottomNavigation from '@/components/navigation/MobileBottomNavigation';

type MobileApplicationShellProps = {
  children: ReactNode;
};

export default function MobileApplicationShell({ children }: MobileApplicationShellProps) {
  const [discoveryOpen, setDiscoveryOpen] = useState(false);

  return (
    <>
      <div className="min-h-dvh pb-24 lg:pb-0">{children}</div>

      <MobileDiscoverySheet open={discoveryOpen} onOpenChange={setDiscoveryOpen} />

      <MobileBottomNavigation
        discoveryOpen={discoveryOpen}
        onToggleDiscovery={() => {
          setDiscoveryOpen(current => !current);
        }}
      />
    </>
  );
}
