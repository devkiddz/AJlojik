'use client';

import {
  useEffect,
  useRef,
  useState
} from 'react';

import type {
  SupportLiveEventItem
} from '../supportLiveTypes';

type UseQuickSupportAttentionStreamInput = {
  workspaceId:
    string |
    null;
  caseIds:
    readonly string[];
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

const MAX_ATTENTION_STREAMS =
  1;

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
  caseIds,
  enabled,
  onEvent
}: UseQuickSupportAttentionStreamInput): void {
  const onEventRef =
    useRef(
      onEvent
    );

  const seenEventsRef =
    useRef(
      new Set<string>()
    );

  const pendingEventRef =
    useRef<
      SupportLiveEventItem |
      null
    >(
      null
    );

  const refreshTimerRef =
    useRef<
      number |
      null
    >(
      null
    );

  const [
    reconnectEpoch,
    setReconnectEpoch
  ] =
    useState(0);

  const caseKey =
    Array.from(
      new Set(
        caseIds.filter(
          Boolean
        )
      )
    )
      .slice(
        0,
        MAX_ATTENTION_STREAMS
      )
      .join('|');

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
      const handleOnline =
        (): void => {
          setReconnectEpoch(
            current =>
              current +
              1
          );
        };

      const handleVisibility =
        (): void => {
          if (
            document.visibilityState ===
            'visible'
          ) {
            setReconnectEpoch(
              current =>
                current +
                1
            );
          }
        };

      window.addEventListener(
        'online',
        handleOnline
      );

      document.addEventListener(
        'visibilitychange',
        handleVisibility
      );

      return () => {
        window.removeEventListener(
          'online',
          handleOnline
        );

        document.removeEventListener(
          'visibilitychange',
          handleVisibility
        );
      };
    },
    []
  );

  useEffect(
    () => {
      if (
        !enabled ||
        !workspaceId ||
        !caseKey ||
        typeof EventSource ===
          'undefined' ||
        !navigator.onLine
      ) {
        return;
      }

      const activeCaseIds =
        caseKey.split('|');

      const sources:
        EventSource[] =
          [];

      const scheduleRefresh =
        (
          payload:
            SupportLiveEventItem
        ): void => {
          pendingEventRef.current =
            payload;

          if (
            refreshTimerRef.current !==
            null
          ) {
            return;
          }

          refreshTimerRef.current =
            window.setTimeout(
              () => {
                refreshTimerRef.current =
                  null;

                const next =
                  pendingEventRef.current;

                pendingEventRef.current =
                  null;

                if (!next) {
                  return;
                }

                void Promise.resolve(
                  onEventRef.current(
                    next
                  )
                ).catch(
                  cause => {
                    console.error(
                      'Quick Support attention refresh failed.',
                      cause
                    );
                  }
                );
              },
              120
            );
        };

      for (
        const caseId of
        activeCaseIds
      ) {
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

            const eventKey =
              `${caseId}:${payload.id}`;

            if (
              seenEventsRef.current.has(
                eventKey
              )
            ) {
              return;
            }

            seenEventsRef.current.add(
              eventKey
            );

            if (
              seenEventsRef.current.size >
              500
            ) {
              seenEventsRef.current.clear();

              seenEventsRef.current.add(
                eventKey
              );
            }

            scheduleRefresh(
              payload
            );
          };

        source.addEventListener(
          'support',
          handleSupport
        );

        sources.push(
          source
        );
      }

      return () => {
        for (
          const source of
          sources
        ) {
          source.close();
        }

        if (
          refreshTimerRef.current !==
          null
        ) {
          window.clearTimeout(
            refreshTimerRef.current
          );

          refreshTimerRef.current =
            null;
        }

        pendingEventRef.current =
          null;
      };
    },
    [
      caseKey,
      enabled,
      reconnectEpoch,
      workspaceId
    ]
  );
}
