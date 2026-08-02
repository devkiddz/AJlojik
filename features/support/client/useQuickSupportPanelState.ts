'use client';

import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  useWorkspace
} from '@/features/workspace';

export type QuickSupportPanelMode =
  | 'minimized'
  | 'open';

const STORAGE_PREFIX =
  'aj_quick_support_panel_state';

type QuickSupportPanelState = {
  workspaceId:
    string |
    null;
  mode:
    QuickSupportPanelMode;
  hydrated:
    boolean;
  markOpen:
    () => void;
  markMinimized:
    () => void;
};

function storageKey(
  workspaceId: string
): string {
  return `${STORAGE_PREFIX}:${workspaceId}`;
}

function readMode(
  workspaceId: string
): QuickSupportPanelMode {
  try {
    const stored =
      window.localStorage.getItem(
        storageKey(
          workspaceId
        )
      );

    return stored ===
      'open'
      ? 'open'
      : 'minimized';
  } catch {
    return 'minimized';
  }
}

function writeMode(
  workspaceId: string,
  mode: QuickSupportPanelMode
): void {
  try {
    window.localStorage.setItem(
      storageKey(
        workspaceId
      ),
      mode
    );
  } catch {
    // Persistence is an enhancement.
    // The current session still works.
  }
}

export function useQuickSupportPanelState():
  QuickSupportPanelState {
  const {
    activeWorkspace
  } =
    useWorkspace();

  const workspaceId =
    activeWorkspace?.id ??
    null;

  const [
    mode,
    setMode
  ] =
    useState<QuickSupportPanelMode>(
      'minimized'
    );

  const [
    hydrated,
    setHydrated
  ] =
    useState(false);

  useEffect(
    () => {
      const timer =
        window.setTimeout(
          () => {
            if (
              !workspaceId
            ) {
              setMode(
                'minimized'
              );

              setHydrated(
                true
              );

              return;
            }

            setMode(
              readMode(
                workspaceId
              )
            );

            setHydrated(
              true
            );
          },
          0
        );

      return () => {
        window.clearTimeout(
          timer
        );
      };
    },
    [
      workspaceId
    ]
  );

  const persist =
    useCallback(
      (
        next:
          QuickSupportPanelMode
      ): void => {
        setMode(
          next
        );

        if (
          workspaceId
        ) {
          writeMode(
            workspaceId,
            next
          );
        }
      },
      [
        workspaceId
      ]
    );

  const markOpen =
    useCallback(
      (): void => {
        persist(
          'open'
        );
      },
      [
        persist
      ]
    );

  const markMinimized =
    useCallback(
      (): void => {
        persist(
          'minimized'
        );
      },
      [
        persist
      ]
    );

  return {
    workspaceId,
    mode,
    hydrated,
    markOpen,
    markMinimized
  };
}
