import type {
  AdminTargetType,
  AdminTodoPriority,
  AdminTodoSource,
  AdminTodoStatus,
  WorkspaceRole
} from '@/lib/generated/prisma/client';

export const ACTIVE_ADMIN_TODO_STATUSES:
  AdminTodoStatus[] = [
    'OPEN',
    'IN_PROGRESS',
    'BLOCKED'
  ];

export const ADMIN_TODO_PRIORITIES:
  AdminTodoPriority[] = [
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
  ];

export const ADMIN_TODO_SOURCES:
  AdminTodoSource[] = [
    'SYSTEM',
    'AI',
    'STAFF',
    'APPROVAL',
    'ORDER',
    'DELIVERY',
    'INVENTORY',
    'SHOPPING_LIST',
    'SUPPORT'
  ];

export const ADMIN_TODO_TARGET_TYPES:
  AdminTargetType[] = [
    'PRODUCT',
    'PROMOTION',
    'MEDIA',
    'COLLECTION',
    'CAMPAIGN',
    'VENDOR',
    'INVENTORY',
    'WORKSPACE',
    'EXPERIENCE',
    'FEATURED_LAYOUT',
    'ORDER',
    'DELIVERY',
    'TRACKING_EVENT',
    'USER',
    'STAFF',
    'SHOPPING_LIST',
    'OTHER'
  ];

export const ADMIN_TODO_DATE_FILTERS = [
  {
    value:
      'overdue',
    label:
      'Overdue'
  },
  {
    value:
      'due-today',
    label:
      'Due today'
  },
  {
    value:
      'due-next-7-days',
    label:
      'Due in 7 days'
  },
  {
    value:
      'no-deadline',
    label:
      'No deadline'
  },
  {
    value:
      'created-today',
    label:
      'Created today'
  },
  {
    value:
      'created-last-7-days',
    label:
      'Created in 7 days'
  },
  {
    value:
      'updated-today',
    label:
      'Updated today'
  }
] as const;

export type AdminTodoDateFilter =
  (typeof ADMIN_TODO_DATE_FILTERS)[number]['value'];

export const ADMIN_TODO_SORTS = [
  {
    value:
      'priority',
    label:
      'Priority, then deadline'
  },
  {
    value:
      'due-soon',
    label:
      'Deadline: soonest'
  },
  {
    value:
      'due-latest',
    label:
      'Deadline: latest'
  },
  {
    value:
      'newest',
    label:
      'Created: newest'
  },
  {
    value:
      'oldest',
    label:
      'Created: oldest'
  },
  {
    value:
      'recently-updated',
    label:
      'Recently updated'
  },
  {
    value:
      'type',
    label:
      'Todo type'
  },
  {
    value:
      'status',
    label:
      'Status'
  },
  {
    value:
      'title',
    label:
      'Title A–Z'
  }
] as const;

export type AdminTodoSort =
  (typeof ADMIN_TODO_SORTS)[number]['value'];

export const ASSIGNABLE_ADMIN_TODO_ROLES:
  WorkspaceRole[] = [
    'SUPPORT',
    'MANAGER',
    'ADMIN',
    'OWNER',
    'SUPER_ADMIN'
  ];
