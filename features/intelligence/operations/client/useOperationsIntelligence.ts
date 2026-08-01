'use client';

import {
  useCallback,
  useEffect,
  useState
} from 'react';

import type {
  IntelligenceClientScope
} from '../../client';

import type {
  IntelligenceOperationsSnapshot
} from '../operationContracts';

export function useOperationsIntelligence(
  scope:
    IntelligenceClientScope
) {
  const [
    snapshot,
    setSnapshot
  ] =
    useState<
      IntelligenceOperationsSnapshot |
      null
    >(
      null
    );

  const [
    loading,
    setLoading
  ] =
    useState(
      scope.audience !==
      'customer'
    );

  const [
    error,
    setError
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const refresh =
    useCallback(
      async () => {
        if (
          scope.audience ===
          'customer' ||
          !scope.workspaceId
        ) {
          setLoading(
            false
          );

          return;
        }

        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const params =
            new URLSearchParams({
              audience:
                scope.audience,
              workspaceId:
                scope.workspaceId
            });

          if (
            scope.vendorProfileId
          ) {
            params.set(
              'vendorProfileId',
              scope.vendorProfileId
            );
          }

          const response =
            await fetch(
              `/api/intelligence/operations?${params.toString()}`,
              {
                cache:
                  'no-store'
              }
            );

          const payload =
            await response.json() as {
              snapshot?:
                IntelligenceOperationsSnapshot;
              error?:
                string;
            };

          if (
            !response.ok ||
            !payload.snapshot
          ) {
            throw new Error(
              payload.error ??
              'Operational Intelligence could not be loaded.'
            );
          }

          setSnapshot(
            payload.snapshot
          );
        } catch (
          cause
        ) {
          setError(
            cause instanceof
            Error
              ? cause.message
              : 'Operational Intelligence could not be loaded.'
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        scope
      ]
    );

  useEffect(
    () => {
      const task =
        window.setTimeout(
          () =>
            void refresh(),
          0
        );

      return () =>
        window.clearTimeout(
          task
        );
    },
    [
      refresh
    ]
  );

  return {
    snapshot,
    loading,
    error,
    refresh
  };
}
