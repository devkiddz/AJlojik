'use client';

/* AJ_MS12_JOURNEY_CONFIRMATION_DIALOG */

import {
  useEffect
} from 'react';

import {
  Trash2,
  X
} from 'lucide-react';

type JourneyDeleteDialogProps = {
  open:
    boolean;
  mode:
    'single' |
    'all';
  title?:
    string |
    null;
  count?:
    number;
  busy:
    boolean;
  onCancel(): void;
  onConfirm(): void;
};

export function JourneyDeleteDialog({
  open,
  mode,
  title = null,
  count = 0,
  busy,
  onCancel,
  onConfirm
}: JourneyDeleteDialogProps) {
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

  const clearingAll =
    mode ===
    'all';

  return (
    <div
      className="fixed inset-0 z-[220] grid place-items-center bg-background/75 px-4 py-8 backdrop-blur-sm"
      role="presentation"
      onMouseDown={event => {
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
        aria-labelledby="journey-delete-title"
        aria-describedby="journey-delete-description"
        className="w-full max-w-md overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-destructive/8 text-destructive">
            <Trash2 className="size-5" />
          </span>

          <button
            type="button"
            disabled={
              busy
            }
            onClick={
              onCancel
            }
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Close confirmation">
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <h2
            id="journey-delete-title"
            className="text-xl font-semibold tracking-tight text-foreground">
            {
              clearingAll
                ? 'Clear your saved Journeys?'
                : 'Remove this Journey?'
            }
          </h2>

          <p
            id="journey-delete-description"
            className="mt-2 text-sm leading-6 text-muted-foreground">
            {
              clearingAll
                ? `AJ will remove all ${count} saved Journey${count === 1 ? '' : 's'} from this workspace, together with their messages and earlier plan versions.`
                : 'AJ will remove this Journey, its conversation and its earlier plan versions from your workspace.'
            }
          </p>

          {!clearingAll &&
          title ? (
            <div className="mt-4 rounded-2xl bg-muted/35 px-4 py-3">
              <p className="text-[10px] text-muted-foreground">
                Journey
              </p>

              <p className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-foreground">
                {
                  title
                }
              </p>
            </div>
          ) : null}

          <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
            This cannot be undone.
          </p>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={
                busy
              }
              onClick={
                onCancel
              }
              className="h-11 rounded-full px-5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40">
              {
                clearingAll
                  ? 'Keep my Journeys'
                  : 'Keep this Journey'
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
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-destructive px-5 text-xs font-medium text-destructive-foreground shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-55">
              <Trash2 className="size-4" />

              {
                busy
                  ? clearingAll
                    ? 'Clearing Journeys…'
                    : 'Removing Journey…'
                  : clearingAll
                    ? 'Clear Journeys'
                    : 'Remove Journey'
              }
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
