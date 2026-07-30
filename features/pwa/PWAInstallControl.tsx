'use client';

import {
  Download,
  RefreshCcw,
  Share2
} from 'lucide-react';

import {
  cn
} from '@/lib/utils';

import {
  usePWARuntime
} from './PWARuntimeProvider';

export function PWAInstallControl() {
  const {
    installMode,
    isStandalone,
    installAvailable,
    updateReady,
    install,
    shareCurrentExperience,
    applyUpdate
  } =
    usePWARuntime();

  const visible =
    updateReady ||
    isStandalone ||
    installAvailable;

  if (
    !visible
  ) {
    return null;
  }

  const action =
    updateReady
      ? () =>
          void applyUpdate()
      : isStandalone
        ? () =>
            void shareCurrentExperience()
        : () =>
            void install();

  const Icon =
    updateReady
      ? RefreshCcw
      : isStandalone
        ? Share2
        : Download;

  const label =
    updateReady
      ? 'Update'
      : isStandalone
        ? 'Share'
        : installMode ===
            'beta'
          ? 'Install Beta'
          : 'Install App';

  const title =
    updateReady
      ? 'Apply the latest AJ Logik update'
      : isStandalone
        ? 'Share this AJ Logik experience'
        : label;

  return (
    <button
      type="button"
      title={
        title
      }
      aria-label={
        title
      }
      onClick={
        action
      }
      className={cn(
        `
          relative inline-flex
          h-9 shrink-0
          items-center justify-center
          gap-2 rounded-full
          border px-2.5
          text-xs font-semibold
          shadow-sm transition
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-ring
          sm:px-3
        `,
        updateReady
          ? [
              'border-amber-500/30',
              'bg-amber-500/10',
              'text-amber-700',
              'hover:bg-amber-500/15',
              'dark:text-amber-300'
            ]
          : [
              'border-border/70',
              'bg-background/70',
              'text-foreground',
              'backdrop-blur-xl',
              'hover:bg-muted'
            ]
      )}>
      <Icon
        className={cn(
          'size-4',
          updateReady &&
            'animate-pulse'
        )}
      />

      <span className="hidden whitespace-nowrap sm:inline">
        {
          label
        }
      </span>

      {updateReady ? (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-background bg-amber-500"
        />
      ) : null}
    </button>
  );
}
