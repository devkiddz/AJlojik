'use client';

/* AJ_MS12_JOURNEY_SUMMARY_COMPLETION_V1 */
/* AJ_MS12_4_JOURNEY_SUMMARY_RECONCILIATION_V1 */
/* AJ_MS12_4_JOURNEY_SUMMARY_RECOVERY_V2 */

import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  ListChecks,
  PackageCheck,
  RotateCcw,
  Sparkles,
  Target,
  WalletCards
} from 'lucide-react';

import {
  useState
} from 'react';

import type {
  AIAssistantMessageView,
  AIAssistantResponsePayload,
  AIAssistantSessionView
} from '../contracts';

type JourneySummaryCardProps = {
  session:
    AIAssistantSessionView;
  activePlanMessage:
    AIAssistantMessageView |
    null;
  planVersion:
    number;
  savedPlanCount:
    number;
  busy:
    boolean;
  reasoningOpen:
    boolean;
  onComplete(): void;
  onReopen(): void;
  onToggleReasoning(): void;
};

function compactUnique(
  values:
    Array<
      string |
      null |
      undefined
    >
) {
  return [
    ...new Set(
      values
        .map(
          value =>
            value
              ?.replace(
                /^Preference:\s*/i,
                ''
              )
              .replace(
                /\.$/,
                ''
              )
              .trim() ??
            ''
        )
        .filter(
          Boolean
        )
    )
  ];
}

function metricValue(
  payload:
    AIAssistantResponsePayload |
    null,
  patterns:
    RegExp[]
) {
  return payload
    ?.metrics.find(
      metric =>
        patterns.some(
          pattern =>
            pattern.test(
              metric.label
            )
        )
    )
    ?.value ??
    null;
}

function formatNaira(
  value:
    number
) {
  return new Intl.NumberFormat(
    'en-NG',
    {
      style:
        'currency',
      currency:
        'NGN',
      maximumFractionDigits:
        0
    }
  ).format(
    value
  );
}

function parseAmount(
  value:
    string |
    null |
    undefined
) {
  if (!value) {
    return null;
  }

  const match =
    value.match(
      /(-?[0-9][0-9,\s]*(?:\.[0-9]+)?)\s*(k|m|thousand|million)?/i
    );

  if (!match) {
    return null;
  }

  const amount =
    Number(
      (
        match[1] ??
        ''
      ).replace(
        /[\s,]/g,
        ''
      )
    );

  if (
    !Number.isFinite(
      amount
    )
  ) {
    return null;
  }

  const suffix =
    (
      match[2] ??
      ''
    )
      .toLowerCase()
      .trim();

  const multiplier =
    suffix ===
      'm' ||
    suffix ===
      'million'
      ? 1_000_000
      : suffix ===
          'k' ||
        suffix ===
          'thousand'
        ? 1_000
        : 1;

  return Math.round(
    amount *
      multiplier
  );
}

function stateBudgetAmount(
  constraints:
    string[]
) {
  for (
    const constraint of
    [
      ...constraints
    ].reverse()
  ) {
    const match =
      constraint.match(
        /^Budget(?:\s+limit)?:\s*(.+?)\.?$/i
      );

    if (!match) {
      continue;
    }

    const amount =
      parseAmount(
        match[1]
      );

    if (
      amount !==
        null &&
      amount >
        0
    ) {
      return amount;
    }
  }

  return null;
}

function hasFlexibleBudget(
  constraints:
    string[]
) {
  return constraints.some(
    value =>
      /^Budget:\s*flexible\.?$/i.test(
        value.trim()
      )
  );
}

function fallbackTotal(
  payload:
    AIAssistantResponsePayload |
    null
) {
  if (
    !payload ||
    ![
      'PAIRING',
      'SHOPPING_PLAN'
    ].includes(
      payload.outputType
    )
  ) {
    return null;
  }

  const total =
    payload.products.reduce(
      (
        sum,
        product
      ) =>
        sum +
        (
          typeof product.price ===
            'number' &&
          Number.isFinite(
            product.price
          )
            ? product.price
            : 0
        ),
      0
    );

  return total >
    0
    ? total
    : null;
}

function displayContextValue(
  value:
    string
) {
  const budget =
    value.match(
      /^Budget(?:\s+limit)?:\s*(.+?)\.?$/i
    );

  if (budget) {
    const amount =
      parseAmount(
        budget[1]
      );

    if (
      amount !==
        null &&
      amount >
        0
    ) {
      return `Budget limit: ${formatNaira(
        amount
      )}`;
    }
  }

  return value;
}

function scrollToPlan() {
  document
    .getElementById(
      'aj-current-plan-response'
    )
    ?.scrollIntoView({
      behavior:
        'smooth',
      block:
        'start'
    });
}

