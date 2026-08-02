export const COMMUNICATION_CONVERSATION_TYPES = [
  'CUSTOMER_VENDOR',
  'SUPPORT_CASE'
] as const;

export type CommunicationConversationTypeValue =
  (typeof COMMUNICATION_CONVERSATION_TYPES)[number];

export const COMMUNICATION_CONVERSATION_STATUSES = [
  'OPEN',
  'ARCHIVED',
  'CLOSED',
  'RESTRICTED'
] as const;

export type CommunicationConversationStatusValue =
  (typeof COMMUNICATION_CONVERSATION_STATUSES)[number];

export const COMMUNICATION_PARTICIPANT_ROLES = [
  'CUSTOMER',
  'VENDOR_MEMBER',
  'SUPPORT_AGENT',
  'ADMIN',
  'SYSTEM'
] as const;

export type CommunicationParticipantRoleValue =
  (typeof COMMUNICATION_PARTICIPANT_ROLES)[number];

export const COMMUNICATION_PARTICIPANT_STATUSES = [
  'ACTIVE',
  'LEFT',
  'REMOVED'
] as const;

export type CommunicationParticipantStatusValue =
  (typeof COMMUNICATION_PARTICIPANT_STATUSES)[number];

export const COMMUNICATION_MESSAGE_TYPES = [
  'TEXT',
  'SYSTEM',
  'EVENT'
] as const;

export type CommunicationMessageTypeValue =
  (typeof COMMUNICATION_MESSAGE_TYPES)[number];

export const COMMUNICATION_ATTACHMENT_STATUSES = [
  'PENDING',
  'READY',
  'QUARANTINED',
  'REMOVED'
] as const;

export type CommunicationAttachmentStatusValue =
  (typeof COMMUNICATION_ATTACHMENT_STATUSES)[number];

export type CommunicationIdentity = {
  id: string;
  name: string;
  image: string | null;
};

export type CommunicationVendorIdentity = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

export type CommunicationContextItem = {
  orderId: string | null;
  orderNumber: string | null;
  orderItemIds: string[];
  productId: string | null;
  productName: string | null;
  source: string | null;
};

export type CommunicationMessageAttachmentItem = {
  id: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  status: CommunicationAttachmentStatusValue;
  createdAt: string;
};

export type CommunicationMessageItem = {
  id: string;
  type: CommunicationMessageTypeValue;
  body: string;
  sender: CommunicationIdentity | null;
  senderRole: CommunicationParticipantRoleValue;
  replyToMessageId: string | null;
  attachments: CommunicationMessageAttachmentItem[];
  editedAt: string | null;
  removedAt: string | null;
  createdAt: string;
};

export type CommunicationParticipantItem = {
  id: string;
  role: CommunicationParticipantRoleValue;
  status: CommunicationParticipantStatusValue;
  user: CommunicationIdentity | null;
  vendorProfileId: string | null;
  unreadCount: number;
  lastReadAt: string | null;
  archivedAt: string | null;
  joinedAt: string;
};

export type CommunicationConversationSummary = {
  id: string;
  type: CommunicationConversationTypeValue;
  status: CommunicationConversationStatusValue;
  subject: string | null;
  vendor: CommunicationVendorIdentity | null;
  context: CommunicationContextItem | null;
  lastMessage: CommunicationMessageItem | null;
  unreadCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CommunicationConversationDetail =
  CommunicationConversationSummary & {
    participants: CommunicationParticipantItem[];
    messages: CommunicationMessageItem[];
  };

export type CommunicationInboxSnapshot = {
  workspaceId: string;
  generatedAt: string;
  unreadCount: number;
  conversations: CommunicationConversationSummary[];
};
