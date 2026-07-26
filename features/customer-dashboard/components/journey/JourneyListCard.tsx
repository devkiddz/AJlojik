import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';

export type JourneyTone =
  | 'slate'
  | 'violet'
  | 'amber'
  | 'rose'
  | 'emerald';

const styles = {
  slate: {
    shell:
      'border-slate-500/15 bg-gradient-to-br from-slate-500/10 via-card to-card',
    icon:
      'bg-slate-500/10 text-slate-700 dark:text-slate-300',
    label:
      'bg-slate-500/10 text-slate-700 dark:text-slate-300',
    accent: 'bg-slate-500'
  },
  violet: {
    shell:
      'border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-card to-card',
    icon:
      'bg-violet-500/10 text-violet-700 dark:text-violet-300',
    label:
      'bg-violet-500/10 text-violet-700 dark:text-violet-300',
    accent: 'bg-violet-500'
  },
  amber: {
    shell:
      'border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-card to-card',
    icon:
      'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    label:
      'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    accent: 'bg-amber-500'
  },
  rose: {
    shell:
      'border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-card to-card',
    icon:
      'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    label:
      'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    accent: 'bg-rose-500'
  },
  emerald: {
    shell:
      'border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-card',
    icon:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    label:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    accent: 'bg-emerald-500'
  }
} satisfies Record<
  JourneyTone,
  {
    shell: string;
    icon: string;
    label: string;
    accent: string;
  }
>;

type JourneyListCardProps = {
  id?: string;
  code: string;
  title: string;
  count: number;
  href: string;
  icon: ReactNode;
  tone: JourneyTone;
  children: ReactNode;
};

export function JourneyListCard({
  id,
  code,
  title,
  count,
  href,
  icon,
  tone,
  children
}: JourneyListCardProps) {
  const style = styles[tone];

  return (
    <article
      id={id}
      data-rail-item
      className={cn(
        'relative flex min-h-64 w-[82vw] max-w-72 shrink-0 snap-start flex-col overflow-hidden rounded-xl border p-3.5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg sm:w-72',
        style.shell
      )}>
      <span
        className={cn(
          'absolute inset-x-0 top-0 h-0.5',
          style.accent
        )}
      />

      <header className="flex items-start gap-3">
        <span
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-xl [&_svg]:size-4',
            style.icon
          )}>
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-sm font-bold leading-5">
            {title}
          </h3>
          <span
            className={cn(
              'mt-1 inline-flex rounded-md px-1.5 py-0.5 text-xs font-bold',
              style.label
            )}>
            {code}
          </span>
        </div>

        <span className="shrink-0 text-2xl font-bold">
          {count}
        </span>
      </header>

      <div className="mt-3 space-y-1.5">
        {children}
      </div>

      <Link
        href={href}
        className="mt-auto flex items-center justify-between border-t border-border/50 pt-3 text-xs font-semibold text-muted-foreground transition hover:text-foreground">
        View all
        <ArrowUpRight className="size-3.5" />
      </Link>
    </article>
  );
}
