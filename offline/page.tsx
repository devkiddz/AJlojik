import Link from 'next/link';
import { RefreshCcw, WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <main className="grid min-h-[70dvh] place-items-center px-[var(--app-page-gutter)] py-12">
      <section className="w-full max-w-lg rounded-[2rem] border border-border/60 bg-card/85 p-7 text-center shadow-xl sm:p-9">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <WifiOff className="size-6" />
        </span>
        <h1 className="mt-5 text-2xl font-black tracking-tight">You are currently offline</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          AJ Logik could not reach the network. Previously opened pages may still be available from your device.
        </p>
        <Link
          href="/store"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground">
          <RefreshCcw className="size-4" />
          Try the Store again
        </Link>
      </section>
    </main>
  );
}
