import type { ReactNode } from 'react';

type AuthCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function AuthCard({ eyebrow, title, description, children }: AuthCardProps) {
  return (
    <section className="w-full max-w-md rounded-3xl border border-border/70 bg-card/80 p-6 shadow-2xl backdrop-blur md:p-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/60">{eyebrow}</p>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">{title}</h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </header>

      {children}
    </section>
  );
}
