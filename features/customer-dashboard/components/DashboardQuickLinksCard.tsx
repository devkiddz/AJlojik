import Link from 'next/link';

import {
  ChevronRight,
  ClipboardList,
  Heart,
  ReceiptText,
  Settings2,
  ShoppingBag,
  Store,
  Zap
} from 'lucide-react';

import type {
  DashboardQuickAction,
  DashboardQuickActionIcon
} from '../contracts/customerDashboardTypes';

function QuickIcon({
  icon
}: {
  icon: DashboardQuickActionIcon;
}) {
  switch (icon) {
    case 'store':
      return <Store />;

    case 'cart':
      return <ShoppingBag />;

    case 'orders':
      return <ReceiptText />;

    case 'wishlist':
      return <Heart />;

    case 'list':
      return <ClipboardList />;

    case 'settings':
      return <Settings2 />;
  }
}

type DashboardQuickLinksCardProps = {
  items: DashboardQuickAction[];
};

export function DashboardQuickLinksCard({
  items
}: DashboardQuickLinksCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm sm:p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-primary">
            Shortcuts
          </p>

          <h3 className="mt-1 text-lg font-bold">
            Move quickly
          </h3>

          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            The places you use most, without searching.
          </p>
        </div>

        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
          <Zap className="size-4.5" />
        </span>
      </header>

      <div className="mt-4 grid gap-2">
        {items.slice(0, 5).map(
          item => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex min-w-0 items-center gap-3 rounded-xl border border-border/55 bg-background/70 p-2.5 transition hover:border-primary/25 hover:bg-muted/45">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-4">
                <QuickIcon
                  icon={item.icon}
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {item.label}
                </span>

                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {item.description}
                </span>
              </span>

              {item.badge ? (
                <span className="grid min-w-6 shrink-0 place-items-center rounded-lg bg-foreground px-1.5 py-1 text-xs font-semibold text-background">
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
              )}
            </Link>
          )
        )}
      </div>
    </article>
  );
}
