import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowRight
} from 'lucide-react';

import { cn } from '@/lib/utils';

import type {
  CommercePriorityExperience
} from '../contracts/customerDashboardTypes';

const priorityToneStyles = {
  navy: {
    shell: 'bg-slate-950 text-white',
    glow: 'bg-sky-400/20',
    badge: 'border-sky-300/20 bg-sky-300/10 text-sky-100',
    action: 'bg-white text-slate-950 hover:bg-white/90'
  },

  wine: {
    shell:
      'bg-gradient-to-br from-rose-950 via-slate-950 to-slate-950 text-white',
    glow: 'bg-rose-400/20',
    badge:
      'border-rose-300/20 bg-rose-300/10 text-rose-100',
    action:
      'bg-white text-rose-950 hover:bg-white/90'
  },

  gold: {
    shell:
      'bg-gradient-to-br from-amber-950 via-slate-950 to-slate-950 text-white',
    glow: 'bg-amber-300/20',
    badge:
      'border-amber-200/20 bg-amber-200/10 text-amber-100',
    action:
      'bg-amber-100 text-amber-950 hover:bg-amber-50'
  },

  emerald: {
    shell:
      'bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-950 text-white',
    glow: 'bg-emerald-300/20',
    badge:
      'border-emerald-200/20 bg-emerald-200/10 text-emerald-100',
    action:
      'bg-emerald-100 text-emerald-950 hover:bg-emerald-50'
  },

  violet: {
    shell:
      'bg-gradient-to-br from-violet-950 via-slate-950 to-slate-950 text-white',
    glow: 'bg-violet-300/20',
    badge:
      'border-violet-200/20 bg-violet-200/10 text-violet-100',
    action:
      'bg-violet-100 text-violet-950 hover:bg-violet-50'
  }
} satisfies Record<
  CommercePriorityExperience['tone'],
  {
    shell: string;
    glow: string;
    badge: string;
    action: string;
  }
>;

type DashboardPriorityProps = {
  priority: CommercePriorityExperience;
};

export function DashboardPriority({
  priority
}: DashboardPriorityProps) {
  const tone =
    priorityToneStyles[priority.tone];

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/10 shadow-sm',
        tone.shell
      )}>
      {priority.image ? (
        <Image
          src={priority.image}
          alt=""
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 66vw"
          className="object-cover opacity-30 transition duration-700 group-hover:scale-[1.02]"
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />

      <div
        className={cn(
          'absolute -right-16 -top-16 size-52 rounded-full blur-3xl',
          tone.glow
        )}
      />

      <div className="relative flex flex-col gap-10 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold',
              tone.badge
            )}>
            {priority.statusLabel ??
              'Current priority'}
          </span>

          <span className="text-xs font-medium text-white/55">
            Priority
          </span>
        </div>

        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-white/65">
            {priority.eyebrow}
          </p>

          <h2 className="mt-2 max-w-2xl text-2xl font-bold leading-tight sm:text-3xl xl:text-4xl">
            {priority.title}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            {priority.description}
          </p>

          {priority.progress != null ? (
            <div className="mt-5 max-w-lg">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Progress</span>
                <span>
                  {priority.progress}%
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{
                    width: `${priority.progress}%`
                  }}
                />
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              href={priority.href}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition hover:-translate-y-0.5',
                tone.action
              )}>
              {priority.actionLabel}
              <ArrowRight className="size-4" />
            </Link>

            {priority.secondaryHref &&
            priority.secondaryActionLabel ? (
              <Link
                href={priority.secondaryHref}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white transition hover:bg-white/10">
                {
                  priority.secondaryActionLabel
                }
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
