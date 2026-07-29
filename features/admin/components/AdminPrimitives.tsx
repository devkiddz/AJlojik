import Link from 'next/link';
import { ArrowLeft, ArrowRight, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export function AdminPage({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn('min-h-dvh px-3 py-5 sm:px-6 lg:px-8', className)}>{children}</main>;
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = 'Admin overview',
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-xl sm:p-7">
      {backHref ? (
        <Link href={backHref} className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="size-4" /> {backLabel}
        </Link>
      ) : null}
      <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', backHref && 'mt-6')}>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}

export function AdminMetric({
  icon: Icon,
  label,
  value,
  detail
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  detail?: string;
}) {
  return (
    <article className="rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm">
      <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <p className="mt-5 text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
      {detail ? <p className="mt-2 text-[9px] leading-4 text-muted-foreground">{detail}</p> : null}
    </article>
  );
}

export function AdminPanel({
  title,
  description,
  children,
  className
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-[2rem] border border-border/60 bg-card/75 p-5 shadow-lg sm:p-6', className)}>
      <h2 className="text-lg font-black">{title}</h2>
      {description ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function AdminEmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="grid min-h-52 place-items-center rounded-3xl border border-dashed border-border/70 bg-background/40 p-8 text-center">
      <div>
        <Icon className="mx-auto size-7 text-muted-foreground" />
        <p className="mt-3 text-sm font-bold">{title}</p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function AdminGridLink({
  href,
  icon: Icon,
  title,
  description,
  meta
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  meta?: string;
}) {
  return (
    <Link href={href} className="group rounded-3xl border border-border/60 bg-background/65 p-4 transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-4" /></span>
        <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1" />
      </div>
      <h3 className="mt-4 text-sm font-black">{title}</h3>
      <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{description}</p>
      {meta ? <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-primary/70">{meta}</p> : null}
    </Link>
  );
}

export const adminFieldClass = 'min-h-11 w-full rounded-2xl border border-border/70 bg-background/75 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10';
