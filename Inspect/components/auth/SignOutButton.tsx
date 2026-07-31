'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authClient } from '@/lib/auth-client';

export default function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleSignOut = async () => {
    setPending(true);

    try {
      await authClient.signOut();

      router.push('/');
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-60">
      {pending ? 'Signing out...' : 'Sign out'}
    </button>
  );
}
