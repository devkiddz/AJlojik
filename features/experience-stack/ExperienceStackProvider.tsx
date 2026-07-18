'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useFeedExperience } from '@/features/feed-experience';

import type { FeedIntent } from '@/features/feed-experience/contracts';

import { useIdentity } from '@/providers/IdentityProvider';

import type {
  ExperienceHistoryEntry,
  ExperienceHistorySettings,
  ExperienceHistorySource,
  ExperienceStackState
} from './experienceStackTypes';

// ============================================================
// INPUT CONTRACTS
// ============================================================

export type PushExperienceInput = {
  label: string;
  subtitle?: string | null;

  categorySlug: string;
  source: ExperienceHistorySource;

  experienceId?: string | null;
  campaignId?: string | null;
  collectionId?: string | null;
  productId?: string | null;

  intentSnapshot: FeedIntent;

  contextSnapshot?: Record<string, unknown> | null;

  fingerprint: string;
};

export type UpdateHistorySettingsInput = {
  enabled?: boolean;

  retention?: ExperienceHistorySettings['retention'];

  maxEntries?: number;
};

// ============================================================
// PROVIDER CONTRACT
// ============================================================

type ExperienceStackContextValue = ExperienceStackState & {
  workspaceId: string;

  loading: boolean;
  error: string | null;

  canAccessExperienceModes: boolean;

  requireExperienceAccess: () => boolean;

  refreshHistory: () => Promise<void>;

  pushExperience: (input: PushExperienceInput) => Promise<ExperienceHistoryEntry | null>;

  goBack: () => Promise<ExperienceHistoryEntry | null>;

  jumpTo: (entryId: string) => Promise<ExperienceHistoryEntry | null>;

  clearHistory: () => Promise<void>;

  startFresh: () => Promise<void>;

  updateSettings: (input: UpdateHistorySettingsInput) => Promise<void>;
};

type ExperienceStackProviderProps = {
  children: ReactNode;
  workspaceId: string;
  initialState?: ExperienceStackState;
};

// ============================================================
// DEFAULT STATE
// ============================================================

const defaultSettings: ExperienceHistorySettings = {
  enabled: true,
  retention: 'SEVEN_DAYS',
  maxEntries: 20
};

const defaultState: ExperienceStackState = {
  entries: [],
  settings: defaultSettings,
  canGoBack: false,
  currentEntry: null
};

const ExperienceStackContext = createContext<ExperienceStackContextValue | null>(null);

const EXPERIENCE_AUTH_ROUTE = '/sign-in';

// ============================================================
// RESPONSE ERROR
// ============================================================

class ExperienceStackRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);

    this.name = 'ExperienceStackRequestError';

    this.status = status;
  }
}

// ============================================================
// RESPONSE HELPER
// ============================================================

async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';

  const rawBody = await response.text();

  let parsedData: unknown;
  let parsedSuccessfully = false;

  if (rawBody && contentType.includes('application/json')) {
    try {
      parsedData = JSON.parse(rawBody);

      parsedSuccessfully = true;
    } catch {
      throw new ExperienceStackRequestError('The Experience Stack returned invalid JSON.', response.status);
    }
  }

  if (!response.ok) {
    const errorData =
      typeof parsedData === 'object' && parsedData !== null
        ? (parsedData as {
            error?: unknown;
          })
        : null;

    const message =
      typeof errorData?.error === 'string' ? errorData.error : 'The Experience Stack request failed.';

    throw new ExperienceStackRequestError(message, response.status);
  }

  if (!parsedSuccessfully) {
    throw new ExperienceStackRequestError(
      `The Experience Stack returned an unexpected response (${response.status}).`,
      response.status
    );
  }

  return parsedData as T;
}

// ============================================================
// PROVIDER
// ============================================================

