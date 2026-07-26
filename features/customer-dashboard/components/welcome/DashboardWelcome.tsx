'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowLeft,
  Crown,
  History,
  PanelRightOpen
} from 'lucide-react';

import { WorkspaceSwitcher } from '@/features/workspace';

import type {
  CommerceDashboardData
} from '../../contracts/customerDashboardTypes';

type DashboardWelcomeProps = {
  identity: CommerceDashboardData['identity'];
  membership: string;
  onOpenHub: () => void;
};

export function DashboardWelcome({
  identity,
  membership,
  onOpenHub
}: DashboardWelcomeProps) {
  const firstName =
    identity.firstName ||
    identity.name.split(' ')[0] ||
    'Customer';

  return (
    <section className="relative z-30 overflow-visible rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -right-20 -top-24 size-64 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 size-56 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-foreground text-base font-bold text-background shadow-sm sm:size-14">
            {identity.image ? (
              <Image
                src={identity.image}
                alt={identity.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              identity.name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground">
              Customer dashboard
            </p>
            <h1 className="mt-1 break-words text-2xl font-bold sm:text-3xl">
              Welcome, {firstName}
            </h1>
          </div>
        </div>

        <div className="relative z-50 grid min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
          <div className="relative z-50 col-span-2 min-w-0 sm:col-span-1 [&>button]:h-10 [&>button]:w-full [&>button]:max-w-full [&>button]:rounded-xl [&>button]:border [&>button]:border-border/60 [&>button]:bg-background [&>button]:px-3.5 [&>button]:text-xs [&>button]:font-semibold [&>button]:shadow-none sm:[&>button]:w-auto">
            <WorkspaceSwitcher />
          </div>

          <HeaderChip
            icon={<Crown />}
            label="Membership"
            value={membership}
          />

          <Link
            href="#activity-archive"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-3.5 text-xs font-semibold transition hover:border-primary/25 hover:bg-muted">
            <History className="size-4" />
            History
          </Link>

          <button
            type="button"
            onClick={onOpenHub}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-3.5 text-xs font-semibold transition hover:border-primary/25 hover:bg-muted xl:hidden">
            <PanelRightOpen className="size-4" />
            Hub
          </button>

          <Link
            href="/store"
            className="col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background transition hover:bg-foreground/90 sm:col-span-1">
            <ArrowLeft className="size-4" />
            Back to store
          </Link>
        </div>
      </div>
    </section>
  );
}

function HeaderChip({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex h-10 min-w-0 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-3.5">
      <span className="text-muted-foreground [&_svg]:size-4">
        {icon}
      </span>
      <span className="hidden text-xs text-muted-foreground sm:inline">
        {label}
      </span>
      <span className="break-words text-xs font-semibold capitalize">
        {value}
      </span>
    </div>
  );
}
