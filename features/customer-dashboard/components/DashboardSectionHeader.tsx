import Link from 'next/link';

import {
  ArrowRight,
  Sparkles
} from 'lucide-react';

type DashboardSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;

  helper?: string;

  href?: string;
  actionLabel?: string;
};

export function DashboardSectionHeader({
  eyebrow,
  title,
  description,
  helper,
  href,
  actionLabel
}: DashboardSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-primary">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-bold leading-tight sm:text-2xl">
          {title}
        </h2>

        <p className="mt-1 max-w-3xl text-sm leading-5 text-muted-foreground">
          {description}
        </p>

        {helper ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">
              {helper}
            </span>
          </p>
        ) : null}
      </div>

      {href && actionLabel ? (
        <Link
          href={href}
          className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-xl border border-border/60 bg-background/70 px-4 text-xs font-semibold transition hover:border-primary/30 hover:bg-muted sm:self-auto">
          {actionLabel}
          <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
