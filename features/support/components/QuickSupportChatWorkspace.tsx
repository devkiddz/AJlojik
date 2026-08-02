'use client';

import Link from 'next/link';

import {
  ArrowRight,
  Headphones,
  LoaderCircle,
  MessageCircle,
  Send,
  ShieldCheck
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

    return payload.error ??
      fallback;
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

  const messagesEndRef =
    useRef<
      HTMLDivElement |
      null
    >(
      null
    );

  const loadCase =
    useCallback(
      async (
        caseId: string,
        markRead = false
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
          setAuthenticationRequired(
            true
          );

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

        const next =
          (await response.json()) as
            SupportCaseDetail;

        setSupportCase(
          next
        );

        setAuthenticationRequired(
          false
        );

        if (
          markRead
        ) {
          invalidateQuickSupportSummary();
        }

        return next;
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
          setSupportCase(
            null
          );

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
          const response =
            await fetch(
              `/api/support/quick-chat/summary?workspaceId=${encodeURIComponent(
                workspaceId
              )}`,
              {
                credentials:
                  'same-origin',
                cache:
                  'no-store'
              }
            );

          if (
            response.status ===
            401
          ) {
            setAuthenticationRequired(
              true
            );

            setSupportCase(
              null
            );

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
            snapshot.workspaceId !==
            workspaceId
          ) {
            return;
          }

          const activeCase =
            snapshot.activeCase;

          if (
            activeCase
          ) {
            await loadCase(
              activeCase.id,
              true
            );
          } else {
            setSupportCase(
              null
            );

            setAuthenticationRequired(
              false
            );
          }
        } catch (cause) {
          setError(
            cause instanceof Error
              ? cause.message
              : 'AJ Logik could not prepare Quick Support.'
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        loadCase,
        workspaceId,
        workspaceLoading
      ]
    );

  useEffect(
    () => {
      void restoreConversation();
    },
    [
      restoreConversation
    ]
  );

  const applyLiveEvent =
    useCallback(
      async (
        event:
          SupportLiveEventItem
      ): Promise<void> => {
        if (
          !supportCase
        ) {
          return;
        }

        if (
          event.actorId ===
          supportCase.customer.id
        ) {
          return;
        }

        await loadCase(
          supportCase.id,
          event.type ===
            'MESSAGE_CREATED'
        );
      },
      [
        loadCase,
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

  useEffect(
    () => {
      messagesEndRef.current
        ?.scrollIntoView({
          block:
            'end',
          behavior:
            'smooth'
        });
    },
    [
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
          busy
        ) {
          return;
        }

        setBusy(
          true
        );

        setError(
          null
        );

        try {
          const response =
            supportCase
              ? await fetch(
                  `/api/support/cases/${encodeURIComponent(
                    supportCase.id
                  )}`,
                  {
                    method:
                      'PATCH',
                    credentials:
                      'same-origin',
                    cache:
                      'no-store',
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
                supportCase
                  ? 'AJ Logik could not send your Support message.'
                  : 'AJ Logik could not start Quick Support.'
              )
            );
          }

          const next =
            (await response.json()) as
              SupportCaseDetail;

          setSupportCase(
            next
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

          invalidateQuickSupportSummary();
        } catch (cause) {
          setError(
            cause instanceof Error
              ? cause.message
              : 'AJ Logik could not send your Support message.'
          );
        } finally {
          setBusy(
            false
          );
        }
      },
      [
        busy,
        live,
        message,
        supportCase
      ]
    );

  if (
    loading
  ) {
    return (
      <div className="grid min-h-[22rem] place-items-center">
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
      <div className="grid min-h-[22rem] place-items-center">
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
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground">
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
      <div className="space-y-4">
        <section className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/8 p-4">
          <span className="grid size-10 place-items-center rounded-2xl bg-emerald-500/12 text-emerald-600">
            <Headphones className="size-4" />
          </span>

          <h3 className="mt-4 text-base font-black">
            How can we help?
          </h3>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Send your first message. AJ Logik will silently create a secure Support Case and connect this panel to the live Support workspace.
          </p>
        </section>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        ) : null}

        <textarea
          value={
            message
          }
          maxLength={
            4000
          }
          autoFocus
          onChange={
            event =>
              setMessage(
                event.target.value
              )
          }
          onKeyDown={
            event => {
              if (
                event.key ===
                  'Enter' &&
                !event.shiftKey
              ) {
                event.preventDefault();

                void sendMessage();
              }
            }
          }
          placeholder="Tell us what you need help with…"
          className="min-h-36 w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 outline-none focus:border-primary/40"
        />

        <button
          type="button"
          disabled={
            busy ||
            !message.trim()
          }
          onClick={() =>
            void sendMessage()
          }
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-black text-primary-foreground disabled:opacity-40">
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}

          Start live chat
        </button>

        <Link
          href="/support"
          className="inline-flex w-full items-center justify-center gap-2 text-xs font-bold text-primary">
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

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border/60 bg-background shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-card/70 p-3">
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

      <div className="max-h-[50dvh] min-h-[19rem] space-y-3 overflow-y-auto bg-muted/20 p-3">
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

                      <p className="mt-1.5 whitespace-pre-wrap text-xs leading-5">
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

      <div className="border-t border-border/60 bg-card/70 p-3">
        {error ? (
          <div className="mb-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        ) : null}

        {canSend ? (
          <div className="flex items-end gap-2">
            <textarea
              value={
                message
              }
              maxLength={
                4000
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
                event => {
                  if (
                    event.key ===
                      'Enter' &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();

                    void sendMessage();
                  }
                }
              }
              placeholder="Message Support…"
              className="max-h-28 min-h-11 min-w-0 flex-1 resize-y rounded-2xl border border-border bg-background px-3 py-2.5 text-xs leading-5 outline-none focus:border-primary/40"
            />

            <button
              type="button"
              disabled={
                busy ||
                !message.trim()
              }
              onClick={() =>
                void sendMessage()
              }
              className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40">
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
            className="inline-flex items-center gap-1.5 text-[10px] font-black text-primary">
            Open full case
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
