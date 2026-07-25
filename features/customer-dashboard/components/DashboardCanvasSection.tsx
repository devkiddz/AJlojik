import type {
  ReactNode
} from 'react';

import Link from 'next/link';

import {
  ArrowRight,
  MoveHorizontal
} from 'lucide-react';

type DashboardCanvasSectionProps = {
  eyebrow: string;
  title: string;
  description: string;

  href?: string;
  actionLabel?: string;

  children: ReactNode;
};

export function DashboardCanvasSection({
  eyebrow,
  title,
  description,
  href,
  actionLabel,
  children
}: DashboardCanvasSectionProps) {
  return (
    <section className="space-y-3">
      <header className="flex items-end justify-between gap-4 px-0.5">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-primary">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-xl font-bold leading-tight sm:text-2xl">
            {title}
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground max-lg:flex">
            <MoveHorizontal className="size-4" />
            Slide
          </span>

          {href && actionLabel ? (
            <Link
              href={href}
              className="hidden h-9 items-center gap-2 rounded-xl border border-border/60 bg-background/75 px-3.5 text-xs font-semibold transition hover:border-primary/25 hover:bg-muted sm:inline-flex">
              {actionLabel}
              <ArrowRight className="size-3.5" />
            </Link>
          ) : null}
        </div>
      </header>

      {children}
    </section>
  );
}
