import Link from 'next/link';

import { ArrowLeft, Store } from 'lucide-react';

export default function ShopsNotFound() {
  return (
    <main className="mx-auto grid min-h-[70dvh] w-full max-w-4xl place-items-center px-4 py-10 text-center">
      <div className="rounded-[2rem] border border-dashed border-border/70 bg-card/60 p-10">
        <Store className="mx-auto size-9 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Shop unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Marketplace storefronts are unavailable in the current Commerce Mode,
          or this merchant is no longer public.
        </p>
        <Link
          href="/store"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-xs font-bold text-background">
          <ArrowLeft className="size-3.5" />
          Return to Store
        </Link>
      </div>
    </main>
  );
}
