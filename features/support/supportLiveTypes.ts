export const SUPPORT_LIVE_EVENT_TYPES = [
  'MESSAGE_CREATED',
  'CASE_UPDATED',
  'CONVERSATION_READ',
  'PRESENCE_UPDATED',
  'TYPING_UPDATED',
  'UNREAD_UPDATED'
] as const;

export type SupportLiveEventTypeValue =
  (typeof SUPPORT_LIVE_EVENT_TYPES)[number];

export const SUPPORT_LIVE_AUDIENCES = [
  'CUSTOMER',
  'AGENT'
] as const;

export type SupportLiveAudience =
  (typeof SUPPORT_LIVE_AUDIENCES)[number];

export type SupportLiveEventItem = {
  id: number;
  workspaceId: string;
  caseId: string;
  conversationId: string;
  type: SupportLiveEventTypeValue;
  actorId: string | null;
  payload: unknown;
  createdAt: string;
};

export type SupportLivePresenceItem = {
  id: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  audience: SupportLiveAudience;
  active: boolean;
  typing: boolean;
  lastSeenAt: string;
  expiresAt: string;
};

export type SupportLivePresencePayload = {
  caseId: string;
  generatedAt: string;
  participants: SupportLivePresenceItem[];
};

export type SupportLiveReadyPayload = {
  caseId: string;
  cursor: number;
  audience: SupportLiveAudience;
  connectedAt: string;
};

export type SupportLiveReconnectPayload = {
  caseId: string;
  cursor: number;
  reconnectAfterMs: number;
};
