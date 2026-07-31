import Link from 'next/link';

import type {
  ReactNode
} from 'react';

import {
  ArrowUpRight
} from 'lucide-react';

import {
  cn
} from '@/lib/utils';

export type JourneyCardTone =
  | 'slate'
  | 'rose'
  | 'violet'
  | 'emerald'
  | 'amber';

type JourneyCardShellProps = {
  id?: string;

  code: string;
  title: string;
  href: string;
  icon: ReactNode;
  tone: JourneyCardTone;

  metric: ReactNode;
  supportingLabel: string;

  children: ReactNode;

  actionLabel?: string;
  className?: string;
};

const toneStyles: Record<
  JourneyCardTone,
  {
    icon: string;
    metric: string;
    surface: string;
    border: string;
  }
> = {
  slate: {
    icon:
      'bg-slate-500/10 text-slate-600 dark:text-slate-300',

    metric:
      'text-slate-700 dark:text-slate-200',

    surface:
      'from-slate-500/10 via-transparent to-transparent',

    border:
      'border-t-slate-500'
  },

  rose: {
    icon:
      'bg-rose-500/10 text-rose-600 dark:text-rose-300',

    metric:
      'text-rose-700 dark:text-rose-200',

    surface:
      'from-rose-500/10 via-transparent to-transparent',

    border:
      'border-t-rose-500'
  },

  violet: {
    icon:
      'bg-violet-500/10 text-violet-600 dark:text-violet-300',

    metric:
      'text-violet-700 dark:text-violet-200',

    surface:
      'from-violet-500/10 via-transparent to-transparent',

    border:
      'border-t-violet-500'
  },

  emerald: {
    icon:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',

    metric:
      'text-emerald-700 dark:text-emerald-200',

    surface:
      'from-emerald-500/10 via-transparent to-transparent',

    border:
      'border-t-emerald-500'
  },

  amber: {
    icon:
      'bg-amber-500/10 text-amber-700 dark:text-amber-300',

    metric:
      'text-amber-700 dark:text-amber-200',

    surface:
      'from-amber-500/10 via-transparent to-transparent',

    border:
      'border-t-amber-500'
  }
};

export function JourneyCardShell({
  id,
  code,
  title,
  href,
  icon,
  tone,
  metric,
  supportingLabel,
  children,
  actionLabel = 'Open journey',
  className
}: JourneyCardShellProps) {
  const styles =
    toneStyles[tone];

  return (
    <Link
      id={id}
      data-rail-item
      href={href}
      aria-label={`Open ${title}`}
      className={cn(
        `
          group relative min-h-60
          w-[var(--dashboard-rail-card-width)]
          min-w-0 shrink-0 snap-start
          overflow-hidden rounded-xl
          border border-t-4
          border-border/60
          bg-card shadow-sm
          transition duration-300
        `,
        `
          hover:-translate-y-0.5
          hover:border-x-primary/25
          hover:border-b-primary/25
          hover:shadow-md
        `,
        styles.border,
        className
      )}>
      <div
        className={cn(
          `
            pointer-events-none
            absolute inset-0
            bg-gradient-to-br
            opacity-80
          `,
          styles.surface
        )}
      />

      <div
        className="
          relative flex h-full
          min-w-0 flex-col
          p-2.5 sm:p-3
        ">
        <header className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                `
                  grid size-8
                  shrink-0 place-items-center
                  rounded-lg
                  [&_svg]:size-3.5
                `,
                styles.icon
              )}>
              {icon}
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {title}
              </p>

              <span
                className={cn(
                  `
                    mt-1 inline-flex
                    w-fit items-center
                    rounded-md
                    px-1.5 py-0.5
                    text-[9px] font-bold
                  `,
                  styles.icon
                )}>
                {code}
              </span>
            </div>
          </div>

          <span
            className="
              grid size-7 shrink-0
              place-items-center
              rounded-lg border
              border-border/60
              bg-background/90
              text-muted-foreground
              shadow-sm transition
              group-hover:border-primary/25
              group-hover:text-foreground
            ">
            <ArrowUpRight className="size-3.5" />
          </span>
        </header>

        <div
          className="
            mt-2.5 h-36 min-h-36
            min-w-0 overflow-hidden
          ">
          {children}
        </div>

        <footer
          className="
            mt-auto flex min-w-0
            items-end justify-between
            gap-2 pt-2.5
          ">
          <div className="min-w-0">
            <div
              className={cn(
                `
                  text-xl font-bold
                  leading-none
                `,
                styles.metric
              )}>
              {metric}
            </div>

            <p
              className="
                mt-1 truncate
                text-[11px]
                text-muted-foreground
              ">
              {supportingLabel}
            </p>
          </div>

          <span
            className="
              shrink-0 text-[9px]
              font-semibold
              text-muted-foreground
              transition
              group-hover:text-foreground
              sm:text-[10px]
            ">
            {actionLabel}
          </span>
        </footer>
      </div>
    </Link>
  );
}
