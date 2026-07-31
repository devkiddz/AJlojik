import 'server-only';

import type {
  AdminTargetType,
  NotificationPriority,
  NotificationTopic,
  Prisma
} from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';

import type {
  NotificationCenterSnapshot,
  NotificationItem,
  NotificationPreferences
} from '../notificationTypes';

type NotificationDatabase = Pick<
  Prisma.TransactionClient,
  'notification' | 'notificationPreference' | 'notificationMute'
>;

type CreateNotificationInput = {
  workspaceId: string;
  userId: string;
  topic: NotificationTopic;
  priority?: NotificationPriority;
  title: string;
  message: string;
  href?: string | null;
  targetType?: AdminTargetType | null;
  targetId?: string | null;
  dedupeKey: string;
  scopeKey?: string | null;
  metadata?: Prisma.InputJsonValue;
};

type NotificationPreferencePatch = Partial<{
  inAppEnabled: boolean;
  orderUpdates: boolean;
  deliveryUpdates: boolean;
  shoppingListUpdates: boolean;
  supportUpdates: boolean;
  systemUpdates: boolean;
  promotionUpdates: boolean;
  mutedUntil: Date | null;
}>;

const DEFAULT_PREFERENCES: NotificationPreferences = {
  inAppEnabled: true,
  orderUpdates: true,
  deliveryUpdates: true,
  shoppingListUpdates: true,
  supportUpdates: true,
  systemUpdates: true,
  promotionUpdates: false,
  mutedUntil: null
};

function mapPreferences(
  preference: {
    inAppEnabled: boolean;
    orderUpdates: boolean;
    deliveryUpdates: boolean;
    shoppingListUpdates: boolean;
    supportUpdates: boolean;
    systemUpdates: boolean;
    promotionUpdates: boolean;
    mutedUntil: Date | null;
  } | null
): NotificationPreferences {
  if (!preference) {
    return DEFAULT_PREFERENCES;
  }

  return {
    inAppEnabled: preference.inAppEnabled,
    orderUpdates: preference.orderUpdates,
    deliveryUpdates: preference.deliveryUpdates,
    shoppingListUpdates: preference.shoppingListUpdates,
    supportUpdates: preference.supportUpdates,
    systemUpdates: preference.systemUpdates,
    promotionUpdates: preference.promotionUpdates,
    mutedUntil: preference.mutedUntil?.toISOString() ?? null
  };
}

function mapNotification(
  notification: {
    id: string;
    topic: NotificationTopic;
    priority: NotificationPriority;
    title: string;
    message: string;
    href: string | null;
    targetType: AdminTargetType | null;
    targetId: string | null;
    scopeKey: string | null;
    readAt: Date | null;
    createdAt: Date;
  }
): NotificationItem {
  return {
    id: notification.id,
    topic: notification.topic,
    priority: notification.priority,
    title: notification.title,
    message: notification.message,
    href: notification.href,
    targetType: notification.targetType,
    targetId: notification.targetId,
    scopeKey: notification.scopeKey,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString()
  };
}

function topicIsEnabled(
  preference: NotificationPreferences,
  topic: NotificationTopic
): boolean {
  if (!preference.inAppEnabled) {
    return false;
  }

  if (topic === 'ORDER') return preference.orderUpdates;
  if (topic === 'DELIVERY') return preference.deliveryUpdates;
  if (topic === 'SHOPPING_LIST') return preference.shoppingListUpdates;
  if (topic === 'SUPPORT') return preference.supportUpdates;
  if (topic === 'PROMOTION') return preference.promotionUpdates;

  return preference.systemUpdates;
}

export async function ensureNotificationPreference(
  database: NotificationDatabase,
  userId: string,
  workspaceId: string
) {
  return database.notificationPreference.upsert({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId
      }
    },
    create: {
      workspaceId,
      userId
    },
    update: {}
  });
}

export async function createCustomerNotification(
  database: NotificationDatabase,
  input: CreateNotificationInput
) {
  const preferenceRecord =
    await database.notificationPreference.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: input.workspaceId,
          userId: input.userId
        }
      }
    });

  const preferences = mapPreferences(preferenceRecord);

  if (!topicIsEnabled(preferences, input.topic)) {
    return null;
  }

  const isUrgent = input.priority === 'URGENT';
  const now = new Date();

  if (
    !isUrgent &&
    preferences.mutedUntil &&
    new Date(preferences.mutedUntil) > now
  ) {
    return null;
  }

  if (!isUrgent && input.scopeKey) {
    const scopeMute = await database.notificationMute.findUnique({
      where: {
        workspaceId_userId_scopeKey: {
          workspaceId: input.workspaceId,
          userId: input.userId,
          scopeKey: input.scopeKey
        }
      }
    });

    if (
      scopeMute &&
      (!scopeMute.mutedUntil || scopeMute.mutedUntil > now)
    ) {
      return null;
    }
  }

  return database.notification.upsert({
    where: {
      workspaceId_userId_dedupeKey: {
        workspaceId: input.workspaceId,
        userId: input.userId,
        dedupeKey: input.dedupeKey
      }
    },
    create: {
      workspaceId: input.workspaceId,
      userId: input.userId,
      topic: input.topic,
      priority: input.priority ?? 'NORMAL',
      title: input.title,
      message: input.message,
      href: input.href ?? null,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      scopeKey: input.scopeKey ?? null,
      dedupeKey: input.dedupeKey,
      metadata: input.metadata
    },
    update: {}
  });
}

