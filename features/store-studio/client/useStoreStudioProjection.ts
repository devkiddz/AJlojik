'use client';

import { useEffect, useRef, useState } from 'react';

import type { StoreStudioProjection } from '../contracts';
import { STORE_STUDIO_REFRESH_EVENT } from './storeStudioEvents';

type StoreStudioProjectionState = {
  projection: StoreStudioProjection | null;
  loading: boolean;
};

export function useStoreStudioProjection(
  workspaceId: string | null | undefined
): StoreStudioProjectionState {
  const [projection, setProjection] =
    useState<StoreStudioProjection | null>(null);

  const [loading, setLoading] =
    useState(Boolean(workspaceId));

  const [refreshVersion, setRefreshVersion] =
    useState(0);

  const loadedWorkspaceIdRef =
    useRef<string | null>(null);

  useEffect(() => {
    const requestRefresh = () => {
      setRefreshVersion(current => current + 1);
    };

    window.addEventListener(
      STORE_STUDIO_REFRESH_EVENT,
      requestRefresh
    );

    return () => {
      window.removeEventListener(
        STORE_STUDIO_REFRESH_EVENT,
        requestRefresh
      );
    };
  }, []);

  useEffect(() => {
    if (!workspaceId) {
      loadedWorkspaceIdRef.current = null;
      setProjection(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    if (loadedWorkspaceIdRef.current !== workspaceId) {
      setLoading(true);
    }

    void fetch(
      `/api/store-studio/projection?workspaceId=${encodeURIComponent(workspaceId)}`,
      {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      }
    )
      .then(async response => {
        if (!response.ok) {
          throw new Error(
            `Store Studio projection failed with ${response.status}.`
          );
        }

        return response.json() as Promise<{
          projection: StoreStudioProjection;
        }>;
      })
      .then(result => {
        loadedWorkspaceIdRef.current = workspaceId;
        setProjection(result.projection);
      })
      .catch(error => {
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return;
        }

        console.error(
          'Unable to load Store Studio projection.',
          error
        );

        loadedWorkspaceIdRef.current = workspaceId;
        setProjection(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [refreshVersion, workspaceId]);

  return {
    projection,
    loading
  };
}
