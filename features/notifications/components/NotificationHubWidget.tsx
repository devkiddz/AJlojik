'use client';

import { Bell, BellRing, ChevronRight, CircleAlert, RefreshCw, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useIdentity } from '@/providers/IdentityProvider';
import { cn } from '@/lib/utils';

import { useNotificationSummary } from '../client/useNotificationSummary';

export default function NotificationHubWidget() {
  const router = useRouter();
  const { isAuthenticated } = useIdentity();
  const { snapshot, loading, error, refresh, mutate } = useNotificationSummary(4);

  if (!isAuthenticated) {
    return (
      <section className="rounded-2xl border border-border/60 bg-card/75 p-4 shadow-sm">
        <Bell className="size-5 text-primary" />
        <h3 className="mt-3 text-sm font-black">Notifications</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Sign in to receive verified order, delivery and Shopping List updates.
        </p>
        <button
          type="button"
          onClick={() => router.push('/sign-in?returnTo=%2Fnotifications')}
          className="mt-4 h-9 rounded-full bg-foreground px-4 text-xs font-bold text-background">
          Sign in
        </button>
      </section>
    );
  }

  const items = snapshot?.items ?? [];
  const unreadCount = snapshot?.unreadCount ?? 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/75 shadow-sm">
      <div className="border-b border-border/60 p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            {unreadCount ? <BellRing className="size-4" /> : <Bell className="size-4" />}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-black">Notifications</p>
              {unreadCount ? (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-black text-primary-foreground">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
              Database-backed in-app updates. Push delivery is not enabled.
            </p>
          </div>

          <button
            type="button"
            title="Refresh notifications"
            aria-label="Refresh notifications"
            onClick={() => void refresh()}
            disabled={loading}
            className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40">
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex gap-2 border-b border-border/60 bg-amber-500/10 p-3 text-[11px] text-amber-700 dark:text-amber-300">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="max-h-[min(60vh,28rem)] divide-y divide-border/60 overflow-y-auto overscroll-contain">
        {items.map(item => (
          <button
            type="button"
            key={item.id}
            onClick={() => {
              const navigate = () => {
                router.push(item.href ?? '/notifications');
              };

              if (!item.readAt) {
                void mutate({
                  action: 'mark-read',
                  notificationId: item.id
                })
                  .then(navigate)
                  .catch(cause => {
                    console.error('Unable to mark Hub notification read.', cause);
                    navigate();
                  });

                return;
              }

              navigate();
            }}
            className="group flex w-full items-start gap-3 p-3 text-left transition hover:bg-muted/55">
            <span
              className={cn(
                'mt-1 size-2 shrink-0 rounded-full',
                item.readAt ? 'bg-muted-foreground/25' : 'bg-primary'
              )}
            />

            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold">{item.title}</span>

              <span className="mt-1 line-clamp-2 block text-[10px] leading-4 text-muted-foreground">
                {item.message}
              </span>
            </span>

            <ChevronRight className="mt-1 size-3.5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
          </button>
        ))}

        {!items.length && !loading ? (
          <div className="p-5 text-center">
            <Bell className="mx-auto size-5 text-muted-foreground" />

            <p className="mt-2 text-xs font-bold">No verified updates</p>

            <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
              This surface remains empty until a real commerce event occurs.
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-border/60 p-3">
        <button
          type="button"
          onClick={() => router.push('/notifications')}
          className="h-9 rounded-full bg-foreground px-3 text-[10px] font-bold text-background">
          Open centre
        </button>
        <button
          type="button"
          onClick={() => router.push('/settings/notifications')}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border px-3 text-[10px] font-bold">
          <Settings2 className="size-3" />
          Settings
        </button>
      </div>
    </section>
  );
}
