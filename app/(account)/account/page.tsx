import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import SignOutButton from '@/components/auth/SignOutButton';
import { getOrCreateExperienceProfile } from '@/features/feed-experience/services';
import { auth } from '@/lib/auth';

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect('/sign-in');
  }

  const experienceProfile = await getOrCreateExperienceProfile(session.user.id);

  const tier = typeof session.user.tier === 'string' ? session.user.tier : 'member';

  return (
    <main className="min-h-dvh px-4 py-8">
      <section className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-card/70 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/60">
              AJ Logik Account
            </p>

            <h1 className="mt-2 text-2xl font-bold">Welcome, {session.user.name}</h1>

            <p className="mt-1 text-sm text-muted-foreground">{session.user.email}</p>
          </div>

          <SignOutButton />
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-border/70 bg-card/60 p-5">
            <p className="text-sm text-muted-foreground">Membership</p>

            <p className="mt-2 text-xl font-bold capitalize">{tier}</p>
          </article>

          <article className="rounded-3xl border border-border/70 bg-card/60 p-5">
            <p className="text-sm text-muted-foreground">Email status</p>

            <p className="mt-2 text-xl font-bold">
              {session.user.emailVerified ? 'Verified' : 'Not verified'}
            </p>
          </article>

          <article className="rounded-3xl border border-border/70 bg-card/60 p-5">
            <p className="text-sm text-muted-foreground">Experience profile</p>

            <p className="mt-2 text-xl font-bold capitalize">{experienceProfile.persona.replace('-', ' ')}</p>

            <p className="mt-2 text-xs text-muted-foreground">
              {experienceProfile.personalizationEnabled ? 'Personalization active' : 'Personalization paused'}
            </p>
          </article>
        </div>

        <section className="rounded-3xl border border-border/70 bg-card/60 p-6">
          <h2 className="text-lg font-semibold">Your AJ Logik workspace</h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Your persistent cart, wishlist, orders, delivery activity and experience profile will appear here
            as we connect the commerce models.
          </p>
        </section>
      </section>
    </main>
  );
}
