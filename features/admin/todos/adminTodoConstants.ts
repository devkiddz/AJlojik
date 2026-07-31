import type {
  AdminTodoPriority,
  AdminTodoStatus,
  WorkspaceRole
} from '@/lib/generated/prisma/client';

export const ACTIVE_ADMIN_TODO_STATUSES: AdminTodoStatus[] = [
  'OPEN',
  'IN_PROGRESS',
  'BLOCKED'
];

export const ADMIN_TODO_PRIORITIES: AdminTodoPriority[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
];

export const ASSIGNABLE_ADMIN_TODO_ROLES: WorkspaceRole[] = [
  'SUPPORT',
  'MANAGER',
  'ADMIN',
  'OWNER',
  'SUPER_ADMIN'
];