export function ExperienceStackProvider({
  children,
  workspaceId,
  initialState = defaultState
}: ExperienceStackProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, isPending } = useIdentity();

  const { actions } = useFeedExperience();

  const [entries, setEntries] = useState(initialState.entries);

  const [settings, setSettings] = useState(initialState.settings);

  const [currentEntry, setCurrentEntry] = useState(initialState.currentEntry);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const canAccessExperienceModes =
    !isPending && isAuthenticated && Boolean(workspaceId) && workspaceId !== 'guest-live';

  // ==========================================================
  // INTERNAL STATE
  // ==========================================================

  const applyStackState = useCallback((state: ExperienceStackState) => {
    setEntries(state.entries);
    setSettings(state.settings);

    setCurrentEntry(state.currentEntry);
  }, []);

  const restoreEntry = useCallback(
    (entry: ExperienceHistoryEntry) => {
      actions.restoreExperience(entry.intentSnapshot as FeedIntent);
    },
    [actions]
  );

  const requestAuthentication = useCallback(() => {
    setError('Create an account or sign in to access personalised Experience modes.');

    const returnTo = encodeURIComponent(pathname || '/');

    router.push(`${EXPERIENCE_AUTH_ROUTE}?returnTo=${returnTo}`);
  }, [pathname, router]);

  const requireExperienceAccess = useCallback((): boolean => {
    if (isPending) {
      setError('Confirming your account session.');

      return false;
    }

    if (!isAuthenticated) {
      requestAuthentication();

      return false;
    }

    if (!workspaceId || workspaceId === 'guest-live') {
      setError('Your account workspace is not available yet.');

      return false;
    }

    setError(null);

    return true;
  }, [isAuthenticated, isPending, requestAuthentication, workspaceId]);

  const runOperation = useCallback(
    async <T,>(operation: () => Promise<T>, fallback: T): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        return await operation();
      } catch (operationError) {
        const message =
          operationError instanceof Error
            ? operationError.message
            : 'An unexpected Experience Stack error occurred.';

        setError(message);

        if (operationError instanceof ExperienceStackRequestError && operationError.status === 401) {
          requestAuthentication();
        }

        return fallback;
      } finally {
        setLoading(false);
      }
    },
    [requestAuthentication]
  );

  // ==========================================================
  // REFRESH
  // ==========================================================

  const refreshHistory = useCallback(async () => {
    if (isPending) {
      return;
    }

    /*
     * Guests do not receive local Experience
     * history anymore.
     */
    if (!canAccessExperienceModes) {
      applyStackState(defaultState);
      setError(null);

      return;
    }

    await runOperation(async () => {
      const params = new URLSearchParams({
        workspaceId
      });

      const response = await fetch(`/api/experience-history?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store'
      });

      const state = await readJsonResponse<ExperienceStackState>(response);

      applyStackState(state);
    }, undefined);
  }, [applyStackState, canAccessExperienceModes, isPending, runOperation, workspaceId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshHistory();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshHistory]);

  // ==========================================================
  // PUSH
  // ==========================================================

  const pushExperience = useCallback(
    async (input: PushExperienceInput): Promise<ExperienceHistoryEntry | null> => {
      if (!requireExperienceAccess()) {
        return null;
      }

      if (!settings.enabled) {
        return null;
      }

      return runOperation(async () => {
        const response = await fetch('/api/experience-history', {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            workspaceId,
            ...input
          })
        });

        const entry = await readJsonResponse<ExperienceHistoryEntry | null>(response);

        if (!entry) {
          return null;
        }

        setEntries(currentEntries => {
          const withoutDuplicate = currentEntries.filter(currentEntry => currentEntry.id !== entry.id);

          return [entry, ...withoutDuplicate].slice(0, settings.maxEntries);
        });

        setCurrentEntry(entry);

        return entry;
      }, null);
    },
    [requireExperienceAccess, runOperation, settings.enabled, settings.maxEntries, workspaceId]
  );

  // ==========================================================
  // BACK
  // ==========================================================

  const goBack = useCallback(async (): Promise<ExperienceHistoryEntry | null> => {
    if (!requireExperienceAccess()) {
      return null;
    }

    return runOperation(async () => {
      const response = await fetch('/api/experience-history/back', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          workspaceId
        })
      });

      const result = await readJsonResponse<{
        previousEntry: ExperienceHistoryEntry | null;

        removedEntryId: string | null;
      }>(response);

      if (!result.previousEntry) {
        return null;
      }

      setEntries(currentEntries => currentEntries.filter(entry => entry.id !== result.removedEntryId));

      setCurrentEntry(result.previousEntry);

      restoreEntry(result.previousEntry);

      return result.previousEntry;
    }, null);
  }, [requireExperienceAccess, restoreEntry, runOperation, workspaceId]);

  // ==========================================================
  // JUMP
  // ==========================================================

  const jumpTo = useCallback(
    async (entryId: string): Promise<ExperienceHistoryEntry | null> => {
      if (!requireExperienceAccess()) {
        return null;
      }

      return runOperation(async () => {
        const response = await fetch('/api/experience-history/jump', {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            workspaceId,
            entryId
          })
        });

        const entry = await readJsonResponse<ExperienceHistoryEntry | null>(response);

        if (!entry) {
          return null;
        }

        setEntries(currentEntries => [
          entry,

          ...currentEntries.filter(currentEntry => currentEntry.id !== entry.id)
        ]);

        setCurrentEntry(entry);

        restoreEntry(entry);

        return entry;
      }, null);
    },
    [requireExperienceAccess, restoreEntry, runOperation, workspaceId]
  );

  // ==========================================================
  // CLEAR
  // ==========================================================

  const clearHistory = useCallback(async () => {
    if (!requireExperienceAccess()) {
      return;
    }

    await runOperation(async () => {
      const response = await fetch('/api/experience-history', {
        method: 'DELETE',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          workspaceId
        })
      });

      await readJsonResponse<{
        deletedCount: number;
      }>(response);

      setEntries([]);
      setCurrentEntry(null);
    }, undefined);
  }, [requireExperienceAccess, runOperation, workspaceId]);

  // ==========================================================
  // START FRESH
  // ==========================================================

  const startFresh = useCallback(async () => {
    if (!requireExperienceAccess()) {
      return;
    }

    await clearHistory();

    actions.resetExperience();
  }, [actions, clearHistory, requireExperienceAccess]);

  // ==========================================================
  // SETTINGS
  // ==========================================================

  const updateSettings = useCallback(
    async (input: UpdateHistorySettingsInput) => {
      if (!requireExperienceAccess()) {
        return;
      }

      await runOperation(async () => {
        const response = await fetch('/api/experience-history/settings', {
          method: 'PATCH',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            workspaceId,
            ...input
          })
        });

        const updatedSettings = await readJsonResponse<ExperienceHistorySettings>(response);

        setSettings(updatedSettings);

        setEntries(currentEntries => currentEntries.slice(0, updatedSettings.maxEntries));

        if (!updatedSettings.enabled) {
          setCurrentEntry(null);
        }
      }, undefined);
    },
    [requireExperienceAccess, runOperation, workspaceId]
  );

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = useMemo<ExperienceStackContextValue>(
    () => ({
      workspaceId,

      entries,
      settings,
      currentEntry,

      canGoBack: canAccessExperienceModes && entries.length > 1,

      loading,
      error,

      canAccessExperienceModes,
      requireExperienceAccess,

      refreshHistory,
      pushExperience,
      goBack,
      jumpTo,
      clearHistory,
      startFresh,
      updateSettings
    }),
    [
      workspaceId,
      entries,
      settings,
      currentEntry,
      canAccessExperienceModes,
      loading,
      error,
      requireExperienceAccess,
      refreshHistory,
      pushExperience,
      goBack,
      jumpTo,
      clearHistory,
      startFresh,
      updateSettings
    ]
  );

  return <ExperienceStackContext.Provider value={value}>{children}</ExperienceStackContext.Provider>;
}

// ============================================================
// HOOK
// ============================================================

export function useExperienceStack() {
  const context = useContext(ExperienceStackContext);

  if (!context) {
    throw new Error('useExperienceStack must be used within ExperienceStackProvider.');
  }

  return context;
}
