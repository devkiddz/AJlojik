import {
  AlarmClock,
  CheckCircle2,
  CircleDashed,
  ListTodo,
  UserRoundCheck
} from 'lucide-react';

import type {
  AdminTodoPriority,
  Prisma
} from '@/lib/generated/prisma/client';
import {
  AdminMetric,
  AdminPage,
  AdminPageHeader
} from '@/features/admin/components';
import { getAdminAccess } from '@/features/admin/auth/adminPermissions';
import {
  ACTIVE_ADMIN_TODO_STATUSES,
  ADMIN_TODO_PRIORITIES,
  ASSIGNABLE_ADMIN_TODO_ROLES
} from '@/features/admin/todos/adminTodoConstants';
import {
  AdminTodoCard,
  AdminTodoCreatePanel,
  AdminTodoFilterPanel
} from '@/features/admin/todos/components';
import { prisma } from '@/lib/prisma';

type AdminTodosPageProps = {
  searchParams: Promise<{
    view?: string;
    priority?: string;
    assignee?: string;
    q?: string;
  }>;
};

export default async function AdminTodosPage({
  searchParams
}: AdminTodosPageProps) {
  const access = await getAdminAccess();

  if (!access.permissions.has('todo:view')) {
    throw new Error('Todo access is required.');
  }

  const params = await searchParams;
  const now = new Date();
  const view = params.view ?? 'active';
  const priority = ADMIN_TODO_PRIORITIES.includes(
    params.priority as AdminTodoPriority
  )
    ? (params.priority as AdminTodoPriority)
    : null;
  const assignee = params.assignee?.trim() || null;
  const query = params.q?.trim() || null;

  const viewWhere: Prisma.AdminTodoWhereInput =
    view === 'snoozed'
      ? {
          status: {
            in: ACTIVE_ADMIN_TODO_STATUSES
          },
          snoozedUntil: {
            gt: now
          }
        }
      : view === 'completed'
        ? {
            status: 'COMPLETED'
          }
        : view === 'dismissed'
          ? {
              status: 'DISMISSED'
            }
          : view === 'all'
            ? {}
            : {
                status: {
                  in: ACTIVE_ADMIN_TODO_STATUSES
                },
                OR: [
                  { snoozedUntil: null },
                  { snoozedUntil: { lte: now } }
                ]
              };

  const where: Prisma.AdminTodoWhereInput = {
    workspaceId: access.membership.workspaceId,
    AND: [
      viewWhere,
      ...(priority ? [{ priority }] : []),
      ...(assignee === 'unassigned'
        ? [{ assigneeId: null }]
        : assignee
          ? [{ assigneeId: assignee }]
          : []),
      ...(query
        ? [
            {
              OR: [
                {
                  title: {
                    contains: query,
                    mode: 'insensitive' as const
                  }
                },
                {
                  description: {
                    contains: query,
                    mode: 'insensitive' as const
                  }
                }
              ]
            }
          ]
        : [])
    ]
  };

  const activeVisibleWhere: Prisma.AdminTodoWhereInput = {
    workspaceId: access.membership.workspaceId,
    status: {
      in: ACTIVE_ADMIN_TODO_STATUSES
    },
    OR: [
      { snoozedUntil: null },
      { snoozedUntil: { lte: now } }
    ]
  };

  const [
    todos,
    memberships,
    activeCount,
    snoozedCount,
    completedCount,
    unassignedCount
  ] = await Promise.all([
    prisma.adminTodo.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        createdBy: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueAt: 'asc' },
        { updatedAt: 'desc' }
      ],
      take: 200
    }),
    prisma.workspaceMembership.findMany({
      where: {
        workspaceId: access.membership.workspaceId,
        active: true,
        role: {
          in: ASSIGNABLE_ADMIN_TODO_ROLES
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        joinedAt: 'asc'
      }
    }),
    prisma.adminTodo.count({
      where: activeVisibleWhere
    }),
    prisma.adminTodo.count({
      where: {
        workspaceId: access.membership.workspaceId,
        status: {
          in: ACTIVE_ADMIN_TODO_STATUSES
        },
        snoozedUntil: {
          gt: now
        }
      }
    }),
    prisma.adminTodo.count({
      where: {
        workspaceId: access.membership.workspaceId,
        status: 'COMPLETED'
      }
    }),
    prisma.adminTodo.count({
      where: {
        ...activeVisibleWhere,
        assigneeId: null
      }
    })
  ]);

  const assignableUsers = memberships.map(membership => ({
    id: membership.user.id,
    name: membership.user.name,
    email: membership.user.email,
    role: membership.role
  }));

  return (
    <AdminPage>
      <div className="space-y-5">
        <AdminPageHeader
          eyebrow="Operational attention"
          title="Admin Todo Studio"
          description="One workspace queue for generated and staff-created work. Active deduplication prevents repeated operational tasks while preserving completed history."
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminMetric icon={ListTodo} label="Active now" value={activeCount} />
          <AdminMetric icon={AlarmClock} label="Snoozed" value={snoozedCount} />
          <AdminMetric icon={CheckCircle2} label="Completed" value={completedCount} />
          <AdminMetric icon={UserRoundCheck} label="Unassigned" value={unassignedCount} />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(19rem,0.75fr)_minmax(0,1.25fr)]">
          <div className="space-y-5">
            {access.permissions.has('todo:manage') ? (
              <AdminTodoCreatePanel
                users={assignableUsers}
                canAssign={access.permissions.has('todo:assign')}
              />
            ) : null}

            <AdminTodoFilterPanel
              view={view}
              priority={priority}
              assignee={assignee}
              query={query}
              users={assignableUsers}
            />
          </div>

          <section className="space-y-3">
            {todos.map(todo => (
              <AdminTodoCard
                key={todo.id}
                todo={todo}
                users={assignableUsers}
                canManage={access.permissions.has('todo:manage')}
                canAssign={access.permissions.has('todo:assign')}
              />
            ))}

            {!todos.length ? (
              <div className="grid min-h-72 place-items-center rounded-[2rem] border border-dashed border-border/70 bg-card/45 p-8 text-center">
                <div>
                  <CircleDashed className="mx-auto size-8 text-muted-foreground" />
                  <h2 className="mt-4 font-black">No Todos match this view</h2>
                  <p className="mt-2 max-w-md text-xs leading-5 text-muted-foreground">
                    Adjust the filters or return to the active queue.
                  </p>
                </div>
              </div>
            ) : null}
          </section>
        </section>
      </div>
    </AdminPage>
  );
}
