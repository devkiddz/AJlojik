'use client';

import { useEffect, useState } from 'react';

import type { StoreStudioProjection } from '../contracts';

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

  useEffect(() => {
    if (!workspaceId) {
      setProjection(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    setLoading(true);

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
  }, [workspaceId]);

  return {
    projection,
    loading
  };
}