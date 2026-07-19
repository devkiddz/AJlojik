import Link from 'next/link';

import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

import type { ReactNode } from 'react';

type ActionPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export default function ActionPageShell({ eyebrow, title, description, children }: ActionPageShellProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/store"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to store
      </Link>

      <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-border/60 bg-card p-6 shadow-xl sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="size-3.5" />
            {eyebrow}
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {description}
          </p>
        </div>

        {children ? <div className="relative mt-8">{children}</div> : null}

        <Link
          href="/store"
          className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90">
          Continue shopping
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
