import { LoaderCircle, ShoppingBag } from 'lucide-react';

export default function StoreLoadingState({ label = 'Preparing your experience' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm sm:p-9">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
        <div className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ShoppingBag className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold">{label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Loading the latest store activity…</p>
          </div>
          <LoaderCircle className="ml-auto size-5 animate-spin text-primary" />
        </div>

        <div className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-3xl border border-border/50 bg-background/60 p-3">
              <div className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />
              <div className="mt-4 h-3 w-2/3 animate-pulse rounded-full bg-muted" />
              <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-muted/70" />
              <div className="mt-2 h-3 w-4/5 animate-pulse rounded-full bg-muted/70" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
