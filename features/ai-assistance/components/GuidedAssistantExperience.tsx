'use client';

import * as React from 'react';

import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Clock3,
  LoaderCircle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

import type {
  AIAssistantApplicationView,
  AIAssistantAudience,
  AIAssistantFeedbackValue,
  AIAssistantMessageView,
  AIAssistantSessionView
} from '../contracts';

import type {
  AssistantSuggestedPrompt
} from '../contextualPrompts';

import {
  AssistantResponseCard
} from './AssistantResponseCard';

type GuidedAssistantExperienceProps = {
  audience: AIAssistantAudience;
  workspaceId: string;
  vendorProfileId: string | null;
  session: AIAssistantSessionView | null;
  prompts: AssistantSuggestedPrompt[];
  sending: boolean;
  activityLabel: string;
  onPrompt: (prompt: string) => void;
  onStartFresh: () => void;
  onApplied: (
    messageId: string,
    application: AIAssistantApplicationView
  ) => void;
  onFeedback: (
    messageId: string,
    feedback: AIAssistantFeedbackValue
  ) => void;
};

type ExperienceStage =
  | 'choose'
  | 'understand'
  | 'prepare'
  | 'act';

type ResolutionStatus =
  | 'COLLECTING'
  | 'READY'
  | 'AWAITING_REVIEW'
  | 'ACTIONABLE'
  | 'APPLIED'
  | 'DISMISSED';

type AssistantResolution = {
  id: string;
  message: AIAssistantMessageView;
  type: string;
  title: string;
  summary: string;
  status: ResolutionStatus;
  updatedAt: string;
  understoodFacts: Array<{
    label: string;
    value: string;
  }>;
  expectedOutcome: string;
};

const stages: Array<{
  id: ExperienceStage;
  label: string;
}> = [
  {
    id: 'choose',
    label: 'Choose'
  },
  {
    id: 'understand',
    label: 'Understand'
  },
  {
    id: 'prepare',
    label: 'Prepare'
  },
  {
    id: 'act',
    label: 'Act'
  }
];

function stageIndex(
  stage: ExperienceStage
) {
  return stages.findIndex(
    item =>
      item.id ===
      stage
  );
}

function readableType(
  value: string
) {
  return value
    .replaceAll(
      '_',
      ' '
    )
    .toLowerCase()
    .replace(
      /\b[a-z]/g,
      character =>
        character.toUpperCase()
    );
}

function resolutionStatus(
  message: AIAssistantMessageView
): ResolutionStatus {
  if (
    message.feedback ===
    'DISMISSED'
  ) {
    return 'DISMISSED';
  }

  if (
    message.applications.some(
      application =>
        application.status ===
        'APPLIED'
    )
  ) {
    return 'APPLIED';
  }

  const payload =
    message.payload;

  if (!payload) {
    return 'READY';
  }

  const needsMore =
    payload.sections.some(
      section =>
        section.title
          .toLowerCase()
          .includes(
            'what i need'
          )
    );

  if (needsMore) {
    return 'COLLECTING';
  }

  if (
    payload.actions.length
  ) {
    return 'ACTIONABLE';
  }

  if (
    payload.warnings.length ||
    payload.draftFields.length
  ) {
    return 'AWAITING_REVIEW';
  }

  return 'READY';
}

function statusLabel(
  status: ResolutionStatus
) {
  if (
    status ===
    'AWAITING_REVIEW'
  ) {
    return 'Awaiting review';
  }

  return status
    .toLowerCase()
    .replace(
      /\b[a-z]/g,
      character =>
        character.toUpperCase()
    );
}

function statusClass(
  status: ResolutionStatus
) {
  if (
    status ===
    'APPLIED'
  ) {
    return 'border-accent/30 bg-accent/10 text-foreground';
  }

  if (
    status ===
    'ACTIONABLE'
  ) {
    return 'border-primary/25 bg-primary/8 text-foreground';
  }

  if (
    status ===
    'COLLECTING'
  ) {
    return 'border-secondary/25 bg-secondary/8 text-foreground';
  }

  if (
    status ===
    'DISMISSED'
  ) {
    return 'border-border/60 bg-muted/35 text-muted-foreground';
  }

  return 'border-border/60 bg-background/70 text-foreground';
}

