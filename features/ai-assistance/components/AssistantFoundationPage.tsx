import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  LockKeyhole,
  Sparkles
} from 'lucide-react';

import { getAssistantProfile } from '../assistantProfiles';
import type { AIAssistantAudience } from '../contracts';

type AssistantFoundationPageProps = {
  audience: AIAssistantAudience;
  contextLabel: string;
};

const destinations: Record<
  AIAssistantAudience,
  Array<{ href: string; label: string }>
> = {
  admin: [
    { href: '/admin/products', label: 'Open Product Studio' },
    { href: '/admin/store-studio', label: 'Open Store Studio' },
    { href: '/admin/approvals', label: 'Review approvals' }
  ],
  vendor: [
    { href: '/vendor/products', label: 'Open Product Studio' },
    { href: '/vendor/stories', label: 'Open Stories' },
    { href: '/vendor/submissions', label: 'Review submissions' }
  ],
  customer: [
    { href: '/store', label: 'Explore the Store' },
    { href: '/wishlist', label: 'Open Wishlist' },
    { href: '/account/lists', label: 'Open Shopping Lists' }
  ]
};

export function AssistantFoundationPage({
  audience,
  contextLabel
}: AssistantFoundationPageProps) {
  const profile = getAssistantProfile(audience);

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_34%)] px-3 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[96rem] space-y-5">
        <header className="overflow-hidden rounded-[2rem] border border-border/60 bg-slate-950 p-5 text-white shadow-xl sm:p-8">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-violet-200">
                  <BrainCircuit className="size-5" />
                </span>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">
                  {profile.eyebrow}
                </p>
              </div>
              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
                {profile.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
                {profile.description}
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-bold uppercase text-white/80">
              <LockKeyhole className="size-4" /> Draft-only authority
            </span>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
          <article className="rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Bot className="size-4" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                  Prepared responsibilities
                </p>
                <h2 className="mt-1 text-xl font-black">What AJ will help with</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {profile.capabilities.map(capability => (
                <section
                  key={capability.id}
                  className="rounded-3xl border border-border/60 bg-background/60 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <h3 className="text-sm font-black">{capability.title}</h3>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {capability.description}
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {capability.examples.map(example => (
                      <p
                        key={example}
                        className="flex items-start gap-2 text-[10px] leading-4 text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-primary" />
                        {example}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>

          <div className="space-y-5">
            <article className="rounded-[2rem] border border-primary/20 bg-primary/5 p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                Grounding context
              </p>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {profile.contextDescription}
              </p>
              <div className="mt-4 rounded-2xl border border-primary/15 bg-background/70 p-3">
                <p className="text-[9px] font-bold uppercase text-muted-foreground">
                  Current surface
                </p>
                <p className="mt-1 text-xs font-black">{contextLabel}</p>
              </div>
            </article>

            <article className="rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="size-4 text-primary" />
                <h2 className="text-sm font-black">Authority boundary</h2>
              </div>
              <div className="mt-4 space-y-3">
                {profile.authorityRules.map(rule => (
                  <p
                    key={rule}
                    className="flex items-start gap-2 text-[10px] leading-5 text-muted-foreground">
                    <LockKeyhole className="mt-1 size-3 shrink-0 text-primary" />
                    {rule}
                  </p>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.45fr)]">
          <article className="rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              Implementation sequence
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {profile.preparationSteps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-2xl border border-border/60 bg-background/60 p-3">
                  <span className="grid size-7 place-items-center rounded-xl bg-primary/10 text-[10px] font-black text-primary">
                    {index + 1}
                  </span>
                  <p className="mt-3 text-[10px] font-bold leading-4">{step}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              Continue working
            </p>
            <div className="mt-4 grid gap-2">
              {destinations[audience].map(destination => (
                <Link
                  key={destination.href}
                  href={destination.href}
                  className="group flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-xs font-bold transition hover:border-primary/30 hover:bg-muted/60">
                  {destination.label}
                  <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
