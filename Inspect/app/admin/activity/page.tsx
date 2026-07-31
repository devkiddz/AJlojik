import {
  Activity,
  CircleUserRound,
  Clock3,
  DatabaseZap
} from 'lucide-react';

import { getAdminAccess } from '@/features/admin/auth/adminPermissions';
import {
  AdminMetric,
  AdminPage,
  AdminPageHeader,
  AdminPanel
} from '@/features/admin/components';
import { prisma } from '@/lib/prisma';

export default async function AdminActivityPage() {
  const access = await getAdminAccess();

  if (!access.permissions.has('activity:view')) {
    throw new Error('Administrative activity access is required.');
  }

  const events = await prisma.adminAuditEvent.findMany({
    where: { workspaceId: access.membership.workspaceId },
    include: {
      actor: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 250
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = events.filter(event => event.createdAt >= today).length;
  const actors = new Set(events.map(event => event.actorId)).size;
  const targets = new Set(events.map(event => event.targetType)).size;

  return (
    <AdminPage>
      <div className="mx-auto max-w-[96rem] space-y-5">
        <AdminPageHeader
          eyebrow="Workspace audit trail"
          title="Administrative Activity"
          description="Review workspace-scoped Studio, inventory, approval, user, vendor and system changes recorded by server-authorized operations."
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminMetric icon={Activity} label="Visible events" value={events.length} />
          <AdminMetric icon={Clock3} label="Today" value={todayCount} />
          <AdminMetric icon={CircleUserRound} label="Active operators" value={actors} />
          <AdminMetric icon={DatabaseZap} label="Target areas" value={targets} />
        </section>

        <AdminPanel
          title="Latest activity"
          description="The newest operations appear first. Detailed filters and exports can be added after live usage establishes the reporting requirements."
        >
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {events.map(event => (
              <article
                key={event.id}
                className="rounded-3xl border border-border/60 bg-background/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[8px] font-black text-primary">
                    {event.targetType.replaceAll('_', ' ')}
                  </span>
                  <time
                    dateTime={event.createdAt.toISOString()}
                    className="text-[8px] text-muted-foreground"
                  >
                    {event.createdAt.toLocaleString('en-NG', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: access.membership.workspace.timezone
                    })}
                  </time>
                </div>
                <h2 className="mt-3 text-xs font-black">
                  {event.action.replaceAll('_', ' ')}
                </h2>
                <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
                  {event.summary}
                </p>
                <div className="mt-4 border-t border-border/50 pt-3">
                  <p className="truncate text-[9px] font-bold">{event.actor?.name ?? 'System operator'}</p>
                  <p className="mt-1 truncate text-[8px] text-muted-foreground">
                    {event.actor?.email ?? 'No operator email'}
                  </p>
                </div>
              </article>
            ))}
          </section>

          {!events.length ? (
            <div className="grid min-h-52 place-items-center text-center">
              <div>
                <Activity className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-bold">No administrative activity yet</p>
              </div>
            </div>
          ) : null}
        </AdminPanel>
      </div>
    </AdminPage>
  );
}