function expectedOutcome(
  message: AIAssistantMessageView
) {
  const payload =
    message.payload;

  if (!payload) {
    return message.content;
  }

  const action =
    payload.actions[0];

  if (action) {
    return action.label;
  }

  if (
    payload.products.length
  ) {
    return `${payload.products.length} products resolved`;
  }

  if (
    payload.draftFields.length
  ) {
    return `${payload.draftFields.length} draft details prepared`;
  }

  const next =
    payload.sections.find(
      section =>
        section.title
          .toLowerCase()
          .includes(
            'what i need'
          )
    );

  if (
    next?.bullets[0]
  ) {
    return next.bullets[0];
  }

  return 'Review the prepared resolution';
}

function understoodFacts(
  message: AIAssistantMessageView
) {
  const payload =
    message.payload;

  if (!payload) {
    return [];
  }

  const metrics =
    payload.metrics.map(
      metric => ({
        label:
          metric.label,
        value:
          metric.value
      })
    );

  if (metrics.length) {
    return metrics.slice(
      0,
      4
    );
  }

  const understanding =
    payload.sections.find(
      section =>
        section.title
          .toLowerCase()
          .includes(
            'what i understand'
          )
    );

  return (
    understanding?.bullets
      .slice(
        0,
        4
      )
      .map(
        (
          bullet,
          index
        ) => ({
          label:
            `Detail ${index + 1}`,
          value:
            bullet
        })
      ) ??
    []
  );
}

function collectResolutions(
  messages: AIAssistantMessageView[]
): AssistantResolution[] {
  const bucket =
    new Map<
      string,
      AssistantResolution
    >();

  for (
    const message of
    messages
  ) {
    if (
      message.role !==
      'ASSISTANT'
    ) {
      continue;
    }

    const type =
      message.payload
        ?.outputType ??
      'ASSISTANT_UPDATE';

    const resolution:
      AssistantResolution = {
      id:
        message.id,
      message,
      type,
      title:
        message.payload
          ?.headline ??
        'Assistant update',
      summary:
        message.payload
          ?.summary ??
        message.content,
      status:
        resolutionStatus(
          message
        ),
      updatedAt:
        message.createdAt,
      understoodFacts:
        understoodFacts(
          message
        ),
      expectedOutcome:
        expectedOutcome(
          message
        )
    };

    bucket.set(
      type,
      resolution
    );
  }

  return [
    ...bucket.values()
  ].sort(
    (
      left,
      right
    ) =>
      new Date(
        right.updatedAt
      ).getTime() -
      new Date(
        left.updatedAt
      ).getTime()
  );
}

function updateText(
  message: AIAssistantMessageView
) {
  const payload =
    message.payload;

  if (!payload) {
    return message.content;
  }

  const next =
    payload.sections.find(
      section =>
        section.title
          .toLowerCase()
          .includes(
            'what i need'
          )
    );

  if (
    next?.bullets[0]
  ) {
    return next.bullets[0];
  }

  return payload.summary;
}

