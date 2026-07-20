'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import type {
  HubContextValue,
  HubGroup,
  HubGroupId,
  HubPreview,
  HubWidget
} from '@/components/discovery-hub-panel/discoveryHubTypes';

const DiscoveryHubContext =
  createContext<HubContextValue | null>(
    null
  );

type DiscoveryHubProviderProps = {
  groups: HubGroup[];
  widgets: HubWidget[];
  children: ReactNode;

  activeGroupId?: HubGroupId;

  onActiveGroupIdChange?: (
    groupId: HubGroupId
  ) => void;
};

export function DiscoveryHubProvider({
  groups,
  widgets,
  children,
  activeGroupId:
    controlledGroupId,
  onActiveGroupIdChange
}: DiscoveryHubProviderProps) {
  const sortedGroups =
    useMemo(
      () =>
        [...groups].sort(
          (
            firstGroup,
            secondGroup
          ) =>
            firstGroup.order -
            secondGroup.order
        ),
      [groups]
    );

  const sortedWidgets =
    useMemo(
      () =>
        [...widgets]
          .filter(
            widget =>
              widget.enabled
          )
          .sort(
            (
              firstWidget,
              secondWidget
            ) =>
              firstWidget.order -
              secondWidget.order
          ),
      [widgets]
    );

  const firstGroupId =
    sortedGroups[0]?.id ?? '';

  const [
    internalActiveGroupId,
    setInternalActiveGroupId
  ] = useState<HubGroupId>(
    firstGroupId
  );

  const [
    activePreview,
    setActivePreview
  ] =
    useState<HubPreview | null>(
      null
    );

  const requestedGroupId =
    controlledGroupId ??
    internalActiveGroupId;

  const requestedGroupExists =
    sortedGroups.some(
      group =>
        group.id ===
        requestedGroupId
    );

  const activeGroupId =
    requestedGroupExists
      ? requestedGroupId
      : firstGroupId;

  useEffect(() => {
    if (
      controlledGroupId !==
      undefined
    ) {
      return;
    }

    if (
      requestedGroupExists
    ) {
      return;
    }

    setInternalActiveGroupId(
      firstGroupId
    );
  }, [
    controlledGroupId,
    firstGroupId,
    requestedGroupExists
  ]);

  const setActiveGroupId =
    useCallback(
      (
        groupId: HubGroupId
      ) => {
        const groupExists =
          sortedGroups.some(
            group =>
              group.id ===
              groupId
          );

        if (!groupExists) {
          return;
        }

        if (
          onActiveGroupIdChange
        ) {
          onActiveGroupIdChange(
            groupId
          );

          return;
        }

        setInternalActiveGroupId(
          groupId
        );
      },
      [
        onActiveGroupIdChange,
        sortedGroups
      ]
    );

  const openPreview =
    useCallback(
      (
        preview: HubPreview
      ) => {
        setActivePreview(
          preview
        );
      },
      []
    );

  const closePreview =
    useCallback(() => {
      setActivePreview(null);
    }, []);

  const value =
    useMemo<HubContextValue>(
      () => ({
        groups: sortedGroups,
        widgets:
          sortedWidgets,

        activeGroupId,
        activePreview,

        setActiveGroupId,
        openPreview,
        closePreview
      }),
      [
        activeGroupId,
        activePreview,
        closePreview,
        openPreview,
        setActiveGroupId,
        sortedGroups,
        sortedWidgets
      ]
    );

  return (
    <DiscoveryHubContext.Provider
      value={value}
    >
      {children}
    </DiscoveryHubContext.Provider>
  );
}

export function useDiscoveryHub() {
  const context =
    useContext(
      DiscoveryHubContext
    );

  if (!context) {
    throw new Error(
      'useDiscoveryHub must be used within a DiscoveryHubProvider'
    );
  }

  return context;
}
