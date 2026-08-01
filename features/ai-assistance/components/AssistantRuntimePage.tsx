'use client';

import {
  IntelligenceWorkspace
} from '@/features/intelligence/components';

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type KeyboardEvent
} from 'react';

import Link from 'next/link';

import {
  Archive,
  Bot,
  BrainCircuit,
  ChevronRight,
  Clock3,
  History,
  LoaderCircle,
  LockKeyhole,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

import {
  useWorkspace
} from '@/features/workspace';

import {
  useIdentity
} from '@/providers/IdentityProvider';

import {
  getAssistantProfile
} from '../assistantProfiles';

import {
  resolveAssistantSuggestedPrompts
} from '../contextualPrompts';

import type {
  AIAssistantApplicationView,
  AIAssistantAudience,
  AIAssistantFeedbackValue,
  AIAssistantRuntimeContext,
  AIAssistantSessionSummary,
  AIAssistantSessionView
} from '../contracts';

import {
  GuidedAssistantExperience
} from './GuidedAssistantExperience';

const MS9_01_GUIDED_AI_INTERACTION = true;

type AssistantActivityStage =
  | 'understanding'
  | 'checking-context'
  | 'exploring-options'
  | 'preparing-response';

const ASSISTANT_ACTIVITY_STAGES: Array<{
  id: AssistantActivityStage;
  label: string;
}> = [
  {
    id: 'understanding',
    label: 'Thinking about what you need…'
  },
  {
    id: 'checking-context',
    label: 'Checking your current activity…'
  },
  {
    id: 'exploring-options',
    label: 'Looking through the strongest options…'
  },
  {
    id: 'preparing-response',
    label: 'Preparing something helpful…'
  }
];

function createCapabilityLabel(prompt: string) {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    return 'I can help you get started';
  }

  const lowerFirst =
    cleanPrompt.charAt(0).toLowerCase() + cleanPrompt.slice(1);

  if (/^(help|show|find|compare|create|build|plan|prepare|suggest|explain|summarise|summarize|continue|check|prioritise|prioritize|draft|improve|identify|submit|review|complete|use)/i.test(cleanPrompt)) {
    return `I can ${lowerFirst}`;
  }

  return `I can help you ${lowerFirst}`;
}

type AssistantRuntimePageProps = {
  audience:
    AIAssistantAudience;
  contextLabel:
    string;
  initialWorkspaceId?:
    string |
    null;
  vendorProfileId?:
    string |
    null;
  initialContext?:
    Partial<
      AIAssistantRuntimeContext
    >;
};

async function readJson<T>(
  response:
    Response
): Promise<T> {
  const payload =
    (await response.json()) as T & {
      error?:
        string;
    };

  if (!response.ok) {
    throw new Error(
      payload.error ??
      'The Store Assistant could not complete that request.'
    );
  }

  return payload;
}

function queryString(
  input: {
    audience:
      AIAssistantAudience;
    workspaceId:
      string;
    vendorProfileId:
      string |
      null;
  }
) {
  const params =
    new URLSearchParams({
      audience:
        input.audience,
      workspaceId:
        input.workspaceId
    });

  if (
    input.vendorProfileId
  ) {
    params.set(
      'vendorProfileId',
      input.vendorProfileId
    );
  }

  return params.toString();
}

