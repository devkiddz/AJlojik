'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import type {
  HubContextValue,
  HubGroup,
  HubGroupId,
  HubPreview,
  HubWidget
} from '@/components/discovery-hub-panel/discoveryHubTypes';

const DEFAULT_HUB_GROUP_ID: HubGroupId = 'home';

const DiscoveryHubContext = createContext<HubContextValue | null>(null);

type DiscoveryHubProviderProps = {
  groups: HubGroup[];
  widgets: HubWidget[];
  children: ReactNode;

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

  const firstGroupId = sortedGroups[0]?.id ?? DEFAULT_HUB_GROUP_ID;

  const [internalActiveGroupId, setInternalActiveGroupId] = useState<HubGroupId>(
    () => controlledGroupId ?? firstGroupId
  );

  const [activePreview, setActivePreview] = useState<HubPreview | null>(null);

  const requestedGroupId = controlledGroupId ?? internalActiveGroupId;

  const requestedGroupExists = sortedGroups.some(group => group.id === requestedGroupId);

  /**
   * Do not synchronously repair state inside an effect.
   *
   * When the requested group no longer exists, the provider
   * safely exposes the first available group instead.
   */
  const activeGroupId = requestedGroupExists ? requestedGroupId : firstGroupId;

  const setActiveGroupId = useCallback(
    (groupId: HubGroupId) => {
      const groupExists = sortedGroups.some(group => group.id === groupId);

      if (!groupExists) {
        return;
      }

      if (onActiveGroupIdChange) {
        onActiveGroupIdChange(groupId);

        return;
      }

      setInternalActiveGroupId(groupId);
    },
    [onActiveGroupIdChange, sortedGroups]
  );

  const openPreview = useCallback((preview: HubPreview) => {
    setActivePreview(preview);
  }, []);

  const closePreview = useCallback(() => {
    setActivePreview(null);
  }, []);

  const value = useMemo<HubContextValue>(
    () => ({
      groups: sortedGroups,
      widgets: sortedWidgets,

      activeGroupId,
      activePreview,

      setActiveGroupId,
      openPreview,
      closePreview
    }),
    [activeGroupId, activePreview, closePreview, openPreview, setActiveGroupId, sortedGroups, sortedWidgets]
  );

  return <DiscoveryHubContext.Provider value={value}>{children}</DiscoveryHubContext.Provider>;
}

export function useDiscoveryHub() {
  const context = useContext(DiscoveryHubContext);

  if (!context) {
    throw new Error('useDiscoveryHub must be used within a DiscoveryHubProvider');
  }

  return context;
}
