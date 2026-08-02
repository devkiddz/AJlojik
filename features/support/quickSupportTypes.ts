import type {
  SupportCaseStatusValue,
  SupportIdentity
} from './supportTypes';

export type QuickSupportMessageDirection =
  | 'CUSTOMER'
  | 'SUPPORT'
  | 'SYSTEM';

export type QuickSupportReplyPreview = {
  caseId: string;
  caseNumber: string;
  messageId: string;
  bodyPreview: string;
  sender: SupportIdentity | null;
  createdAt: string;
};

export type QuickSupportCaseContinuity = {
  id: string;
  caseNumber: string;
  subject: string;
  status: SupportCaseStatusValue;
  reusable: boolean;
  unreadCount: number;
  lastReadAt: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageDirection:
    QuickSupportMessageDirection |
    null;
  updatedAt: string;
};

export type QuickSupportSummary = {
  workspaceId: string;
  generatedAt: string;
  totalCaseCount: number;
  openCaseCount: number;
  historyCount: number;
  unreadCount: number;
  activeCase:
    QuickSupportCaseContinuity |
    null;
  recentCases:
    QuickSupportCaseContinuity[];
  latestAgentReply:
    QuickSupportReplyPreview |
    null;
};
