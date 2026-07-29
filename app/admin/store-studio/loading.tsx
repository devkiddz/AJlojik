import { LoaderCircle } from 'lucide-react';

export default function StoreStudioLoading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="text-center">
        <LoaderCircle className="mx-auto size-8 animate-spin text-primary" />
        <p className="mt-4 text-sm font-bold">Loading Store Studio…</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Resolving campaigns, assets, and Store destinations.
        </p>
      </div>
    </main>
  );
}
