import { LoaderCircle } from 'lucide-react';

export default function ProductLoading() {
  return (
    <main className="grid min-h-[70dvh] place-items-center bg-background px-6">
      <div className="text-center">
        <LoaderCircle className="mx-auto size-8 animate-spin text-primary" />
        <p className="mt-4 text-sm font-bold">Loading product experience…</p>
      </div>
    </main>
  );
}
