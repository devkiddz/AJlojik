import {
  AlarmClock,
  CheckCircle2,
  CircleDashed,
  ListTodo,
  UserRoundCheck
} from 'lucide-react';

import type {
  AdminTargetType,
  AdminTodoPriority,
  AdminTodoSource,
  Prisma
} from '@/lib/generated/prisma/client';

import {
  AdminMetric,
  AdminPage,
  AdminPageHeader
} from '@/features/admin/components';

import {
  getAdminAccess
} from '@/features/admin/auth/adminPermissions';

import {
  ACTIVE_ADMIN_TODO_STATUSES,
  ADMIN_TODO_DATE_FILTERS,
  ADMIN_TODO_PRIORITIES,
  ADMIN_TODO_SORTS,
  ADMIN_TODO_SOURCES,
  ADMIN_TODO_TARGET_TYPES,
  ASSIGNABLE_ADMIN_TODO_ROLES,
  type AdminTodoDateFilter,
  type AdminTodoSort
} from '@/features/admin/todos/adminTodoConstants';

import {
  AdminTodoCard,
  AdminTodoCreatePanel,
  AdminTodoFilterPanel
} from '@/features/admin/todos/components';

import {
  prisma
} from '@/lib/prisma';

type AdminTodosPageProps = {
  searchParams: Promise<{
    view?:
      string;
    priority?:
      string;
    source?:
      string;
    target?:
      string;
    date?:
      string;
    sort?:
      string;
    assignee?:
      string;
    q?:
      string;
  }>;
};

function startOfDay(
  value:
    Date
) {
  const result =
    new Date(
      value
    );

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
}

function addDays(
  value:
    Date,
  days:
    number
) {
  const result =
    new Date(
      value
    );

  result.setDate(
    result.getDate() +
      days
  );

  return result;
}

function resolveDateWhere(
  filter:
    AdminTodoDateFilter |
    null,
  now:
    Date
): Prisma.AdminTodoWhereInput | null {
  if (!filter) {
    return null;
  }

  const today =
    startOfDay(
      now
    );

  const tomorrow =
    addDays(
      today,
      1
    );

  switch (filter) {
    case 'overdue':
      return {
        dueAt: {
          lt:
            now
        }
      };

    case 'due-today':
      return {
        dueAt: {
          gte:
            today,
          lt:
            tomorrow
        }
      };

    case 'due-next-7-days':
      return {
        dueAt: {
          gte:
            now,
          lt:
            addDays(
              now,
              7
            )
        }
      };

    case 'no-deadline':
      return {
        dueAt:
          null
      };

    case 'created-today':
      return {
        createdAt: {
          gte:
            today,
          lt:
            tomorrow
        }
      };

    case 'created-last-7-days':
      return {
        createdAt: {
          gte:
            addDays(
              now,
              -7
            )
        }
      };

    case 'updated-today':
      return {
        updatedAt: {
          gte:
            today,
          lt:
            tomorrow
        }
      };
  }
}

function resolveOrderBy(
  sort:
    AdminTodoSort
): Prisma.AdminTodoOrderByWithRelationInput[] {
  switch (sort) {
    case 'due-soon':
      return [
        {
          dueAt:
            'asc'
        },
        {
          priority:
            'desc'
        },
        {
          updatedAt:
            'desc'
        }
      ];

    case 'due-latest':
      return [
        {
          dueAt:
            'desc'
        },
        {
          priority:
            'desc'
        }
      ];

    case 'newest':
      return [
        {
          createdAt:
            'desc'
        }
      ];

    case 'oldest':
      return [
        {
          createdAt:
            'asc'
        }
      ];

    case 'recently-updated':
      return [
        {
          updatedAt:
            'desc'
        }
      ];

    case 'type':
      return [
        {
          source:
            'asc'
        },
        {
          priority:
            'desc'
        },
        {
          dueAt:
            'asc'
        }
      ];

    case 'status':
      return [
        {
          status:
            'asc'
        },
        {
          priority:
            'desc'
        },
        {
          updatedAt:
            'desc'
        }
      ];

    case 'title':
      return [
        {
          title:
            'asc'
        }
      ];

    default:
      return [
        {
          priority:
            'desc'
        },
        {
          dueAt:
            'asc'
        },
        {
          updatedAt:
            'desc'
        }
      ];
  }
}