export function AssistantRuntimePage({
  audience,
  contextLabel,
  initialWorkspaceId =
    null,
  vendorProfileId =
    null,
  initialContext =
    {}
}: AssistantRuntimePageProps) {
  const profile =
    getAssistantProfile(
      audience
    );

  const {
    activeWorkspace,
    loading:
      workspaceLoading
  } =
    useWorkspace();

  const {
    isAuthenticated,
    isPending:
      identityPending
  } =
    useIdentity();

  const workspaceId =
    initialWorkspaceId ??
    activeWorkspace?.id ??
    '';

  const [
    sessions,
    setSessions
  ] =
    useState<
      AIAssistantSessionSummary[]
    >([]);

  const [
    activeSession,
    setActiveSession
  ] =
    useState<
      AIAssistantSessionView |
      null
    >(
      null
    );

  const [
    prompt,
    setPrompt
  ] =
    useState('');

  const [
    loading,
    setLoading
  ] =
    useState(
      true
    );

  const [
    sending,
    setSending
  ] =
    useState(
      false
    );

  const [
    activityStageIndex,
    setActivityStageIndex
  ] =
    useState(0);

  const [
    sidebarOpen,
    setSidebarOpen
  ] =
    useState(
      true
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

  const loadSessions =
    useCallback(
      async () => {
        if (
          !workspaceId ||
          (
            audience ===
              'customer' &&
            !isAuthenticated
          )
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
          const response =
            await fetch(
              `/api/assistant/sessions?${queryString(
                {
                  audience,
                  workspaceId,
                  vendorProfileId
                }
              )}`,
              {
                cache:
                  'no-store'
              }
            );

          const data =
            await readJson<{
              sessions:
                AIAssistantSessionSummary[];
            }>(
              response
            );

          setSessions(
            data.sessions
          );
        } catch (
          cause
        ) {
          setError(
            cause instanceof
            Error
              ? cause.message
              : 'Your Store Assistant conversations could not be loaded.'
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        audience,
        isAuthenticated,
        vendorProfileId,
        workspaceId
      ]
    );

  useEffect(
    () => {
      const task =
        window.setTimeout(
          () =>
            void loadSessions(),
          0
        );

      return () =>
        window.clearTimeout(
          task
        );
    },
    [
      loadSessions
    ]
  );

  useEffect(
    () => {
      if (!sending) {
        setActivityStageIndex(0);
        return;
      }

      const interval =
        window.setInterval(
          () =>
            setActivityStageIndex(
              current =>
                Math.min(
                  current + 1,
                  ASSISTANT_ACTIVITY_STAGES.length - 1
                )
            ),
          1400
        );

      return () =>
        window.clearInterval(interval);
    },
    [sending]
  );

  async function selectSession(
    sessionId:
      string
  ) {
    if (!workspaceId) {
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
          `/api/assistant/sessions/${encodeURIComponent(
            sessionId
          )}?${queryString(
            {
              audience,
              workspaceId,
              vendorProfileId
            }
          )}`,
          {
            cache:
              'no-store'
          }
        );

      const data =
        await readJson<{
          session:
            AIAssistantSessionView;
        }>(
          response
        );

      setActiveSession(
        data.session
      );

      setSidebarOpen(
        false
      );
    } catch (
      cause
    ) {
      setError(
        cause instanceof
        Error
          ? cause.message
          : 'That Store Assistant conversation could not be opened.'
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  function updateSessionSummary(
    session:
      AIAssistantSessionView
  ) {
    setSessions(
      current => [
        {
          id:
            session.id,
          title:
            session.title,
          audience:
            session.audience,
          status:
            session.status,
          messageCount:
            session.messageCount,
          lastMessage:
            session.lastMessage,
          createdAt:
            session.createdAt,
          updatedAt:
            session.updatedAt
        },
        ...current.filter(
          item =>
            item.id !==
            session.id
        )
      ]
    );
  }

  async function sendPrompt(
    value =
      prompt
  ) {
    const message =
      value.trim();

    if (
      !message ||
      !workspaceId ||
      sending
    ) {
      return;
    }

    setSending(
      true
    );

    setError(
      null
    );

    setPrompt('');

    try {
      const response =
        await fetch(
          '/api/assistant/respond',
          {
            method:
              'POST',
            headers: {
              'Content-Type':
                'application/json'
            },
            body:
              JSON.stringify({
                audience,
                workspaceId,
                vendorProfileId,
                sessionId:
                  activeSession?.id ??
                  null,
                message,
                context: {
                  workspaceId,
                  vendorProfileId,
                  productId:
                    initialContext.productId ??
                    null,
                  category:
                    initialContext.category ??
                    null,
                  intent:
                    initialContext.intent ??
                    null,
                  mode:
                    initialContext.mode ??
                    null
                }
              })
          }
        );

      const data =
        await readJson<{
          session:
            AIAssistantSessionView;
        }>(
          response
        );

      setActiveSession(
        data.session
      );

      updateSessionSummary(
        data.session
      );

      window.dispatchEvent(
        new CustomEvent(
          'rcentz:ai-intelligence-updated',
          {
            detail: {
              sessionId:
                data.session.id
            }
          }
        )
      );
    } catch (
      cause
    ) {
      setPrompt(
        message
      );

      setError(
        cause instanceof
        Error
          ? cause.message
          : 'The Store Assistant could not prepare a response.'
      );
    } finally {
      setSending(
        false
      );
    }
  }

  async function archiveSession() {
    if (
      !activeSession ||
      !workspaceId
    ) {
      return;
    }

    setLoading(
      true
    );

    try {
      const response =
        await fetch(
          `/api/assistant/sessions/${encodeURIComponent(
            activeSession.id
          )}?${queryString(
            {
              audience,
              workspaceId,
              vendorProfileId
            }
          )}`,
          {
            method:
              'DELETE'
          }
        );

      await readJson<{
        archived:
          boolean;
      }>(
        response
      );

      setSessions(
        current =>
          current.filter(
            item =>
              item.id !==
              activeSession.id
          )
      );

      setActiveSession(
        null
      );
    } catch (
      cause
    ) {
      setError(
        cause instanceof
        Error
          ? cause.message
          : 'The session could not be archived.'
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  function applicationApplied(
    messageId:
      string,
    application:
      AIAssistantApplicationView
  ) {
    setActiveSession(
      current =>
        current
          ? {
              ...current,
              messages:
                current.messages.map(
                  message =>
                    message.id ===
                    messageId
                      ? {
                          ...message,
                          feedback:
                            'APPLIED',
                          applications: [
                            application,
                            ...message.applications.filter(
                              item =>
                                item.id !==
                                application.id
                            )
                          ]
                        }
                      : message
                )
            }
          : current
    );
  }

  async function feedback(
    messageId:
      string,
    feedbackValue:
      AIAssistantFeedbackValue
  ) {
    if (
      !workspaceId ||
      !activeSession
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `/api/assistant/messages/${encodeURIComponent(
            messageId
          )}/feedback`,
          {
            method:
              'POST',
            headers: {
              'Content-Type':
                'application/json'
            },
            body:
              JSON.stringify({
                audience,
                workspaceId,
                vendorProfileId,
                feedback:
                  feedbackValue
              })
          }
        );

      await readJson<{
        messageId:
          string;
        feedback:
          AIAssistantFeedbackValue;
      }>(
        response
      );

      setActiveSession(
        current =>
          current
            ? {
                ...current,
                messages:
                  current.messages.map(
                    message =>
                      message.id ===
                      messageId
                        ? {
                            ...message,
                            feedback:
                              feedbackValue
                          }
                        : message
                  )
              }
            : current
      );

      window.dispatchEvent(
        new CustomEvent(
          'rcentz:ai-intelligence-updated',
          {
            detail: {
              messageId,
              feedback:
                feedbackValue
            }
          }
        )
      );
    } catch (
      cause
    ) {
      setError(
        cause instanceof
        Error
          ? cause.message
          : 'Feedback could not be recorded.'
      );
    }
  }

  function onKeyDown(
    event:
      KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key ===
        'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault();

      void sendPrompt();
    }
  }

  const quickPrompts =
    resolveAssistantSuggestedPrompts({
      audience,
      context: {
        workspaceId,
        vendorProfileId,
        productId:
          initialContext.productId ??
          null,
        category:
          initialContext.category ??
          null,
        intent:
          initialContext.intent ??
          null,
        mode:
          initialContext.mode ??
          null
      }
    });

  const activeActivityStage =
    ASSISTANT_ACTIVITY_STAGES[
      activityStageIndex
    ] ??
    ASSISTANT_ACTIVITY_STAGES[0];

  if (
    audience ===
      'customer' &&
    (
      identityPending ||
      workspaceLoading
    )
  ) {
    return (
    <main className="grid min-h-[75vh] place-items-center">
        <LoaderCircle className="size-8 animate-spin text-primary" />
      </main>
    );
  }

  if (
    audience ===
      'customer' &&
    !isAuthenticated
  ) {
    return (
      <main className="grid min-h-[75vh] place-items-center px-4">
        <section className="max-w-lg rounded-[2rem] border bg-card p-8 text-center shadow-xl">
          <BrainCircuit className="mx-auto size-10 text-primary" />

          <h1 className="mt-5 text-3xl font-black">
            Sign in to ask AJ
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Recommendations,
            comparisons and
            Shopping List plans
            use your active
            workspace and privacy
            settings.
          </p>

          <Link
            href="/sign-in?next=/ai"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-black text-primary-foreground">
            Continue to sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_38%)] px-3 py-4 sm:px-5 sm:py-6">
      <div className="mx-auto max-w-[100rem] space-y-4">
        <header className="overflow-hidden rounded-[2rem] border border-accent/20 bg-gradient-premium p-5 text-white shadow-xl sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-accent">
                  <BrainCircuit className="size-5" />
                </span>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                    {
                      profile.eyebrow
                    }
                  </p>

                  <p className="mt-1 text-[10px] text-white/45">
                    {
                      contextLabel
                    }
                  </p>
                </div>
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
                {
                  profile.title
                }
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
                {
                  profile.description
                }
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/12 px-3 py-2 text-[10px] font-black text-white">
                <ShieldCheck className="size-4" />

                No external API
                key
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-black text-white/75">
                <LockKeyhole className="size-4" />

                Review before use
              </span>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {
              error
            }
          </div>
        ) : null}

        <section className={`grid min-h-[44rem] gap-4 ${
          sidebarOpen
            ? 'xl:grid-cols-[20rem_minmax(0,1fr)]'
            : 'grid-cols-1'
        }`}>
          {sidebarOpen ? (
            <aside className="min-w-0 rounded-[2rem] border border-border/60 bg-card/80 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                    Conversations
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {
                      sessions.length
                    }{' '}
                    active
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSidebarOpen(
                      false
                    )
                  }
                  className="grid size-9 place-items-center rounded-full border"
                  aria-label="Hide session history">
                  <PanelLeftClose className="size-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveSession(
                    null
                  )
                }
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-black text-primary-foreground">
                <MessageSquarePlus className="size-4" />

                Start fresh
              </button>

              <div className="mt-4 space-y-2">
                {loading &&
                !sessions.length ? (
                  <div className="grid h-32 place-items-center">
                    <LoaderCircle className="size-5 animate-spin text-primary" />
                  </div>
                ) : sessions.length ? (
                  sessions.map(
                    session => (
                      <button
                        key={
                          session.id
                        }
                        type="button"
                        onClick={() =>
                          void selectSession(
                            session.id
                          )
                        }
                        className={`w-full rounded-2xl border p-3 text-left transition ${
                          activeSession?.id ===
                          session.id
                            ? 'border-accent/35 bg-accent/10'
                            : 'border-border/60 bg-background/45 hover:bg-muted/35'
                        }`}>
                        <p className="line-clamp-2 text-xs font-black leading-5">
                          {
                            session.title
                          }
                        </p>

                        <p className="mt-2 flex items-center gap-2 text-[9px] text-muted-foreground">
                          <Clock3 className="size-3" />

                          {new Date(
                            session.updatedAt
                          ).toLocaleString(
                            'en-NG'
                          )}
                        </p>

                        <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-muted-foreground">
                          {
                            session.lastMessage ??
                            'No response yet'
                          }
                        </p>
                      </button>
                    )
                  )
                ) : (
                  <div className="rounded-2xl border border-dashed p-4 text-center">
                    <History className="mx-auto size-5 text-muted-foreground" />

                    <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
                      Your intelligence
                      sessions will
                      appear here.
                    </p>
                  </div>
                )}
              </div>
            </aside>
          ) : null}

          <div className="min-w-0 overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 shadow-sm">
            <header className="flex min-w-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                {!sidebarOpen ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSidebarOpen(
                        true
                      )
                    }
                    className="grid size-9 shrink-0 place-items-center rounded-full border"
                    aria-label="Show session history">
                    <PanelLeftOpen className="size-4" />
                  </button>
                ) : null}

                <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-accent/12 text-accent">
                  <Bot className="size-4" />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black">
                    {activeSession?.title ??
                      'New Store Assistant conversation'}
                  </p>

                  <p className="mt-0.5 text-[9px] text-muted-foreground">
                    AJ Logik local assistant
                    {' · '}
                    live workspace
                  </p>
                </div>
              </div>

              {activeSession ? (
                <button
                  type="button"
                  onClick={() =>
                    void archiveSession()
                  }
                  className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-[9px] font-black">
                  <Archive className="size-3.5" />

                  Archive
                </button>
              ) : null}
            </header>

            <div className="flex min-h-[38rem] flex-col">
              {/* MS9_02A_PROMPT_FIELD_ABOVE_RESULTS */}
