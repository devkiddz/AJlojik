import 'server-only';

import type {
  AdminTargetType,
  AdminTodoPriority,
  AdminTodoSource,
  Prisma
} from '@/lib/generated/prisma/client';
import {
  ACTIVE_ADMIN_TODO_STATUSES
} from '@/features/admin/todos/adminTodoConstants';

export type OperationalTodoInput = {
  workspaceId: string;
  title: string;
  description?: string | null;
  source: AdminTodoSource;
  priority?: AdminTodoPriority;
  targetType?: AdminTargetType | null;
  targetId?: string | null;
  dedupeKey: string;
  dueAt?: Date | null;
  metadata?: Prisma.InputJsonValue;
  createdById?: string | null;
};

function activeDedupeKey(
  workspaceId: string,
  dedupeKey: string
) {
  return `${workspaceId}:${dedupeKey}`;
}

export async function upsertOperationalTodo(
  transaction: Prisma.TransactionClient,
  input: OperationalTodoInput
) {
  const resolvedActiveDedupeKey = activeDedupeKey(
    input.workspaceId,
    input.dedupeKey
  );

  const existing = await transaction.adminTodo.findUnique({
    where: {
      activeDedupeKey: resolvedActiveDedupeKey
    },
    select: {
      id: true
    }
  });

  const legacyExisting = existing
    ? null
    : await transaction.adminTodo.findFirst({
        where: {
          workspaceId: input.workspaceId,
          source: input.source,
          targetType: input.targetType ?? null,
          targetId: input.targetId ?? null,
          status: {
            in: [...ACTIVE_ADMIN_TODO_STATUSES]
          },
          activeDedupeKey: null
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true
        }
      });

  const data = {
    title: input.title,
    description: input.description ?? null,
    source: input.source,
    priority: input.priority ?? 'MEDIUM',
    targetType: input.targetType ?? null,
    targetId: input.targetId ?? null,
    dedupeKey: input.dedupeKey,
    metadata: input.metadata,
    dueAt: input.dueAt ?? null,
    lastTriggeredAt: new Date()
  } as const;

  if (existing || legacyExisting) {
    return transaction.adminTodo.update({
      where: {
        id: (existing ?? legacyExisting)!.id
      },
      data: {
        ...data,
        activeDedupeKey: resolvedActiveDedupeKey
      }
    });
  }

  return transaction.adminTodo.upsert({
    where: {
      activeDedupeKey: resolvedActiveDedupeKey
    },
    create: {
      workspaceId: input.workspaceId,
      createdById: input.createdById ?? null,
      activeDedupeKey: resolvedActiveDedupeKey,
      ...data
    },
    update: data
  });
}

export async function completeOperationalTodos(
  transaction: Prisma.TransactionClient,
  input: {
    workspaceId: string;
    source?: AdminTodoSource;
    targetType?: AdminTargetType;
    targetId?: string;
    dedupeKey?: string;
  }
) {
  const target = {
    workspaceId: input.workspaceId,
    source: input.source,
    targetType: input.targetType,
    targetId: input.targetId,
    dedupeKey: input.dedupeKey
  } as const;

  const completed = await transaction.adminTodo.updateMany({
    where: {
      ...target,
      status: {
        in: [...ACTIVE_ADMIN_TODO_STATUSES]
      }
    },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      dismissedAt: null,
      snoozedUntil: null,
      activeDedupeKey: null
    }
  });

  await transaction.adminTodo.updateMany({
    where: {
      ...target,
      status: 'DISMISSED',
      activeDedupeKey: {
        not: null
      }
    },
    data: {
      activeDedupeKey: null,
      snoozedUntil: null
    }
  });

  return completed;
}
