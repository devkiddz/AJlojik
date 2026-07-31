'use server';

import { revalidatePath } from 'next/cache';

import type {
  AdminTodoPriority,
  AdminTodoStatus,
  Prisma
} from '@/lib/generated/prisma/client';
import {
  requireAdminPermission
} from '@/features/admin/auth/adminPermissions';
import {
  ACTIVE_ADMIN_TODO_STATUSES,
  ADMIN_TODO_PRIORITIES,
  ASSIGNABLE_ADMIN_TODO_ROLES
} from '@/features/admin/todos/adminTodoConstants';
import { prisma } from '@/lib/prisma';

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function parsePriority(value: string): AdminTodoPriority {
  if (!ADMIN_TODO_PRIORITIES.includes(value as AdminTodoPriority)) {
    throw new Error('A valid Todo priority is required.');
  }

  return value as AdminTodoPriority;
}

function parseDate(value: string, label: string) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} is invalid.`);
  }

  return date;
}

async function requireAssignableUser(
  workspaceId: string,
  userId: string
) {
  const membership = await prisma.workspaceMembership.findFirst({
    where: {
      workspaceId,
      userId,
      active: true,
      role: {
        in: ASSIGNABLE_ADMIN_TODO_ROLES
      }
    },
    select: {
      userId: true
    }
  });

  if (!membership) {
    throw new Error('The selected assignee is not active in this Admin workspace.');
  }
}

export async function createAdminTodo(formData: FormData) {
  const access = await requireAdminPermission('todo:manage');
  const title = text(formData, 'title');
  const description = text(formData, 'description') || null;
  const priority = parsePriority(text(formData, 'priority') || 'MEDIUM');
  const assigneeId = text(formData, 'assigneeId') || null;
  const dueAt = parseDate(text(formData, 'dueAt'), 'Due date');

  if (!title || title.length > 160) {
    throw new Error('Todo title is required and must not exceed 160 characters.');
  }

  if (description && description.length > 2_000) {
    throw new Error('Todo description must not exceed 2,000 characters.');
  }

  if (assigneeId) {
    await requireAssignableUser(access.membership.workspaceId, assigneeId);
  }

  await prisma.$transaction(async transaction => {
    const todo = await transaction.adminTodo.create({
      data: {
        workspaceId: access.membership.workspaceId,
        createdById: access.session.user.id,
        assigneeId,
        title,
        description,
        source: 'STAFF',
        priority,
        dueAt,
        metadata: {
          origin: 'ADMIN_TODO_STUDIO'
        }
      }
    });

    await transaction.adminAuditEvent.create({
      data: {
        workspaceId: access.membership.workspaceId,
        actorId: access.session.user.id,
        action: 'ADMIN_TODO_CREATED',
        targetType: 'OTHER',
        targetId: todo.id,
        summary: `Todo created: ${title}`,
        metadata: {
          priority,
          assigneeId,
          dueAt: dueAt?.toISOString() ?? null
        }
      }
    });
  });

  revalidatePath('/admin');
  revalidatePath('/admin/todos');
}

export async function updateAdminTodo(formData: FormData) {
  const access = await requireAdminPermission('todo:manage');
  const id = text(formData, 'id');
  const intent = text(formData, 'intent');

  if (!id || !intent) {
    throw new Error('A Todo and an update action are required.');
  }

  const existing = await prisma.adminTodo.findFirst({
    where: {
      id,
      workspaceId: access.membership.workspaceId
    },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      assigneeId: true,
      dueAt: true,
      snoozedUntil: true
    }
  });

  if (!existing) {
    throw new Error('The selected Todo was not found in this workspace.');
  }

  if (existing.status === 'COMPLETED' || existing.status === 'DISMISSED') {
    throw new Error('Completed or dismissed Todos are immutable history.');
  }

  const update: Prisma.AdminTodoUncheckedUpdateInput = {};
  let summary = `Todo updated: ${existing.title}`;
  let metadata: Prisma.InputJsonObject = {
    intent
  };

  if (intent === 'assign') {
    if (!access.permissions.has('todo:assign')) {
      throw new Error('Todo assignment permission is required.');
    }

    const assigneeId = text(formData, 'assigneeId') || null;

    if (assigneeId) {
      await requireAssignableUser(access.membership.workspaceId, assigneeId);
    }

    update.assigneeId = assigneeId;
    summary = assigneeId
      ? `Todo assigned: ${existing.title}`
      : `Todo unassigned: ${existing.title}`;
    metadata = {
      intent,
      previousAssigneeId: existing.assigneeId,
      assigneeId
    };
  } else if (intent === 'priority') {
    const priority = parsePriority(text(formData, 'priority'));
    update.priority = priority;
    summary = `Todo priority changed to ${priority}: ${existing.title}`;
    metadata = {
      intent,
      previousPriority: existing.priority,
      priority
    };
  } else if (intent === 'status') {
    const status = text(formData, 'status') as AdminTodoStatus;

    if (!ACTIVE_ADMIN_TODO_STATUSES.includes(status)) {
      throw new Error('Only active Todo statuses can be selected here.');
    }

    update.status = status;
    update.completedAt = null;
    update.dismissedAt = null;
    update.snoozedUntil = null;
    summary = `Todo moved to ${status.replaceAll('_', ' ')}: ${existing.title}`;
    metadata = {
      intent,
      previousStatus: existing.status,
      status
    };
  } else if (intent === 'due') {
    const dueAt = parseDate(text(formData, 'dueAt'), 'Due date');
    update.dueAt = dueAt;
    summary = dueAt
      ? `Todo due date updated: ${existing.title}`
      : `Todo due date cleared: ${existing.title}`;
    metadata = {
      intent,
      previousDueAt: existing.dueAt?.toISOString() ?? null,
      dueAt: dueAt?.toISOString() ?? null
    };
  } else if (intent === 'snooze') {
    const snoozedUntil = parseDate(
      text(formData, 'snoozedUntil'),
      'Snooze time'
    );

    if (!snoozedUntil || snoozedUntil <= new Date()) {
      throw new Error('Snooze time must be in the future.');
    }

    update.snoozedUntil = snoozedUntil;
    summary = `Todo snoozed: ${existing.title}`;
    metadata = {
      intent,
      previousSnoozedUntil:
        existing.snoozedUntil?.toISOString() ?? null,
      snoozedUntil: snoozedUntil.toISOString()
    };
  } else if (intent === 'unsnooze') {
    update.snoozedUntil = null;
    summary = `Todo returned to the active queue: ${existing.title}`;
    metadata = {
      intent,
      previousSnoozedUntil:
        existing.snoozedUntil?.toISOString() ?? null
    };
  } else if (intent === 'complete') {
    update.status = 'COMPLETED';
    update.completedAt = new Date();
    update.dismissedAt = null;
    update.snoozedUntil = null;
    update.activeDedupeKey = null;
    summary = `Todo completed: ${existing.title}`;
    metadata = {
      intent,
      previousStatus: existing.status,
      status: 'COMPLETED'
    };
  } else if (intent === 'dismiss') {
    update.status = 'DISMISSED';
    update.dismissedAt = new Date();
    update.completedAt = null;
    update.snoozedUntil = null;
    summary = `Todo dismissed: ${existing.title}`;
    metadata = {
      intent,
      previousStatus: existing.status,
      status: 'DISMISSED'
    };
  } else {
    throw new Error('Unsupported Todo update action.');
  }

  await prisma.$transaction([
    prisma.adminTodo.update({
      where: {
        id
      },
      data: update
    }),
    prisma.adminAuditEvent.create({
      data: {
        workspaceId: access.membership.workspaceId,
        actorId: access.session.user.id,
        action: 'ADMIN_TODO_UPDATED',
        targetType: 'OTHER',
        targetId: id,
        summary,
        metadata
      }
    })
  ]);

  revalidatePath('/admin');
  revalidatePath('/admin/todos');
}