<footer className="border-b border-border/60 bg-background/75 p-3 backdrop-blur sm:p-4">
                <div className="flex min-w-0 items-end gap-2 rounded-[1.5rem] border border-border/70 bg-card p-2 shadow-sm focus-within:border-accent/40">
                  <textarea
                    value={
                      prompt
                    }
                    onChange={
                      (
                        event:
                          ChangeEvent<HTMLTextAreaElement>
                      ) =>
                        setPrompt(
                          event.target
                            .value
                        )
                    }
                    onKeyDown={
                      onKeyDown
                    }
                    rows={2}
                    maxLength={
                      2000
                    }
                    placeholder={
                      audience ===
                      'customer'
                        ? 'Tell me what you are shopping for, planning or trying to decide…'
                        : audience ===
                          'vendor'
                          ? 'Tell me what you want to create, improve or prepare…'
                          : 'Tell me what needs attention, review or preparation…'
                    }
                    className="min-h-12 min-w-0 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none"
                  />

                  <button
                    type="button"
                    disabled={
                      sending ||
                      !prompt.trim() ||
                      !workspaceId
                    }
                    onClick={() =>
                      void sendPrompt()
                    }
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition disabled:opacity-40"
                    aria-label="Send request to AJ">
                    {sending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-center text-[9px] text-muted-foreground">
                  AJ Logik can prepare
                  drafts and suggestions.
                  You stay in control of
                  publishing, stock,
                  Orders and payments.
                </p>
              </footer>

              <IntelligenceWorkspace
                audience={
                  audience
                }
                workspaceId={
                  workspaceId
                }
                vendorProfileId={
                  vendorProfileId
                }
                sessionId={
                  activeSession?.id ??
                  null
                }
                runtime={
                  initialContext
                }
                conversation={
                  <>
                                  <GuidedAssistantExperience
                                    audience={
                                      audience
                                    }
                                    workspaceId={
                                      workspaceId
                                    }
                                    vendorProfileId={
                                      vendorProfileId
                                    }
                                    session={
                                      activeSession
                                    }
                                    prompts={
                                      quickPrompts
                                    }
                                    sending={
                                      sending
                                    }
                                    activityLabel={
                                      activeActivityStage.label
                                    }
                                    onPrompt={value =>
                                      void sendPrompt(
                                        value
                                      )
                                    }
                                    onStartFresh={() => {
                                      setActiveSession(
                                        null
                                      );
                                      setPrompt('');
                                      setError(
                                        null
                                      );
                                    }}
                                    onApplied={
                                      applicationApplied
                                    }
                                    onFeedback={(
                                      messageId,
                                      feedbackValue
                                    ) =>
                                      void feedback(
                                        messageId,
                                        feedbackValue
                                      )
                                    }
                                  />
                  </>
                }
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
