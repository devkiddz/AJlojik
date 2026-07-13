'use client';

import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import type { HubContextValue, HubGroup, HubGroupId, HubPreview, HubWidget } from './discoveryHubTypes';

const DiscoveryHubContext = createContext<HubContextValue | null>(null);

type DiscoveryHubProviderProps = {
  groups: HubGroup[];
  widgets: HubWidget[];
  children: ReactNode;

  /**
   * Optional controlled group state.
   * DesktopDiscoveryRail uses this so the selected tab survives
   * compact/expanded transitions.
   */
  activeGroupId?: HubGroupId;

  onActiveGroupIdChange?: (groupId: HubGroupId) => void;
};

export function DiscoveryHubProvider({
  groups,
  widgets,
  children,
  activeGroupId: controlledGroupId,
  onActiveGroupIdChange
}: DiscoveryHubProviderProps) {
  const [internalActiveGroupId, setInternalActiveGroupId] = useState<HubGroupId>('home');

  const [activePreview, setActivePreview] = useState<HubPreview | null>(null);

  const activeGroupId = controlledGroupId ?? internalActiveGroupId;

  const setActiveGroupId = (groupId: HubGroupId) => {
    if (onActiveGroupIdChange) {
      onActiveGroupIdChange(groupId);
      return;
    }

    setInternalActiveGroupId(groupId);
  };

  const sortedGroups = useMemo(
    () => [...groups].sort((firstGroup, secondGroup) => firstGroup.order - secondGroup.order),
    [groups]
  );

  const sortedWidgets = useMemo(
    () =>
      [...widgets]
        .filter(widget => widget.enabled)
        .sort((firstWidget, secondWidget) => firstWidget.order - secondWidget.order),
    [widgets]
  );

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
