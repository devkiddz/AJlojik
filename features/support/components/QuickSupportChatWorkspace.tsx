'use client';

import Link from 'next/link';

import {
  AlertTriangle,
  ArrowRight,
  Headphones,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  WifiOff
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import {
  cn
} from '@/lib/utils';

import {
  useWorkspace
} from '@/features/workspace';

import {
  clearQuickSupportSelectedCaseId,
  readQuickSupportSelectedCaseId,
  writeQuickSupportSelectedCaseId
} from '../client/quickSupportSelectionStorage';

import {
  invalidateQuickSupportSummary
} from '../client/useQuickSupportSummary';

import {
  useSupportLiveCase
} from '../client/useSupportLiveCase';

import type {
  SupportLiveEventItem
} from '../supportLiveTypes';

import type {
  QuickSupportSummary
} from '../quickSupportTypes';

import type {
  SupportCaseDetail,
  SupportCaseStatusValue
} from '../supportTypes';

import {
  SupportLiveActivityBar
} from './SupportLiveActivityBar';

import {
  SupportLiveStatusBadge
} from './SupportLiveStatusBadge';

import {
  QuickSupportCaseContinuityBar
} from './QuickSupportCaseContinuityBar';

const reusableStatuses:
  readonly SupportCaseStatusValue[] = [
    'NEW',
    'TRIAGED',
    'ASSIGNED',
    'IN_PROGRESS',
    'WAITING_CUSTOMER',
    'WAITING_VENDOR',
    'WAITING_INTERNAL'
  ];

const dateFormatter =
  new Intl.DateTimeFormat(
    'en-NG',
    {
      hour:
        '2-digit',
      minute:
        '2-digit'
    }
  );

async function readFailure(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const payload =
      (await response.json()) as {
        error?: string;
      };

    return (
      payload.error ??
      fallback
    );
  } catch {
    return fallback;
  }
}

function quickChatSubject(
  body: string
): string {
  const summary =
    body
      .replace(
        /\s+/g,
        ' '
      )
      .trim()
      .slice(
        0,
        92
      );

  return `Quick chat: ${summary}`;
}

function isAbortError(
  cause: unknown
): boolean {
  return (
    cause instanceof
      DOMException &&
    cause.name ===
      'AbortError'
  );
}

