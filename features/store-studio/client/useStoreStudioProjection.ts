'use client';

import { useEffect, useRef, useState } from 'react';

import type { StoreStudioProjection } from '../contracts';
import { STORE_STUDIO_REFRESH_EVENT } from './storeStudioEvents';

type StoreStudioProjectionState = {
  projection: StoreStudioProjection | null;
  loading: boolean;
};

const CACHE_PREFIX = 'aj-logik:store-studio-projection:v2:';

function cacheKey(workspaceId: string): string {
  return `${CACHE_PREFIX}${workspaceId}`;
}

function validProjection(value: unknown, workspaceId: string): value is StoreStudioProjection {
  if (!value || typeof value !== 'object') return false;

  const projection = value as Partial<StoreStudioProjection>;

  return (
    projection.workspaceId === workspaceId &&
    Array.isArray(projection.banners) &&
    Array.isArray(projection.stories) &&
    Array.isArray(projection.reels)
  );
}

function readCachedProjection(workspaceId: string): StoreStudioProjection | null {
  try {
    const value = window.sessionStorage.getItem(cacheKey(workspaceId));
    if (!value) return null;

    const parsed: unknown = JSON.parse(value);
    return validProjection(parsed, workspaceId) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCachedProjection(projection: StoreStudioProjection): void {
  try {
    window.sessionStorage.setItem(cacheKey(projection.workspaceId), JSON.stringify(projection));
  } catch {
    // Session storage is only a resilience layer. The network projection remains authoritative.
  }
}

export function useStoreStudioProjection(
  workspaceId: string | null | undefined
): StoreStudioProjectionState {
  const [projection, setProjection] = useState<StoreStudioProjection | null>(null);
  const [loading, setLoading] = useState(Boolean(workspaceId));
  const [refreshVersion, setRefreshVersion] = useState(0);

  const projectionRef = useRef<StoreStudioProjection | null>(null);
  const loadedWorkspaceIdRef = useRef<string | null>(null);

  useEffect(() => {
    const requestRefresh = () => {
      setRefreshVersion(current => current + 1);
    };

    window.addEventListener(STORE_STUDIO_REFRESH_EVENT, requestRefresh);

    return () => {
      window.removeEventListener(STORE_STUDIO_REFRESH_EVENT, requestRefresh);
    };
  }, []);

  useEffect(() => {
    if (!workspaceId) {
      loadedWorkspaceIdRef.current = null;
      projectionRef.current = null;
      setProjection(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const workspaceChanged = loadedWorkspaceIdRef.current !== workspaceId;
    const cachedProjection = readCachedProjection(workspaceId);

    if (workspaceChanged) {
      loadedWorkspaceIdRef.current = workspaceId;

      if (cachedProjection) {
        projectionRef.current = cachedProjection;
        setProjection(cachedProjection);
        setLoading(false);
      } else {
        projectionRef.current = null;
        setProjection(null);
        setLoading(true);
      }
    }

    void fetch(`/api/store-studio/projection?workspaceId=${encodeURIComponent(workspaceId)}`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'x-aj-logik-projection': 'store-studio'
      }
    })
      .then(async response => {
        if (!response.ok) {
          throw new Error(`Store Studio projection failed with ${response.status}.`);
        }

        return response.json() as Promise<{ projection: StoreStudioProjection }>;
      })
      .then(result => {
        if (!validProjection(result.projection, workspaceId)) {
          throw new Error('Store Studio returned an invalid projection.');
        }

        projectionRef.current = result.projection;
        loadedWorkspaceIdRef.current = workspaceId;
        setProjection(result.projection);
        writeCachedProjection(result.projection);
      })
      .catch(fetchError => {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          return;
        }

        console.error('Unable to refresh Store Studio projection.', fetchError);

        /*
         * Keep the last successful projection visible. A temporary network,
         * optimizer, or development-server interruption must never collapse
         * the Store banner and campaign experience.
         */
        if (!projectionRef.current && cachedProjection) {
          projectionRef.current = cachedProjection;
          setProjection(cachedProjection);
        }
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
