'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { FeedActions, ShoppingJourneyModuleDefinition } from '../contracts';

type ShoppingJourneyModuleProps = {
  module: ShoppingJourneyModuleDefinition;
  actions: FeedActions;
};

const toneStyles = {
  default: 'border-border bg-card/70',

  returning: 'border-violet-500/15 bg-violet-500/[0.04]',

  member: 'border-primary/15 bg-primary/[0.04]',

  premium: 'border-amber-400/20 bg-gradient-to-br from-amber-500/[0.08] via-card/70 to-card/60'
};

export function ShoppingJourneyModule({ module, actions }: ShoppingJourneyModuleProps) {
  const { title, subtitle, items, tone } = module.data;

  if (!items.length) return null;

  return (
    <section className={cn('overflow-hidden rounded-3xl border p-4 md:p-5', toneStyles[tone])}>
      <header className="mb-4">
        <h2 className="text-base font-semibold text-foreground md:text-lg">{title}</h2>

        {subtitle ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground md:text-sm">{subtitle}</p>
        ) : null}
      </header>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => actions.openExperience(item.target)}
            className="group flex w-72 shrink-0 items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-3 text-left transition hover:-translate-y-0.5 hover:border-primary/25 hover:bg-background">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="64px"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{item.title}</h3>

                {item.badge ? (
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {item.badge}
                  </span>
                ) : null}
              </div>

              <p className="mt-1 line-clamp-2 text-xs leading-4 text-muted-foreground">{item.description}</p>

              <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-primary">
                Open experience
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
