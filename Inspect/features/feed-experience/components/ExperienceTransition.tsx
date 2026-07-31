'use client';

import { LoaderCircle, Sparkles } from 'lucide-react';

type ExperienceTransitionProps = {
  label?: string;
};

export function ExperienceTransition({ label = 'Preparing your experience' }: ExperienceTransitionProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="
        absolute inset-0 z-40
        grid place-items-center
        bg-background/75
        backdrop-blur-sm
      ">
      <div
        className="
          flex items-center gap-3
          rounded-full
          border border-primary/10
          bg-card/95
          px-5 py-3
          shadow-xl
        ">
        <span className="relative grid size-9 place-items-center rounded-full bg-primary/10">
          <Sparkles className="size-4 text-primary" />

          <LoaderCircle className="absolute size-9 animate-spin text-primary/30" />
        </span>

        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>

          <p className="text-xs text-muted-foreground">Resolving what matters next</p>
        </div>
      </div>
    </div>
  );
}