export default async function AdminTodosPage({
  searchParams
}: AdminTodosPageProps) {
  const access =
    await getAdminAccess();

  if (
    !access.permissions.has(
      'todo:view'
    )
  ) {
    throw new Error(
      'Todo access is required.'
    );
  }

  const params =
    await searchParams;

  const now =
    new Date();

  const view =
    params.view ??
    'active';

  const priority =
    ADMIN_TODO_PRIORITIES.includes(
      params.priority as
        AdminTodoPriority
    )
      ? params.priority as
          AdminTodoPriority
      : null;

  const source =
    ADMIN_TODO_SOURCES.includes(
      params.source as
        AdminTodoSource
    )
      ? params.source as
          AdminTodoSource
      : null;

  const target =
    ADMIN_TODO_TARGET_TYPES.includes(
      params.target as
        AdminTargetType
    )
      ? params.target as
          AdminTargetType
      : null;

  const date =
    ADMIN_TODO_DATE_FILTERS.some(
      item =>
        item.value ===
        params.date
    )
      ? params.date as
          AdminTodoDateFilter
      : null;

  const sort =
    ADMIN_TODO_SORTS.some(
      item =>
        item.value ===
        params.sort
    )
      ? params.sort as
          AdminTodoSort
      : 'priority';

  const assignee =
    params.assignee?.trim() ||
    null;

  const query =
    params.q?.trim() ||
    null;

  const dateWhere =
    resolveDateWhere(
      date,
      now
    );

  const viewWhere:
    Prisma.AdminTodoWhereInput =
    view ===
    'snoozed'
      ? {
          status: {
            in:
              ACTIVE_ADMIN_TODO_STATUSES
          },
          snoozedUntil: {
            gt:
              now
          }
        }
      : view ===
          'completed'
        ? {
            status:
              'COMPLETED'
          }
        : view ===
            'dismissed'
          ? {
              status:
                'DISMISSED'
            }
          : view ===
              'all'
            ? {}
            : {
                status: {
                  in:
                    ACTIVE_ADMIN_TODO_STATUSES
                },
                OR: [
                  {
                    snoozedUntil:
                      null
                  },
                  {
                    snoozedUntil: {
                      lte:
                        now
                    }
                  }
                ]
              };

  const where:
    Prisma.AdminTodoWhereInput = {
    workspaceId:
      access.membership
        .workspaceId,
    AND: [
      viewWhere,
      ...(priority
        ? [
            {
              priority
            }
          ]
        : []),
      ...(source
        ? [
            {
              source
            }
          ]
        : []),
      ...(target
        ? [
            {
              targetType:
                target
            }
          ]
        : []),
      ...(dateWhere
        ? [
            dateWhere
          ]
        : []),
      ...(assignee ===
      'unassigned'
        ? [
            {
              assigneeId:
                null
            }
          ]
        : assignee
          ? [
              {
                assigneeId:
                  assignee
              }
            ]
          : []),
      ...(query
        ? [
            {
              OR: [
                {
                  title: {
                    contains:
                      query,
                    mode:
                      'insensitive' as const
                  }
                },
                {
                  description: {
                    contains:
                      query,
                    mode:
                      'insensitive' as const
                  }
                },
                {
                  dedupeKey: {
                    contains:
                      query,
                    mode:
                      'insensitive' as const
                  }
                }
              ]
            }
          ]
        : [])
    ]
  };

  const activeVisibleWhere:
    Prisma.AdminTodoWhereInput = {
    workspaceId:
      access.membership
        .workspaceId,
    status: {
      in:
        ACTIVE_ADMIN_TODO_STATUSES
    },
    OR: [
      {
        snoozedUntil:
          null
      },
      {
        snoozedUntil: {
          lte:
            now
        }
      }
    ]
  };

  const [
    todos,
    memberships,
    activeCount,
    snoozedCount,
    completedCount,
    unassignedCount
  ] =
    await Promise.all([
      prisma.adminTodo.findMany({
        where,
        include: {
          assignee: {
            select: {
              id:
                true,
              name:
                true,
              email:
                true
            }
          },
          createdBy: {
            select: {
              name:
                true
            }
          }
        },
        orderBy:
          resolveOrderBy(
            sort
          ),
        take:
          200
      }),
      prisma.workspaceMembership.findMany({
        where: {
          workspaceId:
            access.membership
              .workspaceId,
          active:
            true,
          role: {
            in:
              ASSIGNABLE_ADMIN_TODO_ROLES
          }
        },
        include: {
          user: {
            select: {
              id:
                true,
              name:
                true,
              email:
                true
            }
          }
        },
        orderBy: {
          joinedAt:
            'asc'
        }
      }),
      prisma.adminTodo.count({
        where:
          activeVisibleWhere
      }),
      prisma.adminTodo.count({
        where: {
          workspaceId:
            access.membership
              .workspaceId,
          status: {
            in:
              ACTIVE_ADMIN_TODO_STATUSES
          },
          snoozedUntil: {
            gt:
              now
          }
        }
      }),
      prisma.adminTodo.count({
        where: {
          workspaceId:
            access.membership
              .workspaceId,
          status:
            'COMPLETED'
        }
      }),
      prisma.adminTodo.count({
        where: {
          ...activeVisibleWhere,
          assigneeId:
            null
        }
      })
    ]);

  const assignableUsers =
    memberships.map(
      membership => ({
        id:
          membership.user.id,
        name:
          membership.user.name,
        email:
          membership.user.email,
        role:
          membership.role
      })
    );

  return (
    <AdminPage>
      <div className="space-y-5">
        <AdminPageHeader
          eyebrow="Operational attention"
          title="Admin Todo Studio"
          description="One workspace queue for generated and staff-created work. Filter by type, target, date, priority and assignee, then sort the queue by the authority most useful to the current operation."
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminMetric
            icon={
              ListTodo
            }
            label="Active now"
            value={
              activeCount
            }
          />

          <AdminMetric
            icon={
              AlarmClock
            }
            label="Snoozed"
            value={
              snoozedCount
            }
          />

          <AdminMetric
            icon={
              CheckCircle2
            }
            label="Completed"
            value={
              completedCount
            }
          />

          <AdminMetric
            icon={
              UserRoundCheck
            }
            label="Unassigned"
            value={
              unassignedCount
            }
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(19rem,0.72fr)_minmax(0,1.28fr)]">
          <div className="space-y-5">
            {access.permissions.has(
              'todo:manage'
            ) ? (
              <AdminTodoCreatePanel
                users={
                  assignableUsers
                }
                canAssign={access.permissions.has(
                  'todo:assign'
                )}
              />
            ) : null}

            <AdminTodoFilterPanel
              view={
                view
              }
              priority={
                priority
              }
              source={
                source
              }
              target={
                target
              }
              date={
                date
              }
              sort={
                sort
              }
              assignee={
                assignee
              }
              query={
                query
              }
              users={
                assignableUsers
              }
            />
          </div>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/55 px-4 py-3">
              <p className="text-xs font-bold">
                {
                  todos.length
                }{' '}
                matching Todo
                {todos.length ===
                1
                  ? ''
                  : 's'}
              </p>

              <p className="text-[10px] text-muted-foreground">
                Sorted by{' '}
                {
                  ADMIN_TODO_SORTS.find(
                    item =>
                      item.value ===
                      sort
                  )?.label
                }
              </p>
            </div>

            {todos.map(
              todo => (
                <AdminTodoCard
                  key={
                    todo.id
                  }
                  todo={
                    todo
                  }
                  users={
                    assignableUsers
                  }
                  canManage={access.permissions.has(
                    'todo:manage'
                  )}
                  canAssign={access.permissions.has(
                    'todo:assign'
                  )}
                />
              )
            )}

            {!todos.length ? (
              <div className="grid min-h-72 place-items-center rounded-[2rem] border border-dashed border-border/70 bg-card/45 p-8 text-center">
                <div>
                  <CircleDashed className="mx-auto size-8 text-muted-foreground" />

                  <h2 className="mt-4 font-black">
                    No Todos match
                    this view
                  </h2>

                  <p className="mt-2 max-w-md text-xs leading-5 text-muted-foreground">
                    Adjust the
                    type, target,
                    date or sorting
                    authority, or
                    return to the
                    active queue.
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
