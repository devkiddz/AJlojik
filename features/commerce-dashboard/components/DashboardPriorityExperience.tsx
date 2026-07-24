'use client';

import Image from 'next/image';
import Link from 'next/link';

import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';

import type {
  CommercePriorityExperience
} from '../contracts/commerceDashboardTypes';

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
    badge: 'border-rose-300/20 bg-rose-300/10 text-rose-100',
    action: 'bg-white text-rose-950 hover:bg-white/90'
  },
  gold: {
    shell:
      'bg-gradient-to-br from-amber-950 via-slate-950 to-slate-950 text-white',
    glow: 'bg-amber-300/20',
    badge: 'border-amber-200/20 bg-amber-200/10 text-amber-100',
    action: 'bg-amber-100 text-amber-950 hover:bg-amber-50'
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
    badge: 'border-violet-200/20 bg-violet-200/10 text-violet-100',
    action: 'bg-violet-100 text-violet-950 hover:bg-violet-50'
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

type DashboardPriorityExperienceProps = {
  priority: CommercePriorityExperience;
};

export function DashboardPriorityExperience({
  priority
}: DashboardPriorityExperienceProps) {
  const tone = priorityToneStyles[priority.tone];

  return (
    <article
      className={cn(
        'group relative h-full min-h-72 overflow-hidden rounded-2xl border border-white/10 shadow-sm',
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

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />

      <div
        className={cn(
          'absolute -right-16 -top-16 size-48 rounded-full blur-3xl',
          tone.glow
        )}
      />

      <div className="relative flex min-h-72 flex-col justify-between p-4 lg:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={cn(
              'rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em]',
              tone.badge
            )}>
            {priority.statusLabel ?? 'YOUR MOMENT'}
          </span>

          <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Priority experience
          </span>
        </div>

        <div className="max-w-3xl">
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/55">
            {priority.eyebrow}
          </p>

          <h2 className="mt-1.5 max-w-2xl text-2xl font-black tracking-tight sm:text-3xl xl:text-4xl">
            {priority.title}
          </h2>

          <p className="mt-2.5 max-w-2xl text-xs leading-5 text-white/65 sm:text-sm">
            {priority.description}
          </p>

          {priority.progress != null ? (
            <div className="mt-3.5 max-w-lg">
              <div className="flex items-center justify-between text-[8px] font-semibold uppercase tracking-wider text-white/50">
                <span>Journey progress</span>
                <span>{priority.progress}%</span>
              </div>

              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: `${priority.progress}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={priority.href}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[11px] font-black transition hover:-translate-y-0.5',
                tone.action
              )}>
              {priority.actionLabel}
              <ArrowRight className="size-3.5" />
            </Link>

            {priority.secondaryHref &&
            priority.secondaryActionLabel ? (
              <Link
                href={priority.secondaryHref}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 text-[11px] font-bold text-white transition hover:bg-white/10">
                {priority.secondaryActionLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
