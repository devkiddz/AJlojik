'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import type {
  IntelligenceResolution
} from '../domain';

import type {
  IntelligenceResolutionSummary
} from '../server/intelligenceMapper';

import {
  IntelligenceClient
} from './intelligenceClient';

import type {
  CreateIntelligenceResolutionInput,
  IntelligenceClientScope
} from './intelligenceClient';

export function useIntelligenceWorkspace(
  scope:
    IntelligenceClientScope
) {
  const [
    resolutions,
    setResolutions
  ] =
    useState<
      IntelligenceResolutionSummary[]
    >([]);

  const [
    activeResolution,
    setActiveResolution
  ] =
    useState<
      IntelligenceResolution |
      null
    >(
      null
    );

  const [
    loading,
    setLoading
  ] =
    useState(
      true
    );

  const [
    mutating,
    setMutating
  ] =
    useState(
      false
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

  const ready =
    Boolean(
      scope.workspaceId
    );

  const refresh =
    useCallback(
      async () => {
        if (!ready) {
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
          const next =
            await IntelligenceClient.list(
              scope
            );

          setResolutions(
            next
          );
        } catch (
          cause
        ) {
          setError(
            cause instanceof
            Error
              ? cause.message
              : 'Resolutions could not be loaded.'
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        ready,
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

  const open =
    useCallback(
      async (
        resolutionId:
          string
      ) => {
        setMutating(
          true
        );

        setError(
          null
        );

        try {
          setActiveResolution(
            await IntelligenceClient.read(
              scope,
              resolutionId
            )
          );
        } catch (
          cause
        ) {
          setError(
            cause instanceof
            Error
              ? cause.message
              : 'That Resolution could not be opened.'
          );
        } finally {
          setMutating(
            false
          );
        }
      },
      [
        scope
      ]
    );

  const create =
    useCallback(
      async (
        input:
          Omit<
            CreateIntelligenceResolutionInput,
            keyof IntelligenceClientScope
          >
      ) => {
        setMutating(
          true
        );

        setError(
          null
        );

        try {
          const created =
            await IntelligenceClient.create({
              ...scope,
              ...input
            });

          setActiveResolution(
            created
          );

          await refresh();

          return created;
        } catch (
          cause
        ) {
          setError(
            cause instanceof
            Error
              ? cause.message
              : 'The Resolution could not be created.'
          );

          return null;
        } finally {
          setMutating(
            false
          );
        }
      },
      [
        refresh,
        scope
      ]
    );

  const transition =
    useCallback(
      async (
        operation:
          'DISMISS' |
          'ARCHIVE'
      ) => {
        if (
          !activeResolution
        ) {
          return;
        }

        setMutating(
          true
        );

        try {
          const updated =
            await IntelligenceClient.transition(
              scope,
              activeResolution.id,
              operation
            );

          setActiveResolution(
            updated
          );

          await refresh();
        } catch (
          cause
        ) {
          setError(
            cause instanceof
            Error
              ? cause.message
              : 'The Resolution could not be updated.'
          );
        } finally {
          setMutating(
            false
          );
        }
      },
      [
        activeResolution,
        refresh,
        scope
      ]
    );

  const action =
    useCallback(
      async (
        actionId:
          string,
        operation:
          'approve' |
          'apply'
      ) => {
        if (
          !activeResolution
        ) {
          return;
        }

        setMutating(
          true
        );

        try {
          if (
            operation ===
            'approve'
          ) {
            await IntelligenceClient.approveAction(
              scope,
              activeResolution.id,
              actionId
            );
          } else {
            await IntelligenceClient.applyAction(
              scope,
              activeResolution.id,
              actionId
            );
          }

          setActiveResolution(
            await IntelligenceClient.read(
              scope,
              activeResolution.id
            )
          );

          await refresh();
        } catch (
          cause
        ) {
          setError(
            cause instanceof
            Error
              ? cause.message
              : 'The prepared action could not be updated.'
          );
        } finally {
          setMutating(
            false
          );
        }
      },
      [
        activeResolution,
        refresh,
        scope
      ]
    );

  const grouped =
    useMemo(
      () => ({
        active:
          resolutions.filter(
            item =>
              ![
                'APPLIED',
                'DISMISSED',
                'ARCHIVED'
              ].includes(
                item.status
              )
          ),
        review:
          resolutions.filter(
            item =>
              item.status ===
                'AWAITING_REVIEW' ||
              item.status ===
                'APPROVED'
          ),
        completed:
          resolutions.filter(
            item =>
              item.status ===
                'APPLIED'
          ),
        archived:
          resolutions.filter(
            item =>
              item.status ===
                'DISMISSED' ||
              item.status ===
                'ARCHIVED'
          )
      }),
      [
        resolutions
      ]
    );

  return {
    resolutions,
    grouped,
    activeResolution,
    loading,
    mutating,
    error,
    setActiveResolution,
    refresh,
    open,
    create,
    transition,
    action
  };
}
