'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowRight,
  BadgeCheck
} from 'lucide-react';

import SignOutButton from '@/components/auth/SignOutButton';
import {
  WorkspaceSwitcher
} from '@/features/workspace';

import {
  cn
} from '@/lib/utils';

import type {
  CommercePriorityExperience,
  DashboardSectionCopy
} from '../contracts/customerDashboardTypes';

import {
  useCustomerDashboard
} from '../providers/CustomerDashboardProvider';

const heroToneStyles = {
  navy: {
    shell:
      'bg-slate-950 text-white',

    glow:
      'bg-sky-400/20',

    badge:
      'border-sky-300/20 bg-sky-300/10 text-sky-100',

    action:
      'bg-white text-slate-950 hover:bg-white/90'
  },

  wine: {
    shell:
      'bg-gradient-to-br from-rose-950 via-slate-950 to-slate-950 text-white',

    glow:
      'bg-rose-400/20',

    badge:
      'border-rose-300/20 bg-rose-300/10 text-rose-100',

    action:
      'bg-white text-rose-950 hover:bg-white/90'
  },

  gold: {
    shell:
      'bg-gradient-to-br from-amber-950 via-slate-950 to-slate-950 text-white',

    glow:
      'bg-amber-300/20',

    badge:
      'border-amber-200/20 bg-amber-200/10 text-amber-100',

    action:
      'bg-amber-100 text-amber-950 hover:bg-amber-50'
  },

  emerald: {
    shell:
      'bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-950 text-white',

    glow:
      'bg-emerald-300/20',

    badge:
      'border-emerald-200/20 bg-emerald-200/10 text-emerald-100',

    action:
      'bg-emerald-100 text-emerald-950 hover:bg-emerald-50'
  },

  violet: {
    shell:
      'bg-gradient-to-br from-violet-950 via-slate-950 to-slate-950 text-white',

    glow:
      'bg-violet-300/20',

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

function HeroStatus({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex h-10 min-w-0 items-center rounded-xl border border-white/10 bg-white/[0.055] px-3.5 backdrop-blur">
      <span className="shrink-0 text-xs text-white/50">
        {label}
      </span>

      <span className="ml-2 max-w-28 truncate text-xs font-semibold capitalize text-white">
        {value}
      </span>
    </div>
  );
}

type DashboardHeroProps = {
  priority: CommercePriorityExperience;
  section: DashboardSectionCopy;
};

export function DashboardHero({
  priority,
  section
}: DashboardHeroProps) {
  const { dashboard } =
    useCustomerDashboard();

  const {
    data,
    greeting
  } = dashboard;

  const tone =
    heroToneStyles[
      priority.tone
    ];

  return (
    <article
      className={cn(
        'group relative isolate overflow-visible rounded-2xl border border-white/10 shadow-sm',
        tone.shell
      )}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        {priority.image ? (
          <Image
            src={priority.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25 transition duration-700 group-hover:scale-[1.015]"
          />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/15" />

        <div
          className={cn(
            'absolute -right-20 -top-24 size-72 rounded-full blur-3xl',
            tone.glow
          )}
        />

        <div className="absolute -bottom-24 left-1/3 size-64 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <header className="grid gap-4 border-b border-white/10 bg-white/[0.025] p-4 backdrop-blur-md sm:p-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-black/35 text-base font-bold text-white shadow-sm sm:size-14">
              {data.identity.image ? (
                <Image
                  src={data.identity.image}
                  alt={data.identity.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                data.identity.name
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-white/70">
                  Customer dashboard
                </p>

                {data.identity.emailVerified ? (
                  <BadgeCheck className="size-4 shrink-0 text-emerald-400" />
                ) : null}
              </div>

              <h1 className="mt-0.5 truncate text-2xl font-bold leading-tight sm:text-3xl">
                {greeting},{' '}
                {data.identity.firstName}
              </h1>

              <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-5 text-white/60">
                Track orders, continue shopping and return to the products that matter.
              </p>
            </div>
          </div>

          <div className="relative z-40 grid min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
            <div
              className="
                relative z-50
                col-span-2
                min-w-0
                sm:col-span-1

                [&>button]:h-10
                [&>button]:w-full
                [&>button]:max-w-full
                [&>button]:rounded-xl
                [&>button]:border
                [&>button]:border-white/10
                [&>button]:bg-white/[0.055]
                [&>button]:px-3.5
                [&>button]:text-xs
                [&>button]:font-semibold
                [&>button]:text-white
                [&>button]:shadow-none
                sm:[&>button]:w-auto
              ">
              <WorkspaceSwitcher />
            </div>

            <HeroStatus
              label="Profile"
              value={data.profile.persona.replaceAll(
                '-',
                ' '
              )}
            />

            <HeroStatus
              label="Membership"
              value={data.identity.tier}
            />

            <div
              className="
                col-span-2
                sm:col-span-1

                [&_button]:h-10
                [&_button]:w-full
                [&_button]:rounded-xl
                [&_button]:border
                [&_button]:border-white/10
                [&_button]:bg-white/[0.055]
                [&_button]:px-4
                [&_button]:text-xs
                [&_button]:font-semibold
                [&_button]:text-white
                [&_button]:shadow-none
                sm:[&_button]:w-auto
              ">
              <SignOutButton />
            </div>
          </div>
        </header>

        <div className="grid gap-8 p-5 sm:p-6 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.4fr)] xl:items-end xl:gap-12">
          <div className="max-w-xl">
            <p className="text-xs font-semibold text-white/50">
              {section.eyebrow}
            </p>

            <h2 className="mt-1.5 text-xl font-bold leading-tight sm:text-2xl">
              {section.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/60">
              {section.description}
            </p>
          </div>

          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white/65">
                {priority.eyebrow}
              </p>

              <span
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold',
                  tone.badge
                )}>
                {priority.statusLabel ??
                  'Current priority'}
              </span>
            </div>

            <h3 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl xl:text-5xl">
              {priority.title}
            </h3>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              {priority.description}
            </p>

            {priority.progress != null ? (
              <div className="mt-5 max-w-lg">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>
                    Progress
                  </span>

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
                  href={
                    priority.secondaryHref
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white transition hover:bg-white/10">
                  {
                    priority.secondaryActionLabel
                  }
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
