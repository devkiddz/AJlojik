export const NOTIFICATION_TOPICS = [
  'ORDER',
  'DELIVERY',
  'SHOPPING_LIST',
  'SUPPORT',
  'COMMUNICATION',
  'SYSTEM',
  'PROMOTION'
] as const;

export type NotificationTopicValue =
  (typeof NOTIFICATION_TOPICS)[number];

export const NOTIFICATION_PRIORITIES = [
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT'
] as const;

export type NotificationPriorityValue =
  (typeof NOTIFICATION_PRIORITIES)[number];

export type NotificationItem = {
  id: string;
  topic: NotificationTopicValue;
  priority: NotificationPriorityValue;
  title: string;
  message: string;
  href: string | null;
  targetType: string | null;
  targetId: string | null;
  scopeKey: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationPreferences = {
  inAppEnabled: boolean;
  orderUpdates: boolean;
  deliveryUpdates: boolean;
  shoppingListUpdates: boolean;
  supportUpdates: boolean;
  communicationUpdates: boolean;
  systemUpdates: boolean;
  promotionUpdates: boolean;
  mutedUntil: string | null;
};


export type NotificationMuteItem = {
  scopeKey: string;
  topic: NotificationTopicValue;
  targetType: string | null;
  targetId: string | null;
  mutedUntil: string | null;
  reason: string | null;
};

export type NotificationCenterSnapshot = {
  workspaceId: string;
  generatedAt: string;
  unreadCount: number;
  totalCount: number;
  items: NotificationItem[];
  mutes: NotificationMuteItem[];
  preferences: NotificationPreferences;
};
