import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowRight
} from 'lucide-react';

import { cn } from '@/lib/utils';

import type {
  CommerceJourneyItem
} from '../contracts/customerDashboardTypes';

const journeyToneStyles = {
  navy:
    'from-sky-500/20 via-slate-950/5 to-transparent',

  wine:
    'from-rose-500/20 via-slate-950/5 to-transparent',

  gold:
    'from-amber-400/25 via-slate-950/5 to-transparent',

  emerald:
    'from-emerald-400/20 via-slate-950/5 to-transparent',

  violet:
    'from-violet-400/20 via-slate-950/5 to-transparent'
} satisfies Record<
  CommerceJourneyItem['tone'],
  string
>;

type DashboardJourneyCardProps = {
  journey: CommerceJourneyItem;
};

export function DashboardJourneyCard({
  journey
}: DashboardJourneyCardProps) {
  return (
    <Link
      href={journey.href}
      className="group relative w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      {journey.image ? (
        <Image
          src={journey.image}
          alt=""
          fill
          sizes="320px"
          className="object-cover opacity-45 transition duration-700 group-hover:scale-105"
        />
      ) : null}

      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br',
          journeyToneStyles[
            journey.tone
          ]
        )}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/25" />

      <div className="relative flex flex-col gap-12 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold backdrop-blur">
            {journey.badge ??
              'Continue'}
          </span>

          <span className="grid size-9 place-items-center rounded-xl bg-foreground text-background transition group-hover:translate-x-0.5">
            <ArrowRight className="size-4" />
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold text-primary">
            {journey.eyebrow}
          </p>

          <h3 className="mt-1.5 text-lg font-bold leading-tight">
            {journey.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {journey.description}
          </p>

          <p className="mt-3 text-xs font-semibold text-foreground">
            {journey.actionLabel}
          </p>
        </div>
      </div>
    </Link>
  );
}
