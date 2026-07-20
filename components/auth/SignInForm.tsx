'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { readAuthReturnTo } from '@/features/action-feedback';
import { authClient } from '@/lib/auth-client';

export default function SignInForm({ callbackURL = '/account', showAdminLink = true }: { callbackURL?: string; showAdminLink?: boolean }) {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setPending(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
        callbackURL: readAuthReturnTo(callbackURL)
      });

      if (error) {
        setErrorMessage(error.message ?? 'The email or password is incorrect.');
        return;
      }

      router.push(callbackURL);
      router.refresh();
    } catch {
      setErrorMessage('Something went wrong while signing you in.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={event => setEmail(event.target.value)}
          className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={event => setPassword(event.target.value)}
          className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
          placeholder="Enter your password"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={event => setRememberMe(event.target.checked)}
          className="size-4 rounded border-border"
        />
        Keep me signed in
      </label>

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        New to AJ Logik?{' '}
        <Link href="/sign-up" className="font-semibold text-primary">
          Create an account
        </Link>
      </p>

      {showAdminLink ? (
        <p className="text-center text-xs text-muted-foreground">
          Staff member?{' '}
          <Link href="https://ajlojik.vercel.app/adminlogin/login" className="font-semibold text-primary">
            Open admin login
          </Link>
        </p>
      ) : null}
    </form>
  );
}
