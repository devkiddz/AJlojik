'use client';

import {
  useMemo,
  useState
} from 'react';

import {
  ArrowRight,
  LoaderCircle,
  Sparkles
} from 'lucide-react';

import type {
  IntelligenceResolutionType
} from '../domain';

type ResolutionComposerProps = {
  audience:
    'customer' |
    'admin' |
    'vendor';
  mutating:
    boolean;
  onCreate(
    input: {
      type:
        IntelligenceResolutionType;
      title:
        string;
      objective:
        string;
      expectedOutcome:
        string;
    }
  ): void;
};

const CUSTOMER_STARTERS: Array<{
  type:
    IntelligenceResolutionType;
  title:
    string;
  objective:
    string;
  expectedOutcome:
    string;
}> = [
  {
    type:
      'SHOPPING_PLAN',
    title:
      'Plan a complete shopping occasion',
    objective:
      'Build a practical product plan around my occasion, budget and preferences.',
    expectedOutcome:
      'A reviewed plan that can become a Shopping List.'
  },
  {
    type:
      'PRODUCT_COMPARISON',
    title:
      'Compare products properly',
    objective:
      'Compare selected products using price, availability, quality and suitability.',
    expectedOutcome:
      'A clear recommendation with trade-offs.'
  },
  {
    type:
      'BASKET_OPTIMIZATION',
    title:
      'Improve my basket',
    objective:
      'Review my basket and reduce unnecessary cost without losing important items.',
    expectedOutcome:
      'An optimized basket proposal ready for review.'
  }
];

const ADMIN_STARTERS: typeof CUSTOMER_STARTERS = [
  {
    type:
      'OPERATIONS_BRIEF',
    title:
      'Prepare an operations brief',
    objective:
      'Identify the most important operational risks and recommended actions.',
    expectedOutcome:
      'A prioritized and actionable workspace brief.'
  },
  {
    type:
      'CATALOG_IMPROVEMENT',
    title:
      'Improve catalogue quality',
    objective:
      'Find incomplete or inconsistent catalogue records and prepare corrections.',
    expectedOutcome:
      'A reviewed catalogue improvement plan.'
  },
  {
    type:
      'CAMPAIGN_PLAN',
    title:
      'Prepare a campaign',
    objective:
      'Create a campaign plan around the current commercial objective.',
    expectedOutcome:
      'A campaign draft ready for review.'
  }
];

const VENDOR_STARTERS: typeof CUSTOMER_STARTERS = [
  {
    type:
      'PRODUCT_DRAFT',
    title:
      'Prepare a product draft',
    objective:
      'Turn product information into a complete catalogue draft.',
    expectedOutcome:
      'A governed product draft ready for review.'
  },
  {
    type:
      'PRODUCT_REVISION',
    title:
      'Prepare a product revision',
    objective:
      'Review a product and prepare a justified revision submission.',
    expectedOutcome:
      'A revision ready for the approval workflow.'
  },
  {
    type:
      'CAMPAIGN_PLAN',
    title:
      'Prepare a vendor campaign',
    objective:
      'Create a campaign proposal around selected products and goals.',
    expectedOutcome:
      'A campaign draft ready for submission.'
  }
];

export function ResolutionComposer({
  audience,
  mutating,
  onCreate
}: ResolutionComposerProps) {
  const [
    objective,
    setObjective
  ] =
    useState('');

  const starters =
    useMemo(
      () =>
        audience ===
        'customer'
          ? CUSTOMER_STARTERS
          : audience ===
              'admin'
            ? ADMIN_STARTERS
            : VENDOR_STARTERS,
      [
        audience
      ]
    );

  function submitCustom() {
    const clean =
      objective.trim();

    if (!clean) {
      return;
    }

    onCreate({
      type:
        'CUSTOM',
      title:
        clean.length >
        80
          ? `${clean.slice(0, 77)}…`
          : clean,
      objective:
        clean,
      expectedOutcome:
        'A reviewed and actionable Resolution.'
    });

    setObjective('');
  }

  return (
    <section className="rounded-[1.75rem] border border-primary/15 bg-gradient-to-br from-primary/8 via-card to-accent/8 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </span>

        <div>
          <p className="text-sm font-black">
            Start a Resolution
          </p>

          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Define the outcome, not merely the conversation.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {starters.map(
          starter => (
            <button
              key={
                starter.type
              }
              type="button"
              disabled={
                mutating
              }
              onClick={() =>
                onCreate(
                  starter
                )
              }
              className="rounded-2xl border border-border/60 bg-background/65 p-3 text-left transition hover:border-primary/25 hover:bg-primary/5 disabled:opacity-50">
              <p className="text-[11px] font-black">
                {
                  starter.title
                }
              </p>

              <p className="mt-1 line-clamp-3 text-[9px] leading-4 text-muted-foreground">
                {
                  starter.objective
                }
              </p>
            </button>
          )
        )}
      </div>

      <div className="mt-3 flex items-end gap-2 rounded-2xl border bg-background/75 p-2">
        <textarea
          value={
            objective
          }
          onChange={
            event =>
              setObjective(
                event.target.value
              )
          }
          rows={2}
          maxLength={
            2000
          }
          placeholder="Describe the outcome you want RCENTZ Intelligence to resolve…"
          className="min-h-12 min-w-0 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none"
        />

        <button
          type="button"
          disabled={
            mutating ||
            !objective.trim()
          }
          onClick={
            submitCustom
          }
          className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40">
          {mutating ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </button>
      </div>
    </section>
  );
}
