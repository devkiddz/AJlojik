'use client';

import Link from 'next/link';

import { CircleAlert, RotateCcw } from 'lucide-react';

export default function StoreStudioError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-5 py-10">
      <section className="w-full max-w-xl rounded-[2rem] border border-destructive/20 bg-card p-6 text-center shadow-xl sm:p-8">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive">
          <CircleAlert className="size-6" />
        </span>

        <h1 className="mt-5 text-2xl font-black">Store Studio needs attention</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {error.message || 'The campaign operation could not be completed.'}
        </p>

        {error.digest ? (
          <p className="mt-3 text-[10px] text-muted-foreground">Reference: {error.digest}</p>
        ) : null}

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-xs font-bold text-background"
          >
            <RotateCcw className="size-4" />
            Try again
          </button>

          <Link
            href="/admin"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border/70 px-5 text-xs font-bold"
          >
            Return to Admin
          </Link>
        </div>
      </section>
    </main>
  );
}
