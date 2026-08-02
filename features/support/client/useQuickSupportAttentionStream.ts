'use client';

import {
  useEffect,
  useRef
} from 'react';

import type {
  SupportLiveEventItem
} from '../supportLiveTypes';

type UseQuickSupportAttentionStreamInput = {
  workspaceId:
    string |
    null;
  caseId:
    string |
    null;
  enabled:
    boolean;
  onEvent:
    (
      event:
        SupportLiveEventItem
    ) =>
      void |
      Promise<void>;
};

function parseEvent(
  value: string
): SupportLiveEventItem | null {
  try {
    return JSON.parse(
      value
    ) as
      SupportLiveEventItem;
  } catch {
    return null;
  }
}

export function useQuickSupportAttentionStream({
  workspaceId,
  caseId,
  enabled,
  onEvent
}: UseQuickSupportAttentionStreamInput): void {
  const onEventRef =
    useRef(
      onEvent
    );

  useEffect(
    () => {
      onEventRef.current =
        onEvent;
    },
    [
      onEvent
    ]
  );

  useEffect(
    () => {
      if (
        !enabled ||
        !workspaceId ||
        !caseId ||
        typeof EventSource ===
          'undefined'
      ) {
        return;
      }

      const source =
        new EventSource(
          `/api/support/quick-chat/live?workspaceId=${encodeURIComponent(
            workspaceId
          )}&caseId=${encodeURIComponent(
            caseId
          )}`,
          {
            withCredentials:
              true
          }
        );

      const handleSupport =
        (
          event: Event
        ): void => {
          const payload =
            parseEvent(
              (
                event as
                  MessageEvent<string>
              ).data
            );

          if (!payload) {
            return;
          }

          void Promise.resolve(
            onEventRef.current(
              payload
            )
          ).catch(
            cause => {
              console.error(
                'Quick Support attention refresh failed.',
                cause
              );
            }
          );
        };

      source.addEventListener(
        'support',
        handleSupport
      );

      return () => {
        source.removeEventListener(
          'support',
          handleSupport
        );

        source.close();
      };
    },
    [
      caseId,
      enabled,
      workspaceId
    ]
  );
}