export async function getNotificationCenter(
  userId: string,
  workspaceId: string,
  take = 50
): Promise<NotificationCenterSnapshot> {
  const safeTake = Math.min(100, Math.max(1, take));

  const [preference, unreadCount, totalCount, notifications, mutes] =
    await Promise.all([
      ensureNotificationPreference(prisma, userId, workspaceId),
      prisma.notification.count({
        where: {
          userId,
          workspaceId,
          archivedAt: null,
          readAt: null
        }
      }),
      prisma.notification.count({
        where: {
          userId,
          workspaceId,
          archivedAt: null
        }
      }),
      prisma.notification.findMany({
        where: {
          userId,
          workspaceId,
          archivedAt: null
        },
        orderBy: [
          {
            readAt: {
              sort: 'asc',
              nulls: 'first'
            }
          },
          { createdAt: 'desc' }
        ],
        take: safeTake,
        select: {
          id: true,
          topic: true,
          priority: true,
          title: true,
          message: true,
          href: true,
          targetType: true,
          targetId: true,
          scopeKey: true,
          readAt: true,
          createdAt: true
        }
      }),
      prisma.notificationMute.findMany({
        where: {
          userId,
          workspaceId,
          OR: [
            { mutedUntil: null },
            { mutedUntil: { gt: new Date() } }
          ]
        },
        orderBy: {
          updatedAt: 'desc'
        },
        select: {
          scopeKey: true,
          topic: true,
          targetType: true,
          targetId: true,
          mutedUntil: true,
          reason: true
        }
      })
    ]);

  return {
    workspaceId,
    generatedAt: new Date().toISOString(),
    unreadCount,
    totalCount,
    items: notifications.map(mapNotification),
    mutes: mutes.map(mute => ({
      scopeKey: mute.scopeKey,
      topic: mute.topic,
      targetType: mute.targetType,
      targetId: mute.targetId,
      mutedUntil: mute.mutedUntil?.toISOString() ?? null,
      reason: mute.reason
    })),
    preferences: mapPreferences(preference)
  };
}

export async function markNotificationRead(
  userId: string,
  workspaceId: string,
  notificationId: string
) {
  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      workspaceId,
      archivedAt: null,
      readAt: null
    },
    data: {
      readAt: new Date()
    }
  });
}

export async function markAllNotificationsRead(
  userId: string,
  workspaceId: string
) {
  await prisma.notification.updateMany({
    where: {
      userId,
      workspaceId,
      archivedAt: null,
      readAt: null
    },
    data: {
      readAt: new Date()
    }
  });
}

export async function archiveNotification(
  userId: string,
  workspaceId: string,
  notificationId: string
) {
  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      workspaceId,
      archivedAt: null
    },
    data: {
      archivedAt: new Date()
    }
  });
}

export async function updateNotificationPreferences(
  userId: string,
  workspaceId: string,
  patch: NotificationPreferencePatch
) {
  await prisma.notificationPreference.upsert({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId
      }
    },
    create: {
      workspaceId,
      userId,
      ...patch
    },
    update: patch
  });
}

export async function setNotificationScopeMute(input: {
  userId: string;
  workspaceId: string;
  scopeKey: string;
  topic: NotificationTopic;
  targetType?: AdminTargetType | null;
  targetId?: string | null;
  mutedUntil?: Date | null;
  reason?: string | null;
}) {
  await prisma.notificationMute.upsert({
    where: {
      workspaceId_userId_scopeKey: {
        workspaceId: input.workspaceId,
        userId: input.userId,
        scopeKey: input.scopeKey
      }
    },
    create: {
      workspaceId: input.workspaceId,
      userId: input.userId,
      scopeKey: input.scopeKey,
      topic: input.topic,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      mutedUntil: input.mutedUntil ?? null,
      reason: input.reason ?? null
    },
    update: {
      topic: input.topic,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      mutedUntil: input.mutedUntil ?? null,
      reason: input.reason ?? null
    }
  });
}

export async function clearNotificationScopeMute(
  userId: string,
  workspaceId: string,
  scopeKey: string
) {
  await prisma.notificationMute.deleteMany({
    where: {
      userId,
      workspaceId,
      scopeKey
    }
  });
}
