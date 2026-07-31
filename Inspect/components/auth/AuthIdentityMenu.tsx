'use client';

import Link from 'next/link';
import { LogIn, LogOut, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authClient } from '@/lib/auth-client';

export default function AuthIdentityMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);

    try {
      await authClient.signOut();

      router.push('/');
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  if (isPending) {
    return <div className="h-10 w-28 animate-pulse rounded-full bg-muted" />;
  }

  if (!session) {
    return (
      <Link
        href="/sign-in"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 text-sm font-semibold text-foreground transition hover:bg-card">
        <LogIn className="size-4" />
        Sign in
      </Link>
    );
  }

  const firstName = session.user.name?.split(' ')[0] ?? 'Member';

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/account"
        className="group inline-flex h-10 items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-2 pr-4 transition hover:border-primary/30 hover:bg-card">
        <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
          <UserRound className="size-4" />
        </span>

        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-28 truncate text-xs font-semibold text-foreground">{firstName}</span>

          <span className="block text-[10px] capitalize text-muted-foreground">
            {session.user.tier ?? 'member'}
          </span>
        </span>
      </Link>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        aria-label="Sign out"
        className="grid size-10 place-items-center rounded-full border border-border/70 bg-background/70 text-muted-foreground transition hover:bg-card hover:text-foreground disabled:opacity-50">
        <LogOut className="size-4" />
      </button>
    </div>
  );
}
