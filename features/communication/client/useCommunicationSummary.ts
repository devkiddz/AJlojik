'use client';

import {
  useCallback,
  useEffect,
  useState
} from 'react';

import { useWorkspace } from '@/features/workspace';
import { useIdentity } from '@/providers/IdentityProvider';

import type {
  CommunicationInboxSnapshot
} from '../communicationTypes';

export function useCommunicationSummary(
  limit = 4,
  enabled = true
) {
  const {
    isAuthenticated
  } = useIdentity();

  const {
    activeWorkspace
  } = useWorkspace();

  const [
    snapshot,
    setSnapshot
  ] = useState<CommunicationInboxSnapshot | null>(
    null
  );

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    error,
    setError
  ] = useState<string | null>(null);

  const workspaceId =
    activeWorkspace?.id ?? null;

  const refresh = useCallback(async () => {
    if (
      !enabled ||
      !isAuthenticated ||
      !workspaceId ||
      workspaceId === 'guest-live'
    ) {
      setSnapshot(null);
      setLoading(false);
      setError(null);
      return null;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/communication/inbox?workspaceId=${encodeURIComponent(
          workspaceId
        )}&limit=${limit}`,
        {
          cache: 'no-store',
          credentials: 'same-origin'
        }
      );

      if (!response.ok) {
        throw new Error(
          'Unable to load the communication inbox.'
        );
      }

      const nextSnapshot =
        (await response.json()) as CommunicationInboxSnapshot;

      setSnapshot(nextSnapshot);
      setError(null);

      return nextSnapshot;
    } catch (cause) {
      console.error(
        'Communication summary refresh failed.',
        cause
      );

      setError(
        'Inbox messages are temporarily unavailable.'
      );

      return null;
    } finally {
      setLoading(false);
    }
  }, [
    enabled,
    isAuthenticated,
    limit,
    workspaceId
  ]);

  useEffect(() => {
    void refresh();
  }, [
    refresh
  ]);

  useEffect(() => {
    const handleFocus = () => {
      void refresh();
    };

    const handleVisibility = () => {
      if (
        document.visibilityState ===
        'visible'
      ) {
        void refresh();
      }
    };

    const intervalId =
      window.setInterval(() => {
        if (
          document.visibilityState ===
          'visible'
        ) {
          void refresh();
        }
      }, 60_000);

    window.addEventListener(
      'focus',
      handleFocus
    );

    document.addEventListener(
      'visibilitychange',
      handleVisibility
    );

    return () => {
      window.clearInterval(
        intervalId
      );

      window.removeEventListener(
        'focus',
        handleFocus
      );

      document.removeEventListener(
        'visibilitychange',
        handleVisibility
      );
    };
  }, [
    refresh
  ]);

  return {
    snapshot,
    unreadCount:
      snapshot?.unreadCount ?? 0,
    loading,
    error,
    refresh
  };
}