export function GuidedAssistantExperience({
  audience,
  workspaceId,
  vendorProfileId,
  session,
  prompts,
  sending,
  activityLabel,
  onPrompt,
  onStartFresh,
  onApplied,
  onFeedback
}: GuidedAssistantExperienceProps) {
  const [
    openResolutionId,
    setOpenResolutionId
  ] =
    React.useState<
      string |
      null
    >(
      null
    );

  const messages =
    session?.messages ??
    [];

  const assistantMessages =
    messages.filter(
      message =>
        message.role ===
        'ASSISTANT'
    );

  const latestAssistant =
    assistantMessages[
      assistantMessages.length -
      1
    ] ??
    null;

  const latestPayload =
    latestAssistant?.payload ??
    null;

  const nextSection =
    latestPayload?.sections.find(
      section =>
        section.title
          .toLowerCase()
          .includes(
            'what i need'
          )
    ) ??
    null;

  const resolutions =
    collectResolutions(
      messages
    );

  const currentResolution =
    resolutions.find(
      resolution =>
        resolution.id ===
        openResolutionId
    ) ??
    null;

  const needsMore =
    Boolean(
      nextSection
    );

  const hasResult =
    resolutions.some(
      resolution =>
        resolution.status !==
          'COLLECTING' &&
        resolution.status !==
          'DISMISSED'
    );

  const currentStage:
    ExperienceStage =
    sending
      ? 'prepare'
      : needsMore
        ? 'understand'
        : hasResult
          ? 'act'
          : messages.length
            ? 'understand'
            : 'choose';

  const currentIndex =
    stageIndex(
      currentStage
    );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5 sm:py-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="overflow-hidden rounded-[1.75rem] border border-accent/20 bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_48%)] shadow-sm">
          <div className="flex flex-col gap-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-accent">
                  Current progress
                </p>

                <h2 className="mt-2 text-lg font-black sm:text-xl">
                  {
                    sending
                      ? activityLabel
                      : latestPayload
                          ?.headline ??
                        'Tell me what you want to achieve'
                  }
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                  {
                    sending
                      ? 'I am updating the current resolution instead of creating another result.'
                      : latestPayload
                          ?.summary ??
                        'Choose a suggestion below or write naturally in the prompt field above.'
                  }
                </p>
              </div>

              {session ? (
                <button
                  type="button"
                  onClick={
                    onStartFresh
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[10px] font-black">
                  <RotateCcw className="size-3.5" />

                  Start fresh
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {stages.map(
                (
                  stage,
                  index
                ) => {
                  const reached =
                    index <=
                    currentIndex;

                  return (
                    <div
                      key={
                        stage.id
                      }
                      className="min-w-0">
                      <div
                        className={`h-1.5 rounded-full ${
                          reached
                            ? 'bg-accent'
                            : 'bg-border/70'
                        }`}
                      />

                      <p
                        className={`mt-1 truncate text-center text-[8px] font-black uppercase tracking-[0.08em] ${
                          reached
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}>
                        {
                          stage.label
                        }
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {nextSection
            ?.bullets[0] ? (
            <div className="border-t border-accent/15 bg-accent/7 p-4 sm:p-5">
              <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.14em] text-accent">
                <CircleDot className="size-3.5" />

                Next update needed
              </p>

              <p className="mt-2 text-sm font-black leading-6">
                {
                  nextSection
                    .bullets[0]
                }
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Answer naturally in
                the prompt field
                above.
              </p>
            </div>
          ) : null}
        </section>

        {!messages.length ? (
          <section>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-accent" />

              <div>
                <h3 className="font-black">
                  Start with
                  something I can
                  resolve
                </h3>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Tap once and I
                  will begin
                  immediately.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {prompts
                .slice(
                  0,
                  8
                )
                .map(
                  suggestion => (
                    <button
                      key={
                        suggestion.id
                      }
                      type="button"
                      disabled={
                        sending
                      }
                      onClick={() =>
                        onPrompt(
                          suggestion.prompt
                        )
                      }
                      className="group flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/60 p-4 text-left transition hover:border-accent/35 hover:bg-muted/45 active:scale-[0.99] disabled:opacity-50">
                      <span className="min-w-0">
                        <span className="block text-xs font-black leading-5">
                          {
                            suggestion.label
                          }
                        </span>

                        <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">
                          {
                            suggestion.description
                          }
                        </span>
                      </span>

                      <ArrowRight className="size-4 shrink-0 text-accent transition group-hover:translate-x-0.5" />
                    </button>
                  )
                )}
            </div>
          </section>
        ) : (
          <>
            <section className="rounded-[1.75rem] border border-border/60 bg-card/55 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                    Live updates
                  </p>

                  <h3 className="mt-1 font-black">
                    What changed
                  </h3>
                </div>

                <span className="rounded-full border px-3 py-1 text-[9px] font-black">
                  {
                    messages.length
                  } updates
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {messages
                  .slice(
                    -8
                  )
                  .map(
                    message => (
                      <div
                        key={
                          message.id
                        }
                        className="flex gap-3 rounded-2xl border border-border/55 bg-background/55 p-3">
                        <span
                          className={`mt-1 size-2 shrink-0 rounded-full ${
                            message.role ===
                            'USER'
                              ? 'bg-primary'
                              : 'bg-accent'
                          }`}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                              {
                                message.role ===
                                'USER'
                                  ? 'You updated'
                                  : 'Assistant updated'
                              }
                            </p>

                            <p className="flex items-center gap-1 text-[9px] text-muted-foreground">
                              <Clock3 className="size-3" />

                              {
                                new Date(
                                  message.createdAt
                                ).toLocaleTimeString(
                                  'en-NG',
                                  {
                                    hour:
                                      '2-digit',
                                    minute:
                                      '2-digit'
                                  }
                                )
                              }
                            </p>
                          </div>

                          <p className="mt-1 text-xs font-semibold leading-5">
                            {
                              message.role ===
                              'USER'
                                ? message.content
                                : updateText(
                                    message
                                  )
                            }
                          </p>
                        </div>
                      </div>
                    )
                  )}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-accent/20 bg-card/70 p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-accent">
                    Resolution bucket
                  </p>

                  <h3 className="mt-1 text-lg font-black">
                    Outcomes being tracked
                  </h3>

                  <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                    New responses update
                    the matching resolution
                    instead of creating
                    another result card.
                  </p>
                </div>

                <span className="rounded-full border border-accent/20 bg-accent/8 px-3 py-1.5 text-[9px] font-black">
                  {
                    resolutions.length
                  } resolutions
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                {resolutions.map(
                  resolution => {
                    const open =
                      currentResolution
                        ?.id ===
                      resolution.id;

                    return (
                      <article
                        key={
                          resolution.id
                        }
                        className={`overflow-hidden rounded-2xl border ${statusClass(
                          resolution.status
                        )}`}>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenResolutionId(
                              open
                                ? null
                                : resolution.id
                            )
                          }
                          className="flex w-full items-start justify-between gap-3 p-4 text-left">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-current/15 px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em]">
                                {
                                  statusLabel(
                                    resolution.status
                                  )
                                }
                              </span>

                              <span className="text-[8px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                                {
                                  readableType(
                                    resolution.type
                                  )
                                }
                              </span>
                            </div>

                            <h4 className="mt-3 font-black">
                              {
                                resolution.title
                              }
                            </h4>

                            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground">
                              {
                                resolution.summary
                              }
                            </p>

                            <p className="mt-3 flex items-center gap-2 text-[10px] font-black">
                              <Check className="size-3.5 text-accent" />

                              {
                                resolution.expectedOutcome
                              }
                            </p>
                          </div>

                          {
                            open
                              ? (
                                <ChevronUp className="size-4 shrink-0" />
                              )
                              : (
                                <ChevronDown className="size-4 shrink-0" />
                              )
                          }
                        </button>

                        {resolution
                          .understoodFacts
                          .length ? (
                          <div className="grid gap-2 border-t border-current/10 px-4 py-3 sm:grid-cols-2">
                            {resolution.understoodFacts.map(
                              fact => (
                                <div
                                  key={`${resolution.id}-${fact.label}`}
                                  className="rounded-xl border border-current/10 bg-background/55 p-3">
                                  <p className="text-[8px] font-black uppercase tracking-[0.1em] text-muted-foreground">
                                    {
                                      fact.label
                                    }
                                  </p>

                                  <p className="mt-1 text-xs font-black">
                                    {
                                      fact.value
                                    }
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        ) : null}

                        {open ? (
                          <div className="border-t border-current/10 bg-background/60 p-3 sm:p-4">
                            <AssistantResponseCard
                              audience={
                                audience
                              }
                              workspaceId={
                                workspaceId
                              }
                              vendorProfileId={
                                vendorProfileId
                              }
                              message={
                                resolution.message
                              }
                              onApplied={
                                onApplied
                              }
                              onFeedback={
                                onFeedback
                              }
                              onPrompt={
                                onPrompt
                              }
                            />
                          </div>
                        ) : null}
                      </article>
                    );
                  }
                )}
              </div>
            </section>
          </>
        )}

        {sending ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-[1.5rem] border border-accent/25 bg-accent/8 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/12 text-accent">
                <LoaderCircle className="size-4 animate-spin" />
              </span>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-accent">
                  Updating resolution
                </p>

                <p className="mt-1 text-sm font-black">
                  {
                    activityLabel
                  }
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
