import Link from 'next/link';

import {
  ChevronRight,
  ClipboardList,
  Heart,
  ReceiptText,
  Settings2,
  ShoppingBag,
  Store
} from 'lucide-react';

import type {
  DashboardQuickAction,
  DashboardQuickActionIcon
} from '../contracts/customerDashboardTypes';

function QuickActionIcon({
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

type DashboardQuickActionProps = {
  item: DashboardQuickAction;
};

export function DashboardQuickActionCard({
  item
}: DashboardQuickActionProps) {
  return (
    <Link
      href={item.href}
      className="group flex min-w-0 items-center gap-3 rounded-xl border border-border/60 bg-background/70 p-3 transition hover:border-primary/25 hover:bg-muted/50">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-4">
        <QuickActionIcon
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
  );
}
