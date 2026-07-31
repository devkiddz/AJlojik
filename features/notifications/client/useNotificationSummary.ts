'use client';

import {
  useCallback,
  useEffect,
  useState
} from 'react';

import { useIdentity } from '@/providers/IdentityProvider';
import { useWorkspace } from '@/features/workspace';

import type {
  NotificationCenterSnapshot
} from '../notificationTypes';

export function useNotificationSummary(limit = 4, enabled = true) {
  const { isAuthenticated } = useIdentity();
  const { activeWorkspace } = useWorkspace();

  const [snapshot, setSnapshot] =
    useState<NotificationCenterSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workspaceId = activeWorkspace?.id ?? null;

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
        `/api/notifications?workspaceId=${encodeURIComponent(workspaceId)}&limit=${limit}`,
        {
          cache: 'no-store',
          credentials: 'same-origin'
        }
      );

      if (!response.ok) {
        throw new Error('Unable to load notifications.');
      }

      const nextSnapshot =
        (await response.json()) as NotificationCenterSnapshot;

      setSnapshot(nextSnapshot);
      setError(null);
      return nextSnapshot;
    } catch (cause) {
      console.error('Notification summary refresh failed.', cause);
      setError('Notifications are temporarily unavailable.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled, isAuthenticated, limit, workspaceId]);

  const mutate = useCallback(
    async (body: Record<string, unknown>) => {
      if (!workspaceId || workspaceId === 'guest-live') {
        return null;
      }

      const response = await fetch(
        `/api/notifications?workspaceId=${encodeURIComponent(workspaceId)}&limit=${limit}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'same-origin',
          cache: 'no-store',
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        throw new Error('Unable to update notifications.');
      }

      const nextSnapshot =
        (await response.json()) as NotificationCenterSnapshot;

      setSnapshot(nextSnapshot);
      setError(null);
      return nextSnapshot;
    },
    [limit, workspaceId]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const handleFocus = () => {
      void refresh();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refresh();
      }
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refresh();
      }
    }, 60_000);

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refresh]);

  return {
    snapshot,
    unreadCount: snapshot?.unreadCount ?? 0,
    loading,
    error,
    refresh,
    mutate
  };
}
