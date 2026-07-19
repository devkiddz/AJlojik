'use client';

import * as React from 'react';

import { useRouter } from 'next/navigation';

import {
  CreditCard,
  Heart,
  LogIn,
  LogOut,
  Palette,
  Settings,
  ShoppingBag,
  ShoppingCart,
  User
} from 'lucide-react';
import { useCart } from '@/features/cart';
import BaseTriggerButton from '@/components/shared/BaseTriggerButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';

import ThemeController from './ThemeController';

import { useIdentity } from '@/providers/IdentityProvider';
import { WorkspaceSwitcher } from '@/features/workspace';

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string | number;
};

function MenuItem({ icon, label, onClick, disabled, badge }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        disabled
          ? 'flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm opacity-40'
          : 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-muted'
      }>
      <span className="text-muted-foreground">{icon}</span>

      <span className="flex-1">{label}</span>

      {badge !== undefined ? (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function getInitials(name?: string) {
  if (!name) return 'AJ';

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

function UserTrigger() {
  const { user, isAuthenticated, isPending } = useIdentity();

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <div className="size-9 animate-pulse rounded-full bg-muted" />

        <div className="hidden space-y-1 md:block">
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  const firstName = user?.name.split(' ')[0] ?? 'Guest';

  return (
    <div className="flex items-center gap-2 rounded-full border border-transparent px-2 py-1 transition hover:border-border hover:bg-background/60">
      <Avatar className="size-8 md:size-10">
        <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? 'Guest'} />

        <AvatarFallback>{isAuthenticated ? getInitials(user?.name) : 'G'}</AvatarFallback>
      </Avatar>

      <div className="hidden min-w-0 flex-col items-start md:flex">
        <span className="max-w-28 truncate text-sm font-semibold">
          {isAuthenticated ? `Hi, ${firstName}` : 'Guest'}
        </span>

        <span className="max-w-32 truncate text-[11px] capitalize text-muted-foreground">
          {isAuthenticated ? `${user?.tier ?? 'member'} member` : 'Explore AJ Logik'}
        </span>
      </div>
    </div>
  );
}

export default function UserActionComponent() {
  const router = useRouter();

  const { user, isAuthenticated, signOut } = useIdentity();

  const { totalQuantity, loading: cartLoading } = useCart();

  const [open, setOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  const navigateTo = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleSignOut = async () => {
    setSigningOut(true);

    try {
      setOpen(false);
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <BaseTriggerButton
            type="button"
            title="Open account menu"
            aria-label={isAuthenticated ? 'Open account menu' : 'Open guest menu'}
            className="rounded-full"
          />
        }>
        <UserTrigger />
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[340px] flex-col p-0 sm:max-w-[380px]">
        <SheetHeader className="border-b px-5 py-5 text-left">
          <SheetTitle className="text-base">
            {isAuthenticated ? 'My AJ Logik' : 'Guest Experience'}
          </SheetTitle>

          <SheetDescription>
            {isAuthenticated
              ? 'Manage your account, shopping activity and preferences.'
              : 'Sign in to save products and continue your shopping journey.'}
          </SheetDescription>

          {isAuthenticated && user ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 p-3">
              <Avatar className="size-11">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />

                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user.name}</p>

                <p className="truncate text-xs text-muted-foreground">{user.email}</p>

                <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold capitalize text-primary">
                  {user.tier} member
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">You are browsing as a guest.</p>

              <button
                type="button"
                onClick={() => navigateTo('/sign-in')}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <LogIn className="size-4" />
                Sign in
              </button>
            </div>
          )}
          <div className="mt-3">
            <WorkspaceSwitcher variant="account-sheet" />
          </div>
        </SheetHeader>

        <div className="space-y-1 px-3 py-4">
          <MenuItem
            icon={<User className="size-4" />}
            label="Profile"
            disabled={!isAuthenticated}
            onClick={() => navigateTo('/account')}
          />

          <MenuItem
            icon={<ShoppingCart className="size-4" />}
            label="Cart"
            badge={cartLoading ? '…' : totalQuantity > 99 ? '99+' : totalQuantity}
            onClick={() => navigateTo('/cart')}
          />

          <MenuItem
            icon={<Heart className="size-4" />}
            label="Wishlist"
            badge={0}
            disabled={!isAuthenticated}
            onClick={() => navigateTo('/wishlist')}
          />

          <MenuItem
            icon={<ShoppingBag className="size-4" />}
            label="Orders"
            disabled={!isAuthenticated}
            onClick={() => navigateTo('/orders')}
          />

          <MenuItem
            icon={<CreditCard className="size-4" />}
            label="Payments"
            disabled={!isAuthenticated}
            onClick={() => navigateTo('/payments')}
          />

          <MenuItem
            icon={<Settings className="size-4" />}
            label="Account settings"
            disabled={!isAuthenticated}
            onClick={() => navigateTo('/settings')}
          />
        </div>

        <div className="border-t px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Palette className="size-4" />
              Theme
            </div>

            <ThemeController />
          </div>
        </div>

        <div className="mt-auto border-t px-5 py-4">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/15 disabled:opacity-50">
              <LogOut className="size-4" />

              {signingOut ? 'Signing out...' : 'Sign out'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigateTo('/sign-up')}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
              Create account
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
