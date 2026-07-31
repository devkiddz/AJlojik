import Link from 'next/link';

import { ArrowLeft, PackageX } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <main className="grid min-h-[75dvh] place-items-center bg-background px-5 py-10">
      <section className="w-full max-w-lg rounded-[2rem] border border-border/60 bg-card p-7 text-center shadow-xl">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
          <PackageX className="size-6" />
        </span>
        <h1 className="mt-5 text-2xl font-black">Product unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This product may have been removed, disabled, or is not available in the live Store.
        </p>
        <Link
          href="/store"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-xs font-bold text-background"
        >
          <ArrowLeft className="size-4" />
          Return to Store
        </Link>
      </section>
    </main>
  );
}
