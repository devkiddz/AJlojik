'use client';

import { AlertCircle, CheckCircle2, ChevronRight, Info, TriangleAlert, X } from 'lucide-react';

import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '@/lib/utils';

import type { ActionFeedbackMessage, ActionFeedbackTone } from './actionFeedbackTypes';

type ActionFeedbackViewportProps = {
  messages: ActionFeedbackMessage[];

  onDismiss: (messageId: string) => void;
};

const toneConfiguration = {
  success: {
    icon: CheckCircle2,

    label: 'Completed',

    iconClassName: 'bg-emerald-500/10 text-emerald-600',

    badgeClassName: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600',

    progressClassName: 'bg-emerald-500'
  },

  error: {
    icon: AlertCircle,

    label: 'Action failed',

    iconClassName: 'bg-destructive/10 text-destructive',

    badgeClassName: 'border-destructive/20 bg-destructive/10 text-destructive',

    progressClassName: 'bg-destructive'
  },

  warning: {
    icon: TriangleAlert,

    label: 'Attention',

    iconClassName: 'bg-amber-500/10 text-amber-600',

    badgeClassName: 'border-amber-500/20 bg-amber-500/10 text-amber-600',

    progressClassName: 'bg-amber-500'
  },

  info: {
    icon: Info,

    label: 'Update',

    iconClassName: 'bg-blue-500/10 text-blue-600',

    badgeClassName: 'border-blue-500/20 bg-blue-500/10 text-blue-600',

    progressClassName: 'bg-blue-500'
  }
} satisfies Record<
  ActionFeedbackTone,
  {
    icon: typeof Info;
    label: string;
    iconClassName: string;
    badgeClassName: string;
    progressClassName: string;
  }
>;

export function ActionFeedbackViewport({ messages, onDismiss }: ActionFeedbackViewportProps) {
  return (
    <div
      aria-live="polite"
      aria-relevant="additions removals"
      className="pointer-events-none fixed inset-x-3 top-3 z-50 flex flex-col items-end gap-3 sm:left-auto sm:right-5 sm:top-5 sm:w-full sm:max-w-md">
      <AnimatePresence initial={false}>
        {messages.map(message => {
          const configuration = toneConfiguration[message.tone];

          const Icon = configuration.icon;

          const bannerLabel = message.banner?.label ?? 'AJ Logik';

          const bannerDetail = message.banner?.detail ?? 'Experience notification';

          const bannerBadge = message.banner?.badge ?? configuration.label;

          return (
            <motion.article
              key={message.id}
              layout
              initial={{
                opacity: 0,
                y: -20,
                scale: 0.96
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }}
              exit={{
                opacity: 0,
                x: 32,
                scale: 0.97
              }}
              transition={{
                duration: 0.22,
                ease: 'easeOut'
              }}
              role={message.tone === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto relative w-full overflow-hidden rounded-3xl border border-primary/10 bg-card shadow-2xl">
              <div className="relative overflow-hidden border-b border-primary/10 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent px-4 py-3">
                <div className="absolute -right-8 -top-8 size-24 rounded-full bg-primary/10 blur-2xl" />

                <div className="relative flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-xs font-black tracking-tight text-primary-foreground shadow-sm">
                    AJ
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{bannerLabel}</p>

                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                          configuration.badgeClassName
                        )}>
                        {bannerBadge}
                      </span>
                    </div>

                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate">{bannerDetail}</span>

                      <span aria-hidden="true" className="size-1 rounded-full bg-muted-foreground/40" />

                      <span className="shrink-0">Now</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label="Dismiss notification"
                    onClick={() => onDismiss(message.id)}
                    className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-background/60 hover:text-foreground">
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 px-4 py-4">
                <div
                  className={cn(
                    'grid size-11 shrink-0 place-items-center rounded-2xl',
                    configuration.iconClassName
                  )}>
                  <Icon className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-5 text-foreground">{message.title}</p>

                  {message.description && (
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{message.description}</p>
                  )}

                  {message.action && (
                    <button
                      type="button"
                      onClick={() => {
                        message.action?.onSelect();
                        onDismiss(message.id);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition hover:opacity-70">
                      {message.action.label}

                      <ChevronRight className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {message.duration > 0 && (
                <div className="h-1 w-full bg-muted">
                  <motion.div
                    initial={{
                      scaleX: 1
                    }}
                    animate={{
                      scaleX: 0
                    }}
                    transition={{
                      duration: message.duration / 1000,

                      ease: 'linear'
                    }}
                    style={{
                      transformOrigin: 'left'
                    }}
                    className={cn('h-full w-full', configuration.progressClassName)}
                  />
                </div>
              )}
            </motion.article>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