export function JourneySummaryCard({
  session,
  activePlanMessage,
  planVersion,
  savedPlanCount,
  busy,
  reasoningOpen,
  onComplete,
  onReopen,
  onToggleReasoning
}: JourneySummaryCardProps) {
  const [
    previewOpen,
    setPreviewOpen
  ] =
    useState(
      false
    );

  const payload =
    activePlanMessage
      ?.payload ??
    null;

  const state =
    session.journeyState;

  const completed =
    session.journeyStage ===
    'COMPLETED';

  const accepted =
    completed ||
    Boolean(
      state
        ?.confirmedDecisions
        .length
    ) ||
    session
      .journeyLastTransition
      ?.reason ===
      'DECISION_CONFIRMED';

  const unresolved =
    compactUnique(
      state
        ?.unresolvedQuestions ??
      []
    );

  const understood =
    compactUnique([
      ...(
        state
          ?.preferences ??
        []
      ),
      ...(
        state
          ?.constraints ??
        []
      )
    ])
      .map(
        displayContextValue
      )
      .slice(
        -3
      );

  const objective =
    state?.objective ??
    session.journeyGoal ??
    session.title;

  const productCount =
    payload?.products.length ??
    0;

  const constraints =
    state?.constraints ??
    [];

  const payloadBudgetLabel =
    metricValue(
      payload,
      [
        /^budget(?:\s+limit)?$/i,
        /budget limit/i
      ]
    );

  const stateBudget =
    stateBudgetAmount(
      constraints
    );

  const payloadBudget =
    parseAmount(
      payloadBudgetLabel
    );

  const budgetAmount =
    stateBudget ??
    payloadBudget;

  const budget =
    budgetAmount !==
      null &&
    budgetAmount >
      0
      ? formatNaira(
          budgetAmount
        )
      : payloadBudgetLabel ??
        (
          hasFlexibleBudget(
            constraints
          )
            ? 'Flexible'
            : null
        );

  const estimatedTotalLabel =
    metricValue(
      payload,
      [
        /estimated total/i,
        /^total$/i,
        /plan total/i
      ]
    );

  const estimatedTotalAmount =
    parseAmount(
      estimatedTotalLabel
    ) ??
    fallbackTotal(
      payload
    );

  const estimatedTotal =
    estimatedTotalAmount !==
      null
      ? formatNaira(
          estimatedTotalAmount
        )
      : estimatedTotalLabel;

  const remainingLabel =
    metricValue(
      payload,
      [
        /remaining budget/i,
        /^remaining$/i
      ]
    );

  const remainingAmount =
    parseAmount(
      remainingLabel
    ) ??
    (
      budgetAmount !==
        null &&
      estimatedTotalAmount !==
        null
        ? budgetAmount -
          estimatedTotalAmount
        : null
    );

  const remaining =
    remainingAmount ===
      null
      ? remainingLabel
      : remainingAmount >=
          0
        ? formatNaira(
            remainingAmount
          )
        : `Over by ${formatNaira(
            Math.abs(
              remainingAmount
            )
          )}`;

  const status =
    completed
      ? 'Completed'
      : accepted
        ? 'Plan accepted'
        : unresolved.length
          ? 'More details needed'
          : activePlanMessage
            ? 'Ready to decide'
            : 'Plan pending';

  const statusClasses =
    completed
      ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : accepted
        ? 'border-accent/40 bg-accent/12 text-foreground'
        : unresolved.length
          ? 'border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300'
          : 'border-border/70 bg-background/70 text-muted-foreground';

  const nextStep =
    unresolved[0] ??
    (
      completed
        ? 'This outcome is frozen until you explicitly reopen the Journey.'
        : accepted
          ? 'The plan is accepted. Complete the Journey when you are satisfied with the saved outcome.'
          : activePlanMessage
            ? 'Review the plan, refine it or confirm that you will go with it.'
            : 'Continue answering AJ’s focused questions so the first complete plan can be prepared.'
    );

  return (
    <section className="border-b border-border/60 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--accent)_10%,transparent),transparent_52%)] px-4 py-4 sm:px-6 sm:py-5">
      <div className="rounded-[1.6rem] border border-accent/25 bg-card/75 p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold text-accent">
              <Sparkles className="size-4" />
              Journey summary
            </p>

            <h2 className="mt-2 text-base font-semibold tracking-tight sm:text-lg">
              {
                objective
              }
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              The current outcome, what AJ understood and what remains before this Journey can close.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {planVersion >
            0 ? (
              <span className="rounded-full border border-border/70 bg-background/75 px-3 py-1 text-[11px] font-semibold">
                Plan v{
                  planVersion
                }
              </span>
            ) : null}

            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusClasses}`}>
              {
                status
              }
            </span>
          </div>
        </div>

        {activePlanMessage ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border/55 bg-background/55 px-3 py-3">
              <p className="text-[10px] font-semibold text-muted-foreground">
                Products
              </p>

              <p className="mt-1 text-sm font-semibold">
                {
                  productCount
                }
              </p>
            </div>

            <div className="rounded-2xl border border-border/55 bg-background/55 px-3 py-3">
              <p className="text-[10px] font-semibold text-muted-foreground">
                Estimated total
              </p>

              <p className="mt-1 text-sm font-semibold">
                {
                  estimatedTotal ??
                  'Not stated'
                }
              </p>
            </div>

            <div className="rounded-2xl border border-border/55 bg-background/55 px-3 py-3">
              <p className="text-[10px] font-semibold text-muted-foreground">
                Budget
              </p>

              <p className="mt-1 text-sm font-semibold">
                {
                  budget ??
                  'Flexible'
                }
              </p>
            </div>

            <div className="rounded-2xl border border-border/55 bg-background/55 px-3 py-3">
              <p className="text-[10px] font-semibold text-muted-foreground">
                Remaining
              </p>

              <p className="mt-1 text-sm font-semibold">
                {
                  remaining ??
                  'Not stated'
                }
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <article className="rounded-2xl border border-border/55 bg-background/45 p-4">
            <p className="flex items-center gap-2 text-[11px] font-semibold text-accent">
              <Target className="size-3.5" />
              AJ understood
            </p>

            {understood.length ? (
              <ul className="mt-3 space-y-2">
                {understood.map(
                  item => (
                    <li
                      key={
                        item
                      }
                      className="flex gap-2 text-sm leading-6 text-foreground/85">
                      <CheckCircle2 className="mt-1 size-3.5 shrink-0 text-accent" />
                      <span>
                        {
                          item
                        }
                      </span>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                AJ is still gathering the first reliable details for this Journey.
              </p>
            )}
          </article>

          <article className="rounded-2xl border border-border/55 bg-background/45 p-4">
            <p className="flex items-center gap-2 text-[11px] font-semibold text-primary">
              <ListChecks className="size-3.5" />
              Next step
            </p>

            <p className="mt-3 flex gap-2 text-sm leading-6 text-foreground/85">
              <CircleDot className="mt-1 size-3.5 shrink-0 text-primary" />
              <span>
                {
                  nextStep
                }
              </span>
            </p>
          </article>
        </div>

        {completed ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-emerald-500/25 bg-emerald-500/5">
            <button
              type="button"
              onClick={() =>
                setPreviewOpen(
                  current =>
                    !current
                )
              }
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <PackageCheck className="size-4 text-emerald-600" />
                Completed Journey preview
              </span>

              <ChevronDown className={`size-4 transition ${previewOpen ? 'rotate-180' : ''}`} />
            </button>

            {previewOpen ? (
              <div className="border-t border-emerald-500/15 px-4 py-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground">
                      Saved outcome
                    </p>

                    <p className="mt-1 text-sm font-semibold leading-6">
                      Plan v{
                        planVersion
                      } · {
                        savedPlanCount
                      } saved version{
                        savedPlanCount ===
                        1
                          ? ''
                          : 's'
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground">
                      Decision
                    </p>

                    <p className="mt-1 text-sm font-semibold leading-6">
                      {
                        state
                          ?.confirmedDecisions
                          .at(
                            -1
                          ) ??
                        'The customer completed this Journey.'
                      }
                    </p>
                  </div>
                </div>

                {payload?.products.length ? (
                  <div className="mt-4">
                    <p className="text-[10px] font-semibold text-muted-foreground">
                      Products in the completed plan
                    </p>

                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {payload.products.map(
                        product => (
                          <div
                            key={`${product.id}:${product.variantId ?? 'default'}`}
                            className="rounded-xl border border-border/50 bg-background/55 px-3 py-2 text-xs font-medium leading-5">
                            {
                              product.name
                            }
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
          {activePlanMessage ? (
            <button
              type="button"
              onClick={
                scrollToPlan
              }
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 text-xs font-semibold transition hover:border-accent/35 hover:bg-accent/8">
              <PackageCheck className="size-3.5" />
              View products
            </button>
          ) : null}

          {activePlanMessage ? (
            <button
              type="button"
              onClick={
                onToggleReasoning
              }
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 text-xs font-semibold transition hover:border-accent/35 hover:bg-accent/8">
              <WalletCards className="size-3.5" />
              {
                reasoningOpen
                  ? 'Hide full reasoning'
                  : 'View full reasoning'
              }
            </button>
          ) : null}

          <div className="flex-1" />

          {completed ? (
            <button
              type="button"
              disabled={
                busy
              }
              onClick={
                onReopen
              }
              className="inline-flex h-10 items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-4 text-xs font-semibold transition hover:bg-accent/18 disabled:opacity-45">
              <RotateCcw className="size-3.5" />
              Reopen Journey
            </button>
          ) : (
            <button
              type="button"
              disabled={
                busy
              }
              onClick={
                onComplete
              }
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-95 disabled:opacity-45">
              <BadgeCheck className="size-3.5" />
              Complete Journey
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
