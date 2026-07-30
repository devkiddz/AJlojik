import {
  RouteOff
} from 'lucide-react';

export default function CustomerJourneyNotFound() {
  return (
    <main
      className="
        grid min-h-[72dvh]
        place-items-center
        bg-muted/20 px-6
        text-center
      ">
      <section
        className="
          w-full max-w-lg
          rounded-[var(--app-card-radius)]
          border border-border/60
          bg-card p-6
          shadow-sm
        ">
        <span
          className="
            mx-auto grid size-12
            place-items-center
            rounded-2xl
            bg-primary/10
            text-primary
          ">
          <RouteOff className="size-5" />
        </span>

        <h1 className="mt-4 text-xl font-black">
          Journey unavailable
        </h1>

        <p
          className="
            mt-2 text-sm
            leading-6
            text-muted-foreground
          ">
          This journey slug is not part of the
          current customer experience. Use the
          global Experience History control or
          another main navigation surface.
        </p>
      </section>
    </main>
  );
}
