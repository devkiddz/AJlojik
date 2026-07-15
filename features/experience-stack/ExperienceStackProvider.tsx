'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useFeedExperience } from '@/features/feed-experience';

import type { FeedIntent } from '@/features/feed-experience/contracts';

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

// ============================================================
// RESPONSE HELPERS
// ============================================================

async function readJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? 'The Experience Stack request failed.');
  }

  return data;
}

// ============================================================
// PROVIDER
// ============================================================

export function ExperienceStackProvider({
  children,
  workspaceId,
  initialState = defaultState
}: ExperienceStackProviderProps) {
  const { actions } = useFeedExperience();

  const [entries, setEntries] = useState(initialState.entries);

  const [settings, setSettings] = useState(initialState.settings);

  const [currentEntry, setCurrentEntry] = useState(initialState.currentEntry);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const isGuestWorkspace = workspaceId === 'guest-live';

  // ==========================================================
  // INTERNAL STATE SYNCHRONIZATION
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

  const runOperation = useCallback(async <T,>(operation: () => Promise<T>): Promise<T> => {
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

      throw operationError;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const refreshHistory = useCallback(async () => {
    if (isGuestWorkspace) {
      applyStackState(defaultState);
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
    });
  }, [applyStackState, isGuestWorkspace, runOperation, workspaceId]);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  // ==========================================================
  // PUSH
  // The Provider decides when an experience is meaningful
  // enough to be persisted.
  // ==========================================================

  const pushExperience = useCallback(
    async (input: PushExperienceInput): Promise<ExperienceHistoryEntry | null> => {
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
      });
    },
    [runOperation, settings.enabled, settings.maxEntries, workspaceId]
  );

  // ==========================================================
  // BACK
  // Removes the current stack entry and restores the previous
  // assembled Feed intent.
  // ==========================================================

  const goBack = useCallback(async () => {
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
    });
  }, [restoreEntry, runOperation, workspaceId]);

  // ==========================================================
  // JUMP
  // Directly restores a selected entry from the History
  // Navigator.
  // ==========================================================

  const jumpTo = useCallback(
    async (entryId: string): Promise<ExperienceHistoryEntry | null> => {
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

        setEntries(currentEntries => {
          const remainingEntries = currentEntries.filter(currentEntry => currentEntry.id !== entry.id);

          return [entry, ...remainingEntries];
        });

        setCurrentEntry(entry);

        restoreEntry(entry);

        return entry;
      });
    },
    [restoreEntry, runOperation, workspaceId]
  );

  // ==========================================================
  // CLEAR
  // Deletes history but leaves the current Feed untouched.
  // ==========================================================

  const clearHistory = useCallback(async () => {
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
    });
  }, [runOperation, workspaceId]);

  // ==========================================================
  // START FRESH
  // Clears history and asks the Feed Provider to return to its
  // baseline category experience.
  // ==========================================================

  const startFresh = useCallback(async () => {
    await clearHistory();

    actions.resetExperience();
  }, [actions, clearHistory]);

  // ==========================================================
  // SETTINGS
  // ==========================================================

  const updateSettings = useCallback(
    async (input: UpdateHistorySettingsInput) => {
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
      });
    },
    [runOperation, workspaceId]
  );

  // ==========================================================
  // DERIVED STATE
  // ==========================================================

  const value = useMemo<ExperienceStackContextValue>(
    () => ({
      workspaceId,

      entries,
      settings,
      currentEntry,

      canGoBack: entries.length > 1,

      loading,
      error,

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
      loading,
      error,
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
