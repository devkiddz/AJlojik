'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';

import { useRouter } from 'next/navigation';

import { useFeedExperience } from '@/features/feed-experience/hooks/useFeedExperience';
import type { FeedIntent } from '@/features/feed-experience/contracts';

import { useIdentity } from '@/providers/IdentityProvider';

import type {
  ExperienceHistoryEntry,
  ExperienceHistorySettings,
  ExperienceHistorySource,
  ExperienceStackState
} from './experienceStackTypes';

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

const GUEST_STACK_STORAGE_PREFIX = 'rcentz_guest_experience_stack';

function guestStorageKey(workspaceId: string): string {
  return `${GUEST_STACK_STORAGE_PREFIX}:${workspaceId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readGuestState(workspaceId: string): ExperienceStackState {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(guestStorageKey(workspaceId));

    if (!raw) {
      return defaultState;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed) || !Array.isArray(parsed.entries) || !isRecord(parsed.settings)) {
      return defaultState;
    }

    const settings: ExperienceHistorySettings = {
      enabled: parsed.settings.enabled !== false,
      retention:
        typeof parsed.settings.retention === 'string'
          ? (parsed.settings.retention as ExperienceHistorySettings['retention'])
          : defaultSettings.retention,
      maxEntries:
        typeof parsed.settings.maxEntries === 'number'
          ? Math.max(5, Math.min(100, Math.round(parsed.settings.maxEntries)))
          : defaultSettings.maxEntries
    };

    const entries = parsed.entries.filter(isRecord) as unknown as ExperienceHistoryEntry[];
    const boundedEntries = entries.slice(0, settings.maxEntries);

    return {
      entries: boundedEntries,
      settings,
      canGoBack: boundedEntries.length > 1,
      currentEntry: boundedEntries[0] ?? null
    };
  } catch {
    return defaultState;
  }
}

function writeGuestState(workspaceId: string, state: ExperienceStackState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(guestStorageKey(workspaceId), JSON.stringify(state));
  } catch {
    // Guest history is a convenience layer and must never block shopping.
  }
}

function currentCustomerRoute(): string {
  if (typeof window === 'undefined') {
    return '/';
  }

  return `${window.location.pathname}${window.location.search}`;
}

function describeIntent(intent: FeedIntent, context: ReturnType<typeof useFeedExperience>['context']) {
  const product =
    intent.type === 'product'
      ? context.catalog.products.find(item => item.id === intent.targetId)
      : undefined;

  const collection =
    intent.type === 'collection'
      ? context.catalog.collections.find(item => item.id === intent.targetId)
      : undefined;

  const promotion =
    intent.type === 'promotion'
      ? context.catalog.promotions.find(item => item.id === intent.targetId)
      : undefined;

  const categorySlug = intent.categorySlug ?? product?.category ?? 'all';
  const route = intent.route ?? currentCustomerRoute();

  switch (intent.type) {
    case 'product':
      return {
        label: product?.name ?? intent.title ?? 'Product experience',
        subtitle: product?.shortDescription ?? intent.subtitle ?? null,
        categorySlug,
        source: 'PRODUCT' as const,
        productId: intent.targetId ?? null,
        fingerprint: `product:${intent.targetId ?? route}`
      };

    case 'collection':
      return {
        label: collection?.title ?? intent.title ?? 'Collection experience',
        subtitle: collection?.subtitle ?? intent.subtitle ?? null,
        categorySlug,
        source: 'COLLECTION' as const,
        collectionId: intent.targetId ?? null,
        fingerprint: `collection:${intent.targetId ?? route}`
      };

    case 'promotion':
      return {
        label: promotion?.title ?? intent.title ?? 'Promotion experience',
        subtitle: promotion?.description ?? intent.subtitle ?? null,
        categorySlug,
        source: 'CAMPAIGN' as const,
        campaignId: intent.targetId ?? null,
        fingerprint: `promotion:${intent.targetId ?? route}`
      };

    case 'search':
      return {
        label: intent.query ? `Search: ${intent.query}` : intent.title ?? 'Search experience',
        subtitle: intent.subtitle ?? null,
        categorySlug,
        source: 'SEARCH' as const,
        fingerprint: `search:${intent.query?.trim().toLowerCase() || route}`
      };

    case 'category':
    case 'store-discovery':
      return {
        label: intent.title ?? (categorySlug === 'all' ? 'Store discovery' : `Browse ${categorySlug}`),
        subtitle: intent.subtitle ?? null,
        categorySlug,
        source: intent.source === 'hub-card' ? ('DISCOVERY_HUB' as const) : ('CATEGORY' as const),
        fingerprint: `${intent.type}:${categorySlug}`
      };

    case 'home':
      return {
        label: intent.title ?? 'AJ Logik experience',
        subtitle: intent.subtitle ?? null,
        categorySlug: 'all',
        source: 'SYSTEM' as const,
        fingerprint: `route:${route}`
      };
  }
}

class ExperienceStackRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ExperienceStackRequestError';
    this.status = status;
  }
}

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
    const errorData = isRecord(parsedData) ? parsedData : null;
    const message =
      typeof errorData?.error === 'string'
        ? errorData.error
        : 'The Experience Stack request failed.';

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

export function ExperienceStackProvider({
  children,
  workspaceId,
  initialState = defaultState
}: ExperienceStackProviderProps) {
  const router = useRouter();
  const { isAuthenticated, isPending } = useIdentity();
  const { actions, context, experience, intent } = useFeedExperience();

  const recordedIntentIdRef = useRef<string | null>(null);

  const [entries, setEntries] = useState(initialState.entries);
  const [settings, setSettings] = useState(initialState.settings);
  const [currentEntry, setCurrentEntry] = useState(initialState.currentEntry);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAccessExperienceModes = !isPending && Boolean(workspaceId);

  const applyStackState = useCallback((state: ExperienceStackState) => {
    setEntries(state.entries);
    setSettings(state.settings);
    setCurrentEntry(state.currentEntry);
  }, []);

  const persistGuestState = useCallback(
    (nextEntries: ExperienceHistoryEntry[], nextSettings = settings) => {
      writeGuestState(workspaceId, {
        entries: nextEntries,
        settings: nextSettings,
        canGoBack: nextEntries.length > 1,
        currentEntry: nextEntries[0] ?? null
      });
    },
    [settings, workspaceId]
  );

  const restoreEntry = useCallback(
    (entry: ExperienceHistoryEntry) => {
      const snapshotRoute =
        typeof entry.intentSnapshot.route === 'string'
          ? entry.intentSnapshot.route
          : typeof entry.contextSnapshot?.route === 'string'
            ? entry.contextSnapshot.route
            : null;

      if (snapshotRoute && currentCustomerRoute() !== snapshotRoute) {
        router.push(snapshotRoute, { scroll: false });
      }

      actions.restoreExperience(entry.intentSnapshot as FeedIntent);

      const scrollY = entry.contextSnapshot?.scrollY;

      if (typeof scrollY === 'number') {
        window.setTimeout(() => {
          window.scrollTo({ top: scrollY, behavior: 'auto' });
        }, 80);
      }
    },
    [actions, router]
  );

  const requireExperienceAccess = useCallback((): boolean => {
    if (isPending) {
      setError('Confirming your experience runtime.');
      return false;
    }

    if (!workspaceId) {
      setError('Your shopping workspace is not available yet.');
      return false;
    }

    setError(null);
    return true;
  }, [isPending, workspaceId]);

  const runOperation = useCallback(
    async <T,>(operation: () => Promise<T>, fallback: T): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        return await operation();
      } catch (operationError) {
        setError(
          operationError instanceof Error
            ? operationError.message
            : 'An unexpected Experience Stack error occurred.'
        );

        return fallback;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshHistory = useCallback(async () => {
    if (isPending || !workspaceId) {
      return;
    }

    if (!isAuthenticated) {
      applyStackState(readGuestState(workspaceId));
      setError(null);
      return;
    }

    await runOperation(async () => {
      const params = new URLSearchParams({ workspaceId });
      const response = await fetch(`/api/experience-history?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store'
      });

      applyStackState(await readJsonResponse<ExperienceStackState>(response));
    }, undefined);
  }, [applyStackState, isAuthenticated, isPending, runOperation, workspaceId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshHistory();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshHistory]);

  const pushExperience = useCallback(
    async (input: PushExperienceInput): Promise<ExperienceHistoryEntry | null> => {
      if (!requireExperienceAccess() || !settings.enabled) {
        return null;
      }

      if (!isAuthenticated) {
        const entry: ExperienceHistoryEntry = {
          id: `guest:${crypto.randomUUID()}`,
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
          visitedAt: new Date().toISOString(),
          expiresAt: null
        };

        const nextEntries = [
          entry,
          ...entries.filter(existingEntry => existingEntry.fingerprint !== entry.fingerprint)
        ].slice(0, settings.maxEntries);

        setEntries(nextEntries);
        setCurrentEntry(entry);
        persistGuestState(nextEntries);

        return entry;
      }

      return runOperation(async () => {
        const response = await fetch('/api/experience-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId, ...input })
        });

        const entry = await readJsonResponse<ExperienceHistoryEntry | null>(response);

        if (!entry) {
          return null;
        }

        setEntries(currentEntries => {
          const nextEntries = [
            entry,
            ...currentEntries.filter(currentEntry => currentEntry.id !== entry.id)
          ].slice(0, settings.maxEntries);

          return nextEntries;
        });
        setCurrentEntry(entry);

        return entry;
      }, null);
    },
    [
      entries,
      isAuthenticated,
      persistGuestState,
      requireExperienceAccess,
      runOperation,
      settings.enabled,
      settings.maxEntries,
      workspaceId
    ]
  );

  useEffect(() => {
    if (!canAccessExperienceModes || !settings.enabled) {
      return;
    }

    if (recordedIntentIdRef.current === intent.id) {
      return;
    }

    recordedIntentIdRef.current = intent.id;

    const description = describeIntent(intent, context);
    const route = intent.route ?? currentCustomerRoute();

    void pushExperience({
      ...description,
      experienceId: experience.id,
      intentSnapshot: {
        ...intent,
        route
      },
      contextSnapshot: {
        route,
        surface: intent.surface ?? 'default',
        scrollY: typeof window === 'undefined' ? 0 : window.scrollY
      }
    });
  }, [canAccessExperienceModes, context, experience.id, intent, pushExperience, settings.enabled]);

  const goBack = useCallback(async (): Promise<ExperienceHistoryEntry | null> => {
    if (!requireExperienceAccess()) {
      return null;
    }

    if (!isAuthenticated) {
      if (entries.length < 2) {
        return null;
      }

      const nextEntries = entries.slice(1);
      const previousEntry = nextEntries[0] ?? null;

      setEntries(nextEntries);
      setCurrentEntry(previousEntry);
      persistGuestState(nextEntries);

      if (previousEntry) {
        restoreEntry(previousEntry);
      }

      return previousEntry;
    }

    return runOperation(async () => {
      const response = await fetch('/api/experience-history/back', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId })
      });

      const result = await readJsonResponse<{
        previousEntry: ExperienceHistoryEntry | null;
        removedEntryId: string | null;
      }>(response);

      if (!result.previousEntry) {
        return null;
      }

      setEntries(currentEntries =>
        currentEntries.filter(entry => entry.id !== result.removedEntryId)
      );
      setCurrentEntry(result.previousEntry);
      restoreEntry(result.previousEntry);

      return result.previousEntry;
    }, null);
  }, [entries, isAuthenticated, persistGuestState, requireExperienceAccess, restoreEntry, runOperation, workspaceId]);

  const jumpTo = useCallback(
    async (entryId: string): Promise<ExperienceHistoryEntry | null> => {
      if (!requireExperienceAccess()) {
        return null;
      }

      if (!isAuthenticated) {
        const selectedEntry = entries.find(entry => entry.id === entryId);

        if (!selectedEntry) {
          return null;
        }

        const entry = {
          ...selectedEntry,
          visitedAt: new Date().toISOString()
        };
        const nextEntries = [entry, ...entries.filter(item => item.id !== entryId)];

        setEntries(nextEntries);
        setCurrentEntry(entry);
        persistGuestState(nextEntries);
        restoreEntry(entry);

        return entry;
      }

      return runOperation(async () => {
        const response = await fetch('/api/experience-history/jump', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId, entryId })
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
    [entries, isAuthenticated, persistGuestState, requireExperienceAccess, restoreEntry, runOperation, workspaceId]
  );

  const clearHistory = useCallback(async () => {
    if (!requireExperienceAccess()) {
      return;
    }

    if (!isAuthenticated) {
      setEntries([]);
      setCurrentEntry(null);
      persistGuestState([]);
      return;
    }

    await runOperation(async () => {
      const response = await fetch('/api/experience-history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId })
      });

      await readJsonResponse<{ deletedCount: number }>(response);
      setEntries([]);
      setCurrentEntry(null);
    }, undefined);
  }, [isAuthenticated, persistGuestState, requireExperienceAccess, runOperation, workspaceId]);

  const startFresh = useCallback(async () => {
    if (!requireExperienceAccess()) {
      return;
    }

    await clearHistory();
    actions.resetExperience();
    router.push('/store', { scroll: false });
  }, [actions, clearHistory, requireExperienceAccess, router]);

  const updateSettings = useCallback(
    async (input: UpdateHistorySettingsInput) => {
      if (!requireExperienceAccess()) {
        return;
      }

      if (!isAuthenticated) {
        const updatedSettings: ExperienceHistorySettings = {
          enabled: input.enabled ?? settings.enabled,
          retention: input.retention ?? settings.retention,
          maxEntries:
            input.maxEntries === undefined
              ? settings.maxEntries
              : Math.max(5, Math.min(100, Math.round(input.maxEntries)))
        };
        const nextEntries = updatedSettings.enabled
          ? entries.slice(0, updatedSettings.maxEntries)
          : [];

        setSettings(updatedSettings);
        setEntries(nextEntries);
        setCurrentEntry(nextEntries[0] ?? null);
        persistGuestState(nextEntries, updatedSettings);
        return;
      }

      await runOperation(async () => {
        const response = await fetch('/api/experience-history/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId, ...input })
        });

        const updatedSettings = await readJsonResponse<ExperienceHistorySettings>(response);
        setSettings(updatedSettings);
        setEntries(currentEntries => currentEntries.slice(0, updatedSettings.maxEntries));

        if (!updatedSettings.enabled) {
          setCurrentEntry(null);
        }
      }, undefined);
    },
    [
      entries,
      isAuthenticated,
      persistGuestState,
      requireExperienceAccess,
      runOperation,
      settings,
      workspaceId
    ]
  );

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

export function useExperienceStack() {
  const context = useContext(ExperienceStackContext);

  if (!context) {
    throw new Error('useExperienceStack must be used within ExperienceStackProvider.');
  }

  return context;
}