export function QuickSupportChatWorkspace() {
  const {
    activeWorkspace,
    loading:
      workspaceLoading
  } =
    useWorkspace();

  const workspaceId =
    activeWorkspace?.id ??
    null;

  const [
    supportCase,
    setSupportCase
  ] =
    useState<
      SupportCaseDetail |
      null
    >(
      null
    );

  const [
    startingNew,
    setStartingNew
  ] =
    useState(false);

  const [
    message,
    setMessage
  ] =
    useState('');

  const [
    loading,
    setLoading
  ] =
    useState(true);

  const [
    busy,
    setBusy
  ] =
    useState(false);

  const [
    authenticationRequired,
    setAuthenticationRequired
  ] =
    useState(false);

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

  const [
    notice,
    setNotice
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const messagesEndRef =
    useRef<
      HTMLDivElement |
      null
    >(
      null
    );

  const workspaceRef =
    useRef<
      string |
      null
    >(
      workspaceId
    );

  const activeCaseIdRef =
    useRef<
      string |
      null
    >(
      null
    );

  const viewSequenceRef =
    useRef(0);

  const navigationControllerRef =
    useRef<
      AbortController |
      null
    >(
      null
    );

  const refreshControllerRef =
    useRef<
      AbortController |
      null
    >(
      null
    );

  const sendControllerRef =
    useRef<
      AbortController |
      null
    >(
      null
    );

  const sendInFlightRef =
    useRef(false);

  const mountedRef =
    useRef(true);

  useEffect(
    () => {
      mountedRef.current =
        true;

      return () => {
        mountedRef.current =
          false;

        navigationControllerRef.current
          ?.abort();

        refreshControllerRef.current
          ?.abort();

        sendControllerRef.current
          ?.abort();
      };
    },
    []
  );

  useEffect(
    () => {
      workspaceRef.current =
        workspaceId;

      viewSequenceRef.current +=
        1;

      navigationControllerRef.current
        ?.abort();

      refreshControllerRef.current
        ?.abort();

      sendControllerRef.current
        ?.abort();

      sendControllerRef.current =
        null;

      sendInFlightRef.current =
        false;

      setBusy(
        false
      );

      activeCaseIdRef.current =
        null;

      setSupportCase(
        null
      );

      setStartingNew(
        false
      );

      setMessage(
        ''
      );

      setError(
        null
      );

      setNotice(
        null
      );

      setAuthenticationRequired(
        false
      );
    },
    [
      workspaceId
    ]
  );

  const requestCaseDetail =
    useCallback(
      async (
        caseId: string,
        markRead: boolean,
        signal:
          AbortSignal
      ): Promise<SupportCaseDetail> => {
        const response =
          await fetch(
            `/api/support/cases/${encodeURIComponent(
              caseId
            )}`,
            {
              method:
                markRead
                  ? 'PATCH'
                  : 'GET',
              credentials:
                'same-origin',
              cache:
                'no-store',
              signal,
              headers:
                markRead
                  ? {
                      'Content-Type':
                        'application/json'
                    }
                  : undefined,
              body:
                markRead
                  ? JSON.stringify({
                      action:
                        'mark-read'
                    })
                  : undefined
            }
          );

        if (
          response.status ===
          401
        ) {
          throw new Error(
            'Sign in to continue with AJ Logik Support.'
          );
        }

        if (!response.ok) {
          throw new Error(
            await readFailure(
              response,
              'AJ Logik could not load this Support conversation.'
            )
          );
        }

        return (
          await response.json()
        ) as
          SupportCaseDetail;
      },
      []
    );

  const commitCase =
    useCallback(
      (
        next:
          SupportCaseDetail,
        requestedWorkspaceId:
          string,
        markRead:
          boolean
      ): boolean => {
        if (
          workspaceRef.current !==
          requestedWorkspaceId
        ) {
          return false;
        }

        activeCaseIdRef.current =
          next.id;

        setSupportCase(
          next
        );

        writeQuickSupportSelectedCaseId(
          requestedWorkspaceId,
          next.id
        );

        setAuthenticationRequired(
          false
        );

        if (
          markRead
        ) {
          invalidateQuickSupportSummary();
        }

        return true;
      },
      []
    );

  const restoreConversation =
    useCallback(
      async (): Promise<void> => {
        if (
          workspaceLoading
        ) {
          return;
        }

        if (
          !workspaceId
        ) {
          setLoading(
            false
          );

          return;
        }

        const sequence =
          viewSequenceRef.current +
          1;

        viewSequenceRef.current =
          sequence;

        navigationControllerRef.current
          ?.abort();

        const controller =
          new AbortController();

        navigationControllerRef.current =
          controller;

        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await fetch(
              `/api/support/quick-chat/summary?workspaceId=${encodeURIComponent(
                workspaceId
              )}`,
              {
                credentials:
                  'same-origin',
                cache:
                  'no-store',
                signal:
                  controller.signal
              }
            );

          if (
            response.status ===
            401
          ) {
            if (
              sequence ===
                viewSequenceRef.current &&
              workspaceRef.current ===
                workspaceId
            ) {
              setAuthenticationRequired(
                true
              );

              activeCaseIdRef.current =
                null;

              setSupportCase(
                null
              );
            }

            return;
          }

          if (!response.ok) {
            throw new Error(
              await readFailure(
                response,
                'AJ Logik could not inspect your Support history.'
              )
            );
          }

          const snapshot =
            (await response.json()) as
              QuickSupportSummary;

          if (
            controller.signal.aborted ||
            sequence !==
              viewSequenceRef.current ||
            snapshot.workspaceId !==
              workspaceId ||
            workspaceRef.current !==
              workspaceId
          ) {
            return;
          }

          const storedCaseId =
            readQuickSupportSelectedCaseId(
              workspaceId
            );

          const selectedCase =
            storedCaseId
              ? snapshot.recentCases.find(
                  item =>
                    item.id ===
                    storedCaseId
                ) ??
                null
              : null;

          if (
            storedCaseId &&
            !selectedCase
          ) {
            clearQuickSupportSelectedCaseId(
              workspaceId
            );
          }

          const activeCase =
            selectedCase ??
            snapshot.activeCase;

          if (
            !activeCase
          ) {
            activeCaseIdRef.current =
              null;

            setSupportCase(
              null
            );

            setAuthenticationRequired(
              false
            );

            setStartingNew(
              false
            );

            return;
          }

          const next =
            await requestCaseDetail(
              activeCase.id,
              true,
              controller.signal
            );

          if (
            controller.signal.aborted ||
            sequence !==
              viewSequenceRef.current
          ) {
            return;
          }

          if (
            commitCase(
              next,
              workspaceId,
              true
            )
          ) {
            setStartingNew(
              false
            );
          }
        } catch (cause) {
          if (
            isAbortError(
              cause
            )
          ) {
            return;
          }

          if (
            sequence ===
              viewSequenceRef.current &&
            workspaceRef.current ===
              workspaceId
          ) {
            const message =
              cause instanceof Error
                ? cause.message
                : 'AJ Logik could not prepare Quick Support.';

            if (
              message.startsWith(
                'Sign in'
              )
            ) {
              setAuthenticationRequired(
                true
              );
            }

            setError(
              message
            );
          }
        } finally {
          if (
            sequence ===
              viewSequenceRef.current &&
            mountedRef.current
          ) {
            setLoading(
              false
            );
          }
        }
      },
      [
        commitCase,
        requestCaseDetail,
        workspaceId,
        workspaceLoading
      ]
    );

  useEffect(
    () => {
      void restoreConversation();

      return () => {
        navigationControllerRef.current
          ?.abort();
      };
    },
    [
      restoreConversation
    ]
  );

  const selectSupportCase =
    useCallback(
      async (
        caseId: string
      ): Promise<void> => {
        if (
          !workspaceId ||
          caseId ===
            activeCaseIdRef.current
        ) {
          return;
        }

        const sequence =
          viewSequenceRef.current +
          1;

        viewSequenceRef.current =
          sequence;

        navigationControllerRef.current
          ?.abort();

        refreshControllerRef.current
          ?.abort();

        const controller =
          new AbortController();

        navigationControllerRef.current =
          controller;

        setLoading(
          true
        );

        setError(
          null
        );

        setNotice(
          null
        );

        try {
          const next =
            await requestCaseDetail(
              caseId,
              true,
              controller.signal
            );

          if (
            controller.signal.aborted ||
            sequence !==
              viewSequenceRef.current
          ) {
            return;
          }

          if (
            commitCase(
              next,
              workspaceId,
              true
            )
          ) {
            setStartingNew(
              false
            );

            setMessage(
              ''
            );
          }
        } catch (cause) {
          if (
            isAbortError(
              cause
            )
          ) {
            return;
          }

          if (
            sequence ===
              viewSequenceRef.current
          ) {
            setError(
              cause instanceof Error
                ? cause.message
                : 'AJ Logik could not switch Support conversations.'
            );
          }
        } finally {
          if (
            sequence ===
              viewSequenceRef.current &&
            mountedRef.current
          ) {
            setLoading(
              false
            );
          }
        }
      },
      [
        commitCase,
        requestCaseDetail,
        workspaceId
      ]
    );

  const refreshActiveCase =
    useCallback(
      async (
        caseId: string,
        markRead:
          boolean
      ): Promise<void> => {
        const requestedWorkspaceId =
          workspaceRef.current;

        if (
          !requestedWorkspaceId ||
          activeCaseIdRef.current !==
            caseId
        ) {
          return;
        }

        refreshControllerRef.current
          ?.abort();

        const controller =
          new AbortController();

        refreshControllerRef.current =
          controller;

        try {
          const next =
            await requestCaseDetail(
              caseId,
              markRead,
              controller.signal
            );

          if (
            controller.signal.aborted ||
            activeCaseIdRef.current !==
              caseId
          ) {
            return;
          }

          commitCase(
            next,
            requestedWorkspaceId,
            markRead
          );
        } catch (cause) {
          if (
            isAbortError(
              cause
            )
          ) {
            return;
          }

          setError(
            cause instanceof Error
              ? cause.message
              : 'AJ Logik could not apply a live Support update.'
          );
        }
      },
      [
        commitCase,
        requestCaseDetail
      ]
    );

  const applyLiveEvent =
    useCallback(
      async (
        event:
          SupportLiveEventItem
      ): Promise<void> => {
        const current =
          supportCase;

        if (!current) {
          return;
        }

        if (
          event.actorId ===
          current.customer.id
        ) {
          return;
        }

        await refreshActiveCase(
          current.id,
          event.type ===
            'MESSAGE_CREATED'
        );
      },
      [
        refreshActiveCase,
        supportCase
      ]
    );

  const live =
    useSupportLiveCase({
      streamUrl:
        supportCase
          ? `/api/support/cases/${encodeURIComponent(
              supportCase.id
            )}/live`
          : '/api/support/cases/disabled/live',
      enabled:
        Boolean(
          supportCase
        ),
      onEvent:
        applyLiveEvent
    });

  const startAnotherConversation =
    useCallback(
      (): void => {
        viewSequenceRef.current +=
          1;

        navigationControllerRef.current
          ?.abort();

        refreshControllerRef.current
          ?.abort();

        live.setTyping(
          false
        );

        activeCaseIdRef.current =
          null;

        setSupportCase(
          null
        );

        setStartingNew(
          true
        );

        setMessage(
          ''
        );

        setError(
          null
        );

        setNotice(
          null
        );
      },
      [
        live
      ]
    );

  const scrollToEnd =
    useCallback(
      (
        behavior:
          ScrollBehavior =
            'smooth'
      ): void => {
        messagesEndRef.current
          ?.scrollIntoView({
            block:
              'end',
            behavior
          });
      },
      []
    );

  useEffect(
    () => {
      const frame =
        window.requestAnimationFrame(
          () => {
            scrollToEnd(
              'auto'
            );
          }
        );

      return () => {
        window.cancelAnimationFrame(
          frame
        );
      };
    },
    [
      scrollToEnd,
      supportCase
        ?.conversation
        .messages.length
    ]
  );

  const sendMessage =
    useCallback(
      async (): Promise<void> => {
        const body =
          message.trim();

        if (
          !body ||
          sendInFlightRef.current
        ) {
          return;
        }

        if (
          !live.online
        ) {
          setError(
            'You are offline. Your draft is safe—reconnect before sending.'
          );

          return;
        }

        const requestedWorkspaceId =
          workspaceId;

        if (
          !requestedWorkspaceId
        ) {
          setError(
            'An active workspace is required for Support.'
          );

          return;
        }

        const selectedCaseId =
          supportCase?.id ??
          null;

        const viewSequence =
          viewSequenceRef.current;

        sendControllerRef.current
          ?.abort();

        const controller =
          new AbortController();

        sendControllerRef.current =
          controller;

        sendInFlightRef.current =
          true;

        setBusy(
          true
        );

        setError(
          null
        );

        setNotice(
          null
        );

        try {
          const response =
            selectedCaseId
              ? await fetch(
                  `/api/support/cases/${encodeURIComponent(
                    selectedCaseId
                  )}`,
                  {
                    method:
                      'PATCH',
                    credentials:
                      'same-origin',
                    cache:
                      'no-store',
                    signal:
                      controller.signal,
                    headers: {
                      'Content-Type':
                        'application/json'
                    },
                    body:
                      JSON.stringify({
                        action:
                          'send',
                        body
                      })
                  }
                )
              : await fetch(
                  '/api/support/cases',
                  {
                    method:
                      'POST',
                    credentials:
                      'same-origin',
                    cache:
                      'no-store',
                    signal:
                      controller.signal,
                    headers: {
                      'Content-Type':
                        'application/json'
                    },
                    body:
                      JSON.stringify({
                        category:
                          'OTHER',
                        priority:
                          'NORMAL',
                        subject:
                          quickChatSubject(
                            body
                          ),
                        description:
                          body
                      })
                  }
                );

          if (
            response.status ===
            401
          ) {
            setAuthenticationRequired(
              true
            );

            throw new Error(
              'Sign in to start a live Support conversation.'
            );
          }

          if (!response.ok) {
            throw new Error(
              await readFailure(
                response,
                selectedCaseId
                  ? 'AJ Logik could not send your Support message.'
                  : 'AJ Logik could not start Quick Support.'
              )
            );
          }

          const next =
            (await response.json()) as
              SupportCaseDetail;

          invalidateQuickSupportSummary();

          const stillViewingRequest =
            !controller.signal.aborted &&
            mountedRef.current &&
            workspaceRef.current ===
              requestedWorkspaceId &&
            viewSequenceRef.current ===
              viewSequence;

          if (
            stillViewingRequest
          ) {
            commitCase(
              next,
              requestedWorkspaceId,
              false
            );

            setStartingNew(
              false
            );

            setMessage(
              ''
            );

            live.setTyping(
              false
            );

            setAuthenticationRequired(
              false
            );
          } else if (
            mountedRef.current
          ) {
            setNotice(
              `Message sent to ${next.caseNumber}.`
            );
          }
        } catch (cause) {
          if (
            isAbortError(
              cause
            )
          ) {
            return;
          }

          if (
            mountedRef.current &&
            viewSequenceRef.current ===
              viewSequence
          ) {
            setError(
              cause instanceof Error
                ? cause.message
                : 'AJ Logik could not send your Support message.'
            );
          }
        } finally {
          if (
            sendControllerRef.current ===
            controller
          ) {
            sendControllerRef.current =
              null;

            sendInFlightRef.current =
              false;

            if (
              mountedRef.current
            ) {
              setBusy(
                false
              );
            }
          }
        }
      },
      [
        commitCase,
        live,
        message,
        supportCase,
        workspaceId
      ]
    );

  const handleComposerKeyDown =
    useCallback(
      (
        event:
          React.KeyboardEvent<HTMLTextAreaElement>
      ): void => {
        if (
          event.key !==
            'Enter' ||
          event.shiftKey ||
          event.nativeEvent.isComposing
        ) {
          return;
        }

        event.preventDefault();

        void sendMessage();
      },
      [
        sendMessage
      ]
    );

  const handleComposerFocus =
    useCallback(
      (): void => {
        window.setTimeout(
          () => {
            scrollToEnd(
              'smooth'
            );
          },
          140
        );
      },
      [
        scrollToEnd
      ]
    );

  if (
    loading
  ) {
    return (
      <div
        data-quick-support-workspace
        aria-busy="true"
        className="grid h-full min-h-[18rem] place-items-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto size-6 animate-spin text-primary" />

          <p className="mt-3 text-xs font-bold">
            Preparing Quick Support…
          </p>
        </div>
      </div>
    );
  }

  if (
    authenticationRequired
  ) {
    return (
      <div
        data-quick-support-workspace
        className="grid h-full min-h-[18rem] place-items-center overflow-y-auto p-4">
        <div className="max-w-sm rounded-[1.5rem] border border-border/60 bg-muted/25 p-5 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </span>

          <h3 className="mt-4 text-base font-black">
            Sign in for secure Support
          </h3>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Your messages, case history and live replies are protected by your AJ Logik account.
          </p>

          <Link
            href="/sign-in"
            className="mt-5 inline-flex h-10 touch-manipulation items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground">
            Sign in
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (
    !supportCase
  ) {
    return (
      <div
        data-quick-support-workspace
        className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
        <QuickSupportCaseContinuityBar
          selectedCaseId={
            null
          }
          startingNew={
            startingNew
          }
          onSelectCase={
            caseId => {
              void selectSupportCase(
                caseId
              );
            }
          }
          onStartNew={
            startAnotherConversation
          }
        />

        <section className="mt-4 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/8 p-4">
          <span className="grid size-10 place-items-center rounded-2xl bg-emerald-500/12 text-emerald-600">
            <Headphones className="size-4" />
          </span>

          <h3 className="mt-4 text-base font-black">
            {
              startingNew
                ? 'Start another conversation'
                : 'How can we help?'
            }
          </h3>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {
              startingNew
                ? 'Your existing cases remain intact. Send a new first message to open a separate Support Case.'
                : 'Send your first message. AJ Logik will silently create a secure Support Case and connect this panel to the live Support workspace.'
            }
          </p>
        </section>

        {!live.online ? (
          <div
            role="status"
            className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
            <WifiOff className="mt-0.5 size-4 shrink-0" />

            <span>
              You are offline. Your draft remains here and can be sent after reconnecting.
            </span>
          </div>
        ) : null}

        {notice ? (
          <div
            role="status"
            className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
            {
              notice
            }
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            {
              error
            }
          </div>
        ) : null}

        <textarea
          value={
            message
          }
          maxLength={
            4000
          }
          enterKeyHint="send"
          onChange={
            event =>
              setMessage(
                event.target.value
              )
          }
          onKeyDown={
            handleComposerKeyDown
          }
          placeholder="Tell us what you need help with…"
          aria-label="Message AJ Logik Support"
          className="mt-4 min-h-32 w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-base leading-6 outline-none focus:border-primary/40 sm:text-sm"
        />

        <button
          type="button"
          disabled={
            busy ||
            !message.trim() ||
            !live.online
          }
          onClick={() =>
            void sendMessage()
          }
          className="mt-3 inline-flex h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-black text-primary-foreground disabled:opacity-40">
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}

          Start live chat
        </button>

        <Link
          href="/support"
          className="mt-4 inline-flex w-full touch-manipulation items-center justify-center gap-2 text-xs font-bold text-primary">
          View Support history
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    );
  }

  const canSend =
    reusableStatuses.includes(
      supportCase.status
    );

  const connectionInterrupted =
    live.state ===
      'offline' ||
    live.state ===
      'reconnecting';

  return (
    <div
      data-quick-support-workspace
      data-support-case={
        supportCase.id
      }
      aria-busy={
        busy
      }
      className="flex h-full min-h-0 flex-col overflow-hidden bg-background sm:rounded-[1.5rem] sm:border sm:border-border/60 sm:shadow-sm">
      <div className="shrink-0">
        <QuickSupportCaseContinuityBar
          selectedCaseId={
            supportCase.id
          }
          startingNew={
            startingNew
          }
          onSelectCase={
            caseId => {
              void selectSupportCase(
                caseId
              );
            }
          }
          onStartNew={
            startAnotherConversation
          }
        />
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border/60 bg-card/70 p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-black uppercase tracking-[0.15em] text-primary">
            {
              supportCase.caseNumber
            }
          </p>

          <p className="mt-1 truncate text-xs font-bold">
            {
              supportCase.subject
            }
          </p>
        </div>

        <SupportLiveStatusBadge
          state={
            live.state
          }
          error={
            live.error
          }
        />
      </div>

      <SupportLiveActivityBar
        actorUserId={
          supportCase.customer.id
        }
        participants={
          live.participants
        }
        remoteLabel="Support agent"
      />

      {connectionInterrupted ? (
        <div
          role="status"
          className={cn(
            'flex shrink-0 items-center gap-2 border-b px-3 py-2 text-[10px]',
            live.state ===
              'offline'
              ? 'border-destructive/20 bg-destructive/8 text-destructive'
              : 'border-amber-500/20 bg-amber-500/8 text-amber-800 dark:text-amber-200'
          )}>
          {live.state ===
          'offline' ? (
            <WifiOff className="size-3.5 shrink-0" />
          ) : (
            <RefreshCw className="size-3.5 shrink-0 animate-spin" />
          )}

          <span className="min-w-0 flex-1">
            {
              live.state ===
                'offline'
                ? 'Offline. Saved messages remain available and your draft is safe.'
                : 'Restoring the live Support connection…'
            }
          </span>

          <button
            type="button"
            onClick={
              live.retry
            }
            className="shrink-0 rounded-full border border-current/20 px-2.5 py-1 font-black">
            Retry
          </button>
        </div>
      ) : null}

      {notice ? (
        <div
          role="status"
          className="shrink-0 border-b border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[10px] text-emerald-700 dark:text-emerald-300">
          {
            notice
          }
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="flex shrink-0 items-start gap-2 border-b border-destructive/20 bg-destructive/10 px-3 py-2 text-[10px] text-destructive">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />

          <span>
            {
              error
            }
          </span>
        </div>
      ) : null}

      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-label={`Messages for Support Case ${supportCase.caseNumber}`}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-muted/20 p-3 [scrollbar-gutter:stable]">
        {
          supportCase
            .conversation
            .messages
            .map(
              item => {
                const own =
                  item.sender?.id ===
                  supportCase.customer.id;

                return (
                  <article
                    key={
                      item.id
                    }
                    className={cn(
                      'flex',
                      own
                        ? 'justify-end'
                        : 'justify-start'
                    )}>
                    <div
                      className={cn(
                        'max-w-[88%] rounded-[1.2rem] border px-3 py-2.5 shadow-sm',
                        own
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border/60 bg-card'
                      )}>
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.1em] opacity-70">
                        <MessageCircle className="size-3" />

                        <span>
                          {
                            item.sender
                              ?.name ??
                            item.senderRole.replaceAll(
                              '_',
                              ' '
                            )
                          }
                        </span>
                      </div>

                      <p className="mt-1.5 whitespace-pre-wrap break-words text-xs leading-5">
                        {
                          item.body
                        }
                      </p>

                      <p className="mt-1.5 text-right text-[8px] opacity-60">
                        {
                          dateFormatter.format(
                            new Date(
                              item.createdAt
                            )
                          )
                        }
                      </p>
                    </div>
                  </article>
                );
              }
            )
        }

        <div
          ref={
            messagesEndRef
          }
          aria-hidden="true"
        />
      </div>

      <div className="shrink-0 border-t border-border/60 bg-card/90 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
        {canSend ? (
          <div className="flex items-end gap-2">
            <textarea
              value={
                message
              }
              maxLength={
                4000
              }
              rows={
                1
              }
              enterKeyHint="send"
              onFocus={
                handleComposerFocus
              }
              onChange={
                event => {
                  const value =
                    event.target.value;

                  setMessage(
                    value
                  );

                  live.setTyping(
                    Boolean(
                      value.trim()
                    )
                  );
                }
              }
              onBlur={() =>
                live.setTyping(
                  false
                )
              }
              onKeyDown={
                handleComposerKeyDown
              }
              placeholder={
                live.online
                  ? 'Message Support…'
                  : 'Draft saved while offline…'
              }
              aria-label={`Message Support about ${supportCase.caseNumber}`}
              className="max-h-28 min-h-11 min-w-0 flex-1 resize-y rounded-2xl border border-border bg-background px-3 py-2.5 text-base leading-5 outline-none focus:border-primary/40 sm:text-xs"
            />

            <button
              type="button"
              aria-label="Send Support message"
              disabled={
                busy ||
                !message.trim() ||
                !live.online
              }
              onClick={() =>
                void sendMessage()
              }
              className="grid size-11 shrink-0 touch-manipulation place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40">
              {busy ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 p-3 text-center text-xs text-muted-foreground">
            This case is awaiting resolution confirmation or has been closed.
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-muted px-2.5 py-1 text-[9px] font-black">
            {
              supportCase.status.replaceAll(
                '_',
                ' '
              )
            }
          </span>

          <Link
            href={
              `/support/${supportCase.id}`
            }
            className="inline-flex touch-manipulation items-center gap-1.5 text-[10px] font-black text-primary">
            Open full case
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
