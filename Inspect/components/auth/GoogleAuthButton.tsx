'use client';

import { useState } from 'react';

import { readAuthReturnTo } from '@/features/action-feedback';
import { authClient } from '@/lib/auth-client';

export default function GoogleAuthButton({ callbackURL, enabled, label }: { callbackURL: string; enabled: boolean; label: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = async () => {
    if (!enabled) {
      setError('Google authentication is awaiting its Google Cloud credentials.');
      return;
    }
    setPending(true); setError(null);
    try {
      const result = await authClient.signIn.social({ provider: 'google', callbackURL: readAuthReturnTo(callbackURL), errorCallbackURL: callbackURL.startsWith('/admin') ? '/adminlogin/login' : '/sign-in' });
      if (result?.error) setError(result.error.message ?? 'Google authentication could not be started.');
    } catch {
      setError('Google authentication could not be started. Please try again.');
      setPending(false);
    }
  };

  return <div className="space-y-3"><button type="button" onClick={authenticate} disabled={pending} className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 text-sm font-semibold shadow-sm transition hover:border-foreground/25 hover:bg-muted/45 disabled:cursor-not-allowed disabled:opacity-60"><GoogleMark />{pending ? 'Opening Google…' : label}</button>{error ? <p role="alert" className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700">{error}</p> : null}<div className="flex items-center gap-3"><span className="h-px flex-1 bg-border" /><span className="text-[10px] font-semibold uppercase tracking-[.16em] text-muted-foreground">or continue with email</span><span className="h-px flex-1 bg-border" /></div></div>;
}

function GoogleMark() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.89h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.24c1.9-1.75 2.98-4.32 2.98-7.37Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.4l-3.24-2.52c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.91A6.02 6.02 0 0 1 6.07 12c0-.66.11-1.3.32-1.91v-2.6H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.51l3.35-2.6Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.49l3.35 2.6C7.18 7.72 9.39 5.96 12 5.96Z"/></svg>; }
