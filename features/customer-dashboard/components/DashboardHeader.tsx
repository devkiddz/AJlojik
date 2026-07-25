'use client';

import Image from 'next/image';

import { BadgeCheck } from 'lucide-react';

import SignOutButton from '@/components/auth/SignOutButton';
import { WorkspaceSwitcher } from '@/features/workspace';

import { useCustomerDashboard } from '../providers/CustomerDashboardProvider';

function DashboardStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-10 min-w-0 items-center rounded-xl border border-border/60 bg-background/70 px-3.5">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>

      <span className="ml-2 max-w-28 truncate text-xs font-semibold capitalize text-foreground">{value}</span>
    </div>
  );
}

export function DashboardHeader() {
  const { dashboard } = useCustomerDashboard();

  const { data, greeting } = dashboard;

  return (
    <header className="relative z-30 isolate overflow-visible rounded-2xl border border-border/60 bg-card/85 p-4 shadow-sm backdrop-blur-xl sm:p-5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -right-20 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-40 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-border/60 bg-slate-950 text-base font-bold text-white shadow-sm sm:size-14">
            {data.identity.image ? (
              <Image
                src={data.identity.image}
                alt={data.identity.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              data.identity.name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-primary">Customer dashboard</p>

              {data.identity.emailVerified ? (
                <BadgeCheck className="size-4 shrink-0 text-emerald-500" />
              ) : null}
            </div>

            <h1 className="mt-0.5 truncate text-2xl font-bold leading-tight sm:text-3xl">
              {greeting}, {data.identity.firstName}
            </h1>

            <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-5 text-muted-foreground">
              Track orders, continue shopping and return to the products that matter.
            </p>
          </div>
        </div>

        <div className="relative z-40 grid min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
          <div
            className="
                relative z-50
                col-span-2
                min-w-0
                sm:col-span-1

                [&>button]:h-10
                [&>button]:w-full
                [&>button]:max-w-full
                [&>button]:rounded-xl
                [&>button]:border
                [&>button]:border-border/60
                [&>button]:bg-background/70
                [&>button]:px-3.5
                [&>button]:text-xs
                [&>button]:font-semibold
                [&>button]:shadow-none
                sm:[&>button]:w-auto
            ">
            <WorkspaceSwitcher />
          </div>

          <DashboardStatus label="Profile" value={data.profile.persona.replaceAll('-', ' ')} />

          <DashboardStatus label="Membership" value={data.identity.tier} />

          <div
            className="
              col-span-2
              sm:col-span-1

              [&_button]:h-10
              [&_button]:w-full
              [&_button]:rounded-xl
              [&_button]:border
              [&_button]:border-border/60
              [&_button]:bg-background/70
              [&_button]:px-4
              [&_button]:text-xs
              [&_button]:font-semibold
              [&_button]:shadow-none
              sm:[&_button]:w-auto
            ">
            <SignOutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
