'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Workspace, WorkspaceRuntime } from './workspaceTypes';
const ACTIVE_WORKSPACE_STORAGE_KEY = 'rcentz_active_workspace_id';

type WorkspaceContextValue = WorkspaceRuntime & {
  loading: boolean;

  refreshWorkspaces: () => Promise<void>;

  switchWorkspace: (workspaceId: string) => Promise<void>;
};

type WorkspaceProviderProps = {
  children: ReactNode;
};

const defaultRuntime: WorkspaceRuntime = {
  activeWorkspace: null,
  availableWorkspaces: [],

  isLive: false,
  isDemo: false,
  isPractice: false,
  isSandbox: false,

  switchingWorkspace: false,
  error: null
};

const guestWorkspace: Workspace = {
  id: 'guest-live',
  slug: 'aj-logik-guest',
  name: 'AJ Logik',

  mode: 'LIVE',

  active: true,
  resettable: false,

  membership: {
    role: 'MEMBER',
    active: true
  },

  wallet: null
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

async function readJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? 'Workspace request failed.');
  }

  return data;
}

function createRuntime(
  availableWorkspaces: Workspace[],
  activeWorkspace: Workspace | null,
  options?: {
    switchingWorkspace?: boolean;
    error?: string | null;
  }
): WorkspaceRuntime {
  return {
    activeWorkspace,
    availableWorkspaces,

    isLive: activeWorkspace?.mode === 'LIVE',
    isDemo: activeWorkspace?.mode === 'DEMO',
    isPractice: activeWorkspace?.mode === 'PRACTICE',
    isSandbox: activeWorkspace?.mode === 'SANDBOX',

    switchingWorkspace: options?.switchingWorkspace ?? false,

    error: options?.error ?? null
  };
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [runtime, setRuntime] = useState<WorkspaceRuntime>(defaultRuntime);

  const [loading, setLoading] = useState(true);

  const refreshWorkspaces = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/workspaces', {
        method: 'GET',
        cache: 'no-store'
      });

      if (response.status === 401) {
        window.localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY);

        setRuntime(createRuntime([guestWorkspace], guestWorkspace));
        return;
      }

      const serverRuntime = await readJsonResponse<WorkspaceRuntime>(response);

      const savedWorkspaceId = window.localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY);

      const restoredWorkspace =
        serverRuntime.availableWorkspaces.find(workspace => workspace.id === savedWorkspaceId) ??
        serverRuntime.activeWorkspace ??
        serverRuntime.availableWorkspaces[0] ??
        null;

      setRuntime(createRuntime(serverRuntime.availableWorkspaces, restoredWorkspace));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load AJ Logik.';

      setRuntime(current =>
        createRuntime(current.availableWorkspaces, current.activeWorkspace, {
          error: message
        })
      );
    } finally {
      setLoading(false);
    }
  }, []);
  const switchWorkspace = useCallback(
    async (workspaceId: string) => {
      const nextWorkspace = runtime.availableWorkspaces.find(workspace => workspace.id === workspaceId);

      if (!nextWorkspace) {
        setRuntime(current =>
          createRuntime(current.availableWorkspaces, current.activeWorkspace, {
            error: 'The selected workspace is unavailable.'
          })
        );

        return;
      }

      if (nextWorkspace.id === runtime.activeWorkspace?.id) {
        return;
      }

      setRuntime(current =>
        createRuntime(current.availableWorkspaces, current.activeWorkspace, {
          switchingWorkspace: true
        })
      );

      window.localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, nextWorkspace.id);

      setRuntime(createRuntime(runtime.availableWorkspaces, nextWorkspace));
    },
    [runtime.activeWorkspace?.id, runtime.availableWorkspaces]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshWorkspaces();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshWorkspaces]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      ...runtime,
      loading,
      refreshWorkspaces,
      switchWorkspace
    }),
    [runtime, loading, refreshWorkspaces, switchWorkspace]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider.');
  }

  return context;
}
