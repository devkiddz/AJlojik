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
// RESPONSE HELPER
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

  const isGuestWorkspace = workspaceId === 'guest-live';

  const [entries, setEntries] = useState(initialState.entries);

  const [settings, setSettings] = useState(initialState.settings);

  const [currentEntry, setCurrentEntry] = useState(initialState.currentEntry);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

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
    });
  }, [applyStackState, isGuestWorkspace, runOperation, workspaceId]);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  // ==========================================================
  // PUSH
  // ==========================================================

  const pushExperience = useCallback(
    async (input: PushExperienceInput): Promise<ExperienceHistoryEntry | null> => {
      if (!settings.enabled) {
        return null;
      }

      if (isGuestWorkspace) {
        const now = new Date().toISOString();

        const guestEntry: ExperienceHistoryEntry = {
          id: `guest:${input.fingerprint}`,
          label: input.label,
          subtitle: input.subtitle ?? null,

          categorySlug: input.categorySlug,
          source: input.source,

          experienceId: input.experienceId ?? null,
          campaignId: input.campaignId ?? null,
          collectionId: input.collectionId ?? null,
          productId: input.productId ?? null,

          intentSnapshot: input.intentSnapshot,
          contextSnapshot: input.contextSnapshot ?? null,

          fingerprint: input.fingerprint,

          visitedAt: now,
          expiresAt: null
        };

        setEntries(currentEntries => {
          const withoutDuplicate = currentEntries.filter(
            entry => entry.fingerprint !== guestEntry.fingerprint
          );

          return [guestEntry, ...withoutDuplicate].slice(0, settings.maxEntries);
        });

        setCurrentEntry(guestEntry);

        return guestEntry;
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
    [isGuestWorkspace, runOperation, settings.enabled, settings.maxEntries, workspaceId]
  );

  // ==========================================================
  // BACK
  // ==========================================================

  const goBack = useCallback(async () => {
    if (isGuestWorkspace) {
      const previousEntry = entries[1] ?? null;

      if (!previousEntry) {
        return null;
      }

      setEntries(currentEntries => currentEntries.slice(1));

      setCurrentEntry(previousEntry);
      restoreEntry(previousEntry);

      return previousEntry;
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
    });
  }, [entries, isGuestWorkspace, restoreEntry, runOperation, workspaceId]);

  // ==========================================================
  // JUMP
  // ==========================================================

  const jumpTo = useCallback(
    async (entryId: string): Promise<ExperienceHistoryEntry | null> => {
      if (isGuestWorkspace) {
        const selectedEntry = entries.find(entry => entry.id === entryId) ?? null;

        if (!selectedEntry) {
          return null;
        }

        const refreshedEntry = {
          ...selectedEntry,
          visitedAt: new Date().toISOString()
        };

        setEntries(currentEntries => [
          refreshedEntry,
          ...currentEntries.filter(entry => entry.id !== entryId)
        ]);

        setCurrentEntry(refreshedEntry);
        restoreEntry(refreshedEntry);

        return refreshedEntry;
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
      });
    },
    [entries, isGuestWorkspace, restoreEntry, runOperation, workspaceId]
  );

  // ==========================================================
  // CLEAR
  // ==========================================================

  const clearHistory = useCallback(async () => {
    if (isGuestWorkspace) {
      setEntries([]);
      setCurrentEntry(null);
      setError(null);
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
    });
  }, [isGuestWorkspace, runOperation, workspaceId]);

  // ==========================================================
  // START FRESH
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
      if (isGuestWorkspace) {
        setSettings(currentSettings => ({
          ...currentSettings,
          ...input
        }));

        if (input.maxEntries !== undefined) {
          setEntries(currentEntries => currentEntries.slice(0, input.maxEntries));
        }

        if (input.enabled === false) {
          setCurrentEntry(null);
        }

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
      });
    },
    [isGuestWorkspace, runOperation, workspaceId]
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
