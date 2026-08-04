'use client';

/* AJ_MS12_INTELLIGENCE_READABILITY_PASS_V1 */

/* AJ_MS12_JOURNEY_HEADER_PROGRESS_V4 */

import {
  Check
} from 'lucide-react';

type JourneyProgressStripProps = {
  stage:
    string |
    null |
    undefined;
  planVersion:
    number;
  stateVersion:
    number;
};

const JOURNEY_STEPS = [
  {
    id:
      'BEGIN',
    label:
      'Begin'
  },
  {
    id:
      'UNDERSTAND',
    label:
      'Understand'
  },
  {
    id:
      'REFINE',
    label:
      'Refine'
  },
  {
    id:
      'DECIDE',
    label:
      'Decide'
  }
] as const;

function progressIndex(
  stage:
    string |
    null |
    undefined
) {
  switch (
    stage
      ?.trim()
      .toUpperCase()
  ) {
    case 'AWAITING_DECISION':
    case 'READY':
    case 'COMPLETED':
      return 3;

    case 'PLANNING':
    case 'REFINING':
      return 2;

    case 'UNDERSTANDING':
      return 1;

    default:
      return 0;
  }
}

function stageLabel(
  stage:
    string |
    null |
    undefined
) {
  if (!stage) {
    return 'Beginning';
  }

  if (
    stage ===
    'READY'
  ) {
    return 'Ready to decide';
  }

  return stage
    .toLowerCase()
    .replaceAll(
      '_',
      ' '
    )
    .replace(
      /\b\w/g,
      character =>
        character.toUpperCase()
    );
}

export function JourneyProgressStrip({
  stage,
  planVersion,
  stateVersion
}: JourneyProgressStripProps) {
  const activeIndex =
    progressIndex(
      stage
    );

  return (
    <section
      aria-label="Journey progress"
      className="border-b border-border/60 bg-accent/[0.035] px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          Journey progress
        </p>

        <p className="text-[11px] font-medium text-muted-foreground">
          {
            stageLabel(
              stage
            )
          }
          {' · '}
          {planVersion >
            0
            ? `Plan v${planVersion}`
            : 'Plan pending'}
          {' · '}
          State v{
            stateVersion
          }
        </p>
      </div>

      <div className="mt-2.5 grid grid-cols-4 gap-1.5">
        {JOURNEY_STEPS.map(
          (
            step,
            index
          ) => {
            const reached =
              index <=
              activeIndex;

            const complete =
              index <
              activeIndex;

            return (
              <div
                key={
                  step.id
                }
                className="min-w-0">
                <div
                  className={`flex h-1.5 items-center justify-end rounded-full transition ${
                    reached
                      ? 'bg-accent shadow-[0_0_14px_color-mix(in_oklab,var(--accent)_38%,transparent)]'
                      : 'bg-border/65'
                  }`}>
                  {complete ? (
                    <span className="mr-0.5 grid size-3 place-items-center rounded-full bg-background text-accent">
                      <Check className="size-2" />
                    </span>
                  ) : null}
                </div>

                <p
                  className={`mt-2 truncate text-center text-xs font-medium ${
                    reached
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}>
                  {
                    step.label
                  }
                </p>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}
