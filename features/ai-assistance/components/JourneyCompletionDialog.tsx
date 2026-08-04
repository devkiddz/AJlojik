'use client';

/* AJ_MS12_JOURNEY_SUMMARY_COMPLETION_V1 */

import {
  useEffect,
  type MouseEvent
} from 'react';

import {
  Archive,
  BadgeCheck,
  CheckCircle2,
  CircleDot,
  X
} from 'lucide-react';

type JourneyCompletionDialogProps = {
  open:
    boolean;
  mode:
    'draft' |
    'complete';
  title:
    string |
    null;
  unresolved:
    string[];
  busy:
    boolean;
  onCancel(): void;
  onConfirm(): void;
};

export function JourneyCompletionDialog({
  open,
  mode,
  title,
  unresolved,
  busy,
  onCancel,
  onConfirm
}: JourneyCompletionDialogProps) {
  useEffect(
    () => {
      if (!open) {
        return;
      }

      const onKeyDown =
        (
          event:
            KeyboardEvent
        ) => {
          if (
            event.key ===
              'Escape' &&
            !busy
          ) {
            onCancel();
          }
        };

      window.addEventListener(
        'keydown',
        onKeyDown
      );

      return () =>
        window.removeEventListener(
          'keydown',
          onKeyDown
        );
    },
    [
      busy,
      onCancel,
      open
    ]
  );

  if (!open) {
    return null;
  }

  const savingDraft =
    mode ===
    'draft';

  return (
    <div
      className="fixed inset-0 z-[225] grid place-items-center bg-background/75 px-4 py-8 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
        if (
          event.target ===
            event.currentTarget &&
          !busy
        ) {
          onCancel();
        }
      }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="journey-completion-title"
        aria-describedby="journey-completion-description"
        className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
          <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
            savingDraft
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          }`}>
            {
              savingDraft
                ? <Archive className="size-5" />
                : <BadgeCheck className="size-5" />
            }
          </span>

          <button
            type="button"
            disabled={
              busy
            }
            onClick={
              onCancel
            }
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
            aria-label="Close confirmation">
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <h2
            id="journey-completion-title"
            className="text-xl font-semibold tracking-tight text-foreground">
            {
              savingDraft
                ? 'Finish this Journey as a draft?'
                : 'Complete this Journey?'
            }
          </h2>

          <p
            id="journey-completion-description"
            className="mt-2 text-sm leading-6 text-muted-foreground">
            {
              savingDraft
                ? 'AJ has not confirmed a successful final outcome yet. Your progress will remain saved in Journeys. AJ will leave it unfinished as a draft and return you to a fresh workspace instead of marking it completed.'
                : 'The active plan, customer decision and Journey history will remain saved as the completed outcome. Further changes will require an explicit reopen.'
            }
          </p>

          {title ? (
            <div className="mt-4 rounded-2xl border border-border/55 bg-muted/30 px-4 py-3">
              <p className="text-[10px] font-semibold text-muted-foreground">
                Journey
              </p>

              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5">
                {
                  title
                }
              </p>
            </div>
          ) : null}

          {savingDraft ? (
            <div className="mt-4 rounded-2xl border border-amber-500/25 bg-amber-500/7 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                <CircleDot className="size-3.5" />
                Still incomplete
              </p>

              <ul className="mt-3 space-y-2">
                {(unresolved.length
                  ? unresolved
                  : [
                      'AJ still needs a confirmed plan and customer decision before this can be completed successfully.'
                    ]
                ).map(
                  item => (
                    <li
                      key={
                        item
                      }
                      className="flex gap-2 text-sm leading-6 text-foreground/85">
                      <CircleDot className="mt-1 size-3 shrink-0 text-amber-600" />
                      <span>
                        {
                          item
                        }
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/7 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-4" />
                The active plan is ready to become the completed outcome.
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={
                busy
              }
              onClick={
                onCancel
              }
              className="h-11 rounded-full px-5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40">
              {
                savingDraft
                  ? 'Keep working'
                  : 'Cancel'
              }
            </button>

            <button
              type="button"
              disabled={
                busy
              }
              onClick={
                onConfirm
              }
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-xs font-semibold shadow-sm transition hover:opacity-95 disabled:opacity-55 ${
                savingDraft
                  ? 'bg-amber-600 text-white'
                  : 'bg-primary text-primary-foreground'
              }`}>
              {
                savingDraft
                  ? <Archive className="size-4" />
                  : <BadgeCheck className="size-4" />
              }

              {
                busy
                  ? savingDraft
                    ? 'Saving draft…'
                    : 'Completing Journey…'
                  : savingDraft
                    ? 'Save as draft'
                    : 'Complete Journey'
              }
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
