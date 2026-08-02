'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import type {
  SupportLiveEventItem,
  SupportLivePresenceItem,
  SupportLivePresencePayload
} from '../supportLiveTypes';

export type SupportLiveConnectionState =
  | 'connecting'
  | 'live'
  | 'reconnecting'
  | 'offline';

type UseSupportLiveCaseInput = {
  streamUrl: string;
  enabled?: boolean;
  onEvent: (
    event: SupportLiveEventItem
  ) => void | Promise<void>;
};

type UseSupportLiveCaseResult = {
  state: SupportLiveConnectionState;
  lastEventId: number;
  error: string | null;
  participants:
    SupportLivePresenceItem[];
  setTyping: (
    typing: boolean
  ) => void;
};

function parseJson<T>(
  value: string
): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function useSupportLiveCase({
  streamUrl,
  enabled = true,
  onEvent
}: UseSupportLiveCaseInput): UseSupportLiveCaseResult {
  const onEventRef =
    useRef(onEvent);

  const [
    state,
    setState
  ] =
    useState<SupportLiveConnectionState>(
      'connecting'
    );

  const [
    lastEventId,
    setLastEventId
  ] =
    useState(0);

  const [
    error,
    setError
  ] =
    useState<string | null>(null);

  const [
    participants,
    setParticipants
  ] =
    useState<
      SupportLivePresenceItem[]
    >([]);

  const typingStateRef =
    useRef(false);

  const lastTypingSentAtRef =
    useRef(0);

  const postActivity =
    useCallback(
      async (
        action:
          | 'heartbeat'
          | 'typing'
          | 'leave',
        typing?: boolean,
        keepalive = false
      ): Promise<void> => {
        const response =
          await fetch(
            streamUrl,
            {
              method: 'POST',
              credentials:
                'same-origin',
              cache: 'no-store',
              keepalive,
              headers: {
                'Content-Type':
                  'application/json'
              },
              body:
                JSON.stringify({
                  action,
                  ...(action ===
                  'typing'
                    ? {
                        typing:
                          Boolean(
                            typing
                          )
                      }
                    : {})
                })
            }
          );

        if (!response.ok) {
          throw new Error(
            'AJ Logik could not update live Support activity.'
          );
        }
      },
      [streamUrl]
    );

  const setTyping =
    useCallback(
      (
        typing: boolean
      ): void => {
        const now =
          Date.now();

        if (
          typing &&
          typingStateRef.current &&
          now -
            lastTypingSentAtRef.current <
            1500
        ) {
          return;
        }

        if (
          !typing &&
          !typingStateRef.current
        ) {
          return;
        }

        typingStateRef.current =
          typing;

        lastTypingSentAtRef.current =
          now;

        void postActivity(
          'typing',
          typing
        ).catch(cause => {
          console.error(
            'Support typing update failed.',
            cause
          );
        });
      },
      [postActivity]
    );

  useEffect(
    () => {
      onEventRef.current =
        onEvent;
    },
    [onEvent]
  );

  useEffect(
    () => {
      if (
        !enabled ||
        typeof EventSource ===
          'undefined'
      ) {
        return;
      }

      const source =
        new EventSource(
          streamUrl,
          {
            withCredentials:
              true
          }
        );

      const handleReady =
        (
          event: Event
        ): void => {
          const messageEvent =
            event as
              MessageEvent<string>;

          const payload =
            parseJson<{
              cursor?: number;
            }>(
              messageEvent.data
            );

          if (
            typeof payload?.cursor ===
            'number'
          ) {
            setLastEventId(
              payload.cursor
            );
          }

          setError(null);
          setState('live');
        };

      const handleSupport =
        (
          event: Event
        ): void => {
          const messageEvent =
            event as
              MessageEvent<string>;

          const payload =
            parseJson<SupportLiveEventItem>(
              messageEvent.data
            );

          if (!payload) {
            setError(
              'AJ Logik received an unreadable live Support event.'
            );
            return;
          }

          setLastEventId(
            payload.id
          );

          setState('live');
          setError(null);

          void Promise.resolve(
            onEventRef.current(
              payload
            )
          ).catch(cause => {
            setError(
              cause instanceof Error
                ? cause.message
                : 'AJ Logik could not apply a live Support update.'
            );
          });
        };

      const handlePresence =
        (
          event: Event
        ): void => {
          const messageEvent =
            event as
              MessageEvent<string>;

          const payload =
            parseJson<SupportLivePresencePayload>(
              messageEvent.data
            );

          if (!payload) {
            return;
          }

          setParticipants(
            payload.participants
          );
        };

      const handleReconnect =
        (
          event: Event
        ): void => {
          const messageEvent =
            event as
              MessageEvent<string>;

          const payload =
            parseJson<{
              cursor?: number;
            }>(
              messageEvent.data
            );

          if (
            typeof payload?.cursor ===
            'number'
          ) {
            setLastEventId(
              payload.cursor
            );
          }

          setState(
            'reconnecting'
          );
        };

      const handleTransportError =
        (
          event: Event
        ): void => {
          const messageEvent =
            event as
              MessageEvent<string>;

          const payload =
            parseJson<{
              message?: string;
            }>(
              messageEvent.data
            );

          setError(
            payload?.message ??
              'The live Support connection was interrupted.'
          );

          setState(
            navigator.onLine
              ? 'reconnecting'
              : 'offline'
          );
        };

      const handleOnline =
        (): void => {
          setState(
            'reconnecting'
          );
        };

      const handleOffline =
        (): void => {
          setState(
            'offline'
          );
        };

      source.addEventListener(
        'ready',
        handleReady
      );

      source.addEventListener(
        'support',
        handleSupport
      );

      source.addEventListener(
        'presence-snapshot',
        handlePresence
      );

      source.addEventListener(
        'reconnect',
        handleReconnect
      );

      source.addEventListener(
        'transport-error',
        handleTransportError
      );

      source.onerror =
        (): void => {
          setState(
            navigator.onLine
              ? 'reconnecting'
              : 'offline'
          );
        };

      window.addEventListener(
        'online',
        handleOnline
      );

      window.addEventListener(
        'offline',
        handleOffline
      );

      const heartbeat =
        window.setInterval(
          () => {
            void postActivity(
              'heartbeat'
            ).catch(cause => {
              console.error(
                'Support presence heartbeat failed.',
                cause
              );
            });
          },
          10_000
        );

      void postActivity(
        'heartbeat'
      ).catch(cause => {
        console.error(
          'Initial Support presence heartbeat failed.',
          cause
        );
      });

      const handleVisibility =
        (): void => {
          if (
            document.visibilityState ===
            'visible'
          ) {
            void postActivity(
              'heartbeat'
            );
          } else {
            setTyping(false);
          }
        };

      document.addEventListener(
        'visibilitychange',
        handleVisibility
      );

      return () => {
        source.close();

        window.clearInterval(
          heartbeat
        );

        document.removeEventListener(
          'visibilitychange',
          handleVisibility
        );

        void postActivity(
          'leave',
          undefined,
          true
        ).catch(() => {
          // Closing a page is
          // best-effort only.
        });

        window.removeEventListener(
          'online',
          handleOnline
        );

        window.removeEventListener(
          'offline',
          handleOffline
        );
      };
    },
    [
      enabled,
      postActivity,
      setTyping,
      streamUrl
    ]
  );

  return {
    state,
    lastEventId,
    error,
    participants,
    setTyping
  };
}
