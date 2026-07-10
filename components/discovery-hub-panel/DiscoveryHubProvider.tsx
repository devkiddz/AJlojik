'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import type { HubContextValue, HubGroup, HubGroupId, HubPreview, HubWidget } from './discoveryHubTypes';

const DiscoveryHubContext = createContext<HubContextValue | null>(null);

type DiscoveryHubProviderProps = {
  groups: HubGroup[];
  widgets: HubWidget[];
  children: ReactNode;
};

export function DiscoveryHubProvider({ groups, widgets, children }: DiscoveryHubProviderProps) {
  const [activeGroupId, setActiveGroupId] = useState<HubGroupId>('home');
  const [activePreview, setActivePreview] = useState<HubPreview | null>(null);

  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => a.order - b.order);
  }, [groups]);

  const sortedWidgets = useMemo(() => {
    return [...widgets].filter(widget => widget.enabled).sort((a, b) => a.order - b.order);
  }, [widgets]);

  const openPreview = (preview: HubPreview) => {
    setActivePreview(preview);
  };

  const closePreview = () => {
    setActivePreview(null);
  };

  const value: HubContextValue = {
    groups: sortedGroups,
    widgets: sortedWidgets,
    activeGroupId,
    activePreview,
    setActiveGroupId,
    openPreview,
    closePreview
  };

  return <DiscoveryHubContext.Provider value={value}>{children}</DiscoveryHubContext.Provider>;
}

export function useDiscoveryHub() {
  const context = useContext(DiscoveryHubContext);

  if (!context) {
    throw new Error('useDiscoveryHub must be used within a DiscoveryHubProvider');
  }

  return context;
}
